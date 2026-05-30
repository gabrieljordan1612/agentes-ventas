'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setCargando(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-[#8CB13D]/30">
      
      {/* LEFT COLUMN - IMAGE */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Abstract Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale-[50%]"
        />

        <div className="relative z-20 flex flex-col justify-end p-16 w-full h-full">
          <div className="flex items-center gap-3 mb-8 text-white">
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full bg-[#8CB13D]"></div>
              <div className="w-4 h-4 rounded-full bg-[#8CB13D]"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight">get closer</span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            La academia de <br/><span className="text-[#8CB13D]">ventas B2B con IA</span> <br/>para LATAM
          </h2>
          
          <div className="space-y-4">
            {[
              'Agentes entrenados con nuestra metodología',
              'Rompe objeciones en tiempo real',
              'Prospección quirúrgica y automatizada'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={20} className="text-[#8CB13D]" />
                <span className="text-base">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 lg:hidden text-slate-900">
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full bg-[#8CB13D]"></div>
                <div className="w-4 h-4 rounded-full bg-[#8CB13D]"></div>
              </div>
              <span className="text-2xl font-bold tracking-tight">get closer</span>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Acceso Alumnos</h1>
            <p className="text-slate-500">Ingresa tus credenciales para acceder a tus agentes de ventas.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] transition-all shadow-sm placeholder-slate-400"
                placeholder="alumno@empresa.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Contraseña</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] transition-all shadow-sm placeholder-slate-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="group w-full flex items-center justify-center gap-2 bg-[#8CB13D] text-white rounded-xl py-3.5 text-sm font-bold hover:bg-[#7a9d32] focus:ring-4 focus:ring-[#8CB13D]/20 disabled:opacity-70 transition-all shadow-lg"
            >
              {cargando ? 'Autenticando...' : 'Iniciar Sesión'}
              {!cargando && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

        </div>
      </div>
      
    </div>
  )
}