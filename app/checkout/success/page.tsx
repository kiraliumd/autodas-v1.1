"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckoutHeader } from "@/components/checkout-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Check, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import confetti from "canvas-confetti"

export default function CheckoutSuccessPage() {
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  // Efeito para lançar confetti quando a página carrega
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Efeito para a barra de progresso
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // Efeito para contagem regressiva
  useEffect(() => {
    if (!isRedirecting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (countdown === 0 && !isRedirecting) {
      handleContinue()
    }
  }, [countdown, isRedirecting])

  const handleContinue = () => {
    if (isRedirecting) return

    setIsRedirecting(true)

    if (sessionId) {
      router.push(`/onboarding/step1?session_id=${sessionId}`)
    } else {
      // Fallback caso não tenha session_id
      router.push("/onboarding/step1")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CheckoutHeader />

      <main className="flex-1 container max-w-2xl py-12 flex flex-col items-center justify-center">
        <Card className="w-full border-2 border-green-100 shadow-lg">
          <CardHeader className="text-center pb-3 bg-green-50 border-b border-green-100">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Pagamento Confirmado!</CardTitle>
            <CardDescription className="text-green-700">
              Obrigado por assinar o Autodas! Estamos configurando sua conta.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Configurando sua conta</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertDescription>
                Você será redirecionado em <span className="font-bold">{countdown}</span> segundos...
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter>
            <Button onClick={handleContinue} className="w-full" disabled={isRedirecting}>
              {isRedirecting ? (
                <span className="flex items-center">
                  Redirecionando
                  <span className="ml-2 inline-block animate-pulse">...</span>
                </span>
              ) : (
                <span className="flex items-center">
                  Continuar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
