"use client"

import { useState, useEffect, useCallback } from "react"

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      return null
    }

    const token = getCsrfToken()
    setCsrfToken(token)
    setIsLoading(false)
  }, [])

  // Função para fazer requisições com o token CSRF
  const fetchWithCSRF = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!csrfToken) {
        throw new Error("Token CSRF não disponível")
      }

      const headers = new Headers(options.headers || {})
      headers.set("X-CSRF-Token", csrfToken)

      const response = await fetch(url, {
        ...options,
        headers,
      })

      return response
    },
    [csrfToken],
  )

  return { csrfToken, isLoading, fetchWithCSRF }
}
