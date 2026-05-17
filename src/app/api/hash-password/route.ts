import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'password required' }, { status: 400 })
  const hash = createHash('sha256').update(password).digest('hex')
  return NextResponse.json({ hash })
}
