import { Check } from "lucide-react"

export function Benefits() {
  const benefits = [
    "Receba a guia no WhatsApp todos os meses",
    "Emissão automática garantida até dezembro",
    "Suporte direto e humanizado",
    "Plataforma segura, com código de segurança exclusivo",
    "Zero mensalidade: pague uma vez e fique tranquilo o ano todo",
  ]

  return (
    <section className="py-20 bg-[#FFF8EE]" id="benefits">
      <div className="container mx-auto max-w-[1120px]">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Por que assinar o AutoDAS?</h2>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 animate-slide-up">
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className={`flex items-start animate-slide-in-right delay-${index * 100}`}>
                <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-gray-800">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 bg-primary/10 border border-primary/30 rounded-lg p-4 text-center animate-fade-in delay-500">
            <p className="font-medium text-primary">Plano único, anual, sem taxas escondidas</p>
          </div>
        </div>
      </div>
    </section>
  )
}
