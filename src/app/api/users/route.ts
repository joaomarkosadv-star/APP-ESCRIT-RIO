import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [rows] = await pool.query(
    'SELECT id, name, email, profile FROM users WHERE is_active = 1 ORDER BY name'
  )

  return NextResponse.json(rows)
}
