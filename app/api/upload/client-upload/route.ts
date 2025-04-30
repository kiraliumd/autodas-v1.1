import { generateClientTokenFromReadWriteToken } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Gerar um token temporário para upload direto do cliente
    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname: "uploads/", // Prefixo para os arquivos
      tokenExpirySeconds: 600, // Token válido por 10 minutos
    })

    return NextResponse.json({ clientToken })
  } catch (error) {
    console.error("Erro ao gerar token:", error)
    return NextResponse.json({ error: "Erro ao gerar token de upload" }, { status: 500 })
  }
}
