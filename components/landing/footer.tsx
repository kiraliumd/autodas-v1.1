import { Logo } from "@/components/logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-600">
      <div className="container mx-auto max-w-[1120px] py-8 md:py-12 px-4 sm:px-6">
        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500">
              Automatizando a emissão da guia DAS para MEIs em todo o Brasil.
            </p>
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3 md:mb-4">
              Produto
            </h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link href="#how-it-works" className="text-xs md:text-sm hover:text-primary transition-colors">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-xs md:text-sm hover:text-primary transition-colors">
                  Plano
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-xs md:text-sm hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3 md:mb-4">
              Suporte
            </h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link href="/central-de-ajuda" className="text-xs md:text-sm hover:text-primary transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="text-xs md:text-sm hover:text-primary transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="text-xs md:text-sm hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 text-center text-xs md:text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AutoDAS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
