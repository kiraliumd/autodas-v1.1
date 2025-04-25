import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white py-4">
        <div className="container flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 container max-w-md py-12 flex flex-col justify-center">
        <LoginForm />
      </main>
    </div>
  )
}
