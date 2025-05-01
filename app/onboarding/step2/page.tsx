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
import { AlertCircle } from "lucide-react"
import { formatWhatsApp, cleanFormat } from "@/lib/utils/format"

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

  useEffect(() => {
    // Verificar se o usuário completou a etapa 1
    const step1Data = localStorage.getItem("onboarding_step1")
    if (!step1Data) {
      router.push("/onboarding/step1")
      return
    }

    // Carregar rascunho salvo, se existir
    const savedDraft = localStorage.getItem("onboarding_step2_draft")
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)
        setFormData(parsedDraft)
      } catch (e) {
        console.error("Erro ao carregar rascunho:", e)
      }
    }
  }, [router])

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

      // Avançar para a próxima etapa
      router.push("/onboarding/step3")
    } catch (err) {
      setError("Ocorreu um erro. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    // Preservar os dados do formulário no localStorage antes de voltar
    if (formData.email.trim() || formData.password.trim() || formData.whatsapp.trim() || formData.securityCode.trim()) {
      localStorage.setItem(
        "onboarding_step2_draft",
        JSON.stringify({
          email: formData.email,
          password: formData.password,
          whatsapp: formData.whatsapp,
          securityCode: formData.securityCode,
        }),
      )
    }

    // Verificar se temos o sessionId no localStorage para garantir que voltamos para o step1 com o ID da sessão
    const sessionId = localStorage.getItem("stripe_session_id")

    if (sessionId) {
      // Usar replace para evitar problemas de navegação
      router.replace(`/onboarding/step1?session_id=${sessionId}`)
    } else {
      // Se não tiver sessionId, ainda assim voltar para step1
      router.replace("/onboarding/step1")
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
          <Button variant="outline" onClick={handleBack}>
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
