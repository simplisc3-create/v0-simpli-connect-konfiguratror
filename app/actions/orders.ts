"use server"

import { stripe } from "@/lib/stripe"

export interface OrderListItem {
  sessionId: string
  orderNumber: string
  created: number // unix seconds
  email: string | null
  name: string | null
  paymentStatus: string
  currency: string
  amountTotal: number
  itemCount: number
}

export interface OrderDetail extends OrderListItem {
  items: { name: string; quantity: number; amountTotal: number }[]
  shipping: {
    name: string | null
    line1: string | null
    line2: string | null
    postalCode: string | null
    city: string | null
    country: string | null
  } | null
  invoiceUrl: string | null
  invoicePdf: string | null
}

function toOrderNumber(sessionId: string): string {
  return sessionId
    .replace(/^cs_(test_|live_)?/, "")
    .slice(0, 12)
    .toUpperCase()
}

/**
 * Lists the most recent paid (or attempted) checkout sessions as orders.
 * Reads directly from Stripe — the source of truth for what was charged.
 */
export async function listRecentOrders(limit = 50): Promise<OrderListItem[]> {
  const sessions = await stripe.checkout.sessions.list({
    limit: Math.min(Math.max(limit, 1), 100),
    expand: ["data.line_items"],
  })

  return sessions.data
    // Only show sessions that represent a real purchase attempt.
    .filter((s) => s.amount_total != null && s.payment_status !== "unpaid")
    .map((s) => ({
      sessionId: s.id,
      orderNumber: toOrderNumber(s.id),
      created: s.created,
      email: s.customer_details?.email ?? null,
      name: s.customer_details?.name ?? null,
      paymentStatus: s.payment_status,
      currency: (s.currency ?? "eur").toUpperCase(),
      amountTotal: (s.amount_total ?? 0) / 100,
      itemCount: s.line_items?.data.reduce((sum, li) => sum + (li.quantity ?? 0), 0) ?? 0,
    }))
}

/**
 * Retrieves full detail for a single order, including shipping address and the
 * Stripe-generated invoice PDF/hosted URL when available.
 */
export async function getOrderDetail(sessionId: string): Promise<OrderDetail | null> {
  if (!sessionId) return null

  const s = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "invoice"],
  })
  if (!s) return null

  const invoice = typeof s.invoice === "object" && s.invoice ? s.invoice : null
  const shippingDetails =
    (s as unknown as { shipping_details?: { name?: string; address?: Record<string, string> } }).shipping_details ??
    null
  const addr = shippingDetails?.address ?? s.customer_details?.address ?? null

  return {
    sessionId: s.id,
    orderNumber: toOrderNumber(s.id),
    created: s.created,
    email: s.customer_details?.email ?? null,
    name: shippingDetails?.name ?? s.customer_details?.name ?? null,
    paymentStatus: s.payment_status,
    currency: (s.currency ?? "eur").toUpperCase(),
    amountTotal: (s.amount_total ?? 0) / 100,
    itemCount: s.line_items?.data.reduce((sum, li) => sum + (li.quantity ?? 0), 0) ?? 0,
    items:
      s.line_items?.data.map((li) => ({
        name: li.description ?? "Artikel",
        quantity: li.quantity ?? 1,
        amountTotal: (li.amount_total ?? 0) / 100,
      })) ?? [],
    shipping: addr
      ? {
          name: shippingDetails?.name ?? s.customer_details?.name ?? null,
          line1: addr.line1 ?? null,
          line2: addr.line2 ?? null,
          postalCode: addr.postal_code ?? null,
          city: addr.city ?? null,
          country: addr.country ?? null,
        }
      : null,
    invoiceUrl: invoice?.hosted_invoice_url ?? null,
    invoicePdf: invoice?.invoice_pdf ?? null,
  }
}

/**
 * Returns the downloadable invoice PDF URL for a given checkout session, if the
 * Stripe invoice has been generated. Used by the customer-facing success page.
 */
export async function getInvoiceLinks(
  sessionId: string,
): Promise<{ invoiceUrl: string | null; invoicePdf: string | null }> {
  if (!sessionId) return { invoiceUrl: null, invoicePdf: null }

  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["invoice"] })
  const invoice = typeof s?.invoice === "object" && s?.invoice ? s.invoice : null
  return {
    invoiceUrl: invoice?.hosted_invoice_url ?? null,
    invoicePdf: invoice?.invoice_pdf ?? null,
  }
}
