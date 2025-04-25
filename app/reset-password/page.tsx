import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Logo } from "@/components/logo"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white py-4">
        <div className="container flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 container max-w-md py-12 flex flex-col justify-center">
        <Suspense fallback={<LoadingCard />}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm p-6">
      <div className="space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
