import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    const { contexto } = await request.json()

    if (!contexto || contexto.trim().length < 10) {
      return NextResponse.json({ error: 'Contexto muy corto' }, { status: 400 })
    }

    const { error } = await supabase
      .from('usuarios')
      .upsert({
        id: user.id,
        email: user.email,
        contexto_vendedor: contexto.trim(),
      })

    if (error) throw error

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error guardando contexto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}