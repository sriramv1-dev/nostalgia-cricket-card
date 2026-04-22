import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/admin/session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const passphrase: string = body?.passphrase ?? ''

    const expected = process.env.ADMIN_PASSPHRASE ?? ''
    if (!expected || passphrase !== expected) {
      return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 })
    }

    const secret = process.env.ADMIN_COOKIE_SECRET ?? ''
    const token = await createAdminToken(secret)

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name:     ADMIN_COOKIE_NAME,
      value:    token,
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   ADMIN_COOKIE_MAX_AGE,
      path:     '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
