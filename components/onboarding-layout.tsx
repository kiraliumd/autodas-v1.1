import { Logo } from "@/components/logo"
import type { ReactNode } from "react"

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
}

export function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white py-4">
        <div className="container flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 container max-w-2xl py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight">Configuração da sua conta</h1>
            <span className="text-sm text-muted-foreground">
              Etapa {currentStep} de {totalSteps}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
