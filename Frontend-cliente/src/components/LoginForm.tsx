import { useState } from 'react'
import { loginWithEmail } from '../services/auth'
import { $user } from '../stores/sessionStore'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const session = await loginWithEmail(email, password)
      $user.set(session.user)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="font-display text-sm text-gray-400" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@test.com"
          required
          className="bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition"
        />
      </div>

      {/* <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition"
        />
      </div> */}

      <div className="flex flex-col gap-1">
        <label className="font-display text-sm text-gray-400" htmlFor="password">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-white/5 border border-white/10 px-4 py-2.5 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
          >
            {showPassword ? (
              // Ojo cerrado
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              // Ojo abierto
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="font-display bg-white text-black font-semibold py-2.5 hover:bg-gray-200 transition outline-[1.8px] -outline-offset-7 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? '[ Iniciando sesión... ]' : '[ Iniciar sesión ]'}
      </button>
    </form>
  )
}