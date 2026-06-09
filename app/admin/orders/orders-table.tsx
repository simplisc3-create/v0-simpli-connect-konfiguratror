"use client"

import { useState } from "react"
import type { OrderListItem } from "@/app/actions/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, RefreshCw } from "lucide-react"

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount)
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts * 1000))
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    paid: { label: "Bezahlt", className: "bg-green-100 text-green-700 hover:bg-green-100" },
    no_payment_required: { label: "Bezahlt", className: "bg-green-100 text-green-700 hover:bg-green-100" },
    unpaid: { label: "Offen", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  }
  const entry = map[status] ?? { label: status, className: "bg-gray-100 text-gray-700 hover:bg-gray-100" }
  return <Badge className={entry.className}>{entry.label}</Badge>
}

export function OrdersTable({ initialOrders }: { initialOrders: OrderListItem[] }) {
  const [orders] = useState(initialOrders)
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleInvoice = async (order: OrderListItem) => {
    setDownloading(order.id)
    try {
      const res = await fetch(`/api/admin/invoice?session_id=${encodeURIComponent(order.id)}`)
      const data = await res.json()
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer")
      } else {
        alert(data?.error ?? "Keine Rechnung verfügbar.")
      }
    } catch {
      alert("Rechnung konnte nicht geladen werden.")
    } finally {
      setDownloading(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
        <p className="text-gray-500">Noch keine Bestellungen vorhanden.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white"
        >
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-sm font-semibold text-gray-900">{order.orderNumber}</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {order.customerName ? `${order.customerName} · ` : ""}
              {order.email ?? "Keine E-Mail"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created)}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-semibold text-gray-900">{formatMoney(order.amountTotal, order.currency)}</p>
            <p className="text-xs text-gray-400">{order.itemCount} Artikel</p>
          </div>

          <div className="shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-transparent"
              disabled={downloading === order.id || !order.hasInvoice}
              onClick={() => handleInvoice(order)}
            >
              {downloading === order.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="ml-2">{order.hasInvoice ? "Rechnung (PDF)" : "Keine Rechnung"}</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
