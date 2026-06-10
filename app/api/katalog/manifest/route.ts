import { put, list } from "@vercel/blob"
import { NextResponse } from "next/server"
import { MANIFEST_PATHNAME, type CatalogManifest } from "@/lib/catalog-data"

export const runtime = "nodejs"
export const maxDuration = 60

const RENDERS_PREFIX = "katalog/renders/"

// Manifest direkt aus den abgelegten Render-Blobs ableiten.
// Dadurch ist der Fortschritt selbstheilend: jedes erfolgreich hochgeladene Bild
// zählt, unabhängig davon ob der Browser zwischendurch neu geladen hat.
async function deriveImagesFromBlobs(): Promise<Record<string, string>> {
  const images: Record<string, string> = {}
  let cursor: string | undefined
  do {
    const result = await list({ prefix: RENDERS_PREFIX, cursor, limit: 1000 })
    for (const b of result.blobs) {
      const file = b.pathname.slice(RENDERS_PREFIX.length)
      if (!file.endsWith(".png")) continue
      const jobId = file.slice(0, -4)
      images[jobId] = b.url
    }
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)
  return images
}

// GET: aktuelles Manifest aus dem Blob-Speicher ableiten
export async function GET() {
  try {
    const images = await deriveImagesFromBlobs()
    const manifest: CatalogManifest = {
      generatedAt: new Date().toISOString(),
      version: Date.now(),
      images,
    }
    return NextResponse.json(manifest)
  } catch (error) {
    console.error("[v0] manifest GET error:", error)
    const empty: CatalogManifest = { generatedAt: "", version: 0, images: {} }
    return NextResponse.json(empty)
  }
}

// POST: optionaler Snapshot. Das Manifest wird beim GET ohnehin live aus den
// Render-Blobs abgeleitet, daher genügt es hier, den aktuellen Stand zu bestätigen.
export async function POST() {
  try {
    const images = await deriveImagesFromBlobs()
    const manifest: CatalogManifest = {
      generatedAt: new Date().toISOString(),
      version: Date.now(),
      images,
    }

    const blob = await put(MANIFEST_PATHNAME, JSON.stringify(manifest), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    })

    return NextResponse.json({ ok: true, url: blob.url, count: Object.keys(images).length })
  } catch (error) {
    console.error("[v0] manifest POST error:", error)
    return NextResponse.json({ error: "Speichern fehlgeschlagen" }, { status: 500 })
  }
}
