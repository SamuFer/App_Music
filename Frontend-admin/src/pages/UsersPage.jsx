import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema } from '../schemas/userSchema'
import { useUsers } from '../hooks/useUsers'

export default function UsersPage() {
  const { users, isLoading, createUser, isCreating, deleteUser } = useUsers();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema)
  });

  const onSave = (data) => {
    createUser(data, { onSuccess: () => reset() });
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
        
        {/* COLUMNA FORMULARIO */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Nuevo Registro</h2>
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

              {/* NUEVO CAMPO: CONTRASEÑA */}
             <div>
                <label className="text-xs font-bold uppercase text-slate-400">Contraseña inicial</label>
                <input 
                    type="password"
                    {...register("password")} 
                    className="w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
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

              <button disabled={isCreating} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200 disabled:opacity-50">
                {isCreating ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </section>

        {/* COLUMNA TABLA */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold uppercase text-slate-500">Usuario</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-500">Rol</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="3" className="p-10 text-center text-slate-400">Cargando datos...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="3" className="p-10 text-center text-slate-400">No hay usuarios registrados</td></tr>
                ) : (
                  users?.map(user => (
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
                    <td className="p-4 text-right">
                      <button onClick={() => deleteUser(user.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
                )} 
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}