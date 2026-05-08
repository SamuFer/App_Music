import { atom } from 'nanostores'
import type { User } from '../types/user'
import { getSession, logout as authLogout } from '../services/auth'
import { AUTH_CONFIG } from '../services/authConfig'

// El átomo central — null significa "no hay nadie logueado"
export const $user = atom<User | null>(null)

// Helper: devuelve avatar URL con fallback
export function getUserAvatar(user: User | null): string {
  return user?.avatarUrl || AUTH_CONFIG.FALLBACK_AVATAR
}

// Inicializar desde localStorage al cargar la app
export function initSession(): void {
  const session = getSession()
  $user.set(session ? session.user : null)
}

// Cerrar sesión desde cualquier componente
export function logoutUser(): void {
  authLogout()
  $user.set(null)
  window.location.href = '/login'
}