import { NextResponse } from "next/server"
import { resolveGlbUrl, type ModuleType, type ColorKey, type WidthKey, COLOR_KEYS } from "@/lib/glb-registry"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cellType = searchParams.get("cellType") as ModuleType | null
    const width = searchParams.get("width")
    const height = searchParams.get("height")
    const color = searchParams.get("color") as ColorKey | null

    if (!cellType || !width || !height || !color) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required parameters",
          required: ["cellType", "width", "height", "color"],
          received: { cellType, width, height, color },
        },
        { status: 400 },
      )
    }

    const widthNum = Number.parseInt(width, 10)
    const heightNum = Number.parseInt(height, 10)

    if (isNaN(widthNum) || isNaN(heightNum)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid width or height - must be numbers",
          received: { width, height },
        },
        { status: 400 },
      )
    }

    // Normalize to standard widths
    const widthKey: WidthKey = widthNum > 50 ? 80 : 40
    // All modules are 40cm tall (standard shelf height)
    const heightKey = 40

    // Validate color
    if (!COLOR_KEYS.includes(color)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid color: "${color}"`,
          validColors: COLOR_KEYS,
        },
        { status: 400 },
      )
    }

    console.log(
      `[v0] API resolving: cellType=${cellType}, width=${widthNum}cm->${widthKey}, height=${heightNum}cm->${heightKey}, color=${color}`,
    )

    const result = resolveGlbUrl({
      width: widthKey,
      height: heightKey,
      moduleType: cellType,
      color: color,
    })

    if (!result.url.startsWith("https://")) {
      console.error("[v0] CRITICAL: resolveGlbUrl returned non-https URL:", result.url)
      return NextResponse.json(
        {
          ok: false,
          error: "CRITICAL: System returned invalid URL (must be https://)",
          url: result.url,
        },
        { status: 500 },
      )
    }

    console.log(`[v0] Resolved GLB URL: ${result.url}`)

    return NextResponse.json({
      ok: true,
      url: result.url,
      filename: result.filename,
      variantCode: result.variantCode,
      inputs: {
        cellType,
        width: widthKey,
        height: heightKey,
        color,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error in blob-models API:", errorMessage)

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to resolve model",
        details: errorMessage,
      },
      { status: 400 },
    )
  }
}
