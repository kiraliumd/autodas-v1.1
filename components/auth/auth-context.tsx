"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile, Subscription } from "@/lib/supabase/types"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  subscription: Subscription | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any | null }>
  refreshUserData: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Use a ref to track if we're currently fetching data to prevent duplicate requests
  const isFetchingRef = useRef(false)
  // Use a ref to track the last user ID we fetched data for
  const lastFetchedUserIdRef = useRef<string | null>(null)

  const fetchUserData = async (userId: string) => {
    // Prevent duplicate fetches for the same user
    if (isFetchingRef.current || lastFetchedUserIdRef.current === userId) {
      return
    }

    try {
      isFetchingRef.current = true
      console.log("Buscando dados do usuário:", userId)
      setIsLoading(true)

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
        setProfile(null)
      } else {
        console.log("Perfil encontrado:", profileData)
        setProfile(profileData)
      }

      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Erro ao buscar assinatura:", subscriptionError)
        setSubscription(null)
      } else if (subscriptionData) {
        console.log("Assinatura encontrada:", subscriptionData)
        setSubscription(subscriptionData)
      } else {
        setSubscription(null)
      }

      // Update the last fetched user ID
      lastFetchedUserIdRef.current = userId
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error)
      setProfile(null)
      setSubscription(null)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }

  const refreshUserData = async () => {
    if (!user || isFetchingRef.current) return
    await fetchUserData(user.id)
  }

  useEffect(() => {
    const fetchInitialUserData = async () => {
      try {
        if (isFetchingRef.current) return

        setIsLoading(true)
        // Check for authenticated user
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          console.log("Usuário autenticado:", session.user.email)
          setUser(session.user)

          // Only fetch user data if we haven't already fetched for this user
          if (lastFetchedUserIdRef.current !== session.user.id) {
            await fetchUserData(session.user.id)
          }
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
        setIsLoading(false)
      }
    }

    fetchInitialUserData()

    // Set up auth state change listener
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento de autenticação:", event)

      if (event === "PASSWORD_RECOVERY") {
        console.log("Evento de recuperação de senha detectado")
        // User clicked on password recovery link
        if (session?.user) {
          setUser(session.user)
          await fetchUserData(session.user.id)
        }
      } else if (session?.user) {
        // Only update user state if it's different
        if (!user || user.id !== session.user.id) {
          setUser(session.user)

          // Only fetch user data if we haven't already fetched for this user
          if (lastFetchedUserIdRef.current !== session.user.id) {
            await fetchUserData(session.user.id)
          }
        }
      } else {
        setUser(null)
        setProfile(null)
        setSubscription(null)
        lastFetchedUserIdRef.current = null
      }
    })

    return () => {
      authSubscription.unsubscribe()
    }
  }, [supabase]) // Remove router from dependencies to prevent loops

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data.user) {
        setUser(data.user)
        await fetchUserData(data.user.id)
      }

      return { error }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
          },
        },
      })

      if (!error) {
        // Update profile with additional data
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            cnpj: userData.cnpj,
            whatsapp: userData.whatsapp,
            security_code: userData.security_code,
          })
          .eq("id", (await supabase.auth.getUser()).data.user?.id || "")

        if (profileError) {
          console.error("Erro ao atualizar perfil:", profileError)
          return { error: profileError }
        }
      }

      return { error }
    } catch (error) {
      console.error("Erro ao criar conta:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSubscription(null)
      lastFetchedUserIdRef.current = null
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error("Usuário não autenticado") }

    try {
      const { error } = await supabase.from("profiles").update(data).eq("id", user.id)

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...data } : null))
      }

      return { error }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })
      return { error }
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error)
      return { error }
    }
  }

  const value = {
    user,
    profile,
    subscription,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUserData,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
