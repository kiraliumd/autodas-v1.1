import type { Metadata } from "next"
import RecoveryEmailsPageClient from "./RecoveryEmailsPageClient"

export const metadata: Metadata = {
  title: "Emails de Recuperação | Autodas Admin",
  description: "Gerenciamento de emails de recuperação de cadastros abandonados",
}

export default function RecoveryEmailsPage() {
  return <RecoveryEmailsPageClient />
}
