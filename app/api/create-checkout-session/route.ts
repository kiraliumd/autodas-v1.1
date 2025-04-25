import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const { price, successUrl, cancelUrl } = await req.json()
    console.log("Criando sessão de checkout para preço:", price)

    // Criar uma sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Plano Anual Autodas",
              description: "Assinatura anual da plataforma Autodas",
            },
            unit_amount: Math.round(price * 100), // Stripe trabalha com centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        price: price.toString(),
        plan_type: "annual",
      },
    })

    console.log(`Sessão de checkout criada: ${session.id}`)

    // Armazenar a sessão no banco de dados imediatamente
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      const { error } = await supabase.from("stripe_sessions").insert({
        session_id: session.id,
        metadata: {
          price: price.toString(),
          plan_type: "annual",
        },
        status: "pending",
        customer_email: null, // Será atualizado quando o checkout for concluído
      })

      if (error) {
        console.error("Erro ao armazenar sessão do Stripe:", error)
      } else {
        console.log(`Sessão ${session.id} armazenada no banco de dados com status 'pending'`)
      }
    } catch (dbError) {
      console.error("Erro ao acessar o banco de dados:", dbError)
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error)
    return NextResponse.json({ error: "Erro ao criar sessão de checkout" }, { status: 500 })
  }
}
