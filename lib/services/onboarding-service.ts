import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { nanoid } from "nanoid"
import type { Database } from "../supabase/database.types"
import { addHours, isBefore } from "date-fns"

// Define what constitutes abandonment (e.g., 2 hours of inactivity)
const ABANDONMENT_THRESHOLD_HOURS = 2

// Define the maximum number of recovery emails to send
const MAX_RECOVERY_EMAILS = 3

// Define the delay between recovery emails (in hours)
const RECOVERY_EMAIL_DELAYS = [2, 24, 72] // 2 hours, 1 day, 3 days

export type OnboardingData = {
  step1?: {
    fullName: string
    cnpj: string
  }
  step2?: {
    email: string
    password: string
    whatsapp: string
    securityCode: string
  }
  stripeSessionId?: string
  stripeSessionMetadata?: any
}

export class OnboardingService {
  private supabase = createClientComponentClient<Database>()

  /**
   * Create or update an onboarding session
   */
  async saveSession(data: OnboardingData, step: number): Promise<string> {
    // Extract email if available
    const email = data.step2?.email || null

    // Check if we have an existing session with this Stripe session ID
    let sessionId: string | null = null

    if (data.stripeSessionId) {
      const { data: existingSession } = await this.supabase
        .from("onboarding_sessions")
        .select("id")
        .eq("stripe_session_id", data.stripeSessionId)
        .single()

      if (existingSession) {
        sessionId = existingSession.id
      }
    }

    const now = new Date().toISOString()

    if (sessionId) {
      // Update existing session
      await this.supabase
        .from("onboarding_sessions")
        .update({
          current_step: step,
          data,
          email: email || undefined,
          last_activity: now,
          abandoned: false, // Reset abandoned flag if user returns
        })
        .eq("id", sessionId)

      return sessionId
    } else {
      // Create new session
      const newSessionId = nanoid()
      const recoveryToken = nanoid(32)

      await this.supabase.from("onboarding_sessions").insert({
        id: newSessionId,
        stripe_session_id: data.stripeSessionId || null,
        current_step: step,
        data,
        email,
        last_activity: now,
        created_at: now,
        completed: false,
        abandoned: false,
        recovery_emails_sent: 0,
        recovery_token: recoveryToken,
      })

      return newSessionId
    }
  }

  /**
   * Mark a session as completed
   */
  async completeSession(sessionId: string): Promise<void> {
    await this.supabase
      .from("onboarding_sessions")
      .update({
        completed: true,
        abandoned: false,
        last_activity: new Date().toISOString(),
      })
      .eq("id", sessionId)
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<any> {
    const { data } = await this.supabase.from("onboarding_sessions").select("*").eq("id", sessionId).single()

    return data
  }

  /**
   * Get session by recovery token
   */
  async getSessionByRecoveryToken(token: string): Promise<any> {
    const { data } = await this.supabase.from("onboarding_sessions").select("*").eq("recovery_token", token).single()

    return data
  }

  /**
   * Find abandoned sessions that need recovery emails
   */
  async findAbandonedSessions(): Promise<any[]> {
    const now = new Date()
    const abandonmentThreshold = addHours(now, -ABANDONMENT_THRESHOLD_HOURS)

    // Find sessions that:
    // 1. Are not completed
    // 2. Are not already marked as abandoned
    // 3. Have had no activity for at least ABANDONMENT_THRESHOLD_HOURS
    // 4. Have an email address (so we can send recovery emails)
    const { data } = await this.supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("completed", false)
      .eq("abandoned", false)
      .lt("last_activity", abandonmentThreshold.toISOString())
      .not("email", "is", null)

    return data || []
  }

  /**
   * Mark sessions as abandoned and determine which need recovery emails
   */
  async processAbandonedSessions(): Promise<any[]> {
    const abandonedSessions = await this.findAbandonedSessions()
    const sessionsNeedingEmails = []

    for (const session of abandonedSessions) {
      // Mark as abandoned
      await this.supabase.from("onboarding_sessions").update({ abandoned: true }).eq("id", session.id)

      // Check if we should send a recovery email
      if (session.email && session.recovery_emails_sent < MAX_RECOVERY_EMAILS) {
        sessionsNeedingEmails.push(session)
      }
    }

    return sessionsNeedingEmails
  }

  /**
   * Find sessions that need follow-up recovery emails
   */
  async findSessionsNeedingFollowupEmails(): Promise<any[]> {
    const now = new Date()
    const sessionsNeedingEmails = []

    // Get all abandoned sessions that haven't completed all recovery emails
    const { data: abandonedSessions } = await this.supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("abandoned", true)
      .eq("completed", false)
      .lt("recovery_emails_sent", MAX_RECOVERY_EMAILS)
      .not("email", "is", null)

    if (!abandonedSessions) return []

    for (const session of abandonedSessions) {
      // Skip if no previous email was sent
      if (!session.last_recovery_email) continue

      const lastEmailDate = new Date(session.last_recovery_email)
      const emailIndex = session.recovery_emails_sent - 1

      // If we've sent all emails, skip
      if (emailIndex >= RECOVERY_EMAIL_DELAYS.length - 1) continue

      // Check if it's time for the next email
      const nextEmailDelay = RECOVERY_EMAIL_DELAYS[emailIndex + 1]
      const nextEmailDate = addHours(lastEmailDate, nextEmailDelay)

      if (isBefore(nextEmailDate, now)) {
        sessionsNeedingEmails.push(session)
      }
    }

    return sessionsNeedingEmails
  }

  /**
   * Update session after sending a recovery email
   */
  async recordRecoveryEmail(sessionId: string, emailId: string | null): Promise<void> {
    const now = new Date().toISOString()

    // Get current count
    const { data: session } = await this.supabase
      .from("onboarding_sessions")
      .select("recovery_emails_sent")
      .eq("id", sessionId)
      .single()

    if (!session) return

    // Update session with new count and timestamp
    await this.supabase
      .from("onboarding_sessions")
      .update({
        recovery_emails_sent: session.recovery_emails_sent + 1,
        last_recovery_email: now,
      })
      .eq("id", sessionId)

    // Log the email
    await this.supabase.from("recovery_email_logs").insert({
      onboarding_session_id: sessionId,
      email: session.email,
      sent_at: now,
      email_type: `recovery_${session.recovery_emails_sent + 1}`,
      status: "sent",
      resend_id: emailId,
    })
  }
}
