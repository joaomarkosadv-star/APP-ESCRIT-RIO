'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Send, X, Users, MessageSquare } from 'lucide-react'
import type { SessionUser, Profile } from '@/types'

interface Conversation {
  id: number
  name: string
  description: string | null
  last_message: string | null
  last_message_user: string | null
  last_message_at: string | null
}

interface Message {
  id: number
  content: string
  userId: number
  userName: string
  createdAt: string
}

interface Member {
  id: number
  name: string
  email: string
  profile: string
}

const profileLabels: Record<string, string> = {
  administrador: 'Administrador',
  advogado: 'Advogado',
  financeiro: 'Financeiro',
  comercial: 'Comercial',
  estagiario: 'Estagiário',
}

export default function ConversasClient({ user }: { user: SessionUser }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [allUsers, setAllUsers] = useState<Member[]>([])
  const [input, setInput] = useState('')
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  // Create modal state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newMemberIds, setNewMemberIds] = useState<number[]>([])
  const [creating, setCreating] = useState(false)

  // Manage modal state
  const [showManage, setShowManage] = useState(false)
  const [addUserId, setAddUserId] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMsgIdRef = useRef(0)
  const isAdmin = user.profile === ('administrador' as Profile)

  // Load conversation list on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages + start polling when conversation changes
  useEffect(() => {
    if (!selected) return

    lastMsgIdRef.current = 0
    setMessages([])
    setLoadingMsgs(true)
    loadMessages(selected.id, true)
    loadMembers(selected.id)

    const interval = setInterval(() => loadMessages(selected.id, false), 3000)
    return () => clearInterval(interval)
  }, [selected?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    const res = await fetch('/api/conversations')
    if (res.ok) setConversations(await res.json())
  }

  async function loadMessages(convId: number, initial: boolean) {
    const after = initial ? 0 : lastMsgIdRef.current
    const res = await fetch(`/api/conversations/${convId}/messages?after=${after}`)
    if (!res.ok) return
    const data: Message[] = await res.json()
    if (initial) {
      setMessages(data)
      setLoadingMsgs(false)
    } else if (data.length > 0) {
      setMessages(prev => [...prev, ...data])
    }
    if (data.length > 0) lastMsgIdRef.current = data[data.length - 1].id
  }

  async function loadMembers(convId: number) {
    const res = await fetch(`/api/conversations/${convId}/members`)
    if (res.ok) {
      const data = await res.json()
      setMembers(data.members)
    }
  }

  async function loadAllUsers() {
    const res = await fetch('/api/users')
    if (res.ok) setAllUsers(await res.json())
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !selected) return
    const content = input.trim()
    setInput('')
    await fetch(`/api/conversations/${selected.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    await loadMessages(selected.id, false)
    loadConversations()
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null, memberIds: newMemberIds }),
    })
    setCreating(false)
    if (res.ok) {
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      setNewMemberIds([])
      await loadConversations()
    }
  }

  async function addMember() {
    if (!selected || !addUserId) return
    await fetch(`/api/conversations/${selected.id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: parseInt(addUserId) }),
    })
    setAddUserId('')
    await loadMembers(selected.id)
  }

  async function removeMember(userId: number) {
    if (!selected) return
    await fetch(`/api/conversations/${selected.id}/members?userId=${userId}`, { method: 'DELETE' })
    await loadMembers(selected.id)
  }

  function openCreate() {
    loadAllUsers()
    setShowCreate(true)
  }

  function openManage() {
    loadAllUsers()
    setShowManage(true)
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr)
    const isToday = date.toDateString() === new Date().toDateString()
    if (isToday) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const nonMembers = allUsers.filter(u => !members.some(m => m.id === u.id))

  return (
    <>
      {/* ── Layout principal do chat ── */}
      <div
        className="flex border border-gray-200 rounded-lg overflow-hidden bg-white"
        style={{ height: 'calc(100vh - 6.5rem)' }}
      >
        {/* Painel esquerdo — lista de grupos */}
        <div className="w-64 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Grupos</span>
            {isAdmin && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1 text-xs text-[#8B1A1A] hover:text-[#6B1414] font-medium"
              >
                <Plus size={13} /> Novo
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center gap-2">
                <MessageSquare size={28} className="opacity-30" />
                <p className="text-xs">Nenhum grupo ainda.</p>
                {isAdmin && <p className="text-xs">Clique em "Novo" para criar.</p>}
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selected?.id === conv.id ? 'bg-red-50 border-l-2 border-l-[#8B1A1A]' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 truncate">{conv.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.last_message
                      ? `${conv.last_message_user?.split(' ')[0]}: ${conv.last_message}`
                      : 'Sem mensagens'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Painel direito — janela do chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Cabeçalho do chat */}
              <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{selected.name}</h3>
                  {selected.description && (
                    <p className="text-xs text-gray-400">{selected.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {members.length} {members.length === 1 ? 'participante' : 'participantes'}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={openManage}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <Users size={13} /> Gerenciar
                  </button>
                )}
              </div>

              {/* Área de mensagens */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50">
                {loadingMsgs ? (
                  <p className="text-center text-gray-400 text-sm py-8">Carregando...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">
                    Nenhuma mensagem ainda. Seja o primeiro a escrever!
                  </p>
                ) : (
                  messages.map(msg =>
                    msg.userId === user.id ? (
                      // Mensagem própria — direita
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[70%]">
                          <div className="bg-[#1C1C1C] text-white rounded-lg rounded-br-sm px-3.5 py-2.5 text-sm leading-relaxed">
                            {msg.content}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 text-right">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    ) : (
                      // Mensagem de outro — esquerda
                      <div key={msg.id} className="flex flex-col items-start">
                        <p className="text-xs text-gray-500 mb-1 ml-1">{msg.userName}</p>
                        <div className="max-w-[70%]">
                          <div className="bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed">
                            {msg.content}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 ml-1">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    )
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Campo de entrada */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#8B1A1A] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-4 py-2 bg-[#8B1A1A] text-white rounded-md text-sm hover:bg-[#6B1414] transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send size={14} /> Enviar
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <MessageSquare size={40} className="opacity-20" />
              <p className="text-sm">Selecione um grupo para começar.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Criar grupo ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Novo Grupo</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={createGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Nome do grupo *
                </label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Cliente Empresa X, Tarefas Sprint 1..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#8B1A1A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Descrição (opcional)
                </label>
                <input
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Breve descrição do grupo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#8B1A1A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                  Participantes *
                </label>
                <div className="border border-gray-200 rounded-md max-h-44 overflow-y-auto divide-y divide-gray-100">
                  {allUsers.filter(u => u.id !== user.id).map(u => (
                    <label key={u.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMemberIds.includes(u.id)}
                        onChange={e =>
                          setNewMemberIds(prev =>
                            e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                          )
                        }
                        className="accent-[#8B1A1A]"
                      />
                      <div>
                        <p className="text-sm text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{profileLabels[u.profile]}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Você será adicionado automaticamente.</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || creating}
                  className="flex-1 px-4 py-2 bg-[#8B1A1A] text-white rounded-md text-sm hover:bg-[#6B1414] disabled:opacity-50"
                >
                  {creating ? 'Criando...' : 'Criar grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Gerenciar participantes ── */}
      {showManage && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Participantes — {selected.name}</h3>
              <button onClick={() => setShowManage(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                  Participantes atuais
                </label>
                <div className="space-y-1.5">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-400">{profileLabels[m.profile]}</p>
                      </div>
                      {m.id !== user.id && (
                        <button
                          onClick={() => removeMember(m.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Remover"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {nonMembers.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                    Adicionar participante
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={addUserId}
                      onChange={e => setAddUserId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#8B1A1A]"
                    >
                      <option value="">Selecione...</option>
                      {nonMembers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({profileLabels[u.profile]})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addMember}
                      disabled={!addUserId}
                      className="px-3 py-2 bg-[#8B1A1A] text-white rounded-md text-sm hover:bg-[#6B1414] disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowManage(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
