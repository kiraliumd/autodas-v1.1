import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Verificar autenticação (em produção, adicionar verificação de admin)
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é um administrador (implementar em produção)
    // const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).single()
    // if (!userRole || userRole.role !== "admin") {
    //   return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 })
    // }

    // Obter a data atual
    const now = new Date().toISOString()

    // Marcar sessões expiradas como "expired" na tabela stripe_sessions
    const { data: expiredSessions, error: updateError } = await supabase
      .from("stripe_sessions")
      .update({ status: "expired" })
      .lt("expires_at", now)
      .eq("status", "completed")
      .select("session_id")

    if (updateError) {
      console.error("Erro ao atualizar sessões expiradas:", updateError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao atualizar sessões expiradas",
        },
        { status: 500 },
      )
    }

    // Contar quantas sessões foram atualizadas
    const expiredCount = expiredSessions?.length || 0

    return NextResponse.json({
      success: true,
      message: `${expiredCount} sessões marcadas como expiradas`,
      expiredSessions,
    })
  } catch (error) {
    console.error("Erro ao limpar sessões expiradas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao limpar sessões expiradas",
      },
      { status: 500 },
    )
  }
}
