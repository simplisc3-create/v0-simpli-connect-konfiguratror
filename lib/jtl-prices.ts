import "server-only"

/**
 * Server-side live JTL price sync helper.
 *
 * Reads JTL_API_URL / JTL_API_KEY (with ERP_WEBHOOK_URL / ERP_TOKEN fallbacks),
 * fetches the bridge's /articles endpoint and returns a SKU -> priceNet map.
 *
 * Fallback-safe: if the bridge is not configured or unreachable, it returns
 * ok:false with an empty prices map. Secrets are never returned to callers.
 */

export type JtlPricesResult = {
  ok: boolean
  prices: Record<string, number>
  error?: string
}

export async function fetchJtlPrices(): Promise<JtlPricesResult> {
  const jtlApiUrl = process.env.JTL_API_URL || process.env.ERP_WEBHOOK_URL
  const jtlApiKey = process.env.JTL_API_KEY || process.env.ERP_TOKEN

  const empty: JtlPricesResult = { ok: false, prices: {} }

  if (!jtlApiUrl || !jtlApiKey) {
    return { ...empty, error: "JTL_NOT_CONFIGURED" }
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
      cache: "no-store",
    })
  } catch {
    return { ...empty, error: "JTL_UNREACHABLE" }
  }

  if (!res.ok) {
    return { ...empty, error: `JTL_STATUS_${res.status}` }
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return { ...empty, error: "JTL_INVALID_JSON" }
  }

  const prices: Record<string, number> = {}

  const ingest = (article: any) => {
    if (!article || typeof article !== "object") return
    const sku = article.sku ?? article.SKU ?? article.articleNumber ?? article.artNr ?? article.id
    const priceRaw = article.priceNet ?? article.price_net ?? article.netPrice ?? article.price ?? article.priceNetto
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
      for (const [sku, value] of Object.entries(data as Record<string, unknown>)) {
        const price = typeof value === "string" ? Number.parseFloat(value) : value
        if (typeof price === "number" && Number.isFinite(price)) {
          prices[sku] = price
        }
      }
    }
  }

  return { ok: true, prices }
}
