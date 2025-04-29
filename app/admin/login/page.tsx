import type { Metadata } from "next"
import { AdminLoginForm } from "@/components/admin/admin-login-form"

export const metadata: Metadata = {
  title: "Admin Login | Autodas",
  description: "Faça login na área administrativa do Autodas",
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <AdminLoginForm />
    </div>
  )
}
