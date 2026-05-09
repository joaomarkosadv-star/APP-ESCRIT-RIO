import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

async function checkMembership(convId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.query(
    'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
    [convId, userId]
  ) as any
  return rows.length > 0
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const convId = parseInt(id)
  const { searchParams } = new URL(request.url)
  const after = parseInt(searchParams.get('after') || '0')

  if (!(await checkMembership(convId, session.id)))
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const [rows] = after === 0
    ? await pool.query(
        `SELECT m.id, m.content, m.created_at AS createdAt,
                u.id AS userId, u.name AS userName
         FROM messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.conversation_id = ?
         ORDER BY m.created_at ASC`,
        [convId]
      )
    : await pool.query(
        `SELECT m.id, m.content, m.created_at AS createdAt,
                u.id AS userId, u.name AS userName
         FROM messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.conversation_id = ? AND m.id > ?
         ORDER BY m.created_at ASC`,
        [convId, after]
      )

  return NextResponse.json(rows)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const convId = parseInt(id)
  const { content } = await request.json()

  if (!content?.trim())
    return NextResponse.json({ error: 'Mensagem não pode estar vazia.' }, { status: 400 })

  if (!(await checkMembership(convId, session.id)))
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  await pool.query(
    'INSERT INTO messages (conversation_id, user_id, content) VALUES (?, ?, ?)',
    [convId, session.id, content.trim()]
  )

  return NextResponse.json({ success: true })
}
