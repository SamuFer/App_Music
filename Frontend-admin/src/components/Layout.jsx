import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-blue-400">MusicAdmin</h2>
        <nav className="space-y-4">
          <Link to="/" className="block p-2 hover:bg-slate-700 rounded transition">🏠 Dashboard</Link>
          <Link to="/users" className="block p-2 hover:bg-slate-700 rounded transition">👤 CRUD Usuarios</Link>
          <Link to="/themes" className="block p-2 hover:bg-slate-700 rounded transition">🎵 Themes</Link>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm">
          <Outlet />{/* <-- Aquí es donde se renderizará cada página */}
        </div>
      </main>
    </div>
  );
}