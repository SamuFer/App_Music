import { AUTH_CONFIG } from './authConfig'
import type { Session, User } from '../types/user'

// --- Usuarios mock para desarrollo ---
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'test@test.com',
    name: 'Usuario Test',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    authProvider: 'email',
  },
]

// --- Helpers de sesión ---
export function getSession(): Session | null {
  const raw = localStorage.getItem('session')
  if (!raw) return null

  const session: Session = JSON.parse(raw)

  // Si el token venció, limpiamos y devolvemos null
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem('session')
    return null
  }

  return session
}

function saveSession(user: User, token: string): Session {
  const session: Session = {
    user,
    token,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 horas
  }
  localStorage.setItem('session', JSON.stringify(session))
  return session
}

export function logout(): void {
  localStorage.removeItem('session')
}

// --- Login con email/password ---
export async function loginWithEmail(
  email: string,
  password: string
): Promise<Session> {
  if (AUTH_CONFIG.USE_MOCK) {
    // Simulamos delay de red
    await new Promise((r) => setTimeout(r, 800))

    const user = MOCK_USERS.find((u) => u.email === email)

    if (!user || password.length < 4) {
      throw new Error('Email o contraseña incorrectos')
    }

    return saveSession(user, 'mock-token-123')
  }

  // Cuando el backend esté listo, esto se activa solo
  const res = await fetch(`${AUTH_CONFIG.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error('Email o contraseña incorrectos')

  const { user, token } = await res.json()
  return saveSession(user, token)
}

// --- Login con Spotify ---
export function loginWithSpotify(): void {
  if (AUTH_CONFIG.USE_MOCK) {
    // Mock: simulamos que Spotify devolvió un usuario
    const spotifyUser: User = {
      id: '2',
      email: 'spotify@test.com',
      name: 'Usuario Spotify',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      authProvider: 'spotify',
    }
    saveSession(spotifyUser, 'mock-spotify-token-456')
    window.location.href = '/' // redirigimos al home
    return
  }

  // Cuando el backend esté listo, redirige al OAuth real
  window.location.href = `${AUTH_CONFIG.API_URL}/auth/spotify`
}