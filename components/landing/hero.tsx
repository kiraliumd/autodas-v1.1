import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[#FFF8EE]">
      <div className="container mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-block bg-primary/20 text-primary px-4 py-1 rounded-[8px] text-sm font-medium mb-5 md:mb-6 animate-fade-in">
            SIMPLIFIQUE SUA VIDA COMO MEI
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-5 md:mb-6 animate-slide-up">
            Esqueceu de pagar o <span className="text-primary">DAS</span> de novo?
          </h1>

          <p className="text-base sm:text-lg text-gray-700 mb-6 md:mb-8 animate-slide-up delay-200">
            Pare de perder dinheiro com multas e juros. O AutoDAS automatiza a emissão da sua guia e envia no seu
            WhatsApp todo mês, no dia certo.
          </p>

          <div className="flex flex-row gap-2 sm:gap-3 md:gap-5 justify-center animate-slide-up delay-300">
            <Link href="/checkout">
              <Button
                size="lg"
                className="rounded-[8px] px-4 sm:px-8 py-4 sm:py-6 text-xs sm:text-base font-medium hover:scale-105 transition-transform"
              >
                ASSINE AGORA
              </Button>
            </Link>
            <Link href="#benefits">
              <Button
                variant="outline"
                size="lg"
                className="rounded-[8px] px-4 sm:px-8 py-4 sm:py-6 text-xs sm:text-base font-medium hover:bg-gray-100 transition-all"
              >
                Ver benefícios
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl mt-10 md:mt-16 animate-fade-in delay-400">
          <Image
            src="https://iytu5oqsloncu0k0.public.blob.vercel-storage.com/uploads/1745985063724-autodas-notify-zap--1--OIg5voB7y4lSoHo4EBVc00bwywIIU6.png"
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
