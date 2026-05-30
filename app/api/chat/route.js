import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { desencriptarApiKey, llamarClaude } from '@/lib/anthropic'
import promptSeguimiento from '@/agents/seguimiento'
import promptObjeciones from '@/agents/objeciones'
import promptLinkedin from '@/agents/linkedin'
import promptProspecto from '@/agents/prospecto'

const agentes = {
  seguimiento: promptSeguimiento,
  objeciones: promptObjeciones,
  linkedin: promptLinkedin,
  prospecto: promptProspecto,
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { agente, messages } = await request.json()

    if (!agente || !messages) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const systemPrompt = agentes[agente]
    if (!systemPrompt) {
      return NextResponse.json({ error: 'Agente no existe' }, { status: 400 })
    }

    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('api_key_encriptada, contexto_vendedor')
      .eq('id', user.id)
      .single()

    if (dbError || !usuario?.api_key_encriptada) {
      return NextResponse.json(
        { error: 'No tienes API key configurada. Ve a Configuración.' },
        { status: 400 }
      )
    }

    const apiKey = desencriptarApiKey(usuario.api_key_encriptada)

    const contextoVendedor = usuario.contexto_vendedor
      ? `\n\nCONTEXTO DEL VENDEDOR:\n${usuario.contexto_vendedor}`
      : ''

    const promptFinal = systemPrompt + contextoVendedor
    const mensajesParaClaude = messages.slice(-6)

    // El agente de objeciones necesita más tokens porque entrega guiones completos
    const maxTokens = agente === 'objeciones' ? 4096 : 1500

    const respuesta = await llamarClaude(apiKey, promptFinal, mensajesParaClaude, maxTokens)

    await supabase.from('historial').insert({
      usuario_id: user.id,
      agente: agente,
      input: messages[messages.length - 1].content,
      output: respuesta,
    })

    return NextResponse.json({ respuesta })

  } catch (error) {
    console.error('Error en /api/chat:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}