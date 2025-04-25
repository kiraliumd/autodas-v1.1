"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function SubscriptionManager() {
  const { subscription, user, refreshUserData } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [autoRenew, setAutoRenew] = useState(subscription?.auto_renew || true)
  const supabase = getSupabaseClient()
  const [formattedEndDate, setFormattedEndDate] = useState<string>("")
  const initializedRef = useRef(false)

  useEffect(() => {
    // Only update state when subscription changes and we haven't initialized yet
    if (subscription && !initializedRef.current) {
      setAutoRenew(subscription.auto_renew)
      initializedRef.current = true

      try {
        const date = new Date(subscription.end_date)
        setFormattedEndDate(format(date, "dd/MM/yyyy", { locale: ptBR }))
      } catch (error) {
        console.error("Erro ao formatar data:", error)
        setFormattedEndDate("Data inválida")
      }
    }
  }, [subscription])

  // Update formatted date when subscription changes
  useEffect(() => {
    if (subscription?.end_date) {
      try {
        const date = new Date(subscription.end_date)
        setFormattedEndDate(format(date, "dd/MM/yyyy", { locale: ptBR }))
      } catch (error) {
        console.error("Erro ao formatar data:", error)
        setFormattedEndDate("Data inválida")
      }
    }
  }, [subscription?.end_date])

  const handleAutoRenewToggle = async () => {
    if (!user || !subscription) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ auto_renew: !autoRenew })
        .eq("id", subscription.id)

      if (!error) {
        setAutoRenew(!autoRenew)
        // Update the subscription data
        await refreshUserData()
      }
    } catch (error) {
      console.error("Erro ao atualizar renovação automática:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return

    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso ao final do período atual.")) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          auto_renew: false,
        })
        .eq("id", subscription.id)

      if (!error) {
        await refreshUserData()
      }
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSubscription = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Redirect to checkout page
      window.location.href = "/checkout"
    } catch (error) {
      console.error("Erro ao criar assinatura:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Você ainda não possui uma assinatura ativa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Plano Anual</h3>
                <p className="text-sm text-muted-foreground">Acesso a todos os recursos</p>
              </div>
              <div className="text-right">
                <p className="font-medium">R$ 47,90</p>
                <p className="text-sm text-muted-foreground">/ano</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createSubscription} disabled={isLoading}>
            {isLoading ? "Processando..." : "Assinar agora"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>Gerencie sua assinatura atual</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              subscription.status === "active"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }
          >
            {subscription.status === "active" ? "Ativa" : "Cancelada"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">
                {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subscription.status === "active" ? `Válido até ${formattedEndDate}` : "Acesso até o final do período"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">R$ {subscription.price.toFixed(2).replace(".", ",")}</p>
              <p className="text-sm text-muted-foreground">/ano</p>
            </div>
          </div>
        </div>

        {subscription.status === "active" && (
          <div className="flex items-center space-x-2">
            <Switch id="auto-renew" checked={autoRenew} onCheckedChange={handleAutoRenewToggle} disabled={isLoading} />
            <Label htmlFor="auto-renew">Renovação automática</Label>
          </div>
        )}

        {subscription.status === "active" && autoRenew && (
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="mr-1 h-4 w-4" />
            Sua assinatura será renovada automaticamente em {formattedEndDate}
          </div>
        )}

        {subscription.status === "canceled" && (
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-800" />
            <AlertTitle>Assinatura cancelada</AlertTitle>
            <AlertDescription>Sua assinatura foi cancelada e você terá acesso até {formattedEndDate}.</AlertDescription>
          </Alert>
        )}

        {subscription.stripe_session_id && (
          <div className="text-sm text-muted-foreground">
            ID da transação: {subscription.stripe_session_id.substring(0, 8)}...
          </div>
        )}
      </CardContent>
      {subscription.status === "active" && (
        <CardFooter>
          <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
            {isLoading ? "Processando..." : "Cancelar assinatura"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
