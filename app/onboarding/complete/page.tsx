"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingLayout } from "@/components/onboarding-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { formatWhatsApp, formatCNPJ, cleanFormat, validateCNPJ } from "@/lib/utils/format"

export default function OnboardingCompletePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    cnpj: "",
    whatsapp: "",
    securityCode: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error checking session:", error)
          setIsAuthenticated(false)
        } else if (data.session) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error("Error during authentication check:", err)
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [supabase.auth])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "whatsapp") {
      setFormData((prev) => ({ ...prev, [name]: formatWhatsApp(value) }))
    } else if (name === "cnpj") {
      setFormData((prev) => ({ ...prev, [name]: formatCNPJ(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate data
      if (
        !formData.fullName.trim() ||
        !formData.cnpj.trim() ||
        !formData.whatsapp.trim() ||
        !formData.securityCode.trim() ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Por favor, preencha todos os campos.")
        setIsLoading(false)
        return
      }

      // Validate CNPJ
      const cleanedCNPJ = cleanFormat(formData.cnpj)
      if (!validateCNPJ(cleanedCNPJ)) {
        setError("CNPJ inválido. Por favor, verifique e tente novamente.")
        setIsLoading(false)
        return
      }

      // Validate password
      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.")
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem.")
        setIsLoading(false)
        return
      }

      // Update user password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (passwordError) {
        throw passwordError
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          cnpj: cleanFormat(formData.cnpj),
          whatsapp: cleanFormat(formData.whatsapp),
          security_code: formData.securityCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id || "")

      if (profileError) {
        throw profileError
      }

      // Show success message
      setSuccess(true)

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err) {
      console.error("Erro ao finalizar cadastro:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao finalizar seu cadastro.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={1}>
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">Verificando autenticação...</div>
          </CardContent>
        </Card>
      </OnboardingLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={1}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Acesso não autorizado</CardTitle>
            <CardDescription>Você precisa estar autenticado para acessar esta página</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Não foi possível verificar sua autenticação. Por favor, verifique seu email para o link de acesso ou
                entre em contato com o suporte.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/login")}>Ir para o login</Button>
          </CardFooter>
        </Card>
      </OnboardingLayout>
    )
  }

  if (success) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={1}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Cadastro finalizado!</CardTitle>
            <CardDescription>Sua conta foi configurada com sucesso</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Seu cadastro foi finalizado com sucesso! Você será redirecionado para o dashboard em instantes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout currentStep={1} totalSteps={1}>
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Complete seu cadastro</CardTitle>
          <CardDescription>Preencha seus dados para finalizar o cadastro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form id="complete-form" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ do MEI</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityCode">Código de segurança personalizado</Label>
                <Input
                  id="securityCode"
                  name="securityCode"
                  value={formData.securityCode}
                  onChange={handleChange}
                  placeholder="Código de 6 dígitos"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Este código será usado para verificar suas guias recebidas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Crie uma senha segura"
                  required
                />
                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Digite novamente sua senha"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="complete-form" disabled={isLoading}>
            {isLoading ? "Processando..." : "Finalizar cadastro"}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingLayout>
  )
}
