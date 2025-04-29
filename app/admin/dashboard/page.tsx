import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardMetrics } from "@/components/admin/dashboard-metrics"
import { DashboardSkeleton } from "@/components/admin/dashboard-skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentOnboardingSessions } from "@/components/admin/recent-onboarding-sessions"
import { AdminUsersList } from "@/components/admin/admin-users-list"

export const metadata: Metadata = {
  title: "Dashboard Administrativo | Autodas",
  description: "Painel de controle administrativo do Autodas",
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral e métricas do sistema Autodas</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardMetrics />
      </Suspense>

      <Tabs defaultValue="onboarding">
        <TabsList>
          <TabsTrigger value="onboarding">Cadastros</TabsTrigger>
          <TabsTrigger value="admins">Administradores</TabsTrigger>
        </TabsList>
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessões de Cadastro Recentes</CardTitle>
              <CardDescription>Últimas sessões de cadastro iniciadas na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p>Carregando sessões...</p>}>
                <RecentOnboardingSessions />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Administradores</CardTitle>
              <CardDescription>Gerenciar usuários administrativos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p>Carregando administradores...</p>}>
                <AdminUsersList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
