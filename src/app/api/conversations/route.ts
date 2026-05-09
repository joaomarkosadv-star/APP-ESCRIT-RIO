import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [rows] = await pool.query(
    `SELECT
       c.id, c.name, c.description, c.created_at,
       latest.content      AS last_message,
       latest.user_name    AS last_message_user,
       latest.created_at   AS last_message_at
     FROM conversations c
     JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = ?
     LEFT JOIN (
       SELECT m.conversation_id, m.content, u.name AS user_name, m.created_at
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.id IN (SELECT MAX(id) FROM messages GROUP BY conversation_id)
     ) latest ON latest.conversation_id = c.id
     ORDER BY COALESCE(latest.created_at, c.created_at) DESC`,
    [session.id]
  )

  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (session.profile !== 'administrador')
    return NextResponse.json({ error: 'Apenas administradores podem criar grupos.' }, { status: 403 })

  const { name, description, memberIds } = await request.json()

  if (!name?.trim())
    return NextResponse.json({ error: 'Nome do grupo é obrigatório.' }, { status: 400 })

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [result] = await conn.query(
      'INSERT INTO conversations (name, description, created_by) VALUES (?, ?, ?)',
      [name.trim(), description?.trim() || null, session.id]
    ) as any

    const convId = result.insertId
    const allMembers = new Set<number>([session.id, ...memberIds])

    for (const userId of allMembers) {
      await conn.query(
        'INSERT IGNORE INTO conversation_members (conversation_id, user_id, added_by) VALUES (?, ?, ?)',
        [convId, userId, session.id]
      )
    }

    await conn.commit()
    return NextResponse.json({ success: true, id: convId })
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
