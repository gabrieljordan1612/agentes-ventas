'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Configuracion() {
  const [apiKey, setApiKey] = useState('')
  const [guardandoKey, setGuardandoKey] = useState(false)
  const [exitoKey, setExitoKey] = useState(false)
  const [errorKey, setErrorKey] = useState('')

  const [contexto, setContexto] = useState('')
  const [guardandoContexto, setGuardandoContexto] = useState(false)
  const [exitoContexto, setExitoContexto] = useState(false)
  const [errorContexto, setErrorContexto] = useState('')
  const [nombreArchivo, setNombreArchivo] = useState('')

  const router = useRouter()

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

  async function cargarWord(e) {
    const file = e.target.files[0]
    if (!file) return

    setNombreArchivo(file.name)
    setErrorContexto('')

    try {
      const mammoth = await import('mammoth')
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      setContexto(result.value)
    } catch (err) {
      setErrorContexto('Error leyendo el archivo. Asegurate que sea un .docx')
    }
  }

  async function guardarContexto(e) {
    e.preventDefault()
    if (!contexto.trim()) return
    setGuardandoContexto(true)
    setErrorContexto('')
    setExitoContexto(false)

    const res = await fetch('/api/guardar-contexto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contexto }),
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
            Tu contexto de vendedor
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Sube tu archivo Word con tu contexto: quién eres, tu empresa, qué vendes y a quién.
            El agente usará esto automáticamente en cada consulta.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
            <input
              type="file"
              accept=".docx"
              onChange={cargarWord}
              className="hidden"
              id="word-upload"
            />
            <label htmlFor="word-upload" className="cursor-pointer">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm font-medium text-gray-700">
                {nombreArchivo || 'Click para subir tu archivo .docx'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Solo archivos Word (.docx)</p>
            </label>
          </div>

          {contexto && (
            <div className="mb-4">
              <p className="text-xs text-green-600 font-medium mb-2">
                Archivo leido correctamente — {contexto.length} caracteres
              </p>
              <textarea
                value={contexto}
                onChange={e => setContexto(e.target.value)}
                className="w-full bg-white text-black border border-gray-200 rounded-lg px-3 py-2 text-xs h-32 resize-none focus:outline-none"
                placeholder="El contenido de tu contexto aparecera aqui..."
              />
            </div>
          )}

          {errorContexto && <p className="text-red-500 text-sm mb-3">{errorContexto}</p>}
          {exitoContexto && (
            <p className="text-green-600 text-sm mb-3">Contexto guardado correctamente</p>
          )}

          <button
            onClick={guardarContexto}
            disabled={!contexto.trim() || guardandoContexto}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {guardandoContexto ? 'Guardando...' : 'Guardar contexto'}
          </button>
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