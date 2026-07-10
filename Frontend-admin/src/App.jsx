import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ThemesPage from './pages/ThemesPage';
import SongsPage from './pages/Songspage';
import AuditPage from './pages/AuditPage';
import LoginPage from './pages/LoginPage';
// import CreateUser from './pages/CreateUser';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública del Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Bloque de seguridad de administrador */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="themes" element={<ThemesPage />} />
              <Route path="songs" element={<SongsPage />} />
              <Route path="themes/:themeId/audit" element={<AuditPage />} />
              <Route path="*" element={<h1 className="p-10">404 - No encontrado</h1>} />
            </Route>
          </Route>

          {/* Si entran a cualquier otra URL rota por fuera del login, los manda a la raíz */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}