import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function getAdminUsers() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar administradores:", error)
    return []
  }

  return data
}

export async function AdminUsersList() {
  const admins = await getAdminUsers()

  if (!admins || admins.length === 0) {
    return <p className="text-center py-4">Nenhum administrador encontrado.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Último login</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell className="font-medium">{admin.name}</TableCell>
            <TableCell>{admin.email}</TableCell>
            <TableCell>
              {admin.role === "master" ? (
                <Badge className="bg-purple-500">Master</Badge>
              ) : admin.role === "editor" ? (
                <Badge className="bg-blue-500">Editor</Badge>
              ) : (
                <Badge variant="outline">Visualizador</Badge>
              )}
            </TableCell>
            <TableCell>
              {admin.is_active ? (
                <Badge className="bg-green-500">Ativo</Badge>
              ) : (
                <Badge variant="destructive">Inativo</Badge>
              )}
            </TableCell>
            <TableCell>
              {admin.last_login ? format(new Date(admin.last_login), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Nunca"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
