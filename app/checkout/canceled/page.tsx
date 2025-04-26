"use client"

import { useRouter } from "next/navigation"
import { CheckoutHeader } from "@/components/checkout-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function CheckoutCanceledPage() {
  const router = useRouter()

  const handleTryAgain = () => {
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CheckoutHeader />

      <main className="flex-1 container max-w-2xl py-12 flex flex-col items-center justify-center">
        <Card className="w-full border-2 border-amber-100 shadow-lg">
          <CardHeader className="text-center pb-3 bg-amber-50 border-b border-amber-100">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-800">Pagamento Cancelado</CardTitle>
            <CardDescription className="text-amber-700">
              Parece que o pagamento foi cancelado. Tudo bem! Quer tentar de novo?
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <p className="text-center text-muted-foreground">
              Você pode tentar novamente quando estiver pronto. Se encontrou algum problema durante o pagamento, nossa
              equipe de suporte está disponível para ajudar.
            </p>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <Button onClick={handleTryAgain} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>

            <Button onClick={() => router.push("/")} className="w-full" variant="outline">
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
