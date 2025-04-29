import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { logAdminActivity } from "@/lib/services/admin-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

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

    // Get user by ID
    const { data: user, error: userError } = await supabase.from("admin_users").select("*").eq("id", params.id).single()

    if (userError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in get admin user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a master admin or the user being updated
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Unauthorized: Not an admin user" }, { status: 403 })
    }

    // Only master admins can update other users, or users can update themselves
    if (adminUser.role !== "master" && session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized: Cannot update other users" }, { status: 403 })
    }

    // Get request body
    const { name, role, is_active } = await request.json()

    // Validate input
    if (role && !["master", "editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (role !== undefined && adminUser.role === "master") updateData.role = role
    if (is_active !== undefined && adminUser.role === "master") updateData.is_active = is_active

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("admin_users")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Log activity
    await logAdminActivity(session.user.id, "updated", "admin_user", params.id, updateData, request)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating admin user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a master admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser || adminUser.role !== "master") {
      return NextResponse.json({ error: "Unauthorized: Only master admins can delete users" }, { status: 403 })
    }

    // Prevent deleting yourself
    if (session.user.id === params.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user
    const { error: deleteError } = await supabase.from("admin_users").delete().eq("id", params.id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    // Log activity
    await logAdminActivity(session.user.id, "deleted", "admin_user", params.id, null, request)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
