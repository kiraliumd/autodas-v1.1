import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // 1. Cliente normal (com cookies)
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 2. Cliente com service role (bypass RLS)
    const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Obter a sessão atual
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Não autenticado",
          step: "auth_check",
        },
        { status: 401 },
      )
    }

    // Informações do usuário autenticado
    const userId = session.user.id
    const userEmail = session.user.email

    // Verificar se o usuário existe na tabela auth.users (usando service role)
    const { data: authUser, error: authError } = await serviceClient.auth.admin.getUserById(userId)

    // Verificar se o usuário existe na tabela admin_users (usando cliente normal)
    const { data: adminUserNormal, error: adminErrorNormal } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single()

    // Verificar se o usuário existe na tabela admin_users (usando service role)
    const { data: adminUserService, error: adminErrorService } = await serviceClient
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single()

    // Verificar se o email existe na tabela admin_users (usando service role)
    const { data: adminUserByEmail, error: adminErrorByEmail } = await serviceClient
      .from("admin_users")
      .select("*")
      .eq("email", userEmail)
      .single()

    // Verificar todas as políticas RLS
    const { data: policies, error: policiesError } = await serviceClient.rpc("get_policies")

    return NextResponse.json({
      success: true,
      diagnostics: {
        session: {
          userId,
          userEmail,
          aud: session.user.aud,
          role: session.user.role,
        },
        authUser: {
          exists: !!authUser,
          data: authUser,
          error: authError,
        },
        adminUserNormal: {
          exists: !!adminUserNormal,
          data: adminUserNormal,
          error: adminErrorNormal,
        },
        adminUserService: {
          exists: !!adminUserService,
          data: adminUserService,
          error: adminErrorService,
        },
        adminUserByEmail: {
          exists: !!adminUserByEmail,
          data: adminUserByEmail,
          error: adminErrorByEmail,
        },
        policies: {
          data: policies,
          error: policiesError,
        },
      },
    })
  } catch (error: any) {
    console.error("Diagnostic error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
