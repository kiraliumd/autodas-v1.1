"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { revalidatePath } from "next/cache"
import type { Database } from "../supabase/database.types"

// Create a server-side Supabase client
const getSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Log admin activity
export async function logAdminActivity(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any,
  request?: Request,
) {
  const supabase = getSupabaseServerClient()

  let ipAddress = null
  let userAgent = null

  if (request) {
    ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    userAgent = request.headers.get("user-agent")
  }

  await supabase.from("admin_activity_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details: details || null,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// Get admin users
export async function getAdminUsers() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data
}

// Create admin user
export async function createAdminUser(email: string, password: string, name: string, role: string) {
  const supabase = getSupabaseServerClient()

  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) throw authError

  // Then create the admin user record
  const { error: adminError } = await supabase.from("admin_users").insert({
    id: authData.user.id,
    email,
    name,
    role,
  })

  if (adminError) {
    // Clean up the auth user if admin user creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw adminError
  }

  revalidatePath("/admin/users")
  return authData.user
}

// Get dashboard stats
export async function getDashboardStats() {
  const supabase = getSupabaseServerClient()

  // Get admin users count
  const { count: adminCount, error: adminError } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true })

  if (adminError) throw adminError

  // Get onboarding stats
  const { data: onboardingStats, error: onboardingError } = await supabase
    .from("onboarding_sessions")
    .select("completed, abandoned")

  if (onboardingError) throw onboardingError

  const completedCount = onboardingStats.filter((s) => s.completed).length
  const abandonedCount = onboardingStats.filter((s) => s.abandoned).length
  const inProgressCount = onboardingStats.filter((s) => !s.completed && !s.abandoned).length

  return {
    adminCount,
    onboardingStats: {
      completed: completedCount,
      abandoned: abandonedCount,
      inProgress: inProgressCount,
      total: onboardingStats.length,
    },
  }
}
