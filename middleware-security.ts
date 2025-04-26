import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { nanoid } from "nanoid"

// Função para gerar um token CSRF
function generateCSRFToken(): string {
  return nanoid(32)
}

// Função para verificar se a origem da requisição é a mesma do site
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  const host = request.headers.get("host")

  if (!origin || !host) {
    return false
  }

  try {
    const originUrl = new URL(origin)
    return originUrl.host === host
  } catch {
    return false
  }
}

export async function securityMiddleware(req: NextRequest) {
  const res = NextResponse.next()

  // Adicionar cabeçalhos de segurança
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-XSS-Protection", "1; mode=block")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Configurar Content Security Policy (CSP)
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; connect-src 'self' https://*.supabase.co https://api.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-src https://js.stripe.com; object-src 'none';",
  )

  // Verificar CSRF para métodos não seguros (POST, PUT, DELETE, PATCH)
  const unsafeMethods = ["POST", "PUT", "DELETE", "PATCH"]

  if (unsafeMethods.includes(req.method) && !req.nextUrl.pathname.startsWith("/api/webhooks")) {
    // Ignorar verificação CSRF para webhooks

    // Verificar se a origem é a mesma
    if (!isSameOrigin(req)) {
      // Verificar token CSRF
      const csrfToken = req.headers.get("X-CSRF-Token")
      const cookieToken = req.cookies.get("csrf_token")?.value

      if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
        return NextResponse.json({ error: "CSRF token inválido" }, { status: 403 })
      }
    }
  }

  // Para requisições GET, definir um novo token CSRF
  if (req.method === "GET" && req.nextUrl.pathname !== "/_next/static" && !req.nextUrl.pathname.includes(".")) {
    const csrfToken = generateCSRFToken()
    res.cookies.set("csrf_token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })
  }

  return res
}
