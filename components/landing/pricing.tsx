import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"
import { CountdownTimer } from "./countdown-timer"

export function PricingSection() {
  const features = [
    "Guia enviada todo mês via WhatsApp",
    "Código de segurança incluso",
    "Acesso por 12 meses",
    "Cancelamento fácil",
    "Pague com Pix ou cartão",
  ]

  // Definir a data de término da promoção (7 dias a partir de agora)
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 7)

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Um plano simples, direto ao ponto
          </h2>
          <p className="mt-4 text-lg text-gray-700">Apenas para os primeiros 100 assinantes</p>
          <div className="mt-2 inline-block bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-medium border border-amber-300 animate-pulse-slow">
            Restam apenas 23 vagas com este preço promocional!
          </div>

          {/* Contador regressivo */}
          <CountdownTimer targetDate={targetDate} className="mt-6" />
        </div>

        <div className="max-w-md mx-auto animate-slide-up delay-300">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900">Plano Anual</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">R$ 47,90</span>
                <span className="ml-1 text-xl font-medium text-gray-600">/ano</span>
                <span className="ml-2 text-sm text-gray-500 line-through">R$ 79,90</span>
              </div>

              <ul className="mt-6 space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className={`flex items-start animate-slide-in-right delay-${index * 100}`}>
                    <div className="flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-6">
              <Link href="/checkout">
                <Button className="w-full py-6 text-base font-medium rounded-[8px] hover:scale-105 transition-transform">
                  ASSINAR AGORA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
