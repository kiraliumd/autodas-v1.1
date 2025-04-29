"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function AdminBypassPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [diagnosticData, setDiagnosticData] = useState<any>(null)
  const supabase = createClientComponentClient()

  const handleBypass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // 1. Autenticar com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error(`Erro de autenticação: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error("Usuário não encontrado")
      }

      // 2. Verificar se o usuário existe na tabela admin_users
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      // 3. Verificar se o usuário existe por email
      const { data: adminByEmail, error: emailError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single()

      // Coletar dados de diagnóstico
      setDiagnosticData({
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        adminCheck: {
          exists: !!adminData && !adminError,
          data: adminData,
          error: adminError ? adminError.message : null,
        },
        emailCheck: {
          exists: !!adminByEmail && !emailError,
          data: adminByEmail,
          error: emailError ? emailError.message : null,
        },
      })

      // 4. Se não existir na tabela admin_users, criar
      if (!adminData || adminError) {
        // Usar a API para criar o admin
        const response = await fetch("/api/admin/bypass-create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: authData.user.id,
            email: authData.user.email,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Erro ao criar administrador")
        }

        setSuccess("Usuário administrador criado com sucesso! Agora você pode fazer login normalmente em /admin/login")
      } else {
        setSuccess("Usuário já existe como administrador. Tente fazer login normalmente em /admin/login")
      }
    } catch (err: any) {
      console.error("Erro no bypass:", err)
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bypass de Administrador</CardTitle>
          <CardDescription>
            Use esta página para diagnosticar e corrigir problemas de login de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6 border-green-500 bg-green-50">
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleBypass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Diagnosticar e Corrigir"
              )}
            </Button>
          </form>

          {diagnosticData && (
            <div className="mt-6">
              <h3 className="mb-2 font-medium">Resultado do Diagnóstico:</h3>
              <pre className="max-h-60 overflow-auto rounded bg-gray-100 p-3 text-xs">
                {JSON.stringify(diagnosticData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
