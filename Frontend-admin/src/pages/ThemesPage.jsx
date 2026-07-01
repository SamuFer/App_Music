import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { themeSchema } from '../schemas/themeSchema'
import { useThemes } from '../hooks/useThemes'

export default function ThemesPage() {
  // 0. Usamos tu hook con la data real de formatPaginatedResponse
  const { themes, isLoading, createTheme, deleteTheme, isCreating, createThemeError, isCreateError } = useThemes()

  // Le pasamos el esquema a react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      status: "Upcoming" // Valor por defecto para el select
    }
  })

  // Como todo pasó la validación de Zod, formateamos seguros para tu backend escrito a mano
  const onSubmit = (data) => {
    const backendData = {
      day: Number(data.day),
      title: data.title,
      startDate: data.startDate,
      votingDeadline: data.votingDeadline,
      status: data.status.toLowerCase() // 'upcoming' o 'active'
    };

    createTheme(backendData, {
      onSuccess: () => {
        reset() // Limpia el formulario al crear con éxito
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TEMÁTICAS</h1>
          <p className="text-slate-500 font-medium">Control de jornadas y canciones del día.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Jornadas</span>
            <span className="text-xl font-black text-indigo-600">{themes.length}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULARIO ADAPTADO A TU CONTROLLER */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-indigo-400 text-2xl">✦</span> Nueva Jornada
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Día Nº</label>
                  <input 
                    type="number" 
                    required
                    {...register('day')}
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500" 
                    placeholder="17" 
                  />{errors.day && <span className="text-xs text-red-500">{errors.day.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Estado Inicial</label>
                  <select 
                    {...register('status')}
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                  </select>
                  {errors.status && <span className="text-xs text-red-500">{errors.status.message}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título de la Temática</label>
                <input 
                  type="text" 
                  required
                  {...register('title')}
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Ej: Rock de los 80" 
                />{errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha de Inicio</label>
                <input 
                  type="datetime-local" 
                  required
                  {...register('startDate')}
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-white" 
                />{errors.startDate && <span className="text-xs text-red-500">{errors.startDate.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cierre de Votación</label>
                <input 
                  type="datetime-local" 
                  required
                  {...register('votingDeadline')}
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-white" 
                />{errors.votingDeadline && <span className="text-xs text-red-500">{errors.votingDeadline.message}</span>}
              </div>

              {/* Alerta de Error del Servidor */}
              {isCreateError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-200 font-medium animate-pulse">
                  ⚠️ {createThemeError?.message || "Hubo un error al guardar en el servidor"}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                {isCreating ? 'Lanzando...' : 'Lanzar Jornada'}
              </button>
            </form>
          </section>
        </aside>

        {/* LISTADO REAL CON DATOS DE TU RESPUESTA PAGINADA */}
        <main className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-bold text-slate-800">Historial de Jornadas</h2>
          </div>

          {isLoading ? (
            <p className="text-slate-400 text-center py-10 font-medium">Cargando temáticas...</p>
          ) : themes.length === 0 ? (
            <p className="text-slate-400 text-center py-10 font-medium">No hay temáticas registradas.</p>
          ) : (
            <div className="grid gap-4">
              {themes.map((theme) => (
                <div key={theme._id} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all group">
                  
                  {/* Día usando la propiedad 'day' de tu modelo */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 
                    ${theme.status === 'active' ? 'border-pink-500 bg-pink-50 text-pink-600' : theme.status === 'upcoming' ? 'border-blue-400 bg-blue-50 text-blue-400' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                    <span className="text-[10px] font-black uppercase">Día</span>
                    <span className="text-2xl font-black">{theme.day}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{theme.title}</h3>
                      {theme.status === 'active' && (
                        <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm font-medium">
                      Estado actual: <span className="text-slate-600 capitalize">{theme.status}</span>
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => deleteTheme(theme._id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 cursor-pointer"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}