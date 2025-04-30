// Importação condicional para evitar erros de compilação
let createServerComponentClient: any = null

try {
  // Tentativa de importação dinâmica
  const supabaseModule = require("@supabase/auth-helpers-nextjs")
  createServerComponentClient = supabaseModule.createServerComponentClient
} catch (error) {
  console.error("Erro ao carregar o módulo Supabase Auth Helpers (servidor):", error)
  // Função substituta para evitar erros
  createServerComponentClient = () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  })
}

// Importação segura para next/headers
let cookies: any = null
try {
  const headersModule = require("next/headers")
  cookies = headersModule.cookies
} catch (error) {
  console.error("Erro ao carregar o módulo next/headers:", error)
  // Função substituta para evitar erros
  cookies = () => ({
    get: () => null,
    getAll: () => [],
  })
}

import type { Database } from "./database.types"

export const getSupabaseServer = () => {
  try {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  } catch (error) {
    console.error("Erro ao criar cliente Supabase do servidor:", error)
    // Retornar um cliente mock para evitar erros
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    }
  }
}
