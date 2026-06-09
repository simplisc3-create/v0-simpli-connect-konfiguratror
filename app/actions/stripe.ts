"use server"

import { stripe } from "@/lib/stripe"
import { allProducts } from "@/lib/simpli-products"
import { fetchJtlPrices } from "@/lib/jtl-prices"

export interface CheckoutLineInput {
  id: string
  quantity: number
  /** Display name for configurator-derived lines that aren't plain catalog SKUs. */
  name?: string
  /** Client-computed unit price (BOM price). Used only as a fallback when the
   * SKU is not in the authoritative catalog or live JTL prices. */
  price?: number
}

// Build a fast SKU -> product lookup from the authoritative catalog.
const productBySku = new Map(allProducts.map((p) => [p.artNr, p]))

/**
 * Starts a Stripe Embedded Checkout session.
 *
 * Security: the client sends SKU ids, quantities, and (as a fallback only) a
 * display name + BOM price. When a SKU exists in the authoritative catalog,
 * the price is resolved SERVER-SIDE — preferring live JTL prices, then the
 * catalog price — and the client price is ignored, preventing tampering on
 * real catalog products. Configurator-derived lines (custom shelf modules that
 * are not plain catalog SKUs) fall back to the client-computed BOM price so
 * checkout never breaks on a valid configuration.
 */
export async function startCheckoutSession(lines: CheckoutLineInput[]) {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("Cart is empty")
  }

  // Pull live JTL prices (fallback-safe — empty map when unavailable).
  const { prices: livePrices } = await fetchJtlPrices()

  const lineItems = lines.map((line) => {
    const product = productBySku.get(line.id)
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1))

    // Resolve the unit price with this priority:
    //   1. Live JTL price for the SKU (authoritative, real-time)
    //   2. Catalog price for the SKU (authoritative)
    //   3. Client-supplied BOM price (for configurator-derived custom lines)
    const livePrice = livePrices[line.id]
    let unitPrice: number | undefined
    if (typeof livePrice === "number" && Number.isFinite(livePrice)) {
      unitPrice = livePrice
    } else if (product) {
      unitPrice = product.price
    } else if (typeof line.price === "number" && Number.isFinite(line.price) && line.price >= 0) {
      unitPrice = line.price
    }

    if (typeof unitPrice !== "number" || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error(`No valid price for line "${line.id}"`)
    }

    const name = product?.name ?? line.name ?? line.id
    const artNr = product?.artNr ?? line.id
    const unitAmount = Math.round(unitPrice * 100)

    return {
      price_data: {
        currency: "eur",
        product_data: {
          name,
          // Stripe requires a non-empty description if provided; keep it to the SKU.
          description: `Art.Nr: ${artNr}`,
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
    // Stripe collects the email in the embedded form. Generating an invoice makes
    // Stripe email the customer a confirmation / receipt automatically — no
    // external email provider required.
    invoice_creation: { enabled: true },
  })

  if (!session.client_secret) {
    throw new Error("Failed to create checkout session")
  }

  return { clientSecret: session.client_secret, sessionId: session.id }
}

export interface OrderSummary {
  orderNumber: string
  paymentStatus: string
  email: string | null
  currency: string
  amountTotal: number
  items: { name: string; description: string | null; quantity: number; amountTotal: number }[]
}

/**
 * Retrieves a completed checkout session and returns a customer-friendly order
 * summary for the confirmation page. Reads pricing from Stripe (the source of
 * truth for what was actually charged), not from the client.
 */
export async function getOrderSummary(sessionId: string): Promise<OrderSummary | null> {
  if (!sessionId) return null

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  })

  if (!session) return null

  const items =
    session.line_items?.data.map((li) => ({
      name: li.description ?? "Artikel",
      description: null,
      quantity: li.quantity ?? 1,
      amountTotal: (li.amount_total ?? 0) / 100,
    })) ?? []

  return {
    // Short, human-friendly order number derived from the session id.
    orderNumber: session.id.replace(/^cs_(test_|live_)?/, "").slice(0, 12).toUpperCase(),
    paymentStatus: session.payment_status,
    email: session.customer_details?.email ?? null,
    currency: (session.currency ?? "eur").toUpperCase(),
    amountTotal: (session.amount_total ?? 0) / 100,
    items,
  }
}
