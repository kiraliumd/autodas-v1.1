"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Check, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  onUploadComplete?: (url: string, fileName: string) => void
  maxSizeMB?: number
  acceptedTypes?: string
  className?: string
}

export function ImageUploader({
  onUploadComplete,
  maxSizeMB = 4,
  acceptedTypes = "image/jpeg, image/png, image/webp, image/gif",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`Arquivo muito grande (máximo ${maxSizeMB}MB)`)
      return
    }

    // Criar preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setUploadError(null)
    setUploadSuccess(false)

    // Preparar upload
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer upload")
      }

      setUploadSuccess(true)

      // Notificar componente pai
      if (onUploadComplete) {
        onUploadComplete(result.url, result.fileName)
      }
    } catch (error) {
      console.error("Erro no upload:", error)
      setUploadError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setPreviewUrl(null)
    setUploadError(null)
    setUploadSuccess(false)
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {!previewUrl ? (
            <div
              onClick={triggerFileInput}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Clique para selecionar uma imagem</p>
              <p className="text-xs text-gray-400 mt-1">
                {`Formatos aceitos: ${acceptedTypes.replace(/image\//g, "").replace(/,/g, ", ")}`}
              </p>
              <p className="text-xs text-gray-400">{`Tamanho máximo: ${maxSizeMB}MB`}</p>
            </div>
          ) : (
            <div className="relative w-full">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-48 object-contain rounded-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={resetUpload}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {uploadError && <div className="mt-2 text-sm text-red-500 text-center">{uploadError}</div>}

          {isUploading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enviando...</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
              <Check className="h-4 w-4" />
              <span>Upload concluído com sucesso!</span>
            </div>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={acceptedTypes} className="hidden" />
        </div>
      </CardContent>
    </Card>
  )
}
