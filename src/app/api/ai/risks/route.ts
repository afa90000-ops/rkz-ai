import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

const RISK_SYSTEM = `أنت محلل مخاطر متخصص في مواقع البناء.
تحلل البيانات وتعطي تقييم شامل للمخاطر مع احتمالية وقوعها وخطورتها.
الرد دائماً بصيغة JSON منظمة.`

export async function POST(req: Request) {
  const { siteData } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: RISK_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `بناءً على بيانات الموقع التالية، قيّم المخاطر وأعط توقعات:

${JSON.stringify(siteData, null, 2)}

أعطني JSON بهذا الشكل:
{
  "overallRisk": "low|medium|high|critical",
  "riskScore": <0-100>,
  "risks": [
    {
      "category": "<فئة المخطر>",
      "probability": <0-100>,
      "severity": "low|medium|high|critical",
      "description": "<وصف المخطر>",
      "recommendation": "<توصية>"
    }
  ],
  "summary": "<ملخص عام>",
  "immediateActions": ["<إجراء فوري>"]
}`,
      },
    ],
  })

  const textContent = response.content.find(b => b.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return NextResponse.json({ error: 'No response' }, { status: 500 })
  }

  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Parse error', raw: textContent.text }, { status: 500 })
  }
}
