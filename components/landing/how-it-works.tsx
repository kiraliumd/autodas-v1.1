import { CalendarCheck, MessageSquare, ShieldCheck } from "lucide-react"

export function HowItWorks() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Emissão automática todo mês",
      description: "Sua guia DAS emitida automaticamente no dia 20.",
    },
    {
      icon: MessageSquare,
      title: "Entrega direta no WhatsApp",
      description: "Sem login, sem e-mail perdido. Você recebe no WhatsApp com código de segurança.",
    },
    {
      icon: ShieldCheck,
      title: "Sem juros ou multas por esquecimento",
      description: "Foco total no seu negócio, sem dores de cabeça com prazos.",
    },
  ]

  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Como o AutoDAS facilita sua vida
          </h2>
          <p className="mt-4 text-xl text-gray-700">
            Deixa que a gente emite a guia. Você só precisa pagar. Simples assim.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-[#FFF8EE] p-8 rounded-xl transition-all hover:shadow-lg text-center animate-slide-up delay-${index * 100}`}
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
