'use client'
import ReactMarkdown from 'react-markdown'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const nombresAgentes = {
  seguimiento: 'Agente de Seguimiento',
  objeciones: 'Agente de Objeciones',
  linkedin: 'Agente de LinkedIn',
  prospecto: 'Agente de Prospección',
  conexion: 'Agente Etapa de Conexión',
  situacion: 'Agente Preguntas de Situación',
  conciencia: 'Agente Consciencia del Problema',
}

import { Send, ShieldCheck, Network, Target, Plug, Search, Lightbulb } from 'lucide-react'

const agentesData = {
  seguimiento: {
    nombre: 'Agente de Seguimiento',
    Icono: Send,
    iconColor: 'text-blue-400',
    descripcion: 'Diseña la cadencia perfecta para mantener el contacto sin ser pesado ni rogar.',
    beneficios: [
      'Aumenta drásticamente la tasa de respuesta',
      'Evita la fricción y elimina el ghosting',
      'Mantiene una postura de alto estatus (no necesitado)'
    ],
    instrucciones: 'Ingresa el contexto de tu última reunión y lo que acordaron. El agente te dirá qué enviar, por qué canal y cuándo.'
  },
  objeciones: {
    nombre: 'Agente de Objeciones',
    Icono: ShieldCheck,
    iconColor: 'text-purple-400',
    descripcion: 'Rompe la resistencia del prospecto usando la potente metodología PPEP.',
    beneficios: [
      'Desactiva el instinto defensivo al instante',
      'Aísla la verdadera objeción oculta',
      'Mantiene el control absoluto de la llamada'
    ],
    instrucciones: 'Escribe textualmente qué te dijo el prospecto (ej: "suena bien pero es muy caro"). El agente te dará el guion exacto.'
  },
  linkedin: {
    nombre: 'Agente de LinkedIn',
    Icono: Network,
    iconColor: 'text-green-400',
    descripcion: 'Genera contenido magnético y estratégico para dominar tu industria.',
    beneficios: [
      'Posicionamiento inmediato como autoridad',
      'Estructuras comprobadas de copywriting persuasivo',
      'Formatos optimizados para el algoritmo de LinkedIn'
    ],
    instrucciones: 'Pide un post sobre un tema específico, un comentario para un prospecto clave, o un análisis de perfil.'
  },
  prospecto: {
    nombre: 'Agente de Prospección',
    Icono: Target,
    iconColor: 'text-orange-400',
    descripcion: 'Crea mensajes de outreach quirúrgicos para prospectos completamente fríos.',
    beneficios: [
      'Alta personalización a escala',
      'Estructuras NEPQ probadas para romper el hielo',
      'Transiciones naturales y sin presión hacia la agenda'
    ],
    instrucciones: 'Describe el caso: canal, origen, y si hay alguna señal observable (ej: "comentó mi último post").'
  },
  conexion: {
    nombre: 'Agente Etapa de Conexión',
    Icono: Plug,
    iconColor: 'text-teal-400',
    descripcion: 'Aperturas magnéticas para leads con contexto previo o reuniones ya agendadas.',
    beneficios: [
      'Baja la guardia del prospecto en 10 segundos',
      'Establece un Frame de Autoridad sólido',
      'Transición suave hacia la etapa de situación'
    ],
    instrucciones: 'Indica si es un Inbound, contactado por SDR, o una reunión agendada, y cuál es el objetivo de la llamada.'
  },
  situacion: {
    nombre: 'Preguntas de Situación',
    Icono: Search,
    iconColor: 'text-indigo-400',
    descripcion: 'Diseña preguntas estratégicas para entender el contexto actual del prospecto.',
    beneficios: [
      'Evita sonar como un interrogatorio policial',
      'Genera confianza y empatía profunda',
      'Revela información crucial sin forzar al prospecto'
    ],
    instrucciones: 'Pide preguntas sobre un proceso específico de su empresa o sobre su estado actual (presente vs pasado).'
  },
  conciencia: {
    nombre: 'Consciencia del Problema',
    Icono: Lightbulb,
    iconColor: 'text-rose-400',
    descripcion: 'Lleva al prospecto a descubrir por sí mismo que tiene un problema urgente.',
    beneficios: [
      'El prospecto se vende a sí mismo la necesidad',
      'Construye urgencia real sin presión artificial',
      'Sienta las bases para presentar tu solución como la única opción lógica'
    ],
    instrucciones: 'Proporciona la causa situacional que descubriste en la etapa anterior y el problema genérico que quieres que el prospecto reconozca.'
  },
}

