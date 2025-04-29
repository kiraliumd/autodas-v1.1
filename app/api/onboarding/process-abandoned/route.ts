import { NextResponse } from "next/server"
import { OnboardingService } from "@/lib/services/onboarding-service"
import { EmailService } from "@/lib/services/email-service"

export async function POST(req: Request) {
  try {
    // Verify authentication or API key for security
    // This should be a secure endpoint only accessible by cron jobs or admins
    const authHeader = req.headers.get("authorization")
    if (
      !process.env.ONBOARDING_RECOVERY_API_KEY ||
      authHeader !== `Bearer ${process.env.ONBOARDING_RECOVERY_API_KEY}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const onboardingService = new OnboardingService()
    const emailService = new EmailService()

    // Process newly abandoned sessions
    const newlyAbandonedSessions = await onboardingService.processAbandonedSessions()

    // Process sessions needing follow-up emails
    const followupSessions = await onboardingService.findSessionsNeedingFollowupEmails()

    // Combine all sessions needing emails
    const allSessionsNeedingEmails = [
      ...newlyAbandonedSessions.map((session) => ({ ...session, isNew: true })),
      ...followupSessions.map((session) => ({ ...session, isNew: false })),
    ]

    // Send recovery emails
    const results = []

    for (const session of allSessionsNeedingEmails) {
      if (!session.email || !session.recovery_token) continue

      // Determine which email number to send
      const emailNumber = session.recovery_emails_sent + 1

      // Send the email
      const emailId = await emailService.sendRecoveryEmail(
        session.email,
        session.recovery_token,
        session.data,
        emailNumber,
      )

      // Record that we sent an email
      if (emailId) {
        await onboardingService.recordRecoveryEmail(session.id, emailId)

        results.push({
          session_id: session.id,
          email: session.email,
          email_number: emailNumber,
          status: "sent",
          resend_id: emailId,
        })
      } else {
        results.push({
          session_id: session.id,
          email: session.email,
          email_number: emailNumber,
          status: "failed",
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: {
        newly_abandoned: newlyAbandonedSessions.length,
        followup: followupSessions.length,
      },
      results,
    })
  } catch (error) {
    console.error("Error processing abandoned sessions:", error)
    return NextResponse.json({ success: false, error: "Error processing abandoned sessions" }, { status: 500 })
  }
}
