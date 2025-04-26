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
      <div className="container mx-auto max-w-[1120px]">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Como o AutoDAS facilita sua vida
          </h2>
          <p className="mt-4 text-xl text-gray-700">
            Deixa que a gente emite a guia. Você só precisa pagar. Simples assim.
          </p>
        </div>

        <div className="flex flex-col space-y-16">
          {/* Primeiro card - Conteúdo à esquerda, imagem à direita */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 animate-slide-up">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{features[0].title}</h3>
                <p className="text-gray-700">{features[0].description}</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 h-64 bg-gray-100 rounded-lg animate-fade-in">
              {/* Espaço para imagem que será adicionada depois */}
            </div>
          </div>

          {/* Segundo card - Imagem à esquerda, conteúdo à direita */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="w-full md:w-1/2 animate-slide-up delay-100">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{features[1].title}</h3>
                <p className="text-gray-700">{features[1].description}</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 h-64 bg-gray-100 rounded-lg animate-fade-in delay-100">
              {/* Espaço para imagem que será adicionada depois */}
            </div>
          </div>

          {/* Terceiro card - Conteúdo à esquerda, imagem à direita */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 animate-slide-up delay-200">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{features[2].title}</h3>
                <p className="text-gray-700">{features[2].description}</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 h-64 bg-gray-100 rounded-lg animate-fade-in delay-200">
              {/* Espaço para imagem que será adicionada depois */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
