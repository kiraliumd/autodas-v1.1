"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function AdminDiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userSession, setUserSession] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession()
        setUserSession(data.session)
      } catch (err) {
        console.error("Erro ao verificar sessão:", err)
        setError("Não foi possível verificar sua sessão")
      }
    }

    async function runDiagnostic() {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/diagnostic")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao executar diagnóstico")
        }

        setDiagnosticData(data)
      } catch (err: any) {
        console.error("Erro de diagnóstico:", err)
        setError(err.message || "Erro ao executar diagnóstico")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
    runDiagnostic()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin/login"
  }

  const handleCreateAdmin = async () => {
    if (!userSession) return

    try {
      setLoading(true)
      const response = await fetch("/api/admin/fix-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userSession.user.id,
          email: userSession.user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar administrador")
      }

      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (err: any) {
      console.error("Erro ao criar administrador:", err)
      setError(err.message || "Erro ao criar administrador")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Executando diagnóstico...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Diagnóstico de Administrador</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sessão do Usuário</CardTitle>
            <CardDescription>Informações sobre sua sessão atual</CardDescription>
          </CardHeader>
          <CardContent>
            {userSession ? (
              <div>
                <p>
                  <strong>ID:</strong> {userSession.user.id}
                </p>
                <p>
                  <strong>Email:</strong> {userSession.user.email}
                </p>
                <p>
                  <strong>Autenticado:</strong> Sim
                </p>
                <div className="mt-4">
                  <Button onClick={handleLogout} variant="outline">
                    Sair
                  </Button>
                </div>
              </div>
            ) : (
              <p>Não autenticado</p>
            )}
          </CardContent>
        </Card>

        {diagnosticData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Verificação de Administrador</CardTitle>
                <CardDescription>Verificação do status de administrador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Usuário na tabela admin_users (cliente normal):</h3>
                    {diagnosticData.diagnostics.adminUserNormal.exists ? (
                      <p className="text-green-600">Encontrado ✓</p>
                    ) : (
                      <p className="text-red-600">Não encontrado ✗</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium">Usuário na tabela admin_users (service role):</h3>
                    {diagnosticData.diagnostics.adminUserService.exists ? (
                      <p className="text-green-600">Encontrado ✓</p>
                    ) : (
                      <p className="text-red-600">Não encontrado ✗</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium">Usuário por email na tabela admin_users:</h3>
                    {diagnosticData.diagnostics.adminUserByEmail.exists ? (
                      <p className="text-green-600">Encontrado ✓</p>
                    ) : (
                      <p className="text-red-600">Não encontrado ✗</p>
                    )}
                  </div>

                  {!diagnosticData.diagnostics.adminUserService.exists && (
                    <div className="mt-6">
                      <Alert>
                        <AlertTitle>Problema Identificado</AlertTitle>
                        <AlertDescription>
                          Seu usuário não está registrado como administrador na tabela admin_users.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={handleCreateAdmin} className="mt-4">
                        Corrigir Automaticamente
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes Técnicos</CardTitle>
                <CardDescription>Informações técnicas para depuração</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs">
                  {JSON.stringify(diagnosticData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
