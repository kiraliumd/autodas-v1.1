"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface FallbackProps {
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export function Fallback({ title, description, actionText, onAction }: FallbackProps) {
  return (
    <Alert className="bg-amber-50 border-amber-200 text-amber-800">
      <AlertCircle className="h-4 w-4 text-amber-800" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {actionText && onAction && (
        <Button
          variant="outline"
          className="mt-2 bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </Alert>
  )
}
