import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Unauthorized: Not an admin user" }, { status: 403 })
    }

    // Get total users count
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // Get onboarding stats
    const { data: onboardingStats } = await supabase.from("onboarding_sessions").select("completed, abandoned")

    const completedCount = onboardingStats?.filter((s) => s.completed).length || 0
    const abandonedCount = onboardingStats?.filter((s) => s.abandoned).length || 0
    const inProgressCount = onboardingStats?.filter((s) => !s.completed && !s.abandoned).length || 0

    return NextResponse.json({
      totalUsers,
      onboardingStats: {
        completed: completedCount,
        abandoned: abandonedCount,
        inProgress: inProgressCount,
        total: onboardingStats?.length || 0,
      },
    })
  } catch (error) {
    console.error("Error in dashboard stats API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
