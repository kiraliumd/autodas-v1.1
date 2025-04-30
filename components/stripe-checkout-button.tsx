"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getStripe } from "@/lib/stripe"

interface StripeCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function StripeCheckoutButton({
  className,
  children = "Assine agora",
  size = "default",
  variant = "default",
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      // Criar sessão de checkout do Stripe
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: 47.9,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/canceled`,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirecionar para o checkout do Stripe
      const stripe = await getStripe()
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (error) {
      console.error("Erro ao processar checkout:", error)
      alert("Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className={className} size={size} variant={variant}>
      {isLoading ? "Processando..." : children}
    </Button>
  )
}
