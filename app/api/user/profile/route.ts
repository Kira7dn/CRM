import { NextRequest, NextResponse } from 'next/server'
import { upsertUserUseCase } from '../depends'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { id, name, avatar, phone, email, address } = body || {}

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ message: 'id là bắt buộc.' }, { status: 400 })
    }

    const upsertUseCase = await upsertUserUseCase();
    const result = await upsertUseCase.execute({ id, name, avatar, phone, email, address })

    return NextResponse.json({ user: result.user })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}
