import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  console.log(`Evento do Stripe recebido: ${event.type}`)

  // Processar eventos do Stripe
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    console.log(`Sessão de checkout completada: ${session.id}`)

    // Verificar se o pagamento foi bem-sucedido
    if (session.payment_status === "paid") {
      try {
        // Usar cookies() de forma não bloqueante
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

        // Verificar se a sessão já existe
        const { data: existingSession } = await supabase
          .from("stripe_sessions")
          .select("session_id")
          .eq("session_id", session.id)
          .single()

        if (existingSession) {
          console.log(`Sessão ${session.id} já existe no banco de dados`)
          return NextResponse.json({ received: true })
        }

        // Armazenar a sessão do Stripe
        const { error: insertError } = await supabase.from("stripe_sessions").insert({
          session_id: session.id,
          metadata: session.metadata || {},
          status: "completed",
          customer_email: session.customer_details?.email || null,
        })

        if (insertError) {
          console.error("Erro ao inserir sessão do Stripe:", insertError)
          throw insertError
        }

        console.log(`Sessão do Stripe ${session.id} armazenada com sucesso`)
      } catch (error) {
        console.error("Erro ao processar webhook do Stripe:", error)
      }
    }
  }

  return NextResponse.json({ received: true })
}
