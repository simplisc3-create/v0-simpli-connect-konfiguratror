import { put, list } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { MANIFEST_PATHNAME, type CatalogManifest } from "@/lib/catalog-data"

export const runtime = "nodejs"
export const maxDuration = 60

// GET: aktuelles Manifest laden (oder leeres zurückgeben)
export async function GET() {
  try {
    const { blobs } = await list({ prefix: MANIFEST_PATHNAME })
    const found = blobs.find((b) => b.pathname === MANIFEST_PATHNAME)
    if (!found) {
      const empty: CatalogManifest = { generatedAt: "", version: 0, images: {} }
      return NextResponse.json(empty)
    }
    const res = await fetch(found.url, { cache: "no-store" })
    const manifest = (await res.json()) as CatalogManifest
    return NextResponse.json(manifest)
  } catch (error) {
    console.error("[v0] manifest GET error:", error)
    const empty: CatalogManifest = { generatedAt: "", version: 0, images: {} }
    return NextResponse.json(empty)
  }
}

// POST: komplettes Manifest (jobId -> url) speichern
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { images: Record<string, string> }
    if (!body?.images) {
      return NextResponse.json({ error: "images erforderlich" }, { status: 400 })
    }

    const manifest: CatalogManifest = {
      generatedAt: new Date().toISOString(),
      version: Date.now(),
      images: body.images,
    }

    const blob = await put(MANIFEST_PATHNAME, JSON.stringify(manifest), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    })

    return NextResponse.json({ ok: true, url: blob.url, count: Object.keys(body.images).length })
  } catch (error) {
    console.error("[v0] manifest POST error:", error)
    return NextResponse.json({ error: "Speichern fehlgeschlagen" }, { status: 500 })
  }
}
