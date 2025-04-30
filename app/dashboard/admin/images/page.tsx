"use client"

import { useState, useEffect } from "react"
import { ImageUploader } from "@/components/upload/image-uploader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"

export default function AdminImagesPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("hero")
  const [uploadedUrl, setUploadedUrl] = useState("")

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/list-blobs")
      const data = await response.json()
      setImages(data.blobs || [])
    } catch (error) {
      console.error("Erro ao buscar imagens:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleDelete = async (url: string) => {
    try {
      await fetch("/api/delete-blob", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })
      fetchImages()
    } catch (error) {
      console.error("Erro ao excluir imagem:", error)
    }
  }

  const handleUploadComplete = (url: string) => {
    setUploadedUrl(url)
    fetchImages()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("URL copiada para a área de transferência!")
      })
      .catch((err) => {
        console.error("Erro ao copiar URL:", err)
      })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Imagens</h1>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upload">Upload de Imagens</TabsTrigger>
          <TabsTrigger value="manage">Gerenciar Imagens</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Nova Imagem</CardTitle>
              <CardDescription>Faça upload de imagens para usar na página inicial</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onUploadComplete={handleUploadComplete} />

              {uploadedUrl && (
                <div className="mt-4 p-4 border rounded-md">
                  <p className="font-medium mb-2">Imagem enviada com sucesso!</p>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="text" value={uploadedUrl} readOnly className="flex-1 p-2 border rounded text-sm" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(uploadedUrl)}>
                      Copiar
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Image
                      src={uploadedUrl || "/placeholder.svg"}
                      alt="Imagem enviada"
                      width={300}
                      height={200}
                      className="rounded-md"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Imagens Disponíveis</CardTitle>
              <CardDescription>Gerencie as imagens que você enviou</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{images.length} imagens encontradas</p>
                <Button variant="outline" size="sm" onClick={fetchImages} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Atualizar
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <Card key={image.url} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <Image src={image.url || "/placeholder.svg"} alt="Imagem" fill className="object-cover" />
                      </div>
                      <CardFooter className="flex justify-between p-3">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(image.url)}>
                          Copiar URL
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(image.url)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                  {images.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">Nenhuma imagem encontrada</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Como usar as imagens na página inicial</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="mb-2">1. Faça upload das imagens que deseja usar</p>
          <p className="mb-2">2. Copie a URL da imagem</p>
          <p className="mb-2">3. Substitua as URLs no código dos componentes:</p>
          <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
            {`// Em components/landing/how-it-works.tsx
const features = [
  {
    // ...
    image: "URL_DA_SUA_IMAGEM_AQUI"
  },
  // ...
]`}
          </pre>
        </div>
      </div>
    </div>
  )
}
