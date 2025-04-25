"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckoutHeader } from "@/components/checkout-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle } from "lucide-react"
import { getStripe } from "@/lib/stripe"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const price = 47.9 // Preço anual em reais

  // Verificar se há parâmetros de sucesso ou cancelamento
  const paymentSuccess = searchParams.get("success")
  const paymentCanceled = searchParams.get("canceled")

  useEffect(() => {
    if (paymentSuccess) {
      setSuccess("Pagamento realizado com sucesso! Você será redirecionado para o cadastro.")
      // Redirecionar para o onboarding após 2 segundos
      setTimeout(() => {
        const sessionId = searchParams.get("session_id")
        if (sessionId) {
          router.push(`/onboarding/step1?session_id=${sessionId}`)
        }
      }, 2000)
    }

    if (paymentCanceled) {
      setError("O pagamento foi cancelado. Você pode tentar novamente quando estiver pronto.")
    }
  }, [paymentSuccess, paymentCanceled, router, searchParams])

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Criar sessão de checkout do Stripe
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price,
          successUrl: `${window.location.origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout?canceled=true`,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirecionar para o checkout do Stripe
      const stripe = await getStripe()
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (error) {
      console.error("Erro ao processar checkout:", error)
      setError("Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CheckoutHeader />

      <main className="flex-1 container max-w-4xl py-12">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 md:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assine o Autodas</h1>
              <p className="text-muted-foreground mt-2">
                Simplifique a gestão do seu MEI com nossa plataforma completa.
              </p>
            </div>

            <Card className="border-2 border-primary">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Plano Anual</CardTitle>
                    <CardDescription>Acesso completo por 12 meses</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                    Recomendado
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">R$ {price.toFixed(2).replace(".", ",")}</span>
                  <span className="text-muted-foreground line-through ml-2">R$ 79,90</span>
                  <span className="text-sm text-muted-foreground ml-2">/ano</span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">O que está incluso:</h3>
                  <ul className="space-y-3">
                    {[
                      "Emissão ilimitada de notas fiscais",
                      "Controle financeiro completo",
                      "Gestão de clientes e fornecedores",
                      "Relatórios detalhados",
                      "Lembretes de obrigações fiscais",
                      "Suporte prioritário via WhatsApp",
                      "Acesso a todas as atualizações",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Plano Anual</span>
                  <span>R$ {price.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-4 border-t">
                  <span>Total</span>
                  <span>R$ {price.toFixed(2).replace(".", ",")}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading || !!success}>
                  {isLoading ? "Processando..." : "Pagar com Stripe"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">Pagamento seguro via Stripe</div>
              </CardFooter>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <div className="text-sm font-medium text-amber-800">Apenas para os primeiros 100 assinantes</div>
                </div>
                <div className="mt-3 pl-8">
                  <div className="text-sm text-amber-700">
                    Restam apenas <span className="font-bold">23</span> vagas com este preço promocional!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
