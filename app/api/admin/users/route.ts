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

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error in admin users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
