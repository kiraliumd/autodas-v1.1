"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"

export function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate email
      if (!email || !email.includes("@")) {
        setError("Por favor, insira um endereço de e-mail válido.")
        setIsLoading(false)
        return
      }

      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })

      if (error) {
        throw error
      }

      // Show success message
      setSuccess(true)
    } catch (err) {
      console.error("Erro ao solicitar redefinição de senha:", err)
      setError("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Redefinição de senha</CardTitle>
          <CardDescription>Verifique seu e-mail para redefinir sua senha</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Enviamos um link de redefinição de senha para <strong>{email}</strong>. Por favor, verifique sua caixa de
              entrada e siga as instruções para criar uma nova senha.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Quando você clicar no link no e-mail, você será automaticamente autenticado e poderá criar uma nova senha.
            </p>
            <p className="text-sm text-gray-600">
              Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam ou tente novamente.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
        <CardDescription>Informe seu e-mail para receber um link de redefinição</CardDescription>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  )
}
