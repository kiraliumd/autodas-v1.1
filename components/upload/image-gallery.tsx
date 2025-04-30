"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Blob {
  url: string
  pathname: string
  contentType: string
  size: number
  uploadedAt: string
}

interface ImageGalleryProps {
  prefix?: string
  limit?: number
  onDelete?: (pathname: string) => void
  className?: string
}

export function ImageGallery({ prefix = "uploads/", limit = 100, onDelete, className = "" }: ImageGalleryProps) {
  const [blobs, setBlobs] = useState<Blob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlobs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/list-blobs?prefix=${prefix}&limit=${limit}`)

        if (!response.ok) {
          throw new Error("Falha ao carregar imagens")
        }

        const data = await response.json()
        setBlobs(data.blobs)
      } catch (error) {
        console.error("Erro ao carregar blobs:", error)
        setError(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchBlobs()
  }, [prefix, limit])

  const handleDelete = async (pathname: string) => {
    if (!onDelete) return

    try {
      setDeleting(pathname)
      await onDelete(pathname)
      setBlobs(blobs.filter((blob) => blob.pathname !== pathname))
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir o arquivo")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Erro ao carregar imagens: {error}</p>
      </div>
    )
  }

  if (blobs.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>Nenhuma imagem encontrada</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {blobs.map((blob) => (
        <Card key={blob.pathname} className="overflow-hidden">
          <div className="relative aspect-square">
            {blob.contentType.startsWith("image/") ? (
              <img
                src={blob.url || "/placeholder.svg"}
                alt={blob.pathname.split("/").pop() || "Imagem"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-sm text-gray-500 p-2 text-center">{blob.pathname.split("/").pop() || "Arquivo"}</p>
              </div>
            )}

            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                onClick={() => handleDelete(blob.pathname)}
                disabled={deleting === blob.pathname}
              >
                {deleting === blob.pathname ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <CardContent className="p-2">
            <p className="text-xs text-gray-500 truncate">{blob.pathname.split("/").pop()}</p>
            <p className="text-xs text-gray-400">
              {(blob.size / 1024).toFixed(1)} KB • {new Date(blob.uploadedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
