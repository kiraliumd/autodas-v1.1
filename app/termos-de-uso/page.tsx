import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Termos de Uso | Autodas",
  description: "Termos de Uso da plataforma Autodas",
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-1 container max-w-[1120px] py-12 mx-auto">
        <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>

        <div className="prose max-w-none">
          <p className="text-sm text-muted-foreground mb-6">Última atualização: 26 de abril de 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou usar a plataforma Autodas, você concorda em cumprir e estar vinculado a estes Termos de Uso.
              Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar nossos serviços.
            </p>
            <p className="mt-2">
              A Autodas (CNPJ: 54.351.803/0001-10) reserva-se o direito de modificar estes termos a qualquer momento. As
              alterações entrarão em vigor imediatamente após a publicação dos termos atualizados. Seu uso continuado da
              plataforma após tais alterações constitui sua aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p>
              A Autodas é uma plataforma SaaS (Software as a Service) projetada para auxiliar Microempreendedores
              Individuais (MEI) na gestão de seus negócios. Nossos serviços incluem, mas não se limitam a, gerenciamento
              financeiro, emissão de notas fiscais, controle de clientes e fornecedores, e outras ferramentas de gestão
              empresarial.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Conta de Usuário</h2>
            <p>
              Para acessar determinados recursos da plataforma, você precisará criar uma conta. Você é responsável por
              manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorrem em sua
              conta. Você concorda em:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Fornecer informações precisas, atuais e completas durante o processo de registro</li>
              <li>Manter e atualizar prontamente suas informações</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
              <li>Garantir que você saia de sua conta ao final de cada sessão</li>
            </ul>
            <p>
              Reservamo-nos o direito de suspender ou encerrar sua conta se qualquer informação fornecida for imprecisa,
              falsa ou desatualizada, ou se você violar estes Termos de Uso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Pagamentos e Assinaturas</h2>
            <p>
              Alguns de nossos serviços são oferecidos mediante pagamento. Ao assinar um plano pago, você concorda em:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Pagar todas as taxas aplicáveis no prazo</li>
              <li>Fornecer informações de pagamento precisas e completas</li>
              <li>Autorizar-nos a cobrar o método de pagamento fornecido</li>
              <li>Manter suas informações de pagamento atualizadas</li>
            </ul>
            <p>
              As assinaturas são renovadas automaticamente, a menos que você cancele antes do próximo ciclo de
              faturamento. Os preços estão sujeitos a alterações, mas notificaremos você com antecedência sobre qualquer
              mudança.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Anúncios e Conteúdo Promocional</h2>
            <p>
              Nossa plataforma pode exibir anúncios e conteúdo promocional. Ao usar nossos serviços, você concorda em
              receber tais materiais. Utilizamos tecnologias de rastreamento, incluindo pixels, para personalizar
              anúncios e medir sua eficácia.
            </p>
            <p className="mt-2">
              Você pode optar por não receber comunicações de marketing seguindo as instruções de cancelamento de
              inscrição incluídas em nossas mensagens ou entrando em contato conosco diretamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, recursos e funcionalidades disponíveis na plataforma Autodas, incluindo, mas não se
              limitando a, textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e
              compilações de dados, são propriedade da Autodas ou de seus licenciadores e são protegidos por leis de
              direitos autorais, marcas registradas e outras leis de propriedade intelectual.
            </p>
            <p className="mt-2">
              Você não pode reproduzir, distribuir, modificar, criar trabalhos derivados, exibir publicamente, executar
              publicamente, republicar, baixar, armazenar ou transmitir qualquer material de nossa plataforma, exceto
              conforme permitido por estes Termos de Uso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              Em nenhuma circunstância a Autodas, seus diretores, funcionários, parceiros, agentes, fornecedores ou
              afiliados serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou
              punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas
              intangíveis, resultantes de:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Seu acesso ou uso ou incapacidade de acessar ou usar a plataforma</li>
              <li>Qualquer conduta ou conteúdo de terceiros na plataforma</li>
              <li>Conteúdo obtido da plataforma</li>
              <li>Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Lei Aplicável</h2>
            <p>
              Estes Termos de Uso serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas
              disposições de conflito de leis. Qualquer ação legal decorrente ou relacionada a estes termos será
              submetida exclusivamente aos tribunais competentes localizados no Brasil.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
            <p>Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:</p>
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
