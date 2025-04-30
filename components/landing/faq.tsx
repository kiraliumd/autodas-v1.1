import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "Como funciona o envio da guia DAS?",
      answer:
        "Todo mês, no dia 20, emitimos automaticamente sua guia DAS e enviamos diretamente para o seu WhatsApp. Você recebe um código de segurança exclusivo para confirmar que é você mesmo.",
    },
    {
      question: "Preciso instalar algum aplicativo?",
      answer:
        "Não! Você recebe tudo diretamente no WhatsApp que você já usa. Sem necessidade de baixar aplicativos ou acessar sites.",
    },
    {
      question: "O que acontece se eu mudar de número de WhatsApp?",
      answer:
        "Você pode atualizar seu número diretamente na plataforma. Assim que alterado, suas guias continuarão sendo enviadas normalmente para o novo número, sem interrupções.",
    },
  ]

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[#FFF8EE]" id="faq">
      <div className="container mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Perguntas Frequentes
          </h2>
          <p className="mt-3 md:mt-4 text-base sm:text-lg text-muted-foreground">Tire suas dúvidas sobre o AutoDAS</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-5 md:p-8 animate-slide-up">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className={`animate-fade-in delay-${index * 100}`}>
                <AccordionTrigger className="text-left font-medium text-sm md:text-base text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
