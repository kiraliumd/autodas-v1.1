import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Política de Privacidade | Autodas",
  description: "Política de Privacidade da plataforma Autodas",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-1 container max-w-[1120px] py-12 mx-auto">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>

        <div className="prose max-w-none">
          <p className="text-sm text-muted-foreground mb-6">Última atualização: 26 de abril de 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
            <p>
              A Autodas (CNPJ: 54.351.803/0001-10) está comprometida em proteger sua privacidade. Esta Política de
              Privacidade explica como coletamos, usamos, divulgamos, transferimos e armazenamos suas informações. Por
              favor, reserve um momento para se familiarizar com nossas práticas de privacidade.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
            <p>Podemos coletar os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Informações que você nos fornece diretamente (nome, e-mail, telefone, CNPJ)</li>
              <li>Informações sobre seu uso da plataforma</li>
              <li>Informações do dispositivo e conexão</li>
              <li>Informações de localização</li>
              <li>Cookies e tecnologias semelhantes</li>
            </ul>
            <p>
              <strong>Pixels de rastreamento e anúncios:</strong> Utilizamos pixels de rastreamento e tecnologias
              similares para medir a eficácia de nossas comunicações, entender como nossos serviços são utilizados e
              personalizar sua experiência. Também exibimos anúncios personalizados com base em seus interesses e
              comportamento de navegação.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Como Usamos Suas Informações</h2>
            <p>Usamos suas informações para:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar transações e enviar notificações relacionadas</li>
              <li>Enviar comunicações de marketing, atualizações e promoções</li>
              <li>Personalizar sua experiência e os anúncios que você vê</li>
              <li>Analisar tendências de uso e melhorar nossos serviços</li>
              <li>Detectar, investigar e prevenir atividades fraudulentas</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
            <p>Podemos compartilhar suas informações com:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Prestadores de serviços que nos ajudam a operar nossa plataforma</li>
              <li>Parceiros de negócios para oferecer produtos ou serviços conjuntos</li>
              <li>Autoridades legais quando exigido por lei</li>
              <li>Terceiros em caso de reorganização empresarial, fusão ou venda</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos e Escolhas</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Acessar, corrigir ou excluir seus dados pessoais</li>
              <li>Retirar seu consentimento a qualquer momento</li>
              <li>Optar por não receber comunicações de marketing</li>
              <li>Solicitar a portabilidade de seus dados</li>
              <li>Apresentar uma reclamação a uma autoridade de proteção de dados</li>
            </ul>
            <p>
              Para exercer esses direitos, entre em contato conosco através do e-mail:{" "}
              <a href="mailto:suporte@autodas.com.br" className="text-primary hover:underline">
                suporte@autodas.com.br
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Segurança de Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso
              não autorizado, perda acidental ou alteração. No entanto, nenhum método de transmissão pela Internet ou
              método de armazenamento eletrônico é 100% seguro.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pelo tempo necessário para fornecer os serviços solicitados, cumprir nossas
              obrigações legais, resolver disputas e fazer cumprir nossos acordos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre
              disponível em nosso site, e notificaremos você sobre quaisquer alterações materiais.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
            <p>Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:</p>
            <p className="mt-2">
              <strong>Autodas</strong>
              <br />
              CNPJ: 54.351.803/0001-10
              <br />
              E-mail:{" "}
              <a href="mailto:suporte@autodas.com.br" className="text-primary hover:underline">
                suporte@autodas.com.br
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
