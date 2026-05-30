'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, UserCircle, Key, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'

export default function Configuracion() {
  const [apiKey, setApiKey] = useState('')
  const [guardandoKey, setGuardandoKey] = useState(false)
  const [exitoKey, setExitoKey] = useState(false)
  const [errorKey, setErrorKey] = useState('')

  const [datosVendedor, setDatosVendedor] = useState({
    nombre: '',
    empresa: '',
    pais: '',
    problema: '',
    cliente_ideal: '',
    canal_principal: '',
    numero_contacto: '',
    contexto_legacy: ''
  })

  const [cargandoContexto, setCargandoContexto] = useState(true)
  const [guardandoContexto, setGuardandoContexto] = useState(false)
  const [exitoContexto, setExitoContexto] = useState(false)
  const [errorContexto, setErrorContexto] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function cargarContextoActual() {
      try {
        const res = await fetch('/api/obtener-contexto')
        if (res.ok) {
          const data = await res.json()
          if (data.contexto) {
            try {
              const parsed = JSON.parse(data.contexto)
              setDatosVendedor({
                nombre: parsed.nombre || '',
                empresa: parsed.empresa || '',
                pais: parsed.pais || '',
                problema: parsed.problema || '',
                cliente_ideal: parsed.cliente_ideal || '',
                canal_principal: parsed.canal_principal || '',
                numero_contacto: parsed.numero_contacto || '',
                contexto_legacy: parsed.contexto_legacy || ''
              })
            } catch (e) {
              setDatosVendedor(prev => ({ ...prev, contexto_legacy: data.contexto }))
            }
          }
        }
      } catch (err) {
        console.error('Error cargando contexto:', err)
      } finally {
        setCargandoContexto(false)
      }
    }
    cargarContextoActual()
  }, [])

  async function guardarApiKey(e) {
    e.preventDefault()
    setGuardandoKey(true)
    setErrorKey('')
    setExitoKey(false)

    const res = await fetch('/api/guardar-apikey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })

    const data = await res.json()
    if (!res.ok) { setErrorKey(data.error); setGuardandoKey(false); return }
    setExitoKey(true)
    setApiKey('')
    setGuardandoKey(false)
  }

  const handleChange = (field) => (e) => {
    setDatosVendedor(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function guardarContexto(e) {
    e.preventDefault()
    setGuardandoContexto(true)
    setErrorContexto('')
    setExitoContexto(false)

    const contextoJson = JSON.stringify(datosVendedor)

    const res = await fetch('/api/guardar-contexto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contexto: contextoJson }),
    })

    const data = await res.json()
    if (!res.ok) { setErrorContexto(data.error); setGuardandoContexto(false); return }
    setExitoContexto(true)
    setGuardandoContexto(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#8CB13D]/30 pb-20">
      
      {/* Header Minimalista */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings size={20} className="text-[#8CB13D]" /> Configuración
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-slate-900 font-bold tracking-tight">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-[#8CB13D]"></div>
              <div className="w-3 h-3 rounded-full bg-[#8CB13D]"></div>
            </div>
            get closer
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* SECCIÓN 1: Contexto vendedor */}
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden mb-8 animate-fade-in">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <UserCircle size={24} className="text-[#8CB13D]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Perfil del Vendedor</h2>
              <p className="text-sm text-slate-500">Datos base que usarán los agentes para generar contexto.</p>
            </div>
          </div>
          
          <div className="p-8">
            {cargandoContexto ? (
              <div className="space-y-6">
                <div className="w-full bg-slate-100 rounded-xl h-12 animate-pulse"></div>
                <div className="w-full bg-slate-100 rounded-xl h-12 animate-pulse"></div>
                <div className="w-full bg-slate-100 rounded-xl h-24 animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre (como te presentas)</label>
                    <input type="text" value={datosVendedor.nombre} onChange={handleChange('nombre')} placeholder="Ej: Gabriel Jordan" className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Empresa / Marca</label>
                    <input type="text" value={datosVendedor.empresa} onChange={handleChange('empresa')} placeholder="Ej: Get Closer Lab" className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">País o Ciudad</label>
                    <input type="text" value={datosVendedor.pais} onChange={handleChange('pais')} placeholder="Ej: Lima, Peru" className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Número de contacto</label>
                    <input type="text" value={datosVendedor.numero_contacto} onChange={handleChange('numero_contacto')} placeholder="Para mensajes de despedida" className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">¿Qué problema central resuelves? (1 línea)</label>
                  <input type="text" value={datosVendedor.problema} onChange={handleChange('problema')} placeholder="Ej: Ayudamos a empresas B2B a conseguir 5-10 reuniones..." className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">¿A qué tipo de cliente le vendes? (Industria, tamaño, rol)</label>
                  <input type="text" value={datosVendedor.cliente_ideal} onChange={handleChange('cliente_ideal')} placeholder="Ej: Dueños de negocios B2B con más de 10 empleados" className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Canal principal de ventas</label>
                  <input type="text" value={datosVendedor.canal_principal} onChange={handleChange('canal_principal')} placeholder="Ej: LinkedIn y WhatsApp" className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contexto Adicional (Reglas libres)</label>
                  <textarea value={datosVendedor.contexto_legacy} onChange={handleChange('contexto_legacy')} placeholder="Cualquier otra regla, contexto o texto libre que quieras que el agente considere siempre..." className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm h-32 resize-y focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] outline-none transition-all placeholder-slate-400" />
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex-1 w-full text-center sm:text-left">
                {errorContexto && <p className="text-red-500 text-sm font-medium">{errorContexto}</p>}
                {exitoContexto && (
                  <p className="text-[#8CB13D] text-sm font-medium flex items-center justify-center sm:justify-start gap-2">
                    <CheckCircle2 size={16} /> ¡Perfil guardado correctamente!
                  </p>
                )}
              </div>
              <button
                onClick={guardarContexto}
                disabled={guardandoContexto || cargandoContexto}
                className="bg-[#8CB13D] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#7a9d32] disabled:opacity-50 transition-all w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-[#8CB13D]/20"
              >
                <Save size={18} /> {guardandoContexto ? 'Guardando...' : 'Guardar Perfil'}
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: API Key */}
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <Key size={24} className="text-[#8CB13D]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">API Key de Anthropic</h2>
              <p className="text-sm text-slate-500">Conecta el cerebro de los agentes con tu cuenta de Claude.</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={guardarApiKey} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Clave de Acceso (Secret Key)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] font-mono transition-all placeholder-slate-400"
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full text-center sm:text-left">
                  {errorKey && <p className="text-red-500 text-sm font-medium">{errorKey}</p>}
                  {exitoKey && (
                    <p className="text-[#8CB13D] text-sm font-medium flex items-center justify-center sm:justify-start gap-2">
                      <CheckCircle2 size={16} /> API key guardada con éxito
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={guardandoKey}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all w-full sm:w-auto shadow-md"
                >
                  {guardandoKey ? 'Guardando...' : 'Guardar API Key'}
                </button>
              </div>
            </form>
            
            <div className="bg-[#8CB13D]/5 border border-[#8CB13D]/20 rounded-xl p-4 mt-6">
              <p className="text-sm text-slate-700 flex items-center gap-2 font-medium">
                <span className="text-[#8CB13D]">🔒</span> Tu API key se encripta de forma segura antes de guardarse en la base de datos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}