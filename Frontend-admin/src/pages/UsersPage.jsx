import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, updateUserSchema } from '../schemas/userSchema'
import { useUsers } from '../hooks/useUsers'

export default function UsersPage() {
  // Estado para la paginación local o de la API
  const [page, setPage] = useState(1);
  const limit = 5; // Usuarios por página

  // Estado para saber si estamos editando un usuario
  const [editingUser, setEditingUser] = useState(null);

  // Extraemos las funciones de tu hook (añadimos updateUser)
  const { 
    users, 
    pagination, 
    isLoading, 
    createUser, 
    isCreating, 
    updateUser, 
    isUpdating, 
    deleteUser, 
    restoreUser 
  } = useUsers({ page, limit })
  
  // Resolver dinámico según si creamos o editamos
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(editingUser ? updateUserSchema : createUserSchema)
  });

  // Cargar datos en el formulario para editar
  const handleEditClick = (user) => {
    setEditingUser(user);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("role", user.role);
    // La contraseña no la poblamos por seguridad
  };

  // Cancelar modo edición
  const handleCancelEdit = () => {
    setEditingUser(null);
    reset({ name: '', email: '', password: '', role: '' });
  };

  // Guardar (Crear o Actualizar según corresponda)
  // En UsersPage.jsx

  const onSave = (data) => {
    if (editingUser) {
      const payload = { ...data };

      // Si la contraseña viene vacía, la eliminamos
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }

      // OBTENER ID CORRECTO (Mongoose usa _id)
      const userId = editingUser._id || editingUser.id;

      // PETICIÓN UPDATE: Pasamos id y userData por separado
      updateUser(
        { id: userId, userData: payload }, 
        { onSuccess: () => handleCancelEdit() }
      );
    } else {
      // PETICIÓN CREATE (POST)
      createUser(data, { onSuccess: () => reset() });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Usuarios</h1>
          <p className="text-slate-500 mt-2">Gestiona los accesos y roles del sistema.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA FORMULARIO (CREAR / EDITAR) */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingUser ? `Editar: ${editingUser.name}` : 'Nuevo Registro'}
              </h2>
              {editingUser && (
                <button 
                  onClick={handleCancelEdit} 
                  type="button" 
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium underline"
                >
                  Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Nombre</label>
                <input {...register("name")} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ej. Alex Smith" />
                {errors.name && <span className="text-red-500 text-xs px-1">{errors.name.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email</label>
                <input {...register("email")} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="alex@empresa.com" />
                {errors.email && <span className="text-red-500 text-xs px-1">{errors.email.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">
                  {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña inicial'}
                </label>
                <input 
                    type="password"
                    {...register("password")} 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder={editingUser ? 'Dejar en blanco para conservar' : ''}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 px-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Rol</label>
                <select {...register("role")} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
                {errors.role && <span className="text-red-500 text-xs px-1">{errors.role.message}</span>}
              </div>

              <button 
                disabled={isCreating || isUpdating} 
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                {isCreating || isUpdating 
                  ? 'Guardando...' 
                  : editingUser 
                    ? 'Actualizar Usuario' 
                    : 'Crear Usuario'
                }
              </button>
            </form>
          </div>
        </section>

        {/* COLUMNA TABLA + PAGINACIÓN */}
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold uppercase text-slate-500">Usuario</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-500">Rol</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-500">Estado</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="p-10 text-center text-slate-400">Cargando datos...</td></tr>
                ) : !users || users.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-slate-400">No hay usuarios registrados</td></tr>
                ) : (
                  users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-700">{user.name}</div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {user.isActive ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>

                    {/* BOTONES DE ACCIÓN (EDITAR / DESACTIVAR / RESTAURAR) */}
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="text-slate-400 hover:text-indigo-600 font-medium text-xs transition-colors p-1"
                      >
                        Editar
                      </button>

                      {user.isActive ? (
                        <button 
                          onClick={() => { if(window.confirm('🚨 ¿Deseas desactivar la cuenta de este usuario?')) deleteUser(user.id)}} 
                          className="text-slate-400 hover:text-red-500 font-medium text-xs transition-colors p-1"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button 
                          onClick={() => restoreUser && restoreUser(user.id)} 
                          className="text-emerald-600 hover:text-emerald-700 font-bold text-xs transition-colors p-1"
                        >
                          Reactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
                )} 
              </tbody>
            </table>

            {/* SECCIÓN DE PAGINACIÓN */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>
                Mostrando {users?.length || 0} de {pagination?.totalDocuments || 0} usuarios (Página {page} de {pagination?.totalPages || 1})
              </span>
              
              <div className="space-x-2">
                <button
                  disabled={!pagination?.hasPrevPage}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  Anterior
                </button>
                <button
                  disabled={!pagination?.hasNextPage}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}