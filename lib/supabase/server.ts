import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Versão do cliente Supabase para uso no Pages Router (sem next/headers)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and key must be defined")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}
