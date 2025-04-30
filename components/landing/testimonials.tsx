import { Star } from "lucide-react"
import Image from "next/image"

export function Testimonials() {
  const testimonials = [
    {
      content: "Antes do AutoDAS eu sempre esquecia. Agora recebo certinho no WhatsApp e não me preocupo mais.",
      author: "Ana Paula",
      role: "Confeitera MEI",
      avatar: "/images/avatar-1.png",
    },
    {
      content: "Melhor R$ 47 que já investi no meu negócio.",
      author: "João Marcos",
      role: "Delivery MEI",
      avatar: "/images/avatar-2.png",
    },
    {
      content:
        "Eu sempre esquecia de emitir a guia e acabava pagando com multa. Agora recebo no WhatsApp todo mês, certinho. Não preciso me preocupar com nada.",
      author: "Camila Rodrigues",
      role: "Designer Freelancer MEI",
      avatar: "/images/avatar-3.png",
    },
  ]

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[#FFF8EE]">
      <div className="container mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            O que dizem nossos assinantes
          </h2>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white p-5 md:p-6 rounded-xl shadow-md transition-all hover:shadow-lg animate-slide-up delay-${index * 100}`}
            >
              <div className="flex mb-3 md:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-800 mb-4 md:mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm md:text-base text-gray-900">{testimonial.author}</p>
                  <p className="text-xs md:text-sm text-gray-700">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
