import { NextResponse } from "next/server"
import { list } from "@vercel/blob"
import { renderToBuffer } from "@react-pdf/renderer"
import { CatalogDocument } from "@/lib/catalog-pdf"
import { MANIFEST_PATHNAME, type CatalogManifest } from "@/lib/catalog-data"

export const runtime = "nodejs"
export const maxDuration = 120

async function loadManifest(): Promise<CatalogManifest> {
  try {
    const { blobs } = await list({ prefix: MANIFEST_PATHNAME })
    const found = blobs.find((b) => b.pathname === MANIFEST_PATHNAME)
    if (!found) return { generatedAt: "", version: 0, images: {} }
    const res = await fetch(found.url, { cache: "no-store" })
    return (await res.json()) as CatalogManifest
  } catch (e) {
    console.error("[v0] PDF: manifest load failed", e)
    return { generatedAt: "", version: 0, images: {} }
  }
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
