'use client'
import ReactMarkdown from 'react-markdown'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const nombresAgentes = {
  seguimiento: 'Agente de Seguimiento',
  objeciones: 'Agente de Objeciones',
  linkedin: 'Agente de LinkedIn',
  prospecto: 'Agente de Prospección',
}

function AgenteChat() {
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'seguimiento'
  const router = useRouter()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function enviarMensaje(e) {
    e.preventDefault()
    if (!input.trim() || cargando) return

    const nuevoMensaje = { role: 'user', content: input }
    const historialActualizado = [...messages, nuevoMensaje]

    setMessages(historialActualizado)
    setInput('')
    setCargando(true)
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            agente: tipo,
            messages: historialActualizado.slice(-6),
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.respuesta }])
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  function limpiarChat() {
    setMessages([])
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Volver
          </button>
          <h1 className="text-base font-semibold text-gray-900">
            {nombresAgentes[tipo]}
          </h1>
        </div>
        <button
          onClick={limpiarChat}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Limpiar chat
        </button>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-20">
            <p className="text-4xl mb-4">👋</p>
            <p>Cuéntale al agente el caso de tu prospecto.</p>
            <p className="mt-1">Sé específico: nombre, empresa, qué pasó, qué dijo.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-xl text-sm ${
  msg.role === 'user'
    ? 'bg-blue-600 text-white'
    : 'bg-white border border-gray-200 text-gray-800'
}`}
>
  {msg.role === 'user' ? (
    <span className="whitespace-pre-wrap">{msg.content}</span>
  ) : (
    <ReactMarkdown
      components={{
        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({children}) => <strong className="font-semibold">{children}</strong>,
        ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
        li: ({children}) => <li className="ml-2">{children}</li>,
        h2: ({children}) => <h2 className="font-bold text-base mt-3 mb-1">{children}</h2>,
        h3: ({children}) => <h3 className="font-semibold mt-2 mb-1">{children}</h3>,
        hr: () => <hr className="my-3 border-gray-200" />,
        code: ({children}) => <code className="bg-gray-100 px-1 rounded text-xs">{children}</code>,
      }}
    >
      {msg.content}
    </ReactMarkdown>
  )}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm text-gray-400">
              Generando respuesta...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={enviarMensaje} className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviarMensaje(e)
              }
            }}
            placeholder="Describe el caso del prospecto..."
            className="flex-1 bg-white text-black border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            type="submit"
            disabled={cargando || !input.trim()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors self-end"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AgentePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Cargando...</div>}>
      <AgenteChat />
    </Suspense>
  )
}