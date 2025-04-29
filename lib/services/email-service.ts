import { Resend } from "resend"
import { OnboardingRecoveryEmail } from "@/components/emails/onboarding-recovery-email"
import { renderAsync } from "@react-email/components"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY!)

export class EmailService {
  /**
   * Send a recovery email for an abandoned onboarding session
   */
  async sendRecoveryEmail(
    email: string,
    recoveryToken: string,
    data: any,
    emailNumber: number,
  ): Promise<string | null> {
    try {
      // Get user's name if available
      const userName = data.step1?.fullName?.split(" ")[0] || "there"

      // Determine which step they were on
      const currentStep = data.current_step || 1

      // Create recovery URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.autodas.com.br"
      const recoveryUrl = `${baseUrl}/onboarding/step${currentStep}?recovery_token=${recoveryToken}`

      // Determine subject line based on email number
      let subject = "Complete seu cadastro no Autodas"
      if (emailNumber === 2) {
        subject = "Lembrete: Seu cadastro no Autodas está pendente"
      } else if (emailNumber >= 3) {
        subject = "Última chance: Complete seu cadastro no Autodas"
      }

      // Render the email component to HTML
      const emailHtml = await renderAsync(
        OnboardingRecoveryEmail({
          userName,
          recoveryUrl,
          currentStep,
          emailNumber,
        }),
      )

      // Send the email
      const { data: resendData, error } = await resend.emails.send({
        from: "Autodas <onboarding@autodas.com.br>",
        to: email,
        subject,
        html: emailHtml,
        tags: [
          { name: "type", value: "onboarding_recovery" },
          { name: "email_number", value: emailNumber.toString() },
        ],
      })

      if (error) {
        console.error("Error sending recovery email:", error)
        return null
      }

      return resendData.id
    } catch (error) {
      console.error("Error sending recovery email:", error)
      return null
    }
  }
}
