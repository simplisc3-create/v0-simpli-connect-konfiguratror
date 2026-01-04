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

    // 4) Persist JSON + CSV (example: local storage under /data/quotes)
    // In production, replace with DB/S3.
    const baseDir = path.join(process.cwd(), "data", "quotes")
    await mkdir(baseDir, { recursive: true })

    const jsonPath = path.join(baseDir, `${id}.json`)
    const csvPath = path.join(baseDir, `${id}.csv`)

    await writeFile(jsonPath, JSON.stringify(body, null, 2), "utf-8")
    await writeFile(csvPath, csv, "utf-8")

    // 5) OPTIONAL: Forward to ERP/Webhook (placeholder)
    // If you have an ERP endpoint, send BOM + meta.
    // Example:
    // await fetch(process.env.ERP_WEBHOOK_URL!, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ERP_TOKEN}` },
    //   body: JSON.stringify({ id, payload: body }),
    // });

    // 6) Return success
    return NextResponse.json({
      ok: true,
      id,
      stored: {
        json: `/data/quotes/${id}.json`,
        csv: `/data/quotes/${id}.csv`,
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
