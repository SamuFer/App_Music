import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { themeSchema } from '../schemas/themeSchema'
import { useThemes } from '../hooks/useThemes'
import { useNavigate } from 'react-router-dom'
import { themesApi } from '../api/themes'

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

export default function ThemesPage() {
  const navigate = useNavigate()
  
  const { themes, isLoading, createTheme, deleteTheme, isCreating, createThemeError, isCreateError, updateTheme, invalidateThemes } = useThemes()
  
  const [editingTheme, setEditingTheme] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('active')

  const ahora = new Date()
  const hasAlreadyStarted = editingTheme && (ahora > new Date(editingTheme.startDate))

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      day: '',
      title: '',
      status: 'upcoming', 
      startDate: '',
      votingDeadline: ''
    }
  })

  const watchedStartDate = useWatch({ control, name: 'startDate' })
  const watchedVotingDeadline = useWatch({ control, name: 'votingDeadline' })

  useEffect(() => {
    if (!watchedStartDate || !watchedVotingDeadline) return

    const ahoraCheck = new Date()
    const startCheck = new Date(watchedStartDate)
    const deadlineCheck = new Date(watchedVotingDeadline)

    let calculated = 'upcoming'

    if (ahoraCheck >= startCheck && ahoraCheck <= deadlineCheck) {
      calculated = 'active'
    } else if (ahoraCheck > deadlineCheck) {
      calculated = 'closed'
    }

    setValue('status', calculated)
  }, [watchedStartDate, watchedVotingDeadline, setValue])

  useEffect(() => {
    if (editingTheme) {
      const backendStatus = editingTheme.status || 'upcoming'
      const cleanStatus = backendStatus.toLowerCase()

      setValue('day', editingTheme.day)
      setValue('title', editingTheme.title)
      setValue('status', cleanStatus) 
      setValue('startDate', formatDateForInput(editingTheme.startDate))
      setValue('votingDeadline', formatDateForInput(editingTheme.votingDeadline))
    } else {
      reset({
        day: '',
        title: '',
        status: 'upcoming',
        startDate: '',
        votingDeadline: ''
      })
    }
  }, [editingTheme, setValue, reset])

  useEffect(() => {
    if (themes.length > 0 && !isLoading) {
      const tieneActivas = themes.some(t => {
        const d = new Date(t.votingDeadline)
        const s = new Date(t.startDate)
        return t.status.toLowerCase() === 'active' && ahora >= s && ahora <= d
      })
      if (!tieneActivas && activeFilter === 'active') {
        setActiveFilter('all')
      }
    }
  }, [themes, isLoading])

  const processedThemes = useMemo(() => {
    const ahoraCheck = new Date()
    return themes.map(theme => {
      const start = new Date(theme.startDate)
      const deadline = new Date(theme.votingDeadline)
      
      let calculatedStatus = theme.status.toLowerCase()
      
      if (ahoraCheck < start) {
        calculatedStatus = 'upcoming'
      } else if (ahoraCheck >= start && ahoraCheck <= deadline) {
        calculatedStatus = 'active'
      } else if (ahoraCheck > deadline) {
        calculatedStatus = 'closed'
      }

      return { ...theme, calculatedStatus }
    })
  }, [themes])

  const filteredThemes = useMemo(() => {
    if (activeFilter === 'all') return processedThemes
    return processedThemes.filter(t => t.calculatedStatus === activeFilter)
  }, [processedThemes, activeFilter])

  const onSubmit = async (data) => {
    const backendData = {
      day: Number(data.day),
      title: data.title,
      status: data.status.toLowerCase(), 
      startDate: data.startDate,
      votingDeadline: data.votingDeadline
    }

    if (editingTheme) {
      setUpdateError(null)
      
      updateTheme({ id: editingTheme.id, data: backendData }, {
        onSuccess: () => {
          setEditingTheme(null)
        },
        onError: (err) => {
          setUpdateError(err.message || 'Error al actualizar la temática')
        }
      })
    } else {
      createTheme(backendData, {
        onSuccess: () => reset()
      })
    }
  }

  const handleForceClose = async (themeId) => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas forzar el cierre inmediato?')) {
      try {
        await themesApi.forceClose(themeId)
        invalidateThemes() 
      } catch (err) {
        alert('Error al cerrar la jornada: ' + err.message)
      }
    }
  }

  const formatAuditDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: '2-digit' }) + ', ' + 
           date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">TEMÁTICAS</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Control inteligente de jornadas y extensiones de tiempo.</p>
        </div>
        <div className="flex gap-3 self-start sm:self-center">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center min-w-[100px]">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            <span className="text-lg md:text-xl font-black text-indigo-600">{themes.length}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* ASIDE: FORMULARIO */}
        <aside className="lg:col-span-4 space-y-6 order-1 lg:order-1">
          <section className={`p-6 rounded-[2rem] shadow-xl relative overflow-hidden transition-all duration-300 border
            ${editingTheme ? 'bg-indigo-950 border-indigo-500/30 text-white' : 'bg-slate-900 border-transparent text-white'}`}
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

            <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-indigo-400 text-2xl">{editingTheme ? '✏️' : '✦'}</span> 
              {editingTheme ? 'Editar / Extender Tiempo' : 'Nueva Jornada'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
              
              {/* FILA: DÍA Y ESTADO INICIAL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Día Nº</label>
                  <input 
                    type="number" 
                    required
                    disabled={hasAlreadyStarted} 
                    {...register('day')}
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                    placeholder="Ej: 31" 
                  />
                  {errors.day && <span className="text-xs text-red-400 block">{errors.day.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Estado Calculado</label>
                  <input 
                    type="text"
                    readOnly
                    disabled
                    {...register('status')}
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 text-indigo-300 font-bold text-sm cursor-not-allowed opacity-90 capitalize"
                  />
                </div>
              </div>

              {/* TÍTULO */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Título de la Temática</label>
                <input 
                  type="text" 
                  required
                  {...register('title')}
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                  placeholder="Ej: Rock de los 80" 
                />
                {errors.title && <span className="text-xs text-red-400 block">{errors.title.message}</span>}
              </div>

              {/* FECHA INICIO */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Fecha de Inicio</label>
                <input 
                  type="datetime-local" 
                  required
                  disabled={hasAlreadyStarted}
                  {...register('startDate')}
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                />
                {errors.startDate && <span className="text-xs text-red-400 block">{errors.startDate.message}</span>}
              </div>

              {/* FECHA LÍMITE */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Cierre de Votación (Ampliar Horas)</label>
                <input 
                  type="datetime-local" 
                  required
                  {...register('votingDeadline')}
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-400 transition-all text-sm border border-transparent focus:border-emerald-500" 
                />
                {errors.votingDeadline && <span className="text-xs text-red-400 block">{errors.votingDeadline.message}</span>}
              </div>

              <p className="text-[10px] text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
                ℹ️ El estado cambia de forma automática según la franja de horario configurada para evitar errores de validación.
              </p>

              {/* ERRORES */}
              {(isCreateError || updateError || createThemeError) && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-200 font-medium">
                  ⚠️ {updateError || createThemeError?.response?.data?.message || createThemeError?.message || "Error al procesar la operación"}
                </div>
              )}

              {/* BOTONES ACCIÓN */}
              <button 
                type="submit" 
                disabled={isCreating || isUpdating}
                className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer shadow-md active:scale-95
                  ${editingTheme ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-indigo-500 hover:bg-indigo-400 text-white'} disabled:bg-slate-700`}
              >
                {editingTheme ? (isUpdating ? 'Actualizando...' : 'Guardar y Actualizar') : (isCreating ? 'Lanzando...' : 'Lanzar Jornada')}
              </button>

              {editingTheme && (
                <button 
                  type="button" 
                  onClick={() => setEditingTheme(null)}
                  className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/20 hover:border-white/40 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancelar Edición
                </button>
              )}
            </form>
          </section>
        </aside>

        {/* MAIN LISTADO */}
        <main className="lg:col-span-8 space-y-4 order-2 lg:order-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap gap-1 w-full">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'active', label: '🔥 Activas' },
                { id: 'upcoming', label: '⏳ Próximas' },
                { id: 'closed', label: '📁 Cerradas' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer
                    ${activeFilter === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <p className="text-slate-400 text-center py-12 font-medium">Cargando historial...</p>
          ) : filteredThemes.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 p-12 rounded-[2rem] text-center">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wide">No hay jornadas en este filtro</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredThemes.map((theme) => {
                const currentStatus = theme.calculatedStatus

                return (
                  <div key={theme.id} className="bg-white border border-slate-200 p-4 md:p-5 rounded-[2rem] flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 hover:shadow-md transition-all group">
                    
                    <div className="flex items-center justify-between md:justify-start gap-4">
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center border-2 shrink-0
                        ${currentStatus === 'active' ? 'border-pink-500 bg-pink-50 text-pink-600' : currentStatus === 'upcoming' ? 'border-blue-400 bg-blue-50 text-blue-400' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider leading-none">Día</span>
                        <span className="text-xl md:text-2xl font-black mt-0.5">{theme.day}</span>
                      </div>

                      <div className="flex-1 md:hidden space-y-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight break-words">{theme.title}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentStatus === 'active' && <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-pink-100 text-pink-700 animate-pulse">Activa</span>}
                          {currentStatus === 'upcoming' && <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-blue-100 text-blue-700">Upcoming</span>}
                          {currentStatus === 'closed' && <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-slate-100 text-slate-600">Cerrada</span>}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col flex-1 min-w-[280px] gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{theme.title}</h4>
                        {currentStatus === 'active' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-pink-100 text-pink-700 border border-pink-200 animate-pulse">Activa</span>}
                        {currentStatus === 'upcoming' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-blue-100 text-blue-700 border border-blue-200">Upcoming</span>}
                        {currentStatus === 'closed' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">Cerrada</span>}
                      </div>

                      <div className="self-start inline-flex items-center gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-2.5">
                        <div className="text-left">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Apertura</span>
                          <span className="text-xs font-bold text-slate-800">{formatAuditDate(theme.startDate)}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200" />
                        <div className="text-left">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Límite</span>
                          <span className="text-xs font-bold text-slate-800">{formatAuditDate(theme.votingDeadline)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between sm:justify-start items-center gap-6 p-3 bg-slate-50 md:bg-transparent rounded-2xl md:p-0 md:border-l md:border-slate-100 md:pl-6 shrink-0">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Votos</span>
                        <span className="text-sm font-black text-slate-700">{theme.votesCount || 0}</span>
                      </div>
                      <div className="md:pl-4">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Puntaje</span>
                        <span className="text-sm font-black text-indigo-600">{theme.averageScore ? theme.averageScore.toFixed(1) : '0.0'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-none justify-end">
                      {currentStatus === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleForceClose(theme.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                          🔒 Cerrar Ya
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('/songs', { state: { themeId: theme.id } })}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        + Canciones
                      </button>
                      <button 
                        onClick={() => navigate(`/themes/${theme.id}/audit`)}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-600 cursor-pointer"
                      >
                        📊 Auditoría
                      </button>
                      <div className="flex gap-1 ml-auto sm:ml-0">
                        <button onClick={() => setEditingTheme(theme)} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-pointer">✏️</button>
                        <button onClick={() => { if(window.confirm('🚨 ¿Eliminar permanentemente?')) deleteTheme(theme.id) }} className="p-2 bg-red-50 hover:bg-red-100 text-red-400 rounded-xl border border-red-100 cursor-pointer">🗑</button>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}