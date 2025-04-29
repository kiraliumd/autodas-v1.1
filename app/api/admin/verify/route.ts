import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Obter a sessão atual
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Não autenticado",
        },
        { status: 401 },
      )
    }

    // Verificar se o usuário é um administrador
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é um administrador",
          debug: { userId: session.user.id, adminError },
        },
        { status: 403 },
      )
    }

    // Atualizar último login
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminUser.id)

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    })
  } catch (error: any) {
    console.error("Admin verify error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
