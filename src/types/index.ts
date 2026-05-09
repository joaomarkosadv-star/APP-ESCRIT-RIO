export type Profile =
  | 'administrador'
  | 'advogado'
  | 'financeiro'
  | 'comercial'
  | 'estagiario'

export interface User {
  id: number
  name: string
  email: string
  profile: Profile
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface SessionUser {
  id: number
  name: string
  email: string
  profile: Profile
}
