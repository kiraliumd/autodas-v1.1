"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Check } from "lucide-react"
import { upload } from "@vercel/blob/client"

interface LargeFileUploaderProps {
  onUploadComplete?: (url: string, fileName: string) => void
  maxSizeGB?: number
  acceptedTypes?: string
  className?: string
}

export function LargeFileUploader({
  onUploadComplete,
  maxSizeGB = 5,
  acceptedTypes = "image/jpeg, image/png, image/webp, image/gif, video/mp4, application/pdf",
  className = "",
}: LargeFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (em GB)
    if (file.size > maxSizeGB * 1024 * 1024 * 1024) {
      setUploadError(`Arquivo muito grande (máximo ${maxSizeGB}GB)`)
      return
    }

    // Criar preview para imagens
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    } else {
      setPreviewUrl(null)
    }

    setUploadError(null)
    setUploadSuccess(false)
    setProgress(0)
    setIsUploading(true)

    try {
      // Obter token para upload direto
      const response = await fetch("/api/upload/client-upload")
      const { clientToken } = await response.json()

      if (!clientToken) {
        throw new Error("Não foi possível obter o token de upload")
      }

      // Gerar nome de arquivo único
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "-")
      const fileName = `${timestamp}-${originalName}`

      // Upload direto do cliente para o Vercel Blob
      const blob = await upload(fileName, file, {
        clientToken,
        access: "public",
        handleUploadUrl: "/api/upload/client-upload",
        onProgress: (progress) => {
          setProgress(Math.round(progress.percentage))
        },
        multipart: true, // Para arquivos grandes
      })

      setUploadSuccess(true)

      // Notificar componente pai
      if (onUploadComplete) {
        onUploadComplete(blob.url, blob.pathname)
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
    setProgress(0)
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {!isUploading && !uploadSuccess ? (
            <div
              onClick={triggerFileInput}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Clique para selecionar um arquivo grande</p>
              <p className="text-xs text-gray-400 mt-1">
                {`Formatos aceitos: ${acceptedTypes
                  .replace(/image\//g, "")
                  .replace(/video\//g, "")
                  .replace(/application\//g, "")
                  .replace(/,/g, ", ")}`}
              </p>
              <p className="text-xs text-gray-400">{`Tamanho máximo: ${maxSizeGB}GB`}</p>
            </div>
          ) : (
            <div className="w-full">
              {previewUrl && (
                <div className="relative w-full mb-4">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                </div>
              )}

              {isUploading && (
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-sm text-center text-gray-500">{`${progress}% concluído`}</p>
                </div>
              )}
            </div>
          )}

          {uploadError && <div className="mt-2 text-sm text-red-500 text-center">{uploadError}</div>}

          {uploadSuccess && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
              <Check className="h-4 w-4" />
              <span>Upload concluído com sucesso!</span>
              <Button variant="outline" size="sm" onClick={resetUpload} className="ml-2">
                Novo upload
              </Button>
            </div>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={acceptedTypes} className="hidden" />
        </div>
      </CardContent>
    </Card>
  )
}
