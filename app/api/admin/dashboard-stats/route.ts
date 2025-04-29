import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se o usuário é um administrador
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Não é um administrador" }, { status: 403 })
    }

    // Obter contagem de usuários administradores
    const { count: adminCount, error: countError } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw countError
    }

    // Obter estatísticas de onboarding
    const { data: onboardingStats, error: onboardingError } = await supabase
      .from("onboarding_sessions")
      .select("completed, abandoned")

    if (onboardingError) {
      throw onboardingError
    }

    const completedCount = onboardingStats.filter((s) => s.completed).length
    const abandonedCount = onboardingStats.filter((s) => s.abandoned).length
    const inProgressCount = onboardingStats.filter((s) => !s.completed && !s.abandoned).length

    // Obter sessões de onboarding recentes
    const { data: recentSessions, error: sessionsError } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    if (sessionsError) {
      throw sessionsError
    }

    return NextResponse.json({
      adminCount,
      onboardingStats: {
        completed: completedCount,
        abandoned: abandonedCount,
        inProgress: inProgressCount,
        total: onboardingStats.length,
      },
      recentSessions,
    })
  } catch (error: any) {
    console.error("Erro ao obter estatísticas do dashboard:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
