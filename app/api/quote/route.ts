import { NextResponse } from "next/server"
import type { ErpPayload } from "@/lib/use-configurator"
import { validatePayloadMinimal } from "@/lib/validate-payload"
import { bomToCsv } from "@/lib/bom-to-csv"
import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

function safeId() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const rand = Math.random().toString(16).slice(2, 8)
  return `${stamp}-${rand}`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ErpPayload

    // 1) Minimal validation
    const errors = validatePayloadMinimal(body)
    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 })
    }

    // 2) Create a request id
    const id = safeId()

    // 3) Build CSV from BOM
    const csv = bomToCsv(
      body.bom.map((l) => ({
        sku: l.sku,
        name: l.name,
        qty: l.qty,
        unit: l.unit,
        category: l.category,
        note: l.note,
      })),
    )

    // 4) Persist JSON + CSV
    // Choose storage dir: explicit override, /tmp on Vercel (read-only FS), else local data dir.
    const baseDir =
      process.env.QUOTE_STORAGE_DIR ||
      (process.env.VERCEL ? path.join("/tmp", "quotes") : path.join(process.cwd(), "data", "quotes"))
    await mkdir(baseDir, { recursive: true })

    const jsonPath = path.join(baseDir, `${id}.json`)
    const csvPath = path.join(baseDir, `${id}.csv`)

    await writeFile(jsonPath, JSON.stringify(body, null, 2), "utf-8")
    await writeFile(csvPath, csv, "utf-8")

    // 5) Forward to the JTL bridge (only when configured)
    // Supports JTL_API_URL/JTL_API_KEY with backwards-compatible ERP_WEBHOOK_URL/ERP_TOKEN fallbacks.
    const jtlApiUrl = process.env.JTL_API_URL || process.env.ERP_WEBHOOK_URL
    const jtlApiKey = process.env.JTL_API_KEY || process.env.ERP_TOKEN

    let jtlForward: unknown = undefined

    if (jtlApiUrl && jtlApiKey) {
      const target = new URL("/orders", jtlApiUrl).toString()

      let res: Response
      try {
        res = await fetch(target, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jtlApiKey}`,
          },
          body: JSON.stringify({ id, payload: body, csv }),
          signal: AbortSignal.timeout(15000),
        })
      } catch (err: any) {
        return NextResponse.json(
          {
            ok: false,
            error: "JTL_FORWARD_FAILED",
            id,
            message: err?.message ?? "Failed to reach JTL bridge",
          },
          { status: 502 },
        )
      }

      // Parse response body (JSON if possible, otherwise raw text).
      const text = await res.text()
      let parsed: unknown = text
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        try {
          parsed = JSON.parse(text)
        } catch {
          parsed = text
        }
      }

      if (!res.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: "JTL_FORWARD_FAILED",
            id,
            status: res.status,
            response: parsed,
          },
          { status: 502 },
        )
      }

      jtlForward = parsed
    }

    // 6) Return success
    return NextResponse.json({
      ok: true,
      id,
      stored: {
        json: jsonPath,
        csv: csvPath,
      },
      summary: {
        widthUI: body.configuration.widthUI,
        widthERP: body.configuration.widthERP,
        height: body.configuration.height,
        sections: body.configuration.sections,
        levels: body.configuration.levels,
        material: body.configuration.material,
        bomLines: body.bom.length,
      },
      ...(jtlForward !== undefined ? { jtlForward } : {}),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "SERVER_ERROR",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 },
    )
  }
}
