"use client"

import { useEffect, useState } from "react"

interface CSRFTokenProps {
  onTokenReady?: (token: string) => void
}

export function CSRFToken({ onTokenReady }: CSRFTokenProps) {
  const [token, setToken] = useState<string>("")

  useEffect(() => {
    // Obter o token CSRF do cookie
    const getCsrfToken = () => {
      const cookies = document.cookie.split(";")
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()
        if (cookie.startsWith("csrf_token=")) {
          return cookie.substring("csrf_token=".length, cookie.length)
        }
      }
      return ""
    }

    const csrfToken = getCsrfToken()
    setToken(csrfToken)

    if (onTokenReady && csrfToken) {
      onTokenReady(csrfToken)
    }
  }, [onTokenReady])

  return <input type="hidden" name="csrf_token" value={token} />
}
