"use client"

import useSWR from "swr"
import { useMemo } from "react"

type JtlPricesResponse = {
  ok: boolean
  prices: Record<string, number>
  error?: string
}

const fetcher = async (url: string): Promise<JtlPricesResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    // Fallback-safe: never throw, just return empty prices.
    return { ok: false, prices: {} }
  }
  return (await res.json()) as JtlPricesResponse
}

/**
 * Fetches live JTL net prices for the given BOM SKUs.
 *
 * The route is fallback-safe and returns an empty map when the JTL bridge is
 * unavailable, so callers can keep using their local fallback prices. The
 * `skus` argument is used only to memoize a stable lookup result; the route
 * returns the full price map.
 */
export function useJtlPrices(skus: string[]) {
  const { data, error, isLoading } = useSWR<JtlPricesResponse>("/api/jtl/prices", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 60_000,
  })

  const prices = data?.ok ? data.prices : {}

  // Stable subset for the requested SKUs (and the full map for convenience).
  const skuKey = skus.join(",")
  const relevantPrices = useMemo(() => {
    if (!prices) return {}
    const subset: Record<string, number> = {}
    for (const sku of skus) {
      if (sku in prices) subset[sku] = prices[sku]
    }
    return subset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuKey, prices])

  return {
    prices,
    relevantPrices,
    isLive: Boolean(data?.ok),
    isLoading,
    error,
  }
}
