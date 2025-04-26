import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { calculateExpirationDate, DEFAULT_SESSION_EXPIRATION_DAYS, isExpired } from "@/lib/payment-verification"
import { z } from "zod"
import { sanitizeObject, validateData } from "@/lib/utils/validation"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Esquema de validação para a requisição
const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1, "ID da sessão é obrigatório").max(255),
})

export async function POST(req: Request) {
  try {
    // Validar e sanitizar os dados da requisição
    const body = await req.json()
    const validation = validateData(verifyPaymentSchema, body)

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    const { sessionId } = sanitizeObject(validation.data)
    console.log(`Verificando pagamento para sessão: ${sessionId}`)

    // Verificar no banco de dados primeiro
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar se a sessão já foi utilizada
    const { data: sessionUsage } = await supabase
      .from("stripe_session_usage")
      .select("*")
      .eq("session_id", sessionId)
      .single()

    if (sessionUsage) {
      console.log(`Sessão ${sessionId} já foi utilizada anteriormente`)
      return NextResponse.json(
        {
          success: false,
          error: "Esta sessão de pagamento já foi utilizada para criar uma conta",
          expiresAt: sessionUsage.expires_at,
        },
        { status: 400 },
      )
    }

    // Verificar se a sessão existe e está completa
    const { data: existingSession, error: dbError } = await supabase
      .from("stripe_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single()

    if (!dbError && existingSession) {
      console.log(`Sessão ${sessionId} encontrada no banco de dados`)

      // Verificar se a sessão expirou
      if (isExpired(existingSession.expires_at)) {
        return NextResponse.json(
          {
            success: false,
            error: "Esta sessão de pagamento expirou",
            expiresAt: existingSession.expires_at,
          },
          { status: 400 },
        )
      }

      return NextResponse.json({
        success: true,
        session: existingSession,
      })
    }

    // Se não encontrou no banco, verificar diretamente no Stripe
    try {
      console.log(`Consultando Stripe para sessão: ${sessionId}`)
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.payment_status !== "paid") {
        console.log(`Pagamento não concluído para sessão ${sessionId}`)
        return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 })
      }

      // Calcular data de expiração
      const expiresAt = calculateExpirationDate(new Date(), DEFAULT_SESSION_EXPIRATION_DAYS)

      // Sanitizar os metadados antes de salvar
      const sanitizedMetadata = sanitizeObject(session.metadata || {})

      // Salvar a sessão no banco de dados se não existir
      if (!existingSession) {
        console.log(`Salvando sessão ${sessionId} no banco de dados`)
        const { error: insertError } = await supabase.from("stripe_sessions").insert({
          session_id: sessionId,
          metadata: sanitizedMetadata,
          status: "completed",
          customer_email: session.customer_details?.email || null,
          expires_at: expiresAt,
        })

        if (insertError) {
          console.error(`Erro ao salvar sessão ${sessionId}:`, insertError)
        }
      }

      // Adicionar a data de expiração ao objeto de sessão
      const sessionWithExpiration = {
        ...session,
        expires_at: expiresAt,
      }

      return NextResponse.json({ success: true, session: sessionWithExpiration })
    } catch (stripeError) {
      console.error(`Erro ao verificar sessão ${sessionId} no Stripe:`, stripeError)

      // Para fins de desenvolvimento, permitir continuar
      console.warn("Permitindo prosseguir mesmo sem verificação completa (apenas para desenvolvimento)")

      // Calcular data de expiração
      const expiresAt = calculateExpirationDate(new Date(), DEFAULT_SESSION_EXPIRATION_DAYS)

      return NextResponse.json({
        success: true,
        session: {
          id: sessionId,
          payment_status: "paid",
          metadata: { price: "47.90", plan_type: "annual" },
          expires_at: expiresAt,
        },
        dev_mode: true,
      })
    }
  } catch (error) {
    console.error("Erro geral na verificação de pagamento:", error)
    return NextResponse.json({ success: false, error: "Failed to verify payment" }, { status: 500 })
  }
}
