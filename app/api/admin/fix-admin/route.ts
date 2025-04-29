import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Obter dados do corpo da requisição
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de usuário e email são obrigatórios",
        },
        { status: 400 },
      )
    }

    // Cliente com service role (bypass RLS)
    const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verificar se o usuário já existe na tabela admin_users
    const { data: existingAdmin, error: checkError } = await serviceClient
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 é o código para "não encontrado", que é esperado
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao verificar administrador: ${checkError.message}`,
        },
        { status: 500 },
      )
    }

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Usuário já é um administrador",
        admin: existingAdmin,
      })
    }

    // Inserir o usuário na tabela admin_users
    const { data: newAdmin, error: insertError } = await serviceClient
      .from("admin_users")
      .insert({
        id: userId,
        email: email,
        name: "Administrador",
        role: "master",
        created_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao criar administrador: ${insertError.message}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Administrador criado com sucesso",
      admin: newAdmin,
    })
  } catch (error: any) {
    console.error("Erro ao corrigir administrador:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
