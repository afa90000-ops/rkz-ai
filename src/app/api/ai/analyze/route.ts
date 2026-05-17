import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logActivity } from '@/lib/audit'

const client = new Anthropic()

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`ai:analyze:${ip}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح به. انتظر دقيقة ثم حاول مجدداً.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    )
  }

  const session = await auth()
  const { imageBase64, mediaType, question } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  logActivity({
    action: 'ai.analyze',
    userId: session?.user?.id as string | undefined,
    userEmail: session?.user?.email as string | undefined,
    companyId: (session?.user as { company_id?: string })?.company_id,
    details: { mediaType },
    ipAddress: ip,
  })

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: question || `حلل هذه الصورة من موقع البناء وأعطني:
1. وصف ما تراه في الصورة
2. أي مخاطر سلامة واضحة
3. مدى الامتثال لمعايير السلامة المهنية
4. توصيات للتحسين

الرد باللغة العربية.`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ analysis: text })
}
