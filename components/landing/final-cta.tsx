import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pronto para automatizar sua vida como MEI?
          </h2>
          <div className="mt-10 animate-slide-up delay-200">
            <Link href="/checkout">
              <Button
                size="lg"
                className="text-base font-medium px-8 py-6 rounded-[8px] hover:scale-105 transition-transform"
              >
                ASSINE AGORA
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-700 animate-fade-in delay-300">
            Pagamento único. Sem mensalidades. Sem surpresas.
            <br />
            Cancelamento fácil sempre que quiser.
          </p>
        </div>
      </div>
    </section>
  )
}
