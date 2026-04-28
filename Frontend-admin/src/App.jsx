import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ThemesPage from './pages/ThemesPage';
// import CreateUser from './pages/CreateUser';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="themes" element={<ThemesPage />} />
          <Route path="*" element={<h1 className="p-10">404 - No encontrado</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}