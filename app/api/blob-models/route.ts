import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list({
      prefix: "40x40x40",
    })

    // Create a mapping of model types to their Blob URLs
    const modelMap: Record<string, string> = {}

    blobs.forEach((blob) => {
      const pathname = blob.pathname.toLowerCase()

      // Match GLB files and map them to model types
      if (pathname.includes("40x40x40-2-1")) modelMap["ohne-seitenwaende"] = blob.url
      else if (pathname.includes("40x40x40-2-2")) modelMap["ohne-rueckwand"] = blob.url
      else if (pathname.includes("40x40x40-2-3")) modelMap["mit-rueckwand"] = blob.url
      else if (pathname.includes("40x40x40-2-4")) modelMap["mit-tueren"] = blob.url
      else if (pathname.includes("40x40x40-2-5")) modelMap["mit-klapptuer"] = blob.url
      else if (pathname.includes("40x40x40-2-6")) modelMap["mit-doppelschublade"] = blob.url
      else if (pathname.includes("40x40x40-2-7")) modelMap["abschliessbare-tueren"] = blob.url
    })

    return NextResponse.json(modelMap)
  } catch (error) {
    console.error("[v0] Error fetching Blob models:", error)
    return NextResponse.json({}, { status: 500 })
  }
}
