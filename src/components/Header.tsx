'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/agenda':     'Agenda',
  '/processos':  'Processos',
  '/whatsapp':   'WhatsApp Business',
  '/agentes':    'Agentes de IA',
  '/conversas':  'Canal de Conversas',
  '/tarefas':    'Gestão de Tarefas',
  '/financeiro': 'Controle Financeiro',
}

export default function Header() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Sistema Interno'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
      <h1 className="text-gray-700 font-medium text-sm tracking-wide">{title}</h1>
    </header>
  )
}
