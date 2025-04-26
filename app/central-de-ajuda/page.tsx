import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Central de Ajuda | Autodas",
  description: "Central de Ajuda da plataforma Autodas",
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-1 container max-w-[1120px] py-12 mx-auto">
        <h1 className="text-3xl font-bold mb-8">Central de Ajuda</h1>

        <div className="bg-muted/50 rounded-lg p-8 mb-8">
          <div className="flex items-start gap-4">
            <Mail className="h-8 w-8 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-semibold mb-2">Precisa de suporte?</h2>
              <p className="text-lg mb-4">
                Para suporte, envie um e-mail para{" "}
                <a href="mailto:suporte@autodas.com.br" className="text-primary font-medium hover:underline">
                  suporte@autodas.com.br
                </a>
              </p>
              <p className="text-muted-foreground">Nossa equipe responderá em até 24 horas.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
