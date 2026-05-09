'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageCircle,
  Bot,
  MessageSquare,
  CheckSquare,
  DollarSign,
  LogOut,
} from 'lucide-react'
import type { Profile } from '@/types'

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    profiles: ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  },
  {
    href: '/agenda',
    label: 'Agenda',
    icon: Calendar,
    profiles: ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  },
  {
    href: '/processos',
    label: 'Processos',
    icon: FileText,
    profiles: ['administrador', 'advogado', 'estagiario'],
  },
  {
    href: '/whatsapp',
    label: 'WhatsApp Business',
    icon: MessageCircle,
    profiles: ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  },
  {
    href: '/agentes',
    label: 'Agentes de IA',
    icon: Bot,
    profiles: ['administrador', 'advogado', 'comercial'],
  },
  {
    href: '/conversas',
    label: 'Canal de Conversas',
    icon: MessageSquare,
    profiles: ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  },
  {
    href: '/tarefas',
    label: 'Gestão de Tarefas',
    icon: CheckSquare,
    profiles: ['administrador', 'advogado', 'financeiro', 'comercial', 'estagiario'],
  },
  {
    href: '/financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    profiles: ['administrador', 'financeiro'],
  },
]

const profileLabels: Record<Profile, string> = {
  administrador: 'Administrador',
  advogado: 'Advogado',
  financeiro: 'Financeiro',
  comercial: 'Comercial',
  estagiario: 'Estagiário',
}

interface SidebarProps {
  profile: Profile
  userName: string
}

export default function Sidebar({ profile, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const visibleItems = menuItems.filter((item) =>
    item.profiles.includes(profile)
  )

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-[#1C1C1C] h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#2A2A2A]">
        <p className="text-[#8B1A1A] font-serif text-lg font-semibold leading-tight tracking-wide">
          De Carli
        </p>
        <p className="text-gray-300 font-serif text-lg font-semibold leading-tight tracking-wide">
          Advocacia
        </p>
        <p className="text-gray-600 text-xs mt-1 tracking-widest uppercase">
          Sistema Interno
        </p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#282828]'
              }`}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Rodapé — usuário logado */}
      <div className="px-4 py-4 border-t border-[#2A2A2A]">
        <p className="text-white text-sm font-medium truncate">{userName}</p>
        <p className="text-gray-500 text-xs mt-0.5">{profileLabels[profile]}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs mt-3 transition-colors"
        >
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </aside>
  )
}
