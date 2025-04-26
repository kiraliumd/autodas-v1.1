"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckoutHeader } from "@/components/checkout-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { processPaymentAndCreateAccount } from "@/lib/payment-processing"

export default function PaymentProcessingPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("Processando seu pagamento...")
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      setError("Sessão de pagamento não encontrada. Por favor, tente novamente.")
      return
    }

    const processPayment = async () => {
      try {
        // Start progress animation
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            // Cap at 90% until we're actually done
            return prev < 90 ? prev + 10 : prev
          })
        }, 1000)

        // Process the payment and create account
        setMessage("Verificando pagamento...")
        const result = await processPaymentAndCreateAccount(sessionId)

        // Clear the interval
        clearInterval(progressInterval)

        if (result.success) {
          setProgress(100)
          setStatus("success")
          setMessage("Pagamento processado com sucesso!")

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setStatus("error")
          setError(result.error || "Ocorreu um erro ao processar seu pagamento.")
        }
      } catch (err) {
        setStatus("error")
        setError("Ocorreu um erro inesperado. Por favor, tente novamente.")
        console.error("Error processing payment:", err)
      }
    }

    processPayment()
  }, [sessionId, router])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CheckoutHeader />

      <main className="flex-1 container max-w-md py-12 flex flex-col justify-center">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>
              {status === "loading" && "Processando pagamento"}
              {status === "success" && "Pagamento confirmado"}
              {status === "error" && "Erro no processamento"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Por favor, aguarde enquanto processamos seu pagamento..."}
              {status === "success" && "Seu pagamento foi processado com sucesso!"}
              {status === "error" && "Ocorreu um problema ao processar seu pagamento."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "loading" && (
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-muted-foreground">{message}</p>
              </div>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Seu pagamento foi confirmado e sua conta foi criada com sucesso! Você será redirecionado para o
                  dashboard em instantes.
                </AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button onClick={() => router.push("/checkout")}>Voltar para o checkout</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
