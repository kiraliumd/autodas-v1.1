import { Check } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"
import { StripeCheckoutButton } from "@/components/stripe-checkout-button"

export function PricingSection() {
  const features = ["Guia enviada todo mês via WhatsApp", "Código de segurança incluso", "Acesso por 12 meses"]

  // Definir a data de término da promoção (7 dias a partir de agora)
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 7)

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Um plano simples, direto ao ponto
          </h2>
          <p className="mt-3 md:mt-4 text-base sm:text-lg text-muted-foreground">
            Apenas para os primeiros 100 assinantes
          </p>
          <div className="mt-2 inline-block bg-[#f2f8e8] text-[#8DC63F] px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium border border-[#c5e0a5] animate-pulse-slow">
            Restam apenas 23 vagas com este preço promocional!
          </div>

          {/* Contador regressivo */}
          <CountdownTimer targetDate={targetDate} className="mt-4 md:mt-6" />
        </div>

        <div className="max-w-md mx-auto animate-slide-up delay-300">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Plano Anual</h3>
                <span className="px-2 md:px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                  Oferta Especial
                </span>
              </div>
              <div className="mt-3 md:mt-4 flex flex-col">
                <div className="flex items-center">
                  <span className="text-xs md:text-sm text-gray-500 line-through">R$ 79,90</span>
                  <span className="ml-1 text-xs md:text-sm text-gray-600">/ano</span>
                </div>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl md:text-4xl font-extrabold text-foreground">R$ 47,90</span>
                  <span className="ml-1 text-lg md:text-xl font-medium text-gray-600">/ano</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="px-2 md:px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full inline-block">
                  Economize 40%
                </span>
              </div>

              <ul className="mt-5 md:mt-6 space-y-3 md:space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className={`flex items-start animate-slide-in-right delay-${index * 100}`}>
                    <div className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                      <Check className="h-2 w-2 md:h-3 md:w-3 text-primary" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 md:p-6">
              <StripeCheckoutButton className="w-full py-4 md:py-6 text-sm md:text-base font-medium rounded-[8px] hover:scale-105 transition-transform">
                ASSINAR AGORA
              </StripeCheckoutButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
