import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function getRecoveryEmails() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data, error } = await supabase
    .from("onboarding_sessions")
    .select("*")
    .gt("recovery_emails_sent", 0)
    .order("last_recovery_email", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Erro ao buscar emails de recuperação:", error)
    return []
  }

  return data
}

export async function RecoveryEmailsList() {
  const sessions = await getRecoveryEmails()

  if (!sessions || sessions.length === 0) {
    return <p className="text-center py-4">Nenhum email de recuperação enviado.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Etapa</TableHead>
          <TableHead>Emails Enviados</TableHead>
          <TableHead>Último Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.email || "Não informado"}</TableCell>
            <TableCell>{session.current_step}</TableCell>
            <TableCell>{session.recovery_emails_sent}</TableCell>
            <TableCell>
              {session.last_recovery_email
                ? format(new Date(session.last_recovery_email), "dd/MM/yyyy HH:mm", { locale: ptBR })
                : "-"}
            </TableCell>
            <TableCell>
              {session.completed ? (
                <Badge className="bg-green-500">Recuperado</Badge>
              ) : session.abandoned ? (
                <Badge variant="destructive">Abandonado</Badge>
              ) : (
                <Badge variant="outline">Em andamento</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
