"use client"

import type React from "react"

import { useState } from "react"
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileCode,
  Building2,
  Send,
  Check,
  Copy,
  ExternalLink,
  Settings,
  ChevronRight,
  X,
  AlertCircle,
  Webhook,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ShoppingItem, ERPSystem, CustomerData } from "@/lib/shopping-item"
import { createERPOrder, exportOrder } from "@/lib/erp-export"

interface ERPExportDialogProps {
  isOpen: boolean
  onClose: () => void
  shoppingList: ShoppingItem[]
  configMetadata: {
    configurationId: string
    shelfDimensions?: {
      width: number
      height: number
      depth: number
      unit: string
    }
  }
}

const erpSystems: { id: ERPSystem; name: string; icon: React.ReactNode; description: string; format: string }[] = [
  {
    id: "sap",
    name: "SAP",
    icon: <Building2 className="h-5 w-5" />,
    description: "SAP ERP & Business One",
    format: "IDoc XML",
  },
  {
    id: "lexware",
    name: "Lexware",
    icon: <FileCode className="h-5 w-5" />,
    description: "Lexware warenwirtschaft",
    format: "XML",
  },
  {
    id: "jtl",
    name: "JTL-Wawi",
    icon: <Database className="h-5 w-5" />,
    description: "JTL Warenwirtschaft",
    format: "XML",
  },
  {
    id: "datev",
    name: "DATEV",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    description: "DATEV Buchungsstapel",
    format: "CSV",
  },
  {
    id: "weclapp",
    name: "weclapp",
    icon: <FileJson className="h-5 w-5" />,
    description: "weclapp Cloud ERP",
    format: "JSON",
  },
  {
    id: "billbee",
    name: "Billbee",
    icon: <FileJson className="h-5 w-5" />,
    description: "Billbee Auftragsabwicklung",
    format: "JSON",
  },
  { id: "xentral", name: "Xentral", icon: <FileCode className="h-5 w-5" />, description: "Xentral ERP", format: "XML" },
  {
    id: "custom-api",
    name: "Eigene API",
    icon: <Webhook className="h-5 w-5" />,
    description: "Benutzerdefiniert",
    format: "JSON",
  },
]

export function ERPExportDialog({ isOpen, onClose, shoppingList, configMetadata }: ERPExportDialogProps) {
  const [selectedSystem, setSelectedSystem] = useState<ERPSystem | null>(null)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData>({})
  const [webhookUrl, setWebhookUrl] = useState("")
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success" | "error">("idle")
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    if (!selectedSystem) return

    setExportStatus("exporting")

    try {
      const order = createERPOrder(shoppingList, configMetadata, showCustomerForm ? customerData : undefined)
      const { content, mimeType, extension } = exportOrder(order, selectedSystem)

      if (selectedSystem === "custom-api" && webhookUrl) {
        // Send to webhook
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": mimeType },
          body: content,
        })

        if (!response.ok) throw new Error("Webhook failed")
        setExportStatus("success")
      } else {
        // Download file
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `simpli-order-${order.orderId}.${extension}`
        a.click()
        URL.revokeObjectURL(url)
        setExportStatus("success")
      }

      setTimeout(() => setExportStatus("idle"), 2000)
    } catch {
      setExportStatus("error")
      setTimeout(() => setExportStatus("idle"), 3000)
    }
  }

  const handleCopyJSON = () => {
    const order = createERPOrder(shoppingList, configMetadata, showCustomerForm ? customerData : undefined)
    navigator.clipboard.writeText(JSON.stringify(order, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nettoPrice = shoppingList.reduce((sum, item) => sum + item.subtotal, 0)
  const bruttoPrice = nettoPrice * 1.19

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-gradient-to-r from-secondary/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Export für Warenwirtschaft</h2>
              <p className="text-xs text-muted-foreground">
                {shoppingList.length} Artikel · {bruttoPrice.toFixed(2).replace(".", ",")} € brutto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-4 space-y-4">
          {/* System Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
              Warenwirtschaftssystem wählen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {erpSystems.map((system) => (
                <button
                  key={system.id}
                  onClick={() => setSelectedSystem(system.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all text-left",
                    selectedSystem === system.id
                      ? "border-accent-blue bg-accent-blue/10 shadow-lg shadow-accent-blue/10"
                      : "border-border bg-secondary/30 hover:border-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      selectedSystem === system.id ? "bg-accent-blue text-white" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {system.icon}
                  </div>
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        selectedSystem === system.id ? "text-accent-blue" : "text-card-foreground",
                      )}
                    >
                      {system.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{system.format}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected System Info */}
          {selectedSystem && (
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                  {erpSystems.find((s) => s.id === selectedSystem)?.icon}
                </div>
                <div>
                  <div className="font-medium text-card-foreground">
                    {erpSystems.find((s) => s.id === selectedSystem)?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {erpSystems.find((s) => s.id === selectedSystem)?.description}
                  </div>
                </div>
              </div>

              {selectedSystem === "custom-api" && (
                <div className="mt-3 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Webhook URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.example.com/orders"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Customer Data Toggle */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <button
              onClick={() => setShowCustomerForm(!showCustomerForm)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Settings className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-card-foreground">Kundendaten hinzufügen</div>
                <div className="text-xs text-muted-foreground">Optional für vollständige Bestellungen</div>
              </div>
              <ChevronRight
                className={cn("h-4 w-4 text-muted-foreground transition-transform", showCustomerForm && "rotate-90")}
              />
            </button>

            {showCustomerForm && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Firma</label>
                  <input
                    type="text"
                    value={customerData.companyName || ""}
                    onChange={(e) => setCustomerData({ ...customerData, companyName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Kunden-Nr.</label>
                  <input
                    type="text"
                    value={customerData.customerId || ""}
                    onChange={(e) => setCustomerData({ ...customerData, customerId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Vorname</label>
                  <input
                    type="text"
                    value={customerData.firstName || ""}
                    onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nachname</label>
                  <input
                    type="text"
                    value={customerData.lastName || ""}
                    onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">E-Mail</label>
                  <input
                    type="email"
                    value={customerData.email || ""}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Straße</label>
                  <input
                    type="text"
                    value={customerData.address?.street || ""}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        address: { ...customerData.address, street: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">PLZ</label>
                  <input
                    type="text"
                    value={customerData.address?.postalCode || ""}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        address: { ...customerData.address, postalCode: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ort</label>
                  <input
                    type="text"
                    value={customerData.address?.city || ""}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        address: { ...customerData.address, city: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Kopiert!" : "JSON kopieren"}
            </button>
            <a
              href="https://docs.simpli-connect.de/api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              API-Dokumentation
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-gradient-to-t from-secondary/30 to-transparent">
          <div className="flex items-center gap-3">
            {exportStatus === "error" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Export fehlgeschlagen
              </div>
            )}
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleExport}
              disabled={!selectedSystem || exportStatus === "exporting"}
              className={cn(
                "flex items-center gap-2 rounded-xl px-6 py-2.5 font-medium text-white transition-all",
                selectedSystem && exportStatus !== "exporting"
                  ? "bg-accent-blue hover:shadow-lg hover:shadow-accent-blue/30 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-muted cursor-not-allowed",
              )}
            >
              {exportStatus === "exporting" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Exportiere...
                </>
              ) : exportStatus === "success" ? (
                <>
                  <Check className="h-4 w-4" />
                  Exportiert!
                </>
              ) : selectedSystem === "custom-api" && webhookUrl ? (
                <>
                  <Send className="h-4 w-4" />
                  An API senden
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportieren
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
