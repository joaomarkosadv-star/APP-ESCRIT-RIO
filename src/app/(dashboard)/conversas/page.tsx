import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import ConversasClient from '@/components/conversas/ConversasClient'
import type { SessionUser } from '@/types'

export default async function ConversasPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) redirect('/login')

  let user: SessionUser | null = null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    user = payload as unknown as SessionUser
  } catch {
    redirect('/login')
  }

  if (!user) redirect('/login')

  return <ConversasClient user={user} />
}
