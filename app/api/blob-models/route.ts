import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    console.log("[v0] Total blobs in storage:", blobs.length)

    const specificModels: Record<string, string> = {
      "ohne-rueckwand-blue-75":
        "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-blue_optimized.glb",
    }

    const modelMap: Record<string, string[]> = {
      "40x40x40": [],
      "80x40x40": [],
    }
    const glbFiles: string[] = []

    blobs.forEach((blob) => {
      const pathname = blob.pathname.toLowerCase()

      if (pathname.endsWith(".glb") && !pathname.includes("rahmung")) {
        glbFiles.push(blob.url)

        if (pathname.includes("40x40x40")) {
          modelMap["40x40x40"].push(blob.url)
        } else if (pathname.includes("80x40x40")) {
          modelMap["80x40x40"].push(blob.url)
        }

        console.log("[v0] Found GLB file:", pathname, "URL:", blob.url)
      }
    })

    console.log("[v0] Total GLB files found:", glbFiles.length)
    console.log("[v0] Model map:", {
      "40x40x40": modelMap["40x40x40"].length,
      "80x40x40": modelMap["80x40x40"].length,
    })

    // Return mapped models and all URLs for fallback
    return NextResponse.json({
      models: glbFiles,
      modelMap: modelMap,
      specificModels: specificModels,
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
