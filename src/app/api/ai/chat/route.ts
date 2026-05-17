import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في إدارة مواقع البناء والسلامة المهنية لنظام RKZ AI.
تحدث دائماً باللغة العربية وكن موجزاً ومفيداً.
تخصصاتك:
- سلامة العمال وقواعد الحماية الشخصية (خوذ، سترات عاكسة)
- متابعة تقدم المشاريع وإدارة الجداول الزمنية
- إدارة المعدات والمواد وصيانتها
- تحليل التنبيهات والمخاطر في الموقع
- الامتثال للمعايير والأنظمة الهندسية
- تحسين كفاءة العمل وتقليل الهدر

أجب على الأسئلة بشكل عملي ومباشر مع اقتراحات قابلة للتنفيذ.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const stream = await client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
