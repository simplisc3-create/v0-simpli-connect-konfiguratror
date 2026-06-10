import { NextResponse } from "next/server"
import { list } from "@vercel/blob"
import { renderToBuffer } from "@react-pdf/renderer"
import { CatalogDocument } from "@/lib/catalog-pdf"
import { type CatalogManifest } from "@/lib/catalog-data"

export const runtime = "nodejs"
export const maxDuration = 120

const RENDERS_PREFIX = "katalog/renders/"

// Manifest live aus den Render-Blobs ableiten – identisch zur GET /api/katalog/manifest
// Route. Der gespeicherte Snapshot ist oft veraltet (0 Bilder), daher hier nicht nutzen.
async function loadManifest(): Promise<CatalogManifest> {
  const images: Record<string, string> = {}
  try {
    let cursor: string | undefined
    do {
      const result = await list({ prefix: RENDERS_PREFIX, cursor, limit: 1000 })
      for (const b of result.blobs) {
        const file = b.pathname.slice(RENDERS_PREFIX.length)
        if (!file.endsWith(".png")) continue
        images[file.slice(0, -4)] = b.url
      }
      cursor = result.hasMore ? result.cursor : undefined
    } while (cursor)
  } catch (e) {
    console.error("[v0] PDF: manifest load failed", e)
  }
  return { generatedAt: new Date().toISOString(), version: Date.now(), images }
}

// @react-pdf bettet entfernte URLs unzuverlässig ein. Daher alle Renders vorab
// serverseitig laden und als data-URLs in das Manifest schreiben.
async function inlineManifestImages(manifest: CatalogManifest): Promise<CatalogManifest> {
  const entries = Object.entries(manifest.images)
  const inlined: Record<string, string> = {}

  await Promise.all(
    entries.map(async ([key, url]) => {
      if (!url || url.startsWith("data:")) {
        inlined[key] = url
        return
      }
      try {
        const res = await fetch(url, { cache: "no-store" })
        if (!res.ok) {
          console.error("[v0] PDF: image fetch failed", key, res.status)
          return
        }
        const contentType = res.headers.get("content-type") || "image/png"
        const buf = Buffer.from(await res.arrayBuffer())
        inlined[key] = `data:${contentType};base64,${buf.toString("base64")}`
      } catch (e) {
        console.error("[v0] PDF: image inline error", key, e)
      }
    }),
  )

  return { ...manifest, images: inlined }
}

export async function GET() {
  try {
    const manifest = await loadManifest()
    const inlinedManifest = await inlineManifestImages(manifest)
    const inlinedCount = Object.values(inlinedManifest.images).filter((v) => v?.startsWith("data:")).length
    console.log("[v0] PDF: manifest images", Object.keys(manifest.images).length, "inlined data-urls", inlinedCount)
    const buffer = await renderToBuffer(<CatalogDocument manifest={inlinedManifest} />)

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="simpli-connect-kollektion-2026.pdf"',
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[v0] PDF generation error:", error)
    return NextResponse.json({ error: "PDF-Erzeugung fehlgeschlagen" }, { status: 500 })
  }
}
