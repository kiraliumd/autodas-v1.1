"use client"

import { ImageGallery } from "@/components/upload/image-gallery"
import { ImageUploader } from "@/components/upload/image-uploader"
import { useState } from "react"

export default function GalleryPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDelete = async (pathname: string) => {
    const response = await fetch("/api/delete-blob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pathname }),
    })

    if (!response.ok) {
      throw new Error("Falha ao excluir arquivo")
    }

    return response.json()
  }

  const handleUploadComplete = () => {
    // Forçar atualização da galeria
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Galeria de Imagens</h1>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Adicionar nova imagem</h2>
        <div className="max-w-md">
          <ImageUploader
            onUploadComplete={(url, fileName) => {
              console.log("Upload concluído:", url, fileName)
              handleUploadComplete()
            }}
          />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-medium mb-4">Imagens disponíveis</h2>
      </div>

      <ImageGallery key={refreshKey} prefix="uploads/" onDelete={handleDelete} />
    </div>
  )
}
