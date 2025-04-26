import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="relative py-16 bg-[#FFF8EE]">
      <div className="container mx-auto max-w-[1120px]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block bg-primary/20 text-primary px-4 py-1 rounded-[8px] text-sm font-medium mb-6 animate-fade-in">
            SIMPLIFIQUE SUA VIDA COMO MEI
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 animate-slide-up">
            Esqueceu de pagar o <span className="text-primary">DAS</span> de novo?
          </h1>

          <p className="text-lg text-gray-700 mb-8 animate-slide-up delay-200">
            Pare de perder dinheiro com multas e juros. O AutoDAS automatiza a emissão da sua guia e envia no seu
            WhatsApp todo mês, no dia certo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-300">
            <Link href="/checkout">
              <Button
                size="lg"
                className="rounded-[8px] px-8 py-6 text-base font-medium hover:scale-105 transition-transform"
              >
                ASSINE AGORA
              </Button>
            </Link>
            <Link href="#benefits">
              <Button
                variant="outline"
                size="lg"
                className="rounded-[8px] px-8 py-6 text-base font-medium hover:bg-gray-100 transition-all"
              >
                Ver benefícios
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl mt-16 animate-fade-in delay-400">
          <Image
            src="/images/whatsapp-mockup.png"
            alt="AutoDAS no WhatsApp"
            width={800}
            height={500}
            className="w-full h-auto rounded-xl shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  )
}
