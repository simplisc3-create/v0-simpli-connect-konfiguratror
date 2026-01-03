import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    console.log("[v0] Total blobs in storage:", blobs.length)

    const specificModels: Record<string, string> = {
      "ohne-rueckwand-blue-75":
        "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-blue_optimized.glb",
      "abschliessbare-tueren-75": "/images/80x40x40-1-7-white-optimized.glb",
    }

    // Return only the specific models, no model map for random selection
    return NextResponse.json({
      specificModels: specificModels,
      count: Object.keys(specificModels).length,
    })
  } catch (error) {
    console.error("[v0] Error fetching Blob models:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch models",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
