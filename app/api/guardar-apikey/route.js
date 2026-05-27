import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { encriptarApiKey } from '@/lib/anthropic'

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

    const { apiKey } = await request.json()

    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'API key inválida. Debe empezar con sk-ant-' },
        { status: 400 }
      )
    }

    const apiKeyEncriptada = encriptarApiKey(apiKey)

    const { error } = await supabase
      .from('usuarios')
      .upsert({
        id: user.id,
        email: user.email,
        api_key_encriptada: apiKeyEncriptada,
      })

    if (error) throw error

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error en /api/guardar-apikey:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}