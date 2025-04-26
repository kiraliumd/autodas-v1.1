"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { formatWhatsApp, formatCNPJ, cleanFormat, validateCNPJ } from "@/lib/utils/format"
import { CSRFToken } from "@/components/security/csrf-token"
import { validateData, registerFormSchema, sanitizeObject } from "@/lib/utils/validation"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    cnpj: "",
    email: "",
    password: "",
    whatsapp: "",
    securityCode: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "whatsapp") {
      setFormData((prev) => ({ ...prev, [name]: formatWhatsApp(value) }))
    } else if (name === "cnpj") {
      setFormData((prev) => ({ ...prev, [name]: formatCNPJ(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validar dados do formulário
      const validation = validateData(registerFormSchema, formData)

      if (!validation.success) {
        setError(validation.error || "Dados inválidos. Por favor, verifique e tente novamente.")
        setIsLoading(false)
        return
      }

      // Validar CNPJ
      const cleanedCNPJ = cleanFormat(formData.cnpj)
      if (!validateCNPJ(cleanedCNPJ)) {
        setError("CNPJ inválido. Por favor, verifique e tente novamente.")
        setIsLoading(false)
        return
      }

      // Sanitizar dados
      const sanitizedData = sanitizeObject({
        fullName: formData.fullName,
        email: formData.email,
        cnpj: cleanFormat(formData.cnpj),
        whatsapp: cleanFormat(formData.whatsapp),
        securityCode: formData.securityCode,
      })

      const { error } = await signUp(sanitizedData.email, formData.password, {
        full_name: sanitizedData.fullName,
        cnpj: sanitizedData.cnpj,
        whatsapp: sanitizedData.whatsapp,
        security_code: sanitizedData.securityCode,
      })

      if (error) {
        setError("Erro ao criar conta. Por favor, verifique seus dados e tente novamente.")
      } else {
        router.push("/onboarding/step3")
      }
    } catch (err) {
      setError("Ocorreu um erro ao criar sua conta. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Criar Conta</CardTitle>
        <CardDescription>Preencha seus dados para criar sua conta no Autodas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CSRFToken />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ do MEI</Label>
            <Input
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Crie uma senha segura"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número de WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityCode">Código de segurança personalizado</Label>
            <Input
              id="securityCode"
              name="securityCode"
              value={formData.securityCode}
              onChange={handleChange}
              placeholder="Crie um código de 6 dígitos"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
