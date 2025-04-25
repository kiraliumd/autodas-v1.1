import { redirect } from "next/navigation"

export default function RegisterPage() {
  // Redireciona para a página de checkout, já que não permitimos cadastros avulsos
  redirect("/checkout")
}
