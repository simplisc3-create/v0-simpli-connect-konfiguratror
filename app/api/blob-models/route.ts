// app/api/blob-models/route.ts
import { NextResponse } from "next/server"
import { resolveGlbUrl } from "@/lib/glb-registry"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const width = Number(searchParams.get("width"))
    const height = Number(searchParams.get("height"))
    const moduleType = searchParams.get("moduleType")
    const color = searchParams.get("color")

    if (!width || !height || !moduleType || !color) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing query params. Required: width, height, moduleType, color",
        },
        { status: 400 },
      )
    }

    const result = resolveGlbUrl({
      width: width as 40 | 80,
      height,
      moduleType: moduleType as any,
      color: color as any,
    })

    return NextResponse.json({
      ok: true,
      url: result.url,
      variantCode: result.variantCode,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Unknown error",
      },
      { status: 500 },
    )
  }
}
