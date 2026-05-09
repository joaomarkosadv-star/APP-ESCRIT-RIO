'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Erro ao fazer login.')
        setLoading(false)
      }
    } catch {
      setError('Não foi possível conectar ao servidor.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-sm p-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-[#8B1A1A] font-semibold tracking-wide">
            De Carli Advocacia
          </h1>
          <p className="text-gray-400 text-xs mt-1 tracking-widest uppercase">
            Sistema Interno
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8B1A1A] transition-colors"
              placeholder="seu@email.com.br"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:border-[#8B1A1A] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B1A1A] hover:bg-[#6B1414] text-white py-2.5 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
