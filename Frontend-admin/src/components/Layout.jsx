import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext'

export default function Layout() {
  const { user, logout } = useAuth(); // Extraemos el usuario y la función de salida
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-blue-400">MusicAdmin</h2>
        <nav className="space-y-4">
          <Link to="/" className="block p-2 hover:bg-slate-700 rounded transition">🏠 Dashboard</Link>
          <Link to="/users" className="block p-2 hover:bg-slate-700 rounded transition">👤 CRUD Usuarios</Link>
          <Link to="/themes" className="block p-2 hover:bg-slate-700 rounded transition">🎵 Themes</Link>
          <Link to="/songs" className="block p-2 hover:bg-slate-700 rounded transition">🎵 Canciones</Link>
        </nav>
        {/* Sección inferior con datos del Administrador y Cierre de Sesión */}
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <div className="px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sesión como admin:</p>
            <p className="text-xs font-semibold text-blue-300 truncate mt-0.5">{user?.email || 'Administrador'}</p>
          </div>
          
          <button 
            type="button"
            onClick={logout}
            className="w-full text-left p-2 bg-slate-700/50 hover:bg-red-900/40 hover:text-red-300 text-slate-300 rounded text-xs font-bold transition cursor-pointer"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-sm">
          <Outlet />{/* <-- Aquí es donde se renderizará cada página */}
        </div>
      </main>
    </div>
  );
}