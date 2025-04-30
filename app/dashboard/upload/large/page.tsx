import { LargeFileUploader } from "@/components/upload/large-file-uploader"

export default function LargeUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Upload de Arquivos Grandes</h1>

      <div className="max-w-md">
        <LargeFileUploader
          onUploadComplete={(url, fileName) => {
            console.log("Upload concluído:", url, fileName)
          }}
        />

        <div className="mt-4 text-sm text-gray-500">
          <p>Este uploader suporta arquivos de até 5GB e faz o upload diretamente do navegador para o Vercel Blob.</p>
          <p className="mt-2">
            Ideal para vídeos, PDFs grandes e outros arquivos que excedem o limite de 4MB do servidor.
          </p>
        </div>
      </div>
    </div>
  )
}
