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
import { AlertCircle, Clock } from "lucide-react"
import { formatCNPJ, cleanFormat, validateCNPJ } from "@/lib/utils/format"
import { verifyPayment } from "@/lib/payment-verification"
import { format, formatDistance } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useOnboardingTracker } from "@/hooks/use-onboarding-tracker"

export default function OnboardingStep1() {
  const [formData, setFormData] = useState({
    fullName: "",
    cnpj: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<{
    name?: string
    email?: string
  }>({})
  const [expirationInfo, setExpirationInfo] = useState<{
    date: string | null
    formattedDate: string | null
    timeLeft: string | null
  }>({
    date: null,
    formattedDate: null,
    timeLeft: null,
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const recoveryToken = searchParams.get("recovery_token")

  // Track onboarding progress
  const onboardingData = {
    step1: formData,
    stripeSessionId: sessionId || undefined,
  }

  useOnboardingTracker(1, onboardingData)

  useEffect(() => {
    // Carregar dados salvos do step1 se existirem
    const savedStep1Data = localStorage.getItem("onboarding_step1")
    if (savedStep1Data) {
      try {
        const parsedData = JSON.parse(savedStep1Data)
        setFormData({
          fullName: parsedData.fullName || "",
          cnpj: parsedData.cnpj ? formatCNPJ(parsedData.cnpj) : "",
        })
      } catch (e) {
        console.error("Erro ao carregar dados salvos do step1:", e)
      }
    }

    const checkPayment = async () => {
      if (!sessionId && !recoveryToken) {
        setError("Sessão de pagamento não encontrada. Por favor, realize o pagamento primeiro.")
        setIsVerifying(false)
        return
      }

      try {
        // If we have a recovery token, we can skip payment verification
        if (recoveryToken) {
          setPaymentVerified(true)
          setIsVerifying(false)
          return
        }

        // Usar a função centralizada de verificação
        const verificationResult = await verifyPayment(sessionId!)

        if (!verificationResult.success || !verificationResult.verified) {
          // Verificar se o erro é devido à expiração
          if (verificationResult.error?.includes("expirou")) {
            setError("Esta sessão de pagamento expirou. Por favor, realize um novo pagamento.")
          } else {
            setError(verificationResult.error || "Pagamento não confirmado. Por favor, realize o pagamento primeiro.")
          }

          setTimeout(() => {
            router.push("/checkout")
          }, 3000)
          return
        }

        // Armazenar o ID da sessão e metadados no localStorage para uso posterior
        localStorage.setItem("stripe_session_id", sessionId!)

        // Armazenar metadados do plano se disponíveis
        if (verificationResult.metadata) {
          localStorage.setItem("stripe_session_metadata", JSON.stringify(verificationResult.metadata))

          // Extrair informações do cliente se disponíveis
          if (verificationResult.metadata.customer_name) {
            setCustomerInfo((prev) => ({
              ...prev,
              name: verificationResult.metadata.customer_name,
            }))

            // Pré-preencher o nome se disponível
            setFormData((prev) => ({
              ...prev,
              fullName: verificationResult.metadata.customer_name || "",
            }))
          }

          if (verificationResult.metadata.customer_email) {
            setCustomerInfo((prev) => ({
              ...prev,
              email: verificationResult.metadata.customer_email,
            }))
          }
        }

        // Processar informações de expiração
        if (verificationResult.expiresAt) {
          try {
            const expirationDate = new Date(verificationResult.expiresAt)
            const formattedDate = format(expirationDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
            const timeLeft = formatDistance(expirationDate, new Date(), {
              addSuffix: true,
              locale: ptBR,
            })

            setExpirationInfo({
              date: verificationResult.expiresAt,
              formattedDate,
              timeLeft,
            })
          } catch (dateError) {
            console.error("Erro ao processar data de expiração:", dateError)
          }
        }

        setPaymentVerified(true)
        setIsVerifying(false)
      } catch (err) {
        console.error("Erro ao verificar pagamento:", err)
        setError("Erro ao verificar pagamento. Por favor, tente novamente.")
        setIsVerifying(false)
      }
    }

    if (sessionId || recoveryToken) {
      checkPayment()
    } else {
      setIsVerifying(false)
    }
  }, [sessionId, recoveryToken, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "cnpj") {
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
      // Validar dados
      if (!formData.fullName.trim() || !formData.cnpj.trim()) {
        setError("Por favor, preencha todos os campos.")
        setIsLoading(false)
        return
      }

      // Validar CNPJ
      const cleanedCNPJ = cleanFormat(formData.cnpj)
      if (!validateCNPJ(cleanedCNPJ)) {
        setError("CNPJ inválido. Por favor, verifique e tente novamente.")
        setIsLoading(false)
        return
      }

      // Verificar se o CNPJ já existe no banco de dados
      const supabase = getSupabaseClient()
      const { data: existingCNPJ, error: cnpjCheckError } = await supabase
        .from("profiles")
        .select("cnpj")
        .eq("cnpj", cleanedCNPJ)
        .maybeSingle()

      if (existingCNPJ) {
        setError("Este CNPJ já está cadastrado. Por favor, informe um CNPJ diferente.")
        setIsLoading(false)
        return
      }

      // Armazenar dados no localStorage para usar nas próximas etapas
      localStorage.setItem(
        "onboarding_step1",
        JSON.stringify({
          fullName: formData.fullName,
          cnpj: cleanFormat(formData.cnpj),
        }),
      )

      // Preserve recovery token when navigating
      const queryParam = recoveryToken ? `?recovery_token=${recoveryToken}` : ""

      // Avançar para a próxima etapa
      router.push(`/onboarding/step2${queryParam}`)
    } catch (err) {
      setError("Ocorreu um erro. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying && (sessionId || recoveryToken)) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={3}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Verificando sessão</CardTitle>
            <CardDescription>Por favor, aguarde enquanto verificamos sua sessão...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </OnboardingLayout>
    )
  }

  // Se não houver sessionId e não estiver verificando, verificar se temos dados salvos antes de redirecionar
  if (!sessionId && !recoveryToken && !isVerifying) {
    const savedStep1Data = localStorage.getItem("onboarding_step1")
    // Só redireciona para checkout se não tiver dados salvos do step1
    if (!savedStep1Data) {
      router.push("/checkout")
      return null
    }
  }

  return (
    <OnboardingLayout currentStep={1} totalSteps={3}>
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>
            {customerInfo.name
              ? `Bem-vindo, ${customerInfo.name.split(" ")[0]}! Vamos completar seu cadastro`
              : "Bem-vindo! Vamos completar seu cadastro"}
          </CardTitle>
          <CardDescription>Preencha seus dados pessoais para começar</CardDescription>
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

          {expirationInfo.date && (
            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                Esta sessão de pagamento expira em {expirationInfo.timeLeft} ({expirationInfo.formattedDate}). Por
                favor, complete seu cadastro antes desse prazo.
              </AlertDescription>
            </Alert>
          )}

          <form id="step1-form" onSubmit={handleSubmit}>
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
                <p className="text-sm text-muted-foreground">Digite o CNPJ no formato XX.XXX.XXX/XXXX-XX</p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="step1-form" disabled={isLoading}>
            {isLoading ? "Processando..." : "Continuar"}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingLayout>
  )
}
