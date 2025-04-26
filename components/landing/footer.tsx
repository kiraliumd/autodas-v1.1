import { Logo } from "@/components/logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-600">
      <div className="container mx-auto max-w-[1120px] py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-gray-500">
              Automatizando a emissão da guia DAS para MEIs em todo o Brasil.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Produto</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#how-it-works" className="text-sm hover:text-primary transition-colors">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm hover:text-primary transition-colors">
                  Plano
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-sm hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/central-de-ajuda" className="text-sm hover:text-primary transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="text-sm hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="text-sm hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AutoDAS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
