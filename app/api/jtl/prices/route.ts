import { NextResponse } from "next/server"

export const runtime = "nodejs"

type PricesResponse = {
  ok: boolean
  prices: Record<string, number>
  error?: string
}

/**
 * Live JTL price sync.
 *
 * Reads JTL_API_URL / JTL_API_KEY server-side (with ERP_WEBHOOK_URL / ERP_TOKEN
 * fallbacks), fetches the bridge's /articles endpoint and returns a
 * SKU -> priceNet map. Designed to be fallback-safe: if the bridge is not
 * configured or unreachable, it returns ok:false with an empty prices map so
 * the client can keep using its local fallback prices.
 *
 * Secrets are never sent to the client.
 */
export async function GET() {
  const jtlApiUrl = process.env.JTL_API_URL || process.env.ERP_WEBHOOK_URL
  const jtlApiKey = process.env.JTL_API_KEY || process.env.ERP_TOKEN

  const empty: PricesResponse = { ok: false, prices: {} }

  if (!jtlApiUrl || !jtlApiKey) {
    return NextResponse.json({ ...empty, error: "JTL_NOT_CONFIGURED" })
  }

  let res: Response
  try {
    const target = new URL("/articles", jtlApiUrl).toString()
    res = await fetch(target, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jtlApiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
      // Always pull fresh prices.
      cache: "no-store",
    })
  } catch (err: any) {
    return NextResponse.json({ ...empty, error: "JTL_UNREACHABLE" })
  }

  if (!res.ok) {
    return NextResponse.json({ ...empty, error: `JTL_STATUS_${res.status}` })
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return NextResponse.json({ ...empty, error: "JTL_INVALID_JSON" })
  }

  // Normalize various plausible bridge shapes into a SKU -> priceNet map.
  const prices: Record<string, number> = {}

  const ingest = (article: any) => {
    if (!article || typeof article !== "object") return
    const sku = article.sku ?? article.SKU ?? article.articleNumber ?? article.artNr ?? article.id
    const priceRaw =
      article.priceNet ?? article.price_net ?? article.netPrice ?? article.price ?? article.priceNetto
    if (sku == null) return
    const price = typeof priceRaw === "string" ? Number.parseFloat(priceRaw) : priceRaw
    if (typeof price !== "number" || !Number.isFinite(price)) return
    prices[String(sku)] = price
  }

  if (Array.isArray(data)) {
    for (const article of data) ingest(article)
  } else if (data && typeof data === "object") {
    const arr = (data as any).articles ?? (data as any).items ?? (data as any).data
    if (Array.isArray(arr)) {
      for (const article of arr) ingest(article)
    } else {
      // Possibly already a { sku: price } map.
      for (const [sku, value] of Object.entries(data as Record<string, unknown>)) {
        const price = typeof value === "string" ? Number.parseFloat(value) : value
        if (typeof price === "number" && Number.isFinite(price)) {
          prices[sku] = price
        }
      }
    }
  }

  return NextResponse.json({ ok: true, prices })
}
