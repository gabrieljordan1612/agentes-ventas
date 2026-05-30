import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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

    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('contexto_vendedor')
      .eq('id', user.id)
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'Error obteniendo contexto' }, { status: 500 })
    }

    return NextResponse.json({ contexto: usuario.contexto_vendedor || '' })

  } catch (error) {
    console.error('Error en /api/obtener-contexto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
