import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar tabelas
    const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("count()").single()

    const { data: subscriptionsData, error: subscriptionsError } = await supabase
      .from("subscriptions")
      .select("count()")
      .single()

    const { data: sessionsData, error: sessionsError } = await supabase
      .from("stripe_sessions")
      .select("count()")
      .single()

    return NextResponse.json({
      status: "ok",
      tables: {
        profiles: {
          count: profilesData?.count || 0,
          error: profilesError ? profilesError.message : null,
        },
        subscriptions: {
          count: subscriptionsData?.count || 0,
          error: subscriptionsError ? subscriptionsError.message : null,
        },
        stripe_sessions: {
          count: sessionsData?.count || 0,
          error: sessionsError ? sessionsError.message : null,
        },
      },
    })
  } catch (error) {
    console.error("Erro ao verificar banco de dados:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
