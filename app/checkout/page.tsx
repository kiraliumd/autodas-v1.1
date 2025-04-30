"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckoutHeader } from "@/components/checkout-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle, Lock } from "lucide-react"
import { getStripe } from "@/lib/stripe"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const price = 47.9 // Preço anual em reais

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
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/canceled`,
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
                    {["Guia enviada todo mês via WhatsApp", "Código de segurança incluso", "Acesso por 12 meses"].map(
                      (item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{item}</span>
                        </li>
                      ),
                    )}
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
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                  {isLoading ? "Processando..." : "Assinar agora"}
                </Button>
                <div className="text-center text-sm text-muted-foreground flex items-center justify-center">
                  <Lock className="h-3 w-3 mr-1" />
                  Pagamento Seguro
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-[#f2f8e8] border-[#c5e0a5]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-[#8DC63F]" />
                  <div className="text-sm font-medium text-[#8DC63F]">Apenas para os primeiros 100 assinantes</div>
                </div>
                <div className="mt-3 pl-8">
                  <div className="text-sm text-[#8DC63F]">
                    Restam apenas <span className="font-bold">21</span> vagas com este preço promocional!
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
