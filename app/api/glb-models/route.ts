import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    // Filter only .glb files
    const glbFiles = blobs
      .filter((blob) => blob.pathname.endsWith(".glb"))
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        filename: blob.pathname.split("/").pop() || "unknown",
        size: blob.size,
      }))

    return NextResponse.json({ files: glbFiles })
  } catch (error) {
    console.error("Error listing GLB files:", error)
    return NextResponse.json({ error: "Failed to list GLB files" }, { status: 500 })
  }
}
