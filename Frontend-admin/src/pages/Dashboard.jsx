export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded shadow-sm">
          <h3 className="text-blue-700 font-semibold uppercase text-sm">Usuarios Totales</h3>
          <p className="text-3xl font-bold text-blue-900">124</p>
        </div>
        <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded shadow-sm">
          <h3 className="text-green-700 font-semibold uppercase text-sm">Votos Hoy</h3>
          <p className="text-3xl font-bold text-green-900">1,204</p>
        </div>
        <div className="p-6 bg-purple-50 border-l-4 border-purple-500 rounded shadow-sm">
          <h3 className="text-purple-700 font-semibold uppercase text-sm">Eventos Activos</h3>
          <p className="text-3xl font-bold text-purple-900">5</p>
        </div>
      </div>
    </div>
  );
}