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

async function clasificarObjecion(apiKey, userMessage) {
  const clasificadorPrompt = `Eres un clasificador de objeciones de ventas. Tu ÚNICO trabajo es identificar qué objeción de la lista corresponde al mensaje del vendedor. Responde SOLO con JSON válido, sin texto adicional.

Si el vendedor describe una objeción de un prospecto, devuelve los IDs más relevantes.
Si es un saludo, pregunta general o no hay objeción clara, devuelve ids vacío.

Responde EXACTAMENTE en este formato:
{"ids": [N], "confianza": "alta/media/baja"}

Lista de objeciones:
OBJ-1: "He probado programas que no funcionaron" → indecisión
OBJ-2: "Esto es muy caro" → precio
OBJ-3: "No tengo dinero" → precio
OBJ-4: "Necesito pensarlo" → indecisión
OBJ-5: "Envíame referencias" → evasión
OBJ-6: "Estoy ocupado, envíame propuesta" → evasión
OBJ-7: "Mándame más información" → evasión
OBJ-8: "Estoy muy ocupado, llámame después" → tiempo
OBJ-9: "Envíame una propuesta" → evasión
OBJ-10: "Necesito hablar con mi cónyuge/pareja" → tercero
OBJ-11: "Necesito revisar mis finanzas" → precio
OBJ-12: "Lo voy a intentar por mi cuenta" → indecisión
OBJ-13: "No tengo tiempo" → tiempo
OBJ-14: "Tengo que orar / consultarlo con Dios" → indecisión
OBJ-15: "Necesito presentarlo a la junta" → tercero
OBJ-16: "La competencia es 10% más barata" → precio
OBJ-17: "Ya tengo un coach/mentor" → indecisión
OBJ-18: "Voy a revisar esto y les avisamos" → evasión
OBJ-19: "Estoy feliz con mi proveedor" → indecisión
OBJ-20: "No sé qué necesito mejorar" → indecisión
OBJ-21: "No sé si funciona para mi industria" → indecisión
OBJ-22: "No hay presupuesto / llámanos el próximo año" → precio
OBJ-23: "Ya estoy hablando con otra empresa" → indecisión
OBJ-24: "Eres más caro que nuestro proveedor actual" → precio
OBJ-25: "Te avisamos / te respondemos luego" → evasión
OBJ-26: "No es el momento adecuado" → tiempo
OBJ-27: "Estoy muy ocupado ahora mismo" → tiempo
OBJ-28: "¿Cuál es la diferencia entre tu empresa y las demás?" → precio/valor
OBJ-29: "El competidor es más barato" → precio
OBJ-30: "Quiero comparar precios con otros" → precio
OBJ-31: "No lo necesitamos / ya tenemos algo" → indecisión
OBJ-32: "Reseñas negativas en línea" → confianza
OBJ-33: "Puedo conseguir lo mismo en otro lugar" → precio
OBJ-34: "Miedo al riesgo personal / pérdida de empleo" → indecisión
OBJ-35: "No me interesa" → indecisión
OBJ-36: "Yo soy quien toma las decisiones" → tercero
OBJ-37: "Me preocupa que esto no funcione" → indecisión
OBJ-38: "¿Qué los hace diferentes a su competencia?" → precio/valor
OBJ-39: "¿Qué garantías me ofreces?" → indecisión
OBJ-40: "Es más dinero del que he gastado nunca" → precio
OBJ-41: "Todavía estamos comparando precios" → precio
OBJ-42: "Quiero hablar con otras empresas primero" → precio
OBJ-43: "Nunca tomo decisiones apresuradas" → indecisión
OBJ-44: "Ya trabajamos con el proveedor X" → indecisión
OBJ-45: "No quiero entrar en deudas" → precio
OBJ-46: "No quiero comprometerme con nada ahora" → indecisión
OBJ-47: "Tengo que consultarlo con un tercero" → tercero
OBJ-48: "¿Esto es una estafa?" → confianza
OBJ-49: "Tengo miedo de que esto no funcione" → indecisión
OBJ-50: "Es demasiado bueno para ser verdad" → confianza
OBJ-51: "Dámelo gratis y te pago cuando gane" → precio
OBJ-52: "Decidimos irnos con la competencia" → precio
OBJ-53: "Necesito investigar más" → indecisión
OBJ-54: "Tengo que hablarlo con mi esposa/esposo" → tercero
OBJ-55: "¿Me puedes dar un descuento?" → precio
OBJ-56: "Solo dime el precio" → precio
OBJ-57: "Estoy muy ocupado / llámame el próximo trimestre" → tiempo`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: clasificadorPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) return { ids: [], confianza: 'baja' }

  try {
    const data = await response.json()
    const text = data.content[0].text.trim()
    return JSON.parse(text)
  } catch {
    return { ids: [], confianza: 'baja' }
  }
}

async function obtenerBattlecards(supabase, ids) {
  if (!ids || ids.length === 0) return ''

  const { data, error } = await supabase
    .from('battlecards')
    .select('id, titulo, categoria_nombre, subtipo, momento, frame, contenido')
    .in('id', ids)

  if (error || !data || data.length === 0) return ''

  return data.map(card => `
═══════════════════════════════════
BATTLECARD CARGADA — Objeción ${card.id}: "${card.titulo}"
Categoría: ${card.categoria_nombre} | Subtipo: ${card.subtipo}
Momento: ${card.momento} | Frame: ${card.frame}
═══════════════════════════════════
${card.contenido}
═══════════════════════════════════`).join('\n\n')
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

    const promptBase = systemPrompt + contextoVendedor

    // Para el agente de objeciones: usar sistema de 2 pasos
    let promptFinal = promptBase
    let mensajesParaClaude = messages.slice(-6)

    if (agente === 'objeciones') {
      const ultimoMensaje = messages[messages.length - 1].content

      // Paso 1: Clasificar objeción (barato)
      const clasificacion = await clasificarObjecion(apiKey, ultimoMensaje)

      // Paso 2: Cargar battlecard específica de Supabase
      if (clasificacion.ids && clasificacion.ids.length > 0) {
        const battlecardTexto = await obtenerBattlecards(supabase, clasificacion.ids)
        if (battlecardTexto) {
          // Inyectar battlecard en el último mensaje del usuario
          mensajesParaClaude = [
            ...messages.slice(-6, -1),
            {
              role: 'user',
              content: ultimoMensaje + '\n\n' + battlecardTexto
            }
          ]
        }
      }
    }

    const respuesta = await llamarClaude(apiKey, promptFinal, mensajesParaClaude)

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