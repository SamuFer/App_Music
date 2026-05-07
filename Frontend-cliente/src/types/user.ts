export type AuthProvider = 'email' | 'spotify'

export type User = {
  id: string
  email: string
  name: string
  avatarUrl?: string
  authProvider: AuthProvider
}

export type Session = {
  user: User
  token: string
  expiresAt: number // timestamp en milisegundos
}