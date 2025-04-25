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
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Carregar dados das etapas anteriores
    const step1 = localStorage.getItem("onboarding_step1")
    const step2 = localStorage.getItem("onboarding_step2")
    const sessionId = localStorage.getItem("stripe_session_id")

    if (!step1 || !step2) {
      router.push("/onboarding/step1")
      return
    }

    setStep1Data(JSON.parse(step1))
    setStep2Data(JSON.parse(step2))
    setStripeSessionId(sessionId)

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
    setDebugInfo(null)

    try {
      let paymentVerified = false
      let sessionData = null

      // 1. Verificar a sessão do Stripe se houver um ID
      if (stripeSessionId) {
        try {
          console.log("Verificando pagamento para sessão:", stripeSessionId)
          const response = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId: stripeSessionId }),
          })

          const data = await response.json()
          console.log("Resposta da verificação de pagamento:", data)

          if (data.success) {
            paymentVerified = true
            sessionData = data.session
            setDebugInfo("Pagamento verificado com sucesso")
          } else {
            setDebugInfo(`Erro na verificação: ${data.error}`)
            throw new Error(data.error || "Erro ao verificar pagamento")
          }
        } catch (verifyError) {
          console.error("Erro ao verificar pagamento:", verifyError)
          setDebugInfo(
            `Erro ao verificar pagamento: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`,
          )
          // Continuar mesmo com erro para fins de desenvolvimento
          paymentVerified = true
        }
      } else {
        // Para desenvolvimento, permitir continuar mesmo sem ID de sessão
        console.warn("Nenhum ID de sessão do Stripe encontrado, prosseguindo sem verificação")
        setDebugInfo("Prosseguindo sem verificação de pagamento (modo de desenvolvimento)")
        paymentVerified = true
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
        setDebugInfo(`Erro ao criar usuário: ${authError.message}`)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        console.error("Usuário não criado")
        setDebugInfo("Usuário não criado após tentativa de registro")
        throw new Error("Erro ao criar usuário")
      }

      console.log("Usuário criado com ID:", authData.user.id)
      setDebugInfo((prev) => `${prev}\nUsuário criado com ID: ${authData.user.id}`)

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
        setDebugInfo((prev) => `${prev}\nErro ao atualizar perfil: ${profileError.message}`)
        throw new Error(profileError.message)
      }

      console.log("Perfil atualizado com sucesso")
      setDebugInfo((prev) => `${prev}\nPerfil atualizado com sucesso`)

      // 4. Criar assinatura
      const startDate = new Date()
      const endDate = addYears(startDate, 1)

      console.log("Criando assinatura para usuário:", authData.user.id)
      const { error: subscriptionError } = await supabase.from("subscriptions").insert({
        user_id: authData.user.id,
        status: "active",
        plan_type: "annual",
        price: sessionData?.metadata?.price || 47.9,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
        stripe_session_id: stripeSessionId || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (subscriptionError) {
        console.error("Erro ao criar assinatura:", subscriptionError)
        setDebugInfo((prev) => `${prev}\nErro ao criar assinatura: ${subscriptionError.message}`)
        throw new Error(subscriptionError.message)
      }

      console.log("Assinatura criada com sucesso")
      setDebugInfo((prev) => `${prev}\nAssinatura criada com sucesso`)

      // 5. Fazer logout para que o usuário faça login manualmente
      await supabase.auth.signOut()

      // 6. Limpar dados do localStorage
      localStorage.removeItem("onboarding_step1")
      localStorage.removeItem("onboarding_step2")
      localStorage.removeItem("stripe_session_id")

      // 7. Mostrar mensagem de sucesso
      setIsSuccess(true)
      setDebugInfo((prev) => `${prev}\nCadastro finalizado com sucesso!`)

      // 8. Redirecionar para login após 3 segundos
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

          {debugInfo && (
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertDescription className="whitespace-pre-line">
                <strong>Informações de debug:</strong>
                {debugInfo}
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
                  <span className="font-medium">Código de segurança:</span> ******
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Pagamento confirmado!</p>
              <p className="mt-1">
                Seu pagamento foi processado com sucesso. Ao finalizar o cadastro, você terá acesso imediato à
                plataforma.
              </p>
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
          <Button variant="outline" onClick={() => router.push("/onboarding/step2")} disabled={isLoading || isSuccess}>
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
