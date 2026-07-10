import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { apiFetch } from '../api/client'; // Importas tu apiFetch real

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Petición real a tu nuevo endpoint del backend
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Si tu backend responde ok, guardamos el usuario en el contexto global
      login(response.user); 
      
      // Redirigimos al panel principal
      navigate('/');

    } catch (err) {
      // Tu apiFetch ya extrae el errorData.error o errorData.message, así que lo capturamos aquí
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] shadow-xl p-8 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-950 text-white rounded-2xl text-xl font-black">
            🔒
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">MusicAdmin</h1>
          <p className="text-xs text-slate-400 font-medium">Panel de Control de Administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@music.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
              ⚠️ {error.replace('// ', '')} {/* Limpiamos los barras si vienen del backend */}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all cursor-pointer"
          >
            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión ✦'}
          </button>
        </form>
      </div>
    </div>
  );
}