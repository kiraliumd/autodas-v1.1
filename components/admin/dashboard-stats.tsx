"use client"

import { useEffect, useState } from "react"
import { Users, CheckCircle, AlertCircle, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type StatsData = {
  totalUsers: number
  completedSessions: number
  abandonedSessions: number
  activeOnboarding: number
  usersTrend: number
  completedTrend: number
  abandonedTrend: number
  activeTrend: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard-stats")

        if (!response.ok) {
          throw new Error("Falha ao carregar estatísticas")
        }

        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted rounded"></div>
              </CardTitle>
              <div className="h-8 w-8 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold h-8 w-16 bg-muted rounded"></div>
              <div className="text-xs text-muted-foreground h-4 w-32 bg-muted rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erro</CardTitle>
          <CardDescription>Não foi possível carregar as estatísticas</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      trend: stats.usersTrend,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Onboarding Completos",
      value: stats.completedSessions,
      trend: stats.completedTrend,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Onboarding Abandonados",
      value: stats.abandonedSessions,
      trend: stats.abandonedTrend,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      title: "Onboarding Ativos",
      value: stats.activeOnboarding,
      trend: stats.activeTrend,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`${card.bgColor} ${card.color} p-2 rounded-full`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {card.trend > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{card.trend}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{Math.abs(card.trend)}%</span>
                </>
              )}
              <span className="ml-1">desde o último mês</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Import Button for error state
import { Button } from "@/components/ui/button"
