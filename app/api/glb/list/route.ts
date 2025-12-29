import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    // Filter only GLB files
    const glbFiles = blobs.filter((blob) => blob.pathname.endsWith(".glb"))

    return NextResponse.json({
      success: true,
      files: glbFiles.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
      })),
    })
  } catch (error) {
    console.error("[v0] Error listing GLB files:", error)
    return NextResponse.json({ success: false, error: "Failed to list GLB files" }, { status: 500 })
  }
}
