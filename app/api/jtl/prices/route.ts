import { NextResponse } from "next/server"
import { fetchJtlPrices } from "@/lib/jtl-prices"

export const runtime = "nodejs"

/**
 * Live JTL price sync.
 *
 * Returns a SKU -> priceNet map fetched from the JTL bridge. Designed to be
 * fallback-safe: if the bridge is not configured or unreachable, it returns
 * ok:false with an empty prices map so the client can keep using its local
 * fallback prices. Secrets are never sent to the client.
 */
export async function GET() {
  const result = await fetchJtlPrices()
  return NextResponse.json(result)
}
