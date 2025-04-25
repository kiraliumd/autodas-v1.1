"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { formatWhatsApp, formatCNPJ, cleanFormat } from "@/lib/utils/format"

export function ProfileForm() {
  const { profile, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    full_name: "",
    cnpj: "",
    whatsapp: "",
    security_code: "",
  })
  const [originalData, setOriginalData] = useState({
    full_name: "",
    cnpj: "",
    whatsapp: "",
    security_code: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const initializedRef = useRef(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (profile && !initializedRef.current) {
      const initialData = {
        full_name: profile.full_name || "",
        cnpj: profile.cnpj ? formatCNPJ(profile.cnpj) : "",
        whatsapp: profile.whatsapp ? formatWhatsApp(profile.whatsapp) : "",
        security_code: profile.security_code || "",
      }
      setFormData(initialData)
      setOriginalData(initialData)
      initializedRef.current = true
    }
  }, [profile])

  // Verificar se houve alterações nos dados
  useEffect(() => {
    const changed =
      formData.full_name !== originalData.full_name ||
      formData.cnpj !== originalData.cnpj ||
      formData.whatsapp !== originalData.whatsapp ||
      formData.security_code !== originalData.security_code

    setHasChanges(changed)
  }, [formData, originalData])

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
    setSuccess(null)

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        cnpj: cleanFormat(formData.cnpj),
        whatsapp: cleanFormat(formData.whatsapp),
        security_code: formData.security_code,
      })

      if (error) {
        setError("Erro ao atualizar perfil. Por favor, tente novamente.")
      } else {
        setSuccess("Perfil atualizado com sucesso!")
        // Atualizar os dados originais após salvar com sucesso
        setOriginalData({ ...formData })
        setHasChanges(false)
      }
    } catch (err) {
      setError("Ocorreu um erro ao atualizar seu perfil. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>Atualize suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Seu nome completo"
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="security_code">Código de segurança personalizado</Label>
            <Input
              id="security_code"
              name="security_code"
              value={formData.security_code}
              onChange={handleChange}
              placeholder="Código de 6 dígitos"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
            className={`transition-colors ${hasChanges ? "bg-primary hover:bg-primary/90" : "bg-gray-300 hover:bg-gray-400 text-gray-700"}`}
          >
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
