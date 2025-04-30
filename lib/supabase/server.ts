import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

// Versão para Pages Router (usando req/res)
export const getSupabaseServer = (
  context: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse },
) => {
  return createServerSupabaseClient<Database>(context)
}

// Função para criar cliente Supabase para uso em componentes do cliente
export const createClientSupabase = () => {
  return createServerComponentClient<Database>({
    // Esta versão não usa cookies diretamente, então é segura para uso no cliente
    cookies: () => new Map(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
