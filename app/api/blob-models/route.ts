import { NextResponse } from "next/server"
import { resolveGlbUrl, type ModuleType, type ColorKey, type SizeKey } from "@/lib/glb-registry"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cellType = searchParams.get("cellType") as ModuleType | null
    const width = searchParams.get("width")
    const height = searchParams.get("height")
    const color = searchParams.get("color") as ColorKey | null

    if (cellType && width && height && color) {
      try {
        const widthNum = Number.parseInt(width, 10)

        const size: SizeKey = widthNum >= 80 ? "80x40x40" : "40x40x40"

        console.log(`[v0] API resolving: cellType=${cellType}, width=${widthNum}cm, size=${size}, color=${color}`)

        const result = resolveGlbUrl({
          size,
          moduleType: cellType,
          color: color,
        })

        console.log(`[v0] Resolved GLB URL: ${result.url}`)

        return NextResponse.json({
          url: result.url,
          filename: result.filename,
          variantCode: result.code,
        })
      } catch (error) {
        console.error("[v0] Error resolving GLB URL:", error)
        return NextResponse.json(
          {
            error: "Failed to resolve model",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({
      message: "Use query params: cellType, width, height, color",
    })
  } catch (error) {
    console.error("[v0] Error in blob-models API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch models",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
