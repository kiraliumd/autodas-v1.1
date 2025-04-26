import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard"]

  // Rotas que não devem ser acessadas se já estiver logado
  const authRoutes = ["/login"]

  // Rotas de onboarding que não precisam de autenticação
  const onboardingRoutes = [
    "/onboarding/step1",
    "/onboarding/step2",
    "/onboarding/step3",
    "/onboarding/complete",
    "/payment-processing",
  ]

  const isProtectedRoute = protectedRoutes.some(
    (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`),
  )

  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname === route)

  const isOnboardingRoute = onboardingRoutes.some((route) => req.nextUrl.pathname === route)

  // Redirecionar para login se tentar acessar rota protegida sem estar logado
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirecionar para dashboard se tentar acessar rota de autenticação já estando logado
  if (isAuthRoute && session) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login"],
}
