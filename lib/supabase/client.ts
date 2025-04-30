"use client"

// Importação condicional para evitar erros de compilação
let createClientComponentClient: any = null

try {
  // Tentativa de importação dinâmica
  const supabaseModule = require("@supabase/auth-helpers-nextjs")
  createClientComponentClient = supabaseModule.createClientComponentClient
} catch (error) {
  console.error("Erro ao carregar o módulo Supabase Auth Helpers:", error)
  // Função substituta para evitar erros
  createClientComponentClient = () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithPassword: () => Promise.resolve({ error: new Error("Módulo Supabase não disponível") }),
      signUp: () => Promise.resolve({ error: new Error("Módulo Supabase não disponível") }),
      signOut: () => Promise.resolve(),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: () => Promise.resolve({ error: new Error("Módulo Supabase não disponível") }),
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: new Error("Módulo Supabase não disponível") }),
          order: () => ({
            limit: () => ({
              single: () => Promise.resolve({ data: null, error: new Error("Módulo Supabase não disponível") }),
            }),
          }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: new Error("Módulo Supabase não disponível") }),
      }),
      insert: () => Promise.resolve({ error: new Error("Módulo Supabase não disponível") }),
    }),
  })
}

import type { Database } from "./database.types"

// Criando um singleton para o cliente Supabase no lado do cliente
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    try {
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
    } catch (error) {
      console.error("Erro ao criar cliente Supabase:", error)
      // Retornar um cliente mock para evitar erros
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          signInWithPassword: () => Promise.resolve({ error: new Error("Cliente Supabase não disponível") }),
          signUp: () => Promise.resolve({ error: new Error("Cliente Supabase não disponível") }),
          signOut: () => Promise.resolve(),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          resetPasswordForEmail: () => Promise.resolve({ error: new Error("Cliente Supabase não disponível") }),
          getUser: () => Promise.resolve({ data: { user: null } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: new Error("Cliente Supabase não disponível") }),
              order: () => ({
                limit: () => ({
                  single: () => Promise.resolve({ data: null, error: new Error("Cliente Supabase não disponível") }),
                }),
              }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: new Error("Cliente Supabase não disponível") }),
          }),
          insert: () => Promise.resolve({ error: new Error("Cliente Supabase não disponível") }),
        }),
      }
    }
  }
  return supabaseClient
}
