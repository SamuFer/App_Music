import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { themeSchema } from '../schemas/themeSchema'
import { useThemes } from '../hooks/useThemes'
import { useNavigate } from 'react-router-dom'

export default function ThemesPage() {

  const navigate = useNavigate()
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
                <div key={theme.id} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all group relative">
                  
                  {/* Indicador de Día */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shrink-0
                    ${theme.status === 'active' ? 'border-pink-500 bg-pink-50 text-pink-600' : theme.status === 'upcoming' ? 'border-blue-400 bg-blue-50 text-blue-400' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                    <span className="text-[10px] font-black uppercase tracking-wider">Día</span>
                    <span className="text-2xl font-black">{theme.day}</span>
                  </div>

                  {/* Info Principal + BADGES DE ESTADO (UX Mejorada) */}
                  <div className="flex-1 text-center md:text-left space-y-1.5">
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2">
                      <h4 className="font-bold text-slate-900 text-mx uppercase tracking-tight line-clamp-2 overflow-hidden">{theme.title}</h4>  {/* line-clamp-2 overflow-hidden: limita el número de líneas y oculta el exceso */}
                      
                      {/* Renderizado dinámico de Badges de Texto Claros */}
                      {theme.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 border border-pink-200 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-pink-600"></span>
                          Activa
                        </span>
                      )}
                      {theme.status === 'upcoming' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Programada
                        </span>
                      )}
                      {theme.status === 'closed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          Finalizada
                        </span>
                      )}
                    </div>
                    {/* <p className="text-slate-400 text-sm font-medium">
                      Estado actual: <span className="text-slate-600 capitalize font-semibold">{theme.status}</span>
                    </p> */}
                  </div>

                  {/* Estadísticas */}
                  <div className="flex gap-8 px-6 border-l border-slate-100 hidden sm:flex shrink-0">
                    <div className="text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Votos</span>
                      <span className="text-lg font-black text-slate-700">{theme.votesCount || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Puntaje</span>
                      <span className="text-lg font-black text-indigo-600">
                        {theme.averageScore ? theme.averageScore.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>

                  {/* BOTÓN DE AUDITORÍA VISIBLE (UX Mejorada) + ACCIONES */}
                  <div className="flex items-center gap-3 shrink-0 self-center md:self-auto">
                    {/* Botón de Auditoría siempre visible si la jornada no está vacía */}
                    <button 
                      onClick={() => navigate(`/themes/${theme.id}/audit`)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      📊 <span className="hidden lg:inline">Auditar Votos</span>
                    </button>

                    {/* Acciones Secundarias (Editar/Borrar) se muestran sutilmente */}
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => deleteTheme(theme.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar Temática"
                      >
                        🗑
                      </button>
                    </div>
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