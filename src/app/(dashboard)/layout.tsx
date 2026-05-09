import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import type { SessionUser } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar profile={user.profile} userName={user.name} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
