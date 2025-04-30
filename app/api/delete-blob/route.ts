import { del } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pathname } = await request.json()

    if (!pathname) {
      return NextResponse.json({ error: "Pathname não fornecido" }, { status: 400 })
    }

    await del(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir blob:", error)
    return NextResponse.json({ error: "Erro ao excluir arquivo" }, { status: 500 })
  }
}
