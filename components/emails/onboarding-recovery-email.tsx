import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface OnboardingRecoveryEmailProps {
  userName: string
  recoveryUrl: string
  currentStep: number
  emailNumber: number
}

export const OnboardingRecoveryEmail = ({
  userName,
  recoveryUrl,
  currentStep,
  emailNumber,
}: OnboardingRecoveryEmailProps) => {
  // Determine message based on step and email number
  let mainMessage = "Notamos que você iniciou seu cadastro no Autodas, mas não o finalizou."
  let urgencyLevel = ""

  if (emailNumber === 2) {
    mainMessage = "Gostaríamos de lembrar que você tem um cadastro pendente no Autodas."
    urgencyLevel = "Não perca a oportunidade de automatizar a emissão da sua guia DAS."
  } else if (emailNumber >= 3) {
    mainMessage = "Esta é sua última chance de completar seu cadastro no Autodas."
    urgencyLevel =
      "Sua sessão de pagamento expirará em breve. Complete seu cadastro agora para não perder seu investimento."
  }

  // Determine step description
  let stepDescription = "informações pessoais"
  if (currentStep === 2) {
    stepDescription = "dados de acesso"
  } else if (currentStep === 3) {
    stepDescription = "confirmação final"
  }

  return (
    <Html>
      <Head />
      <Preview>Continue seu cadastro no Autodas de onde você parou</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://autodas.com.br/images/autodas-logo.svg"
            width="120"
            height="32"
            alt="Autodas"
            style={logo}
          />
          <Heading style={heading}>Olá, {userName}!</Heading>
          <Text style={paragraph}>{mainMessage}</Text>

          {urgencyLevel && <Text style={urgencyText}>{urgencyLevel}</Text>}

          <Text style={paragraph}>
            Você parou no passo {currentStep} ({stepDescription}). Não se preocupe, todos os dados que você já preencheu
            foram salvos.
          </Text>

          <Section style={buttonContainer}>
            <Button pX={20} pY={12} style={button} href={recoveryUrl}>
              Continuar meu cadastro
            </Button>
          </Section>

          <Text style={paragraph}>
            Se você tiver alguma dúvida ou precisar de ajuda, responda a este email ou entre em contato com nosso
            suporte em{" "}
            <Link href="mailto:suporte@autodas.com.br" style={link}>
              suporte@autodas.com.br
            </Link>
            .
          </Text>

          <Text style={paragraph}>
            Atenciosamente,
            <br />
            Equipe Autodas
          </Text>

          <Text style={footer}>© {new Date().getFullYear()} Autodas. Todos os direitos reservados.</Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f5f5f5",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#ffffff",
  maxWidth: "600px",
}

const logo = {
  margin: "0 auto 20px",
  display: "block",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  color: "#333",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "20px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const button = {
  backgroundColor: "#FF7F00",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
}

const link = {
  color: "#FF7F00",
  textDecoration: "underline",
}

const urgencyText = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#d23f00",
  fontWeight: "bold",
  marginBottom: "20px",
}

const footer = {
  fontSize: "14px",
  color: "#999",
  marginTop: "40px",
  textAlign: "center" as const,
}
