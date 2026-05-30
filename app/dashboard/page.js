'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const agentes = [
  {
    id: 'seguimiento',
    nombre: 'Agente de Seguimiento',
    descripcion: 'Genera mensajes exactos para cada etapa del seguimiento con un prospecto.',
    color: 'bg-blue-50 border-blue-200',
    icono: '📩',
  },
  {
    id: 'objeciones',
    nombre: 'Agente de Objeciones',
    descripcion: 'Rompe y previene objeciones de ventas B2B en tiempo real.',
    color: 'bg-purple-50 border-purple-200',
    icono: '🛡️',
  },
  {
    id: 'linkedin',
    nombre: 'Agente de LinkedIn',
    descripcion: 'Genera posts y comentarios estratégicos para LinkedIn.',
    color: 'bg-green-50 border-green-200',
    icono: '💼',
  },
  {
    id: 'prospecto',
    nombre: 'Agente de Prospección',
    descripcion: 'Crea mensajes de outreach para contactar prospectos en frío.',
    color: 'bg-orange-50 border-orange-200',
    icono: '🎯',
  },
  {
    id: 'conexion',
    nombre: 'Agente Etapa de Conexión',
    descripcion: 'Genera aperturas y preguntas para conectar con leads con contexto previo.',
    color: 'bg-teal-50 border-teal-200',
    icono: '🤝',
  },
]

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tus Agentes de Ventas</h1>
            <p className="text-gray-500 text-sm mt-1">Selecciona el agente que necesitas usar</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/configuracion')}
              className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Configuración
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentes.map(agente => (
            <button
              key={agente.id}
              onClick={() => router.push(`/dashboard/agente?tipo=${agente.id}`)}
              className={`${agente.color} border rounded-xl p-6 text-left hover:shadow-md transition-shadow`}
            >
              <span className="text-3xl">{agente.icono}</span>
              <h2 className="text-base font-semibold text-gray-900 mt-3">{agente.nombre}</h2>
              <p className="text-sm text-gray-600 mt-1">{agente.descripcion}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}