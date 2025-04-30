import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 })
    }

    // Opcional: validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 })
    }

    // Opcional: validar tamanho do arquivo (limite de 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máximo 4MB)" }, { status: 400 })
    }

    // Gerar um nome de arquivo único baseado no timestamp e nome original
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "-")
    const fileName = `${timestamp}-${originalName}`

    // Fazer upload para o Vercel Blob
    const blob = await put(`uploads/${fileName}`, file, {
      access: "public",
      addRandomSuffix: true, // Adiciona um sufixo aleatório para evitar colisões
    })

    // Retornar a URL da imagem
    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: blob.pathname,
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json({ error: "Erro ao processar o upload" }, { status: 500 })
  }
}