function AgenteChat() {
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'seguimiento'
  const router = useRouter()
  const info = agentesData[tipo] || agentesData['seguimiento']

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
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans selection:bg-[#8CB13D]/30">
      {/* PANEL IZQUIERDO (MANUAL) */}
      <div className="w-[360px] xl:w-[420px] bg-slate-900 text-white flex flex-col p-8 xl:p-10 flex-shrink-0 relative overflow-y-auto hidden md:flex border-r border-slate-800 shadow-2xl z-10">
        {/* Glow effect sutil */}
        <div className="absolute top-0 left-0 w-full h-64 bg-[#8CB13D]/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2"></div>
        
        <button 
          onClick={() => router.push('/dashboard')} 
          className="flex items-center text-slate-400 hover:text-[#8CB13D] transition-colors text-sm font-medium w-fit mb-12 relative z-10 group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Volver al Dashboard
        </button>
        
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="mb-6 inline-flex">
            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-[#8CB13D] drop-shadow-2xl backdrop-blur-sm`}>
              <info.Icono size={48} strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight mb-4 text-white/95 leading-tight">{info.nombre}</h1>
          <p className="text-slate-300 text-[15px] leading-relaxed mb-10">{info.descripcion}</p>
          
          <div className="mb-10">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">Por qué usarlo</h3>
            <ul className="space-y-4">
              {info.beneficios.map((b, i) => (
                <li key={i} className="flex items-start text-sm text-slate-200">
                  <span className="text-[#8CB13D] mr-3 mt-0.5 text-lg leading-none">•</span>
                  <span className="leading-snug text-[14px]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-auto bg-white/5 border border-white/5 rounded-2xl p-6 shadow-inner">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
              <span className="mr-2 text-base text-[#8CB13D]">💡</span> Instrucciones
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed opacity-90">{info.instrucciones}</p>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO (CHAT) */}
      <div className="flex-1 flex flex-col h-screen relative bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-700 text-sm">
              ← Volver
            </button>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-[#8CB13D]"><info.Icono size={18} strokeWidth={2} /></span> {info.nombre}
            </h1>
          </div>
          <button onClick={limpiarChat} className="text-xs text-gray-500 hover:text-[#8CB13D] font-medium">
            Limpiar
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-end items-center px-8 py-5 absolute top-0 right-0 w-full z-20 bg-gradient-to-b from-[#F8FAFC] to-transparent h-24">
          <button 
            onClick={limpiarChat}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 bg-white/80 hover:bg-white border border-gray-200/60 backdrop-blur-md px-4 py-2 rounded-full transition-all shadow-sm"
          >
            Limpiar historial
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pt-8 pb-32 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
                <div className="w-20 h-20 bg-white text-[#8CB13D] rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center mb-6">
                  <info.Icono size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Hola, estoy listo</h2>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                  Cuéntame el caso específico de tu prospecto y generaré una respuesta basándome en nuestra metodología de ventas.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[85%] md:max-w-2xl px-6 py-4 text-[15px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#111111] text-white rounded-3xl rounded-tr-sm border border-black/5 shadow-md'
                    : 'bg-white text-slate-800 rounded-3xl rounded-tl-sm border border-gray-200 shadow-sm shadow-gray-200/50'
                }`}>
                  {msg.role === 'user' ? (
                    <span className="whitespace-pre-wrap font-medium">{msg.content}</span>
                  ) : (
                    <div className="prose prose-sm md:prose-base prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-a:text-[#8CB13D] prose-strong:text-slate-900 marker:text-[#8CB13D]">
                      <ReactMarkdown
                        components={{
                          ul: ({children}) => <ul className="list-disc pl-4 space-y-2 mb-4 marker:text-[#8CB13D]">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-4 space-y-2 mb-4 marker:text-[#8CB13D]">{children}</ol>,
                          h2: ({children}) => <h2 className="text-lg font-bold mt-6 mb-3 text-slate-900 flex items-center gap-2">{children}</h2>,
                          h3: ({children}) => <h3 className="text-base font-semibold mt-5 mb-2 text-slate-900">{children}</h3>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-[#8CB13D] bg-[#8CB13D]/10 italic py-2 px-4 rounded-r-lg my-4 text-slate-700">{children}</blockquote>,
                          code: ({inline, children}) => inline ? <code className="bg-slate-100 text-[#7a9d32] px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-slate-200/50">{children}</code> : <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto my-4 text-sm font-mono leading-relaxed border border-slate-800">{children}</pre>,
                          hr: () => <hr className="my-6 border-slate-200" />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-gray-200 px-6 py-4 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#8CB13D] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#8CB13D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#8CB13D] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-6 py-4 rounded-2xl flex items-center gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}

            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pt-12 pb-6 px-4 md:px-12 z-20">
          <form onSubmit={enviarMensaje} className="max-w-3xl mx-auto relative group">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviarMensaje(e)
                }
              }}
              placeholder="Pregúntale al agente..."
              className="w-full bg-white text-slate-900 placeholder-slate-400 border border-gray-200/80 rounded-2xl pl-6 pr-16 py-4 text-[15px] shadow-lg shadow-gray-200/50 resize-none focus:outline-none focus:ring-2 focus:ring-[#8CB13D]/30 focus:border-[#8CB13D] transition-all"
              rows={1}
              style={{ minHeight: '60px', maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={cargando || !input.trim()}
              className="absolute right-2 bottom-2 bg-[#8CB13D] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#7a9d32] disabled:opacity-50 disabled:hover:bg-[#8CB13D] transition-all shadow-md shadow-[#8CB13D]/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-3 font-medium">
            Pulsa <kbd className="font-sans px-1.5 py-0.5 bg-white rounded text-slate-500 border border-gray-200">Enter</kbd> para enviar, <kbd className="font-sans px-1.5 py-0.5 bg-white rounded text-slate-500 border border-gray-200">Shift + Enter</kbd> para salto de línea
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AgentePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-gray-400 font-medium">Cargando interfaz...</div>}>
      <AgenteChat />
    </Suspense>
  )
}