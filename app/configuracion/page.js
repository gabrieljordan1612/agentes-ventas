'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-8 block"
        >
          Volver al dashboard
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Configuracion</h1>

        {/* SECCIÓN 1: Contexto vendedor */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Datos del Vendedor
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Completa tu información profesional. Estos son los datos exactos que el agente necesita para generar guiones y respuestas precisas sin pedirte más información.
          </p>

          {cargandoContexto ? (
            <div className="space-y-4">
              <div className="w-full bg-gray-100 rounded-lg h-10 animate-pulse"></div>
              <div className="w-full bg-gray-100 rounded-lg h-10 animate-pulse"></div>
              <div className="w-full bg-gray-100 rounded-lg h-10 animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (como te presentas)</label>
                  <input type="text" value={datosVendedor.nombre} onChange={handleChange('nombre')} placeholder="Ej: Gabriel Jordan" className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Marca</label>
                  <input type="text" value={datosVendedor.empresa} onChange={handleChange('empresa')} placeholder="Ej: Get Closer Lab" className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País o Ciudad</label>
                  <input type="text" value={datosVendedor.pais} onChange={handleChange('pais')} placeholder="Ej: Lima, Peru" className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de contacto</label>
                  <input type="text" value={datosVendedor.numero_contacto} onChange={handleChange('numero_contacto')} placeholder="Para mensajes de despedida" className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué problema central resuelves? (1 línea)</label>
                <input type="text" value={datosVendedor.problema} onChange={handleChange('problema')} placeholder="Ej: Ayudamos a agencias B2B a conseguir 5-10 reuniones calificadas por mes" className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿A qué tipo de cliente le vendes? (Industria, tamaño, rol)</label>
                <input type="text" value={datosVendedor.cliente_ideal} onChange={handleChange('cliente_ideal')} placeholder="Ej: CEOs de Agencias de Software con mas de 10 empleados" className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canal principal de ventas</label>
                <input type="text" value={datosVendedor.canal_principal} onChange={handleChange('canal_principal')} placeholder="Ej: LinkedIn y Cold Email" className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contexto Adicional (o documentos antiguos)</label>
                <textarea value={datosVendedor.contexto_legacy} onChange={handleChange('contexto_legacy')} placeholder="Cualquier otra regla, contexto o texto libre..." className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-y focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={guardarContexto}
              disabled={guardandoContexto}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors w-full sm:w-auto"
            >
              {guardandoContexto ? 'Guardando...' : 'Guardar contexto'}
            </button>
          </div>

          {errorContexto && <p className="text-red-500 text-sm mt-3 text-right">{errorContexto}</p>}
          {exitoContexto && (
            <p className="text-green-600 text-sm mt-3 text-right">¡Datos guardados correctamente!</p>
          )}
        </div>

        {/* SECCIÓN 2: API Key */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">API Key de Anthropic</h2>
          <p className="text-sm text-gray-500 mb-4">
            Consiguela en console.anthropic.com, seccion API Keys.
          </p>

          <form onSubmit={guardarApiKey} className="space-y-4">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
            {errorKey && <p className="text-red-500 text-sm">{errorKey}</p>}
            {exitoKey && <p className="text-green-600 text-sm">API key guardada correctamente</p>}
            <button
              type="submit"
              disabled={guardandoKey}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {guardandoKey ? 'Guardando...' : 'Guardar API key'}
            </button>
          </form>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
          <p className="text-sm text-amber-800">
            Tu API key se encripta antes de guardarse. Nadie mas tiene acceso a ella.
          </p>
        </div>
      </div>
    </div>
  )
}