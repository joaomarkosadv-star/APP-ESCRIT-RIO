import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import type { SessionUser } from '@/types'

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}
