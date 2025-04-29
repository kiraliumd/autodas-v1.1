import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { logAdminActivity } from "@/lib/services/admin-service"

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

    // Obter todos os usuários administradores
    const { data: users, error: usersError } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) {
      throw usersError
    }

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("Erro ao obter usuários administradores:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    // Verificar se o usuário é um administrador master
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser || adminUser.role !== "master") {
      return NextResponse.json(
        { error: "Não autorizado: Apenas administradores master podem criar usuários" },
        { status: 403 },
      )
    }

    // Obter dados do corpo da requisição
    const { email, password, name, role } = await request.json()

    // Validar entrada
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (!["master", "editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Função inválida" }, { status: 400 })
    }

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: `Erro ao criar usuário: ${authError.message}` }, { status: 500 })
    }

    // Criar usuário administrador
    const { data: newUser, error: createError } = await supabase
      .from("admin_users")
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      // Limpar usuário Auth se houver erro
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Erro ao criar administrador: ${createError.message}` }, { status: 500 })
    }

    // Registrar atividade
    await logAdminActivity(session.user.id, "created", "admin_user", newUser.id, { email, name, role }, request)

    return NextResponse.json(newUser)
  } catch (error: any) {
    console.error("Erro ao criar usuário administrador:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
