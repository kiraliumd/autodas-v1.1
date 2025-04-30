import { CalendarCheck, MessageSquare, ShieldCheck } from "lucide-react"

export function HowItWorks() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Emissão automática todo mês",
      description: "Sua guia DAS emitida automaticamente no dia 20.",
      image: "/images/feature-calendar.png",
    },
    {
      icon: MessageSquare,
      title: "Entrega direta no WhatsApp",
      description: "Sem login, sem e-mail perdido. Você recebe no WhatsApp com código de segurança.",
      image:
        "https://iytu5oqsloncu0k0.public.blob.vercel-storage.com/uploads/codigodeseguranc%CC%A7a-autodas-iirQHA6fZGSGykxIE8lYuG7mLuoTIl.png",
    },
    {
      icon: ShieldCheck,
      title: "Sem juros ou multas por esquecimento",
      description: "Foco total no seu negócio, sem dores de cabeça com prazos.",
      image: "/images/feature-shield.png",
    },
  ]

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white" id="how-it-works">
      <div className="container mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Como o Autodas facilita sua vida
          </h2>
          <p className="mt-3 md:mt-4 text-base sm:text-lg md:text-xl text-muted-foreground">
            Deixa que a gente emite a guia. Você só precisa pagar. Simples assim.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 md:p-6 transition-all duration-300 border border-gray-200 shadow-lg hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
