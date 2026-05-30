'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Send, ShieldCheck, Network, Target, Plug, Search, Lightbulb, Settings, LogOut } from 'lucide-react'

const agentes = [
  {
    id: 'seguimiento',
    nombre: 'Agente de Seguimiento',
    descripcion: 'Genera mensajes exactos para cada etapa del seguimiento con un prospecto.',
    Icono: Send,
  },
  {
    id: 'objeciones',
    nombre: 'Agente de Objeciones',
    descripcion: 'Rompe y previene objeciones de ventas B2B en tiempo real.',
    Icono: ShieldCheck,
  },
  {
    id: 'linkedin',
    nombre: 'Agente de LinkedIn',
    descripcion: 'Genera posts y comentarios estratégicos para LinkedIn.',
    Icono: Network,
  },
  {
    id: 'prospecto',
    nombre: 'Agente de Prospección',
    descripcion: 'Crea mensajes de outreach para contactar prospectos en frío.',
    Icono: Target,
  },
  {
    id: 'conexion',
    nombre: 'Agente Etapa de Conexión',
    descripcion: 'Genera aperturas y preguntas para conectar con leads con contexto previo.',
    Icono: Plug,
  },
  {
    id: 'situacion',
    nombre: 'Preguntas de Situación',
    descripcion: 'Diseña preguntas estratégicas de situación basadas en tu industria.',
    Icono: Search,
  },
  {
    id: 'conciencia',
    nombre: 'Consciencia del Problema',
    descripcion: 'Guía al prospecto a descubrir y sentir la urgencia de su problema.',
    Icono: Lightbulb,
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#8CB13D]/30 pb-20">
      
      {/* HERO SECTION */}
      <div className="relative h-[340px] w-full overflow-hidden bg-black animate-fade-in border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop" 
          alt="Dashboard Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay grayscale-[50%]"
        />
        
        <div className="relative z-20 max-w-6xl mx-auto px-6 h-full flex flex-col justify-between py-8">
          {/* Header Top */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full bg-[#8CB13D]"></div>
                <div className="w-4 h-4 rounded-full bg-[#8CB13D]"></div>
              </div>
              <span className="text-xl font-bold tracking-tight">get closer</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/configuracion')}
                className="flex items-center gap-2 text-sm font-medium text-white/90 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl transition-all"
              >
                <Settings size={16} /> <span className="hidden sm:inline">Configuración</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-white/90 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl transition-all hover:text-rose-400"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
          
          {/* Header Titles */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
              Tus Agentes de Ventas
            </h1>
            <p className="text-slate-300 text-base md:text-lg max-w-xl">
              Selecciona el módulo de inteligencia artificial que necesitas para continuar la conversación con tu prospecto.
            </p>
          </div>
        </div>
      </div>

      {/* CARDS GRID (Overlapping Hero) */}
      <div className="relative z-30 max-w-6xl mx-auto px-6 -mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentes.map((agente, index) => (
            <button
              key={agente.id}
              onClick={() => router.push(`/dashboard/agente?tipo=${agente.id}`)}
              className={`group bg-white border border-slate-200/60 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#8CB13D]/10 hover:border-[#8CB13D]/50 animate-slide-up relative overflow-hidden`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Decoración de fondo sutil */}
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none transform translate-x-4 -translate-y-4 text-[#8CB13D]">
                <agente.Icono size={120} strokeWidth={1} />
              </div>
              
              <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-slate-100 text-[#8CB13D] shadow-sm`}>
                <agente.Icono size={22} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 transition-colors mb-2 tracking-tight group-hover:text-slate-950">{agente.nombre}</h2>
              <p className="text-[14px] text-slate-500 leading-relaxed font-medium">{agente.descripcion}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}