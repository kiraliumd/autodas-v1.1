"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebug(null)
    setIsLoading(true)

    try {
      // Autenticar com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Falha na autenticação. Usuário não encontrado.")
      }

      // Informações de depuração
      const debugInfo = {
        userId: authData.user.id,
        userEmail: authData.user.email,
      }

      // Verificar se o usuário é um administrador por email
      const { data: adminByEmail, error: emailError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle()

      // Adicionar informações de depuração
      debugInfo.emailQuery = {
        email: email.toLowerCase().trim(),
        result: adminByEmail,
        error: emailError,
      }

      // Verificar se o usuário é um administrador por ID
      const { data: adminById, error: idError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle()

      // Adicionar informações de depuração
      debugInfo.idQuery = {
        id: authData.user.id,
        result: adminById,
        error: idError,
      }

      // Verificar se encontramos um administrador
      const adminUser = adminByEmail || adminById

      if (!adminUser) {
        // Fazer logout se não for um administrador
        await supabase.auth.signOut()
        setDebug(debugInfo)
        throw new Error("Não é um administrador. Verifique as informações de depuração.")
      }

      // Atualizar último login
      await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminUser.id)

      // Redirecionar para o dashboard
      router.push("/admin/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Falha ao fazer login. Verifique suas credenciais.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Autodas Admin</h1>
        <p className="text-sm text-muted-foreground">Faça login para acessar o painel administrativo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      {debug && (
        <div className="mt-4 rounded border p-2 text-xs">
          <details>
            <summary className="cursor-pointer font-bold">Informações de Depuração</summary>
            <pre className="mt-2 overflow-auto">{JSON.stringify(debug, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}
