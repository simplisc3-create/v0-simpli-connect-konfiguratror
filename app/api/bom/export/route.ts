import { type NextRequest, NextResponse } from "next/server"
import { generateBOM, validateConfig, type BomConfig } from "@/lib/bom-generator"

export async function POST(request: NextRequest) {
  try {
    const config: BomConfig = await request.json()

    // Validate configuration
    const validation = validateConfig(config)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid configuration",
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      )
    }

    // Generate BOM
    const bom = generateBOM(config)

    // Return BOM with validation warnings
    return NextResponse.json({
      bom,
      config,
      warnings: validation.warnings,
      generated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error generating BOM:", error)
    return NextResponse.json(
      {
        error: "Failed to generate BOM",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Export as CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const configParam = searchParams.get("config")

    if (!configParam) {
      return NextResponse.json({ error: "Missing config parameter" }, { status: 400 })
    }

    const config: BomConfig = JSON.parse(decodeURIComponent(configParam))
    const bom = generateBOM(config)

    // Generate CSV
    const csv = [
      "SKU,Name,Quantity,Unit,Note",
      ...bom.map((line) => `${line.sku},"${line.name}",${line.qty},${line.unit},"${line.note || ""}"`),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="BOM-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting BOM CSV:", error)
    return NextResponse.json(
      {
        error: "Failed to export BOM",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
