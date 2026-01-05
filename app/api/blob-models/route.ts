import { NextResponse } from "next/server"
import {
  resolveGlbUrl,
  LEGACY_URLS,
  GLB_BASE_URL,
  type ModuleType,
  type ColorKey,
  type SizeKey,
} from "@/lib/glb-registry"

// Cache for URL verification results
const urlVerificationCache = new Map<string, boolean>()

async function verifyUrl(url: string): Promise<boolean> {
  if (urlVerificationCache.has(url)) {
    return urlVerificationCache.get(url)!
  }

  try {
    const response = await fetch(url, { method: "HEAD" })
    const exists = response.ok
    urlVerificationCache.set(url, exists)
    return exists
  } catch {
    urlVerificationCache.set(url, false)
    return false
  }
}

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
        const family = size === "40x40x40" ? "40" : "80"

        console.log(`[v0] API resolving: cellType=${cellType}, width=${widthNum}cm, size=${size}, color=${color}`)

        const result = resolveGlbUrl({
          size,
          moduleType: cellType,
          color: color,
        })

        if (result.isLegacy) {
          console.log(`[v0] Using legacy URL: ${result.url}`)
          return NextResponse.json({
            url: result.url,
            filename: result.filename,
            variantCode: result.code,
            isLegacy: true,
          })
        }

        const newUrlExists = await verifyUrl(result.url)

        if (newUrlExists) {
          console.log(`[v0] Resolved GLB URL (verified): ${result.url}`)
          return NextResponse.json({
            url: result.url,
            filename: result.filename,
            variantCode: result.code,
          })
        }

        const legacyKey = `${cellType}-${color}-${family}`
        if (LEGACY_URLS[legacyKey]) {
          const legacyUrl = LEGACY_URLS[legacyKey]
          console.log(`[v0] New URL not found, using legacy: ${legacyUrl}`)
          return NextResponse.json({
            url: legacyUrl,
            filename: `${cellType}-${color}${family}.glb`,
            variantCode: "legacy",
            isLegacy: true,
          })
        }

        if (cellType === "ohne-seitenwaende" && LEGACY_URLS[`frame80-${color}`]) {
          const fallbackUrl = LEGACY_URLS[`frame80-${color}`]
          console.log(`[v0] Using frame80 fallback: ${fallbackUrl}`)
          return NextResponse.json({
            url: fallbackUrl,
            filename: "frame80.glb",
            variantCode: "legacy",
            isLegacy: true,
          })
        }

        const finalFallback = `${GLB_BASE_URL}/ohne-rueckwand-orange80.glb`
        const finalFallbackExists = await verifyUrl(finalFallback)

        if (finalFallbackExists) {
          console.log(`[v0] Using final fallback: ${finalFallback}`)
          return NextResponse.json({
            url: finalFallback,
            filename: "ohne-rueckwand-orange80.glb",
            variantCode: "fallback",
            isLegacy: true,
            warning: `Model not found for ${cellType}/${color}, using fallback`,
          })
        }

        console.warn(`[v0] No verified URL found, returning unverified: ${result.url}`)
        return NextResponse.json({
          url: result.url,
          filename: result.filename,
          variantCode: result.code,
          unverified: true,
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
