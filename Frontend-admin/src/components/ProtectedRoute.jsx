import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 font-medium animate-pulse">Verificando rol de administrador...</p>
      </div>
    );
  }

  // Si no está logueado o el rol no es admin, denegamos el acceso directo
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Si pasa la validación, renderiza el panel de administración
  return <Outlet />;
}