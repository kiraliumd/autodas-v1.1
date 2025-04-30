import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Pronto para automatizar sua vida como MEI?
          </h2>
          <div className="mt-8 md:mt-10 animate-slide-up delay-200">
            <Link href="/checkout">
              <Button
                size="lg"
                className="text-sm md:text-base font-medium px-6 md:px-8 py-4 md:py-6 rounded-[8px] hover:scale-105 transition-transform"
              >
                ASSINE AGORA
              </Button>
            </Link>
          </div>
          <p className="mt-4 md:mt-6 text-xs md:text-sm text-gray-700 animate-fade-in delay-300">
            Pagamento único. Sem mensalidades. Sem surpresas.
            <br />
            Cancelamento fácil sempre que quiser.
          </p>
        </div>
      </div>
    </section>
  )
}
