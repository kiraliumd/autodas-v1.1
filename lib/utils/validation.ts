import { z } from "zod"
import DOMPurify from "dompurify"

/**
 * Sanitiza uma string para prevenir ataques XSS
 * @param input String a ser sanitizada
 * @returns String sanitizada
 */
export function sanitizeString(input: string): string {
  if (typeof window === "undefined") {
    // No servidor, usamos uma abordagem simples de sanitização
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
  } else {
    // No cliente, usamos DOMPurify
    return DOMPurify.sanitize(input, { USE_PROFILES: { html: false } })
  }
}

/**
 * Sanitiza um objeto recursivamente
 * @param obj Objeto a ser sanitizado
 * @returns Objeto sanitizado
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      if (typeof value === "string") {
        result[key] = sanitizeString(value)
      } else if (typeof value === "object" && value !== null) {
        result[key] = sanitizeObject(value)
      } else {
        result[key] = value
      }
    }
  }

  return result as T
}

// Esquemas Zod para validação

export const emailSchema = z
  .string()
  .email("Email inválido")
  .min(5, "Email deve ter pelo menos 5 caracteres")
  .max(255, "Email não pode ter mais de 255 caracteres")

export const passwordSchema = z
  .string()
  .min(6, "Senha deve ter pelo menos 6 caracteres")
  .max(100, "Senha não pode ter mais de 100 caracteres")

export const nameSchema = z
  .string()
  .min(3, "Nome deve ter pelo menos 3 caracteres")
  .max(100, "Nome não pode ter mais de 100 caracteres")
  .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/, "Nome deve conter apenas letras e espaços")

export const cnpjSchema = z
  .string()
  .min(14, "CNPJ deve ter 14 dígitos")
  .max(14, "CNPJ deve ter 14 dígitos")
  .regex(/^\d+$/, "CNPJ deve conter apenas números")

export const whatsappSchema = z
  .string()
  .min(10, "WhatsApp deve ter pelo menos 10 dígitos")
  .max(11, "WhatsApp não pode ter mais de 11 dígitos")
  .regex(/^\d+$/, "WhatsApp deve conter apenas números")

export const securityCodeSchema = z
  .string()
  .min(6, "Código de segurança deve ter pelo menos 6 caracteres")
  .max(10, "Código de segurança não pode ter mais de 10 caracteres")
  .regex(/^[a-zA-Z0-9]+$/, "Código de segurança deve conter apenas letras e números")

// Esquemas para validação de formulários

export const profileFormSchema = z.object({
  full_name: nameSchema,
  cnpj: cnpjSchema,
  whatsapp: whatsappSchema,
  security_code: securityCodeSchema,
})

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerFormSchema = z.object({
  fullName: nameSchema,
  cnpj: cnpjSchema,
  email: emailSchema,
  password: passwordSchema,
  whatsapp: whatsappSchema,
  securityCode: securityCodeSchema,
})

export const resetPasswordFormSchema = z.object({
  email: emailSchema,
})

export const confirmResetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

/**
 * Valida dados usando um esquema Zod
 * @param schema Esquema Zod para validação
 * @param data Dados a serem validados
 * @returns Resultado da validação
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erro de validação desconhecido" }
  }
}
