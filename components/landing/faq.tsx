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
        "Basta entrar em contato com nosso suporte e atualizar seu número. Continuaremos enviando suas guias para o novo número sem interrupções.",
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer:
        "Sim! Você pode cancelar quando quiser. O valor é anual, mas garantimos reembolso proporcional caso decida não continuar.",
    },
    {
      question: "Como é feito o pagamento?",
      answer:
        "O pagamento é feito uma única vez por ano, via cartão de crédito ou PIX, através da nossa plataforma segura.",
    },
  ]

  return (
    <section className="py-20 bg-[#FFF8EE]" id="faq">
      <div className="container mx-auto max-w-[1120px]">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Perguntas Frequentes</h2>
          <p className="mt-4 text-lg text-gray-700">Tire suas dúvidas sobre o AutoDAS</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 animate-slide-up">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className={`animate-fade-in delay-${index * 100}`}>
                <AccordionTrigger className="text-left font-medium text-gray-900">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
