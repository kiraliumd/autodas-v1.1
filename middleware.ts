import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { securityMiddleware } from "./middleware-security"

export async function middleware(req: NextRequest) {
  // Aplicar middleware de segurança primeiro
  const securityResponse = await securityMiddleware(req)

  // Se o middleware de segurança retornar uma resposta diferente de next(),
  // significa que houve um problema de segurança, então retornamos essa resposta
  if (securityResponse.status !== 200) {
    return securityResponse
  }

  // Permitir acesso à rota de bypass sem autenticação
  if (req.nextUrl.pathname === "/admin/bypass" || req.nextUrl.pathname === "/admin-bypass") {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard", "/admin"]

  // Rotas que não devem ser acessadas se já estiver logado
  const authRoutes = ["/login"]

  // Rotas de onboarding que não precisam de autenticação
  const onboardingRoutes = ["/onboarding/step1", "/onboarding/step2", "/onboarding/step3"]

  const isProtectedRoute = protectedRoutes.some(
    (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`),
  )

  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname === route)

  const isOnboardingRoute = onboardingRoutes.some((route) => req.nextUrl.pathname === route)

  // Exceção para a rota de bypass do admin
  if (req.nextUrl.pathname === "/admin/bypass" || req.nextUrl.pathname === "/admin-bypass") {
    return res
  }

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
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/api/:path*", "/admin/:path*", "/admin-bypass"],
}
