import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Users, UserCheck, Clock, AlertTriangle } from "lucide-react"

async function getMetrics() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Total de sessões de onboarding
  const { count: totalSessions } = await supabase
    .from("onboarding_sessions")
    .select("*", { count: "exact", head: true })

  // Sessões completas
  const { count: completedSessions } = await supabase
    .from("onboarding_sessions")
    .select("*", { count: "exact", head: true })
    .eq("completed", true)

  // Sessões abandonadas
  const { count: abandonedSessions } = await supabase
    .from("onboarding_sessions")
    .select("*", { count: "exact", head: true })
    .eq("abandoned", true)

  // Sessões em andamento
  const { count: inProgressSessions } = await supabase
    .from("onboarding_sessions")
    .select("*", { count: "exact", head: true })
    .eq("completed", false)
    .eq("abandoned", false)

  return {
    totalSessions: totalSessions || 0,
    completedSessions: completedSessions || 0,
    abandonedSessions: abandonedSessions || 0,
    inProgressSessions: inProgressSessions || 0,
    completionRate: totalSessions ? Math.round((completedSessions / totalSessions) * 100) : 0,
  }
}

export async function DashboardMetrics() {
  const metrics = await getMetrics()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Cadastros</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalSessions}</div>
          <p className="text-xs text-muted-foreground">Sessões de cadastro iniciadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cadastros Completos</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.completedSessions}</div>
          <p className="text-xs text-muted-foreground">Taxa de conclusão: {metrics.completionRate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.inProgressSessions}</div>
          <p className="text-xs text-muted-foreground">Cadastros não finalizados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abandonados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.abandonedSessions}</div>
          <p className="text-xs text-muted-foreground">Cadastros abandonados</p>
        </CardContent>
      </Card>
    </div>
  )
}
