"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingLayout } from "@/components/onboarding-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { addYears } from "date-fns"

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

  const handleSubmit = async () => {
    if (!step1Data || !step2Data) {
      setError("Dados incompletos. Por favor, volte e preencha todas as etapas.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Criar usuário no Supabase Auth - Versão simplificada como na v76
      console.log("Criando usuário:", step2Data.email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: step2Data.email,
        password: step2Data.password,
      })

      if (authError) {
        console.error("Erro ao criar usuário:", authError)
        throw new Error(`Erro ao criar usuário: ${authError.message}`)
      }

      if (!authData.user) {
        console.error("Usuário não criado")
        throw new Error("Erro ao criar usuário: nenhum usuário retornado")
      }

      console.log(`Usuário criado com ID: ${authData.user.id}`)

      // 2. Aguardar um momento para garantir que o usuário foi criado no banco
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 3. Criar perfil
      console.log("Criando perfil para usuário:", authData.user.id)
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: step1Data.fullName,
        cnpj: step1Data.cnpj,
        whatsapp: step2Data.whatsapp,
        security_code: step2Data.securityCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Erro ao criar perfil:", profileError)
        throw new Error(`Erro ao criar perfil: ${profileError.message}`)
      }

      console.log("Perfil criado com sucesso")

      // 4. Criar assinatura
      const startDate = new Date()
      const endDate = addYears(startDate, 1)

      // Usar valores padrão para simplificar
      const price = 47.9
      const planType = "annual"

      console.log("Criando assinatura para usuário:", authData.user.id)
      const { error: subscriptionError } = await supabase.from("subscriptions").insert({
        user_id: authData.user.id,
        status: "active",
        plan_type: planType,
        price: price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
        stripe_session_id: stripeSessionId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (subscriptionError) {
        console.error("Erro ao criar assinatura:", subscriptionError)
        throw new Error(`Erro ao criar assinatura: ${subscriptionError.message}`)
      }

      console.log("Assinatura criada com sucesso")

      // 5. Fazer logout para que o usuário faça login manualmente
      await supabase.auth.signOut()

      // 6. Limpar dados do localStorage
      localStorage.removeItem("onboarding_step1")
      localStorage.removeItem("onboarding_step2")
      localStorage.removeItem("onboarding_step2_draft")
      localStorage.removeItem("stripe_session_id")
      localStorage.removeItem("stripe_session_metadata")

      // 7. Mostrar mensagem de sucesso
      setIsSuccess(true)

      // 8. Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      console.error("Erro ao finalizar cadastro:", err)
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro ao finalizar seu cadastro. Por favor, tente novamente.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.replace("/onboarding/step2")
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
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Cadastro realizado com sucesso! Você será redirecionado para a página de login em instantes.
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border p-4 space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Dados pessoais</h3>
              <div className="mt-1">
                <p>
                  <span className="font-medium">Nome:</span> {step1Data.fullName}
                </p>
                <p>
                  <span className="font-medium">CNPJ:</span> {step1Data.cnpj}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Dados de acesso</h3>
              <div className="mt-1">
                <p>
                  <span className="font-medium">E-mail:</span> {step2Data.email}
                </p>
                <p>
                  <span className="font-medium">WhatsApp:</span> {step2Data.whatsapp}
                </p>
                <p>
                  <span className="font-medium">Código de segurança:</span> {step2Data.securityCode}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Importante:</p>
              <p className="mt-1">
                Ao confirmar, você concorda com nossos Termos de Serviço e Política de Privacidade. Seus dados serão
                usados apenas para fins de prestação de serviço.
              </p>
            </div>
          </div>
        </CardContent>
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
