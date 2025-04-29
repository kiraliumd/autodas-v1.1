import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Criar cliente Supabase com cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 1. Autenticar com Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: `Erro de autenticação: ${authError.message}` }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // 2. Verificar se o usuário existe na tabela admin_users
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    // 3. Verificar se o usuário existe por email
    const { data: adminByEmail, error: emailError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    // Coletar dados de diagnóstico
    const diagnosticData = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      adminCheck: {
        exists: !!adminData && !adminError,
        data: adminData,
        error: adminError ? adminError.message : null,
      },
      emailCheck: {
        exists: !!adminByEmail && !emailError,
        data: adminByEmail,
        error: emailError ? emailError.message : null,
      },
    }

    // 4. Se não existir na tabela admin_users, criar
    if (!adminData || adminError) {
      // Criar admin
      const { data: newAdmin, error: createError } = await supabase
        .from("admin_users")
        .insert({
          id: authData.user.id,
          email: authData.user.email?.toLowerCase(),
          name: "Administrador",
          role: "master",
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          {
            error: `Erro ao criar administrador: ${createError.message}`,
            data: diagnosticData,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Usuário administrador criado com sucesso! Agora você pode fazer login normalmente em /admin/login",
        data: {
          ...diagnosticData,
          created: newAdmin,
        },
      })
    } else {
      return NextResponse.json({
        message: "Usuário já existe como administrador. Tente fazer login normalmente em /admin/login",
        data: diagnosticData,
      })
    }
  } catch (error: any) {
    console.error("Erro no bypass:", error)
    return NextResponse.json({ error: error.message || "Erro desconhecido" }, { status: 500 })
  }
}
