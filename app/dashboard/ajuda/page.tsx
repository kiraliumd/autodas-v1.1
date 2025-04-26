import type { Metadata } from "next"
import { Mail } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Ajuda | Dashboard Autodas",
  description: "Central de Ajuda do Dashboard Autodas",
}

export default function DashboardHelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Central de Ajuda</h3>
        <p className="text-sm text-muted-foreground">Obtenha suporte e tire suas dúvidas sobre a plataforma Autodas.</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Mail className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Precisa de suporte?</h2>
            <p className="mb-3">
              Para suporte, envie um e-mail para{" "}
              <a href="mailto:suporte@autodas.com.br" className="text-primary font-medium hover:underline">
                suporte@autodas.com.br
              </a>
            </p>
            <p className="text-sm text-muted-foreground">Nossa equipe responderá em até 24 horas.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Perguntas Frequentes</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Consulte nossa seção de perguntas frequentes para encontrar respostas rápidas.
          </p>
          <Link href="/faq" className="text-primary text-sm hover:underline">
            Ver Perguntas Frequentes
          </Link>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Tutoriais</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Aprenda a usar todos os recursos da plataforma com nossos tutoriais.
          </p>
          <Link href="/tutoriais" className="text-primary text-sm hover:underline">
            Ver Tutoriais
          </Link>
        </div>
      </div>
    </div>
  )
}
