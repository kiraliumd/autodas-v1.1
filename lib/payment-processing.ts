import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./supabase/database.types"
import { verifyPayment } from "./payment-verification"
import { addYears } from "date-fns"

interface ProcessPaymentResult {
  success: boolean
  error?: string
  userId?: string
}

/**
 * Process payment and create user account in one go
 */
export async function processPaymentAndCreateAccount(sessionId: string): Promise<ProcessPaymentResult> {
  if (!sessionId) {
    return { success: false, error: "ID da sessão não fornecido" }
  }

  try {
    const supabase = createClientComponentClient<Database>()

    // Step 1: Verify the payment
    const verificationResult = await verifyPayment(sessionId)

    if (!verificationResult.success || !verificationResult.verified) {
      return {
        success: false,
        error: verificationResult.error || "Não foi possível verificar o pagamento",
      }
    }

    // Step 2: Generate temporary credentials
    // We'll create a random email and password, then send a password reset link
    const tempEmail = `user_${Date.now()}@temporary.autodas.com.br`
    const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)

    // Step 3: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password: tempPassword,
      options: {
        data: {
          payment_session_id: sessionId,
        },
      },
    })

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Erro ao criar conta de usuário",
      }
    }

    // Step 4: Mark the session as used
    await markSessionAsUsed(sessionId, authData.user.id)

    // Step 5: Create subscription
    const startDate = new Date()
    const endDate = addYears(startDate, 1)

    // Use metadata from verification if available
    const price = verificationResult.metadata?.price || 47.9
    const planType = verificationResult.metadata?.planType || "annual"

    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      user_id: authData.user.id,
      status: "active",
      plan_type: planType,
      price: typeof price === "string" ? Number.parseFloat(price) : price,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      auto_renew: true,
      stripe_session_id: sessionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (subscriptionError) {
      console.error("Erro ao criar assinatura:", subscriptionError)
      // Continue anyway, we can fix this later
    }

    // Step 6: Send password reset email to allow user to set their own password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(tempEmail, {
      redirectTo: `${window.location.origin}/onboarding/complete`,
    })

    if (resetError) {
      console.error("Erro ao enviar email de redefinição:", resetError)
      // Continue anyway, we can handle this later
    }

    // Return success with the user ID
    return {
      success: true,
      userId: authData.user.id,
    }
  } catch (error) {
    console.error("Erro ao processar pagamento e criar conta:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao processar pagamento",
    }
  }
}

/**
 * Mark a session as used
 */
async function markSessionAsUsed(sessionId: string, userId: string): Promise<boolean> {
  if (!sessionId) return false

  try {
    const supabase = createClientComponentClient<Database>()
    const now = new Date()

    // Verificar se a sessão já está marcada como utilizada
    const { data: existingUsage } = await supabase
      .from("stripe_session_usage")
      .select("*")
      .eq("session_id", sessionId)
      .single()

    if (existingUsage) {
      console.log(`Sessão ${sessionId} já foi utilizada anteriormente`)
      return false
    }

    // Marcar a sessão como utilizada
    const { error } = await supabase.from("stripe_session_usage").insert({
      session_id: sessionId,
      user_id: userId,
      used_at: now.toISOString(),
    })

    if (error) {
      console.error("Erro ao marcar sessão como utilizada:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro ao marcar sessão como utilizada:", error)
    return false
  }
}
