import { createServerSupabaseClient as originalCreateServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { Database } from "./database.types"

// Para uso em getServerSideProps
export const createServerSupabaseClient = (context: GetServerSidePropsContext) => {
  return originalCreateServerSupabaseClient<Database>(context)
}

// Para uso em API routes
export const createApiSupabaseClient = (req: NextApiRequest, res: NextApiResponse) => {
  return originalCreateServerSupabaseClient<Database>({ req, res })
}
