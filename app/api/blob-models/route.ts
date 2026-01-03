import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    console.log("[v0] Total blobs in storage:", blobs.length)

    // Create a mapping of model types to their Blob URLs
    const modelMap: Record<string, string> = {}
    const glbFiles: string[] = []

    blobs.forEach((blob) => {
      const pathname = blob.pathname.toLowerCase()

      if (pathname.endsWith(".glb")) {
        glbFiles.push(pathname)
      }

      // Match GLB files and map them to model types based on filename patterns
      if (pathname.includes("40x40x40-2-1") && pathname.endsWith(".glb")) {
        modelMap["ohne-seitenwaende"] = blob.url
        console.log("[v0] Found ohne-seitenwaende:", pathname)
      } else if (pathname.includes("40x40x40-2-2") && pathname.endsWith(".glb")) {
        modelMap["ohne-rueckwand"] = blob.url
        console.log("[v0] Found ohne-rueckwand:", pathname)
      } else if (pathname.includes("40x40x40-2-3") && pathname.endsWith(".glb")) {
        modelMap["mit-rueckwand"] = blob.url
        console.log("[v0] Found mit-rueckwand:", pathname)
      } else if (pathname.includes("40x40x40-2-4") && pathname.endsWith(".glb")) {
        modelMap["mit-tueren"] = blob.url
        console.log("[v0] Found mit-tueren:", pathname)
      } else if (pathname.includes("40x40x40-2-5") && pathname.endsWith(".glb")) {
        modelMap["mit-klapptuer"] = blob.url
        console.log("[v0] Found mit-klapptuer:", pathname)
      } else if (pathname.includes("40x40x40-2-6") && pathname.endsWith(".glb")) {
        modelMap["mit-doppelschublade"] = blob.url
        console.log("[v0] Found mit-doppelschublade:", pathname)
      } else if (pathname.includes("40x40x40-2-7") && pathname.endsWith(".glb")) {
        modelMap["abschliessbare-tueren"] = blob.url
        console.log("[v0] Found abschliessbare-tueren:", pathname)
      }
    })

    console.log("[v0] All GLB files available:", glbFiles)
    console.log("[v0] Model map created:", Object.keys(modelMap))

    return NextResponse.json(modelMap)
  } catch (error) {
    console.error("[v0] Error fetching Blob models:", error)
    return NextResponse.json({ error: "Failed to fetch models", details: String(error) }, { status: 500 })
  }
}
