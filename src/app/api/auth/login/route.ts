import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyPassword, createToken } from '@/lib/auth'
import type { User } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    )

    const users = rows as User[]
    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos.' },
        { status: 401 }
      )
    }

    const passwordValid = await verifyPassword(password, user.password_hash as unknown as string)

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos.' },
        { status: 401 }
      )
    }

    const token = await createToken({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
    })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, profile: user.profile },
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
