"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, CreditCard, MessageCircle, ShieldCheck } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Fallback } from "@/components/ui/fallback"
import { useRouter } from "next/navigation"
import { formatWhatsApp, formatCNPJ } from "@/lib/utils/format"

export default function DashboardPage() {
  const { profile, subscription, isLoading, refreshUserData, user } = useAuth()
  const [formattedEndDate, setFormattedEndDate] = useState<string>("")
  const [formattedWhatsApp, setFormattedWhatsApp] = useState<string>("")
  const [formattedCNPJ, setFormattedCNPJ] = useState<string>("")
  const [localLoading, setLocalLoading] = useState(true)
  const router = useRouter()
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Only run this effect once
    if (hasInitializedRef.current) return

    const loadData = async () => {
      try {
        setLocalLoading(true)
        // Only refresh data if we have a user but no profile or subscription
        if (user && (!profile || !subscription)) {
          await refreshUserData()
        }

        // Format subscription end date if available
        if (subscription?.end_date) {
          try {
            const date = new Date(subscription.end_date)
            setFormattedEndDate(format(date, "dd/MM/yyyy", { locale: ptBR }))
          } catch (error) {
            console.error("Erro ao formatar data:", error)
            setFormattedEndDate("Data inválida")
          }
        }

        // Format WhatsApp and CNPJ if available
        if (profile?.whatsapp) {
          setFormattedWhatsApp(formatWhatsApp(profile.whatsapp))
        }

        if (profile?.cnpj) {
          setFormattedCNPJ(formatCNPJ(profile.cnpj))
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLocalLoading(false)
        hasInitializedRef.current = true
      }
    }

    loadData()
  }, [user, profile, subscription]) // Only depend on these values, not on refreshUserData

  // Update formatted values when profile changes
  useEffect(() => {
    if (profile?.whatsapp) {
      setFormattedWhatsApp(formatWhatsApp(profile.whatsapp))
    }

    if (profile?.cnpj) {
      setFormattedCNPJ(formatCNPJ(profile.cnpj))
    }
  }, [profile?.whatsapp, profile?.cnpj])

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

  // Show loading state only briefly, then show content even if some data is missing
  if (localLoading && isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carregando...</h1>
          <p className="text-muted-foreground mt-2">Aguarde enquanto carregamos seus dados.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-lg bg-gray-100 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Fallback
        title="Sessão expirada"
        description="Sua sessão expirou ou você não está autenticado. Por favor, faça login novamente."
        actionText="Ir para login"
        onAction={() => router.push("/login")}
      />
    )
  }

  // If we have a user but no profile, show a different fallback
  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao seu painel de controle do Autodas, {user?.email?.split("@")[0] || "usuário"}.
          </p>
        </div>

        <Fallback
          title="Perfil incompleto"
          description="Não conseguimos carregar seus dados de perfil. Alguns recursos podem estar limitados."
          actionText="Atualizar dados"
          onAction={() => router.push("/dashboard/settings")}
        />

        {/* Still show the cards, but with limited data */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{/* Cards with fallback content */}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao seu painel de controle do Autodas, {profile?.full_name?.split(" ")[0] || "usuário"}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {subscription
                    ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)
                    : "Sem plano"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscription ? `Válido até ${formattedEndDate}` : "Nenhuma assinatura ativa"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  subscription?.status === "active"
                    ? "bg-primary/10 text-primary border-primary"
                    : "bg-gray-100 text-gray-500 border-gray-300"
                }
              >
                {subscription?.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {subscription?.auto_renew && (
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="mr-1 h-4 w-4" />
                Renovação automática ativada
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedWhatsApp || "Não cadastrado"}</div>
            <p className="text-xs text-muted-foreground mt-1">Número cadastrado para receber a Guia DAS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Código de Segurança</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.security_code || "Não definido"}</div>
            <p className="text-xs text-muted-foreground mt-1">Código para verificação de guias recebidas</p>
            <div className="mt-4 flex items-center text-sm text-amber-600">
              <AlertCircle className="mr-1 h-4 w-4" />
              Verifique nas guias recebidas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adicionando um card para o CNPJ */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CNPJ do MEI</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M10 12H4v6h6" />
              <path d="M10 14v2H8" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedCNPJ || "Não cadastrado"}</div>
            <p className="text-xs text-muted-foreground mt-1">CNPJ utilizado para emissão da guia DAS</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
