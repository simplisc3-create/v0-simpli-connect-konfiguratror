// API Route for ERP/Inventory System Webhook Integration
import { type NextRequest, NextResponse } from "next/server"
import type { ERPOrder } from "@/lib/shopping-item"

export async function POST(request: NextRequest) {
  try {
    const order: ERPOrder = await request.json()

    // Validate order structure
    if (!order.orderId || !order.items || !Array.isArray(order.items)) {
      return NextResponse.json({ error: "Invalid order structure" }, { status: 400 })
    }

    // Log order for debugging (in production, store to database)
    console.log("[ERP Webhook] Received order:", order.orderId)
    console.log("[ERP Webhook] Items:", order.items.length)
    console.log("[ERP Webhook] Total:", order.totals.grossTotal, order.totals.currency)

    // Here you would typically:
    // 1. Store the order in your database
    // 2. Send to external ERP system via their API
    // 3. Trigger notifications
    // 4. Update inventory

    // Example: Forward to external ERP system
    const erpEndpoint = process.env.ERP_WEBHOOK_URL
    if (erpEndpoint) {
      try {
        const erpResponse = await fetch(erpEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.ERP_API_KEY || ""}`,
          },
          body: JSON.stringify(order),
        })

        if (!erpResponse.ok) {
          console.error("[ERP Webhook] External ERP error:", await erpResponse.text())
        }
      } catch (erpError) {
        console.error("[ERP Webhook] Failed to forward to ERP:", erpError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      message: "Order received and processed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[ERP Webhook] Error processing order:", error)
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 })
  }
}

// GET endpoint for testing/health check
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "simpli-connect-erp-webhook",
    version: "1.0.0",
    supportedFormats: ["json", "xml"],
    supportedSystems: ["sap", "lexware", "jtl", "datev", "weclapp", "billbee", "xentral", "custom"],
  })
}
