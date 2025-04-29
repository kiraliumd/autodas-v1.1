"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OnboardingLayout } from "@/components/onboarding-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatWhatsApp, cleanFormat } from "@/lib/utils/format"
import { useOnboardingTracker } from "@/hooks/use-onboarding-tracker"

export default function OnboardingStep2() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    whatsapp: "",
    securityCode: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const recoveryToken = searchParams.get("recovery_token")

  // Load step1 data for tracking
  const [step1Data, setStep1Data] = useState<any>(null)

  useEffect(() => {
    const savedStep1Data = localStorage.getItem("onboarding_step1")
    if (savedStep1Data) {
      try {
        setStep1Data(JSON.parse(savedStep1Data))
      } catch (e) {
        console.error("Erro ao carregar dados do step1:", e)
      }
    }
  }, [])

  // Track onboarding progress
  const sessionId = localStorage.getItem("stripe_session_id") || undefined
  const onboardingData = {
    step1: step1Data,
    step2: formData,
    stripeSessionId: sessionId,
  }

  useOnboardingTracker(2, onboardingData)

  useEffect(() => {
    // Verificar se o usuário completou a etapa 1
    const step1Data = localStorage.getItem("onboarding_step1")

    // Não redirecionamos mais automaticamente, apenas carregamos os dados se existirem
    if (step1Data) {
      // Carregar dados salvos do step2 se existirem
      const savedStep2Data = localStorage.getItem("onboarding_step2")
      if (savedStep2Data) {
        try {
          const parsedData = JSON.parse(savedStep2Data)
          setFormData(parsedData)
        } catch (e) {
          console.error("Erro ao carregar dados salvos do step2:", e)
        }
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "whatsapp") {
      setFormData((prev) => ({ ...prev, [name]: formatWhatsApp(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validar dados
      if (
        !formData.email.trim() ||
        !formData.password.trim() ||
        !formData.whatsapp.trim() ||
        !formData.securityCode.trim()
      ) {
        setError("Por favor, preencha todos os campos.")
        setIsLoading(false)
        return
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Por favor, insira um email válido.")
        setIsLoading(false)
        return
      }

      // Validar senha
      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.")
        setIsLoading(false)
        return
      }

      // Armazenar dados no localStorage para usar na próxima etapa
      localStorage.setItem(
        "onboarding_step2",
        JSON.stringify({
          email: formData.email,
          password: formData.password,
          whatsapp: cleanFormat(formData.whatsapp),
          securityCode: formData.securityCode,
        }),
      )

      // Preserve recovery token when navigating
      const queryParam = recoveryToken ? `?recovery_token=${recoveryToken}` : ""

      // Avançar para a próxima etapa
      router.push(`/onboarding/step3${queryParam}`)
    } catch (err) {
      setError("Ocorreu um erro. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout currentStep={2} totalSteps={3}>
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Dados de acesso</CardTitle>
          <CardDescription>Configure suas informações de acesso e segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recoveryToken && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Bem-vindo de volta! Você pode continuar seu cadastro de onde parou.</AlertDescription>
            </Alert>
          )}

          <form id="step2-form" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
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
                <p className="text-sm text-muted-foreground">Mínimo de 6 caracteres</p>
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
                  placeholder="Crie um código de 6 dígitos"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Este código será usado para verificar suas guias recebidas
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              // Preserve recovery token when navigating back
              const queryParam = recoveryToken ? `?recovery_token=${recoveryToken}` : ""
              router.push(`/onboarding/step1${queryParam}`)
            }}
          >
            Voltar
          </Button>
          <Button type="submit" form="step2-form" disabled={isLoading}>
            {isLoading ? "Processando..." : "Continuar"}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingLayout>
  )
}
