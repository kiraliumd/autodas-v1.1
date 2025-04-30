import { ImageUploader } from "@/components/upload/image-uploader"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Upload de Imagens</h1>

      <div className="max-w-md">
        <ImageUploader
          onUploadComplete={(url, fileName) => {
            console.log("Upload concluído:", url, fileName)
          }}
        />

        <div className="mt-4 text-sm text-gray-500">
          <p>Após o upload, a imagem estará disponível publicamente através da URL retornada.</p>
          <p className="mt-2">Você pode usar esta URL em qualquer lugar do seu aplicativo.</p>
        </div>
      </div>
    </div>
  )
}
