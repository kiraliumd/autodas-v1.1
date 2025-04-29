import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function getRecentSessions() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data, error } = await supabase
    .from("onboarding_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Erro ao buscar sessões:", error)
    return []
  }

  return data
}

export async function RecentOnboardingSessions() {
  const sessions = await getRecentSessions()

  if (!sessions || sessions.length === 0) {
    return <p className="text-center py-4">Nenhuma sessão de cadastro encontrada.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Etapa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Última atividade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.email || "Não informado"}</TableCell>
            <TableCell>{session.current_step}</TableCell>
            <TableCell>
              {session.completed ? (
                <Badge className="bg-green-500">Completo</Badge>
              ) : session.abandoned ? (
                <Badge variant="destructive">Abandonado</Badge>
              ) : (
                <Badge variant="outline">Em andamento</Badge>
              )}
            </TableCell>
            <TableCell>
              {session.created_at ? format(new Date(session.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
            </TableCell>
            <TableCell>
              {session.last_activity
                ? format(new Date(session.last_activity), "dd/MM/yyyy HH:mm", { locale: ptBR })
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
