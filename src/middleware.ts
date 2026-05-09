import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import type { Profile } from '@/types'

// Rotas que não precisam de login
const PUBLIC_PATHS = ['/login', '/api/auth/login']

// Quais perfis podem acessar cada rota
const ROUTE_PERMISSIONS: Record<string, Profile[]> = {
  '/dashboard':  ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  '/agenda':     ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  '/processos':  ['administrador', 'advogado', 'estagiario'],
  '/whatsapp':   ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  '/agentes':    ['administrador', 'advogado', 'comercial'],
  '/conversas':  ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  '/tarefas':    ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  '/financeiro': ['administrador', 'financeiro'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Libera rotas públicas
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')?.value

  // Sem token → vai para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const profile = payload.profile as Profile

    // Verifica se o perfil tem permissão na rota atual
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
      pathname.startsWith(route)
    )

    if (matchedRoute && !ROUTE_PERMISSIONS[matchedRoute].includes(profile)) {
      // Sem permissão → volta para o dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    // Token inválido ou expirado → volta para login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
