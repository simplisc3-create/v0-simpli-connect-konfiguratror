"use server"

import { stripe } from "@/lib/stripe"
import { allProducts } from "@/lib/simpli-products"
import { fetchJtlPrices } from "@/lib/jtl-prices"

export interface CheckoutLineInput {
  id: string
  quantity: number
}

// Build a fast SKU -> product lookup from the authoritative catalog.
const productBySku = new Map(allProducts.map((p) => [p.artNr, p]))

/**
 * Starts a Stripe Embedded Checkout session.
 *
 * Security: the client only sends SKU ids and quantities. Prices are resolved
 * SERVER-SIDE from the authoritative product catalog (allProducts), preferring
 * live JTL prices when the bridge is reachable. This prevents any client-side
 * price tampering.
 */
export async function startCheckoutSession(lines: CheckoutLineInput[]) {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("Cart is empty")
  }

  // Pull live JTL prices (fallback-safe — empty map when unavailable).
  const { prices: livePrices } = await fetchJtlPrices()

  const lineItems = lines.map((line) => {
    const product = productBySku.get(line.id)
    if (!product) {
      throw new Error(`Unknown product SKU "${line.id}"`)
    }

    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1))

    // Prefer live JTL price, fall back to the catalog price.
    const livePrice = livePrices[line.id]
    const unitPrice = typeof livePrice === "number" && Number.isFinite(livePrice) ? livePrice : product.price

    const unitAmount = Math.round(unitPrice * 100)

    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: product.name,
          // Stripe requires a non-empty description if provided; keep it to the SKU.
          description: `Art.Nr: ${product.artNr}`,
        },
        unit_amount: unitAmount,
      },
      quantity,
    }
  })

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: lineItems,
    mode: "payment",
  })

  if (!session.client_secret) {
    throw new Error("Failed to create checkout session")
  }

  return session.client_secret
}
