/**
 * Utilitário centralizado para verificação de pagamentos
 */
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./supabase/database.types"
import { addDays } from "date-fns"

// Interface para o resultado da verificação
export interface PaymentVerificationResult {
  success: boolean
  sessionId: string | null
  verified: boolean
  metadata: {
    price?: string | number
    planType?: string
    [key: string]: any
  } | null
  error?: string
  expiresAt?: string | null
}

// Configuração padrão para expiração de sessões (em dias)
export const DEFAULT_SESSION_EXPIRATION_DAYS = 7

/**
 * Calcula a data de expiração para uma sessão
 * @param fromDate Data base para cálculo (padrão: data atual)
 * @param days Número de dias até a expiração (padrão: 7 dias)
 * @returns Data de expiração formatada como string ISO
 */
export function calculateExpirationDate(
  fromDate: Date = new Date(),
  days: number = DEFAULT_SESSION_EXPIRATION_DAYS,
): string {
  return addDays(fromDate, days).toISOString()
}

/**
 * Verifica se uma data de expiração já passou
 * @param expirationDate Data de expiração a verificar
 * @returns true se a data já expirou, false caso contrário
 */
export function isExpired(expirationDate: string | null | undefined): boolean {
  if (!expirationDate) return false

  try {
    const expDate = new Date(expirationDate)
    const now = new Date()
    return expDate < now
  } catch (error) {
    console.error("Erro ao verificar expiração:", error)
    return false
  }
}

/**
 * Verifica se uma sessão é uma sessão de teste do Stripe
 * @param sessionId ID da sessão do Stripe
 * @returns true se for uma sessão de teste, false caso contrário
 */
export function isTestSession(sessionId: string): boolean {
  return sessionId.startsWith("cs_test_")
}

/**
 * Verifica o status de pagamento de uma sessão do Stripe
 * @param sessionId ID da sessão do Stripe
 * @returns Resultado da verificação
 */
export async function verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
  if (!sessionId) {
    return {
      success: false,
      sessionId: null,
      verified: false,
      metadata: null,
      error: "ID da sessão não fornecido",
    }
  }

  try {
    // Verificar se é uma sessão de teste
    const isTest = isTestSession(sessionId)

    // Verificar no banco de dados primeiro
    const supabase = createClientComponentClient<Database>()

    // Verificar se a sessão já foi utilizada
    const { data: sessionUsage, error: usageError } = await supabase
      .from("stripe_session_usage")
      .select("*")
      .eq("session_id", sessionId)
      .single()

    if (sessionUsage) {
      return {
        success: false,
        sessionId,
        verified: false,
        metadata: null,
        error: "Esta sessão de pagamento já foi utilizada para criar uma conta",
        expiresAt: sessionUsage.expires_at,
      }
    }

    // Verificar se a sessão existe no banco de dados
    const { data: existingSession, error: dbError } = await supabase
      .from("stripe_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single()

    // Se encontrou no banco de dados, verificar se não expirou
    if (!dbError && existingSession) {
      // Verificar se a sessão expirou
      if (isExpired(existingSession.expires_at)) {
        return {
          success: false,
          sessionId,
          verified: false,
          metadata: null,
          error: "Esta sessão de pagamento expirou",
          expiresAt: existingSession.expires_at,
        }
      }

      return {
        success: true,
        sessionId,
        verified: true,
        metadata: existingSession.metadata || null,
        expiresAt: existingSession.expires_at,
      }
    }

    // Se não encontrou no banco, verificar via API
    const response = await fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, isTest }),
    })

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        sessionId,
        verified: false,
        metadata: null,
        error: data.error || "Falha na verificação do pagamento",
        expiresAt: data.expiresAt,
      }
    }

    // Verificar se a sessão retornada pela API não expirou
    if (isExpired(data.session?.expires_at)) {
      return {
        success: false,
        sessionId,
        verified: false,
        metadata: null,
        error: "Esta sessão de pagamento expirou",
        expiresAt: data.session?.expires_at,
      }
    }

    // Extrair metadados relevantes
    const metadata = {
      price: data.session?.metadata?.price || "47.90",
      planType: data.session?.metadata?.plan_type || "annual",
    }

    return {
      success: true,
      sessionId,
      verified: true,
      metadata,
      expiresAt: data.session?.expires_at,
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error)
    return {
      success: false,
      sessionId,
      verified: false,
      metadata: null,
      error: error instanceof Error ? error.message : "Erro desconhecido na verificação",
    }
  }
}

/**
 * Marca uma sessão como utilizada para evitar duplicações
 * @param sessionId ID da sessão do Stripe
 * @param userId ID do usuário associado (opcional)
 * @param expirationDays Dias até a expiração (opcional, padrão: 7 dias)
 */
export async function markSessionAsUsed(
  sessionId: string,
  userId?: string,
  expirationDays: number = DEFAULT_SESSION_EXPIRATION_DAYS,
): Promise<boolean> {
  if (!sessionId) return false

  try {
    const supabase = createClientComponentClient<Database>()
    const now = new Date()
    const expiresAt = calculateExpirationDate(now, expirationDays)

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
      user_id: userId || null,
      used_at: now.toISOString(),
      expires_at: expiresAt,
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
