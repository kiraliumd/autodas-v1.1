import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get("prefix") || "uploads/"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const blobs = await list({
      prefix,
      limit,
    })

    return NextResponse.json(blobs)
  } catch (error) {
    console.error("Erro ao listar blobs:", error)
    return NextResponse.json({ error: "Erro ao listar arquivos" }, { status: 500 })
  }
}
