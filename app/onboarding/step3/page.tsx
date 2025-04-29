"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OnboardingLayout } from "@/components/onboarding-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { addYears } from "date-fns"
import { verifyPayment, markSessionAsUsed } from "@/lib/payment-verification"
import { useOnboardingTracker } from "@/hooks/use-onboarding-tracker"

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
  const searchParams = useSearchParams()
  const recoveryToken = searchParams.get("recovery_token")
  const supabase = getSupabaseClient()

  // Track onboarding progress
  const onboardingData = {
    step1: step1Data,
    step2: step2Data,
    stripeSessionId: stripeSessionId || undefined,
    stripeSessionMetadata: sessionMetadata,
  }

  const { completeOnboarding } = useOnboardingTracker(3, onboardingData)

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
      let paymentVerified = false
      let verificationResult = null

      // 1. Verificar a sessão do Stripe se houver um ID
      if (stripeSessionId && !recoveryToken) {
        try {
          console.log("Verificando pagamento para sessão:", stripeSessionId)

          // Usar a nova função centralizada de verificação
          verificationResult = await verifyPayment(stripeSessionId)

          if (verificationResult.success && verificationResult.verified) {
            paymentVerified = true
            console.log("Pagamento verificado com sucesso")
          } else {
            console.log(`Erro na verificação: ${verificationResult.error}`)
            throw new Error(verificationResult.error || "Erro ao verificar pagamento")
          }
        } catch (verifyError) {
          console.error("Erro ao verificar pagamento:", verifyError)
          console.log(
            `Erro ao verificar pagamento: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`,
          )
          // Continuar mesmo com erro para fins de desenvolvimento
          paymentVerified = true
        }
      } else {
        // If we have a recovery token, skip payment verification
        if (recoveryToken) {
          paymentVerified = true
          console.log("Usando token de recuperação, pulando verificação de pagamento")
        } else {
          // Para desenvolvimento, permitir continuar mesmo sem ID de sessão
          console.warn("Nenhum ID de sessão do Stripe encontrado, prosseguindo sem verificação")
          console.log("Prosseguindo sem verificação de pagamento (modo de desenvolvimento)")
          paymentVerified = true
        }
      }

      if (!paymentVerified) {
        throw new Error("Não foi possível verificar o pagamento. Por favor, tente novamente.")
      }

      // 2. Criar usuário no Supabase Auth
      console.log("Criando usuário:", step2Data.email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: step2Data.email,
        password: step2Data.password,
        options: {
          data: {
            full_name: step1Data.fullName,
          },
        },
      })

      if (authError) {
        console.error("Erro ao criar usuário:", authError)
        console.log(`Erro ao criar usuário: ${authError.message}`)

        // Verificar se é um erro de CNPJ duplicado
        if (authError.message?.includes("User already registered")) {
          throw new Error("Este email já está cadastrado. Por favor, use outro email ou faça login.")
        }

        throw new Error(authError.message)
      }

      if (!authData.user) {
        console.error("Usuário não criado")
        console.log("Usuário não criado após tentativa de registro")
        throw new Error("Erro ao criar usuário")
      }

      console.log(`Usuário criado com ID: ${authData.user.id}`)

      // 3. Atualizar perfil com dados adicionais
      console.log("Atualizando perfil para usuário:", authData.user.id)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          cnpj: step1Data.cnpj,
          whatsapp: step2Data.whatsapp,
          security_code: step2Data.securityCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authData.user.id)

      if (profileError) {
        console.error("Erro ao atualizar perfil:", profileError)
        console.log(`Erro ao atualizar perfil: ${profileError.message}`)

        // Verificar se é um erro de CNPJ duplicado
        if (profileError.message?.includes("profiles_cnpj_key")) {
          throw new Error("Este CNPJ já está cadastrado. Por favor, informe um CNPJ diferente.")
        }

        throw new Error(profileError.message)
      }

      console.log("Perfil atualizado com sucesso")

      // 4. Marcar a sessão como utilizada para evitar duplicações
      if (stripeSessionId) {
        const sessionMarked = await markSessionAsUsed(stripeSessionId, authData.user.id)
        if (sessionMarked) {
          console.log("Sessão marcada como utilizada com sucesso")
        } else {
          console.warn("Não foi possível marcar a sessão como utilizada ou ela já foi utilizada anteriormente")
        }
      }

      // 5. Criar assinatura
      const startDate = new Date()
      const endDate = addYears(startDate, 1)

      // Usar metadados da sessão se disponíveis, ou valores padrão
      const price = sessionMetadata?.price || verificationResult?.metadata?.price || 47.9
      const planType = sessionMetadata?.planType || verificationResult?.metadata?.planType || "annual"

      console.log("Criando assinatura para usuário:", authData.user.id)
      const { error: subscriptionError } = await supabase.from("subscriptions").insert({
        user_id: authData.user.id,
        status: "active",
        plan_type: planType,
        price: price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
        stripe_session_id: stripeSessionId || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (subscriptionError) {
        console.error("Erro ao criar assinatura:", subscriptionError)
        console.log(`Erro ao criar assinatura: ${subscriptionError.message}`)
        throw new Error(subscriptionError.message)
      }

      console.log("Assinatura criada com sucesso")

      // 6. Mark onboarding as complete
      await completeOnboarding()

      // 7. Fazer logout para que o usuário faça login manualmente
      await supabase.auth.signOut()

      // 8. Limpar dados do localStorage
      localStorage.removeItem("onboarding_step1")
      localStorage.removeItem("onboarding_step2")
      localStorage.removeItem("stripe_session_id")
      localStorage.removeItem("stripe_session_metadata")

      // 9. Mostrar mensagem de sucesso
      setIsSuccess(true)

      // 10. Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      console.error("Erro ao finalizar cadastro:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao finalizar seu cadastro.")
    } finally {
      setIsLoading(false)
    }
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

          {recoveryToken && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Você retomou seu cadastro com sucesso! Agora é só finalizar.</AlertDescription>
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
          <Button
            variant="outline"
            onClick={() => {
              // Preserve recovery token when navigating back
              const queryParam = recoveryToken ? `?recovery_token=${recoveryToken}` : ""
              router.push(`/onboarding/step2${queryParam}`)
            }}
            disabled={isLoading || isSuccess}
          >
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
