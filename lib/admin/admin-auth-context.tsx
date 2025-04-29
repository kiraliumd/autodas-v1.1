"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

type AdminRole = "master" | "editor" | "viewer"

type AdminUser = {
  id: string
  email: string
  role: AdminRole
  name: string
  lastLogin: Date | null
}

type AdminAuthContextType = {
  user: User | null
  adminData: AdminUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  isMasterAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminData, setAdminData] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Check if the current user is a master admin
  const isMasterAdmin = adminData?.role === "master"

  const fetchAdminData = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("admin_users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching admin data:", error)
        return null
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role as AdminRole,
        name: data.name,
        lastLogin: data.last_login ? new Date(data.last_login) : null,
      }
    } catch (error) {
      console.error("Error in fetchAdminData:", error)
      return null
    }
  }

  const updateLastLogin = async (userId: string) => {
    try {
      await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", userId)
    } catch (error) {
      console.error("Error updating last login:", error)
    }
  }

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        setIsLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)

          // Check if user is an admin
          const adminData = await fetchAdminData(session.user.id)

          if (adminData) {
            setAdminData(adminData)
            await updateLastLogin(session.user.id)
          } else {
            // User is not an admin, redirect to admin login
            await supabase.auth.signOut()
            setUser(null)
            router.push("/admin/login")
          }
        }
      } catch (error) {
        console.error("Error checking admin session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)

        // Check if user is an admin
        const adminData = await fetchAdminData(session.user.id)

        if (adminData) {
          setAdminData(adminData)
        } else {
          // User is not an admin
          await supabase.auth.signOut()
          setUser(null)
          router.push("/admin/login")
        }
      } else {
        setUser(null)
        setAdminData(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data.user) {
        // Check if user is an admin
        const adminData = await fetchAdminData(data.user.id)

        if (adminData) {
          setUser(data.user)
          setAdminData(adminData)
          await updateLastLogin(data.user.id)
          return { error: null }
        } else {
          // User is not an admin
          await supabase.auth.signOut()
          return { error: new Error("Unauthorized: Not an admin user") }
        }
      }

      return { error }
    } catch (error) {
      console.error("Error signing in:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAdminData(null)
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    adminData,
    isLoading,
    signIn,
    signOut,
    isMasterAdmin,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
