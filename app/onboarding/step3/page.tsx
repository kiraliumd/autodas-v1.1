"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingLayout } from "@/components/onboarding-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Step1Data {
  fullName: string
  cnpj: string
}

interface Step2Data {
  email: string
  password: string
  whatsapp: string
  securityCode: string
}

export default function OnboardingStep3() {
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null)
  const [sessionMetadata, setSessionMetadata] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Carregar dados das etapas anteriores
    const step1 = localStorage.getItem("onboarding_step1")
    const step2 = localStorage.getItem("onboarding_step2")
    const sessionId = localStorage.getItem("stripe_session_id")
    const metadataStr = localStorage.getItem("stripe_session_metadata")

    if (!step1 || !step2) {
      router.push("/onboarding/step1")
      return
    }

    setStep1Data(JSON.parse(step1))
    setStep2Data(JSON.parse(step2))
    setStripeSessionId(sessionId)

    if (metadataStr) {
      try {
        setSessionMetadata(JSON.parse(metadataStr))
      } catch (e) {
        console.error("Erro ao parsear metadados da sessão:", e)
      }
    }

    // Debug: verificar se o sessionId está presente
    if (sessionId) {
      console.log("ID da sessão do Stripe encontrado:", sessionId)
    } else {
      console.warn("Nenhum ID de sessão do Stripe encontrado no localStorage")
    }
  }, [router])

  // Verificar se o email já está em uso
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("check_email_exists", { email_to_check: email })

      if (error) {
        console.error("Erro ao verificar email:", error)
        return false
      }

      return !!data
    } catch (error) {
      console.error("Erro ao verificar email:", error)
      return false
    }
  }

  const handleSubmit = async () => {
    // Código de submissão omitido para brevidade
  }

  const handleBack = () => {
    router.push("/onboarding/step2")
  }

  if (!step1Data || !step2Data) {
    return (
      <OnboardingLayout currentStep={3} totalSteps={3}>
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">Carregando...</div>
          </CardContent>
        </Card>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout currentStep={3} totalSteps={3}>
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Confirmação de dados</CardTitle>
          <CardDescription>Verifique se todos os dados estão corretos antes de finalizar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{/* Conteúdo omitido para brevidade */}</CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={isLoading || isSuccess}>
            Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || isSuccess}>
            {isLoading ? "Processando..." : "Finalizar cadastro"}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingLayout>
  )
}
