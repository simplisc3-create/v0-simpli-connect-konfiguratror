"use server"

import { stripe } from "@/lib/stripe"

export interface OrderListItem {
  id: string // checkout session id
  orderNumber: string
  created: number // unix seconds
  email: string | null
  customerName: string | null
  paymentStatus: string
  currency: string
  amountTotal: number
  itemCount: number
  hasInvoice: boolean
}

function toOrderNumber(sessionId: string): string {
  return sessionId
    .replace(/^cs_(test_|live_)?/, "")
    .slice(0, 12)
    .toUpperCase()
}

/**
 * Lists the most recent checkout sessions that represent real purchases.
 * Reads directly from Stripe — the source of truth for what was charged.
 */
export async function listOrders(limit = 50): Promise<{ orders: OrderListItem[]; error?: string }> {
  try {
    const sessions = await stripe.checkout.sessions.list({
      limit: Math.min(Math.max(limit, 1), 100),
      expand: ["data.line_items"],
    })

    const orders = sessions.data
      // Only show sessions that represent a real purchase attempt.
      .filter((s) => s.amount_total != null && s.payment_status !== "unpaid")
      .map<OrderListItem>((s) => ({
        id: s.id,
        orderNumber: toOrderNumber(s.id),
        created: s.created,
        email: s.customer_details?.email ?? null,
        customerName: s.customer_details?.name ?? null,
        paymentStatus: s.payment_status,
        currency: (s.currency ?? "eur").toUpperCase(),
        amountTotal: (s.amount_total ?? 0) / 100,
        itemCount: s.line_items?.data.reduce((sum, li) => sum + (li.quantity ?? 0), 0) ?? 0,
        hasInvoice: s.invoice != null,
      }))

    return { orders }
  } catch (err) {
    console.error("[v0] listOrders failed:", err)
    return { orders: [], error: "Bestellungen konnten nicht von Stripe geladen werden." }
  }
}

/**
 * Returns the downloadable invoice PDF URL for a checkout session, if the
 * Stripe invoice has been generated. Prefers the direct PDF link, falling back
 * to the hosted invoice page.
 */
export async function getInvoiceUrl(sessionId: string): Promise<{ url: string | null; error?: string }> {
  if (!sessionId) return { url: null, error: "Keine Bestellung angegeben." }

  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["invoice"] })
    const invoice = typeof s?.invoice === "object" && s?.invoice ? s.invoice : null
    const url = invoice?.invoice_pdf ?? invoice?.hosted_invoice_url ?? null
    if (!url) return { url: null, error: "Für diese Bestellung ist keine Rechnung verfügbar." }
    return { url }
  } catch (err) {
    console.error("[v0] getInvoiceUrl failed:", err)
    return { url: null, error: "Rechnung konnte nicht geladen werden." }
  }
}
