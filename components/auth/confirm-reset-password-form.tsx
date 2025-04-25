"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"

export function ConfirmResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [authInProgress, setAuthInProgress] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Handle automatic authentication from reset password link
  useEffect(() => {
    const handlePasswordRecovery = async () => {
      try {
        setIsCheckingToken(true)
        setAuthInProgress(true)

        // Check if we're coming from a password reset link
        // Supabase automatically handles the token in the URL
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error checking session:", error)
          setError("Link de redefinição de senha inválido ou expirado.")
          setIsValidToken(false)
          setAuthInProgress(false)
        } else if (data.session) {
          console.log("User authenticated via password reset link")
          setIsValidToken(true)
          setAuthInProgress(false)
        } else {
          // If no session, check if we have hash parameters in the URL
          // This handles the case where the auth flow hasn't completed yet
          const hash = window.location.hash
          if (hash && (hash.includes("access_token") || hash.includes("error"))) {
            console.log("Auth parameters detected in URL, processing...")

            // Let Supabase handle the hash parameters
            const { data: hashData, error: hashError } = await supabase.auth.getSession()

            if (hashError) {
              console.error("Error processing auth parameters:", hashError)
              setError("Erro ao processar o link de redefinição de senha.")
              setIsValidToken(false)
            } else if (hashData.session) {
              console.log("User authenticated via hash parameters")
              setIsValidToken(true)
            } else {
              setError("Link de redefinição de senha inválido ou expirado.")
              setIsValidToken(false)
            }
          } else {
            console.log("No authentication parameters found")
            setError("Link de redefinição de senha inválido ou expirado.")
            setIsValidToken(false)
          }
          setAuthInProgress(false)
        }
      } catch (err) {
        console.error("Error during authentication:", err)
        setError("Ocorreu um erro ao verificar o link de redefinição de senha.")
        setIsValidToken(false)
        setAuthInProgress(false)
      } finally {
        setIsCheckingToken(false)
      }
    }

    handlePasswordRecovery()

    // Listen for auth state changes (important for when the hash is processed)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)

      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery event detected")
        setIsValidToken(true)
        setAuthInProgress(false)
        setIsCheckingToken(false)
      } else if (session) {
        console.log("Session detected during auth state change")
        setIsValidToken(true)
        setAuthInProgress(false)
        setIsCheckingToken(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate passwords
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem.")
        setIsLoading(false)
        return
      }

      // Update password via Supabase
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      // Show success message
      setSuccess(true)

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err) {
      console.error("Erro ao redefinir senha:", err)
      setError("Ocorreu um erro ao redefinir sua senha. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingToken || authInProgress) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Redefinição de senha</CardTitle>
          <CardDescription>Verificando seu link de redefinição...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-muted-foreground">Autenticando, por favor aguarde...</p>
        </CardContent>
      </Card>
    )
  }

  if (!isValidToken) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Link inválido</CardTitle>
          <CardDescription>Não foi possível verificar seu link de redefinição de senha</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Link de redefinição de senha inválido ou expirado."}</AlertDescription>
          </Alert>
          <p className="mt-4 text-sm text-gray-600">
            O link de redefinição de senha pode ter expirado ou ser inválido. Por favor, solicite um novo link.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/reset-password">
            <Button>Solicitar novo link</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Senha redefinida</CardTitle>
          <CardDescription>Sua senha foi atualizada com sucesso</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Sua senha foi redefinida com sucesso. Você será redirecionado para o dashboard em instantes.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard">
            <Button>Ir para o dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Criar nova senha</CardTitle>
        <CardDescription>Digite sua nova senha para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">A senha deve ter pelo menos 6 caracteres.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente sua nova senha"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
