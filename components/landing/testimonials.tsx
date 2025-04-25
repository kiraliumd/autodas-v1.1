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
    <section className="py-20 bg-[#FFF8EE]">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">O que dizem nossos assinantes</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg animate-slide-up delay-${index * 100}`}
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-800 mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-700">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
