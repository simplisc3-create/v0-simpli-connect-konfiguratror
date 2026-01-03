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
        glbFiles.push(blob.url)
        console.log("[v0] Found GLB file:", pathname, "URL:", blob.url)
      }
    })

    console.log("[v0] Total GLB files found:", glbFiles.length)
    console.log("[v0] GLB URLs:", glbFiles)

    // Return all GLB file URLs as an array
    return NextResponse.json({
      models: glbFiles,
      count: glbFiles.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching Blob models:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Failed to fetch models",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
