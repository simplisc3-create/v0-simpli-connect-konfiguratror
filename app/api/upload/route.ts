import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const artNr = formData.get("artNr") as string

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 })
    }

    // Create a unique filename with the article number
    const filename = `product-${artNr}-${Date.now()}.${file.type.split("/")[1] || "jpg"}`
    const blob = await put(filename, file, { access: "public" })

    return NextResponse.json({ url: blob.url, artNr }, { status: 200 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 })
  }
}
