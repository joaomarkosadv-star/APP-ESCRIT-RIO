import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const convId = parseInt(id)

  const [memberCheck] = await pool.query(
    'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
    [convId, session.id]
  ) as any
  if (memberCheck.length === 0)
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const [[conv]] = await pool.query(
    'SELECT id, name, description FROM conversations WHERE id = ?',
    [convId]
  ) as any

  const [members] = await pool.query(
    `SELECT u.id, u.name, u.email, u.profile
     FROM conversation_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.conversation_id = ?
     ORDER BY u.name`,
    [convId]
  )

  return NextResponse.json({ conversation: conv, members })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (session.profile !== 'administrador')
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  const convId = parseInt(id)
  const { userId } = await request.json()

  await pool.query(
    'INSERT IGNORE INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)',
    [convId, userId, session.id]
  )

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (session.profile !== 'administrador')
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  const convId = parseInt(id)
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: 'userId obrigatório.' }, { status: 400 })

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM conversation_members WHERE conversation_id = ?',
    [convId]
  ) as any
  if (countRows[0].total <= 1)
    return NextResponse.json({ error: 'O grupo precisa ter ao menos um participante.' }, { status: 400 })

  await pool.query(
    'DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
    [convId, userId]
  )

  return NextResponse.json({ success: true })
}
