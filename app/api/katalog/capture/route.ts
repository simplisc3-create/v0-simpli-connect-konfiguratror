import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

// Nimmt ein einzelnes gerendertes Bild (PNG-DataURL) entgegen und legt es im Blob ab.
export async function POST(request: NextRequest) {
  try {
    const { jobId, dataUrl } = (await request.json()) as { jobId?: string; dataUrl?: string }

    if (!jobId || !dataUrl) {
      return NextResponse.json({ error: "jobId und dataUrl erforderlich" }, { status: 400 })
    }

    // DataURL -> Buffer
    const base64 = dataUrl.split(",")[1]
    if (!base64) {
      return NextResponse.json({ error: "Ungültige dataUrl" }, { status: 400 })
    }
    const buffer = Buffer.from(base64, "base64")

    const safeId = jobId.replace(/[^a-zA-Z0-9_-]/g, "_")
    const blob = await put(`katalog/renders/${safeId}.png`, buffer, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    })

    return NextResponse.json({ ok: true, url: blob.url })
  } catch (error) {
    console.error("[v0] capture upload error:", error)
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 })
  }
}
