"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Download,
  FileJson,
  FileSpreadsheet,
  Database,
  Send,
  Ruler,
  Layers,
  Palette,
  Box,
  ListOrdered,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ShelfConfig } from "./shelf-configurator"

interface CartItem {
  id: string
  name: string
  description: string
  width: number
  height: number
  color: string
  colorLabel: string
  type: string
  quantity: number
  unitPrice: number
  totalPrice: number
  sku: string
}

interface LiveCartProps {
  config: ShelfConfig
  isOpen: boolean
  onToggle: () => void
}

const colorLabels: Record<string, string> = {
  weiss: "Weiß",
  schwarz: "Schwarz",
  rot: "Rot",
  gruen: "Grün",
  gelb: "Gelb",
  blau: "Blau",
  orange: "Orange",
}

const typeLabels: Record<string, string> = {
  "ohne-seitenwaende": "Ohne Seitenwände",
  "mit-seitenwaenden": "Mit Seitenwänden",
  "ohne-rueckwand": "Ohne Rückwand",
  "mit-rueckwand": "Mit Rückwand",
  "mit-tueren": "Mit Türen",
  "abschliessbare-tueren": "Abschließbare Türen",
  "mit-klapptuer": "Mit Klapptür",
  "mit-doppelschublade": "Mit Doppelschublade",
  schubladen: "Schublade",
}

// Base prices per module type (in EUR)
const basePrices: Record<string, number> = {
  "ohne-seitenwaende": 89,
  "mit-seitenwaenden": 129,
  "ohne-rueckwand": 119,
  "mit-rueckwand": 149,
  "mit-tueren": 199,
  "abschliessbare-tueren": 249,
  "mit-klapptuer": 179,
  "mit-doppelschublade": 219,
  schubladen: 169,
}

// Color surcharges
const colorSurcharges: Record<string, number> = {
  weiss: 0,
  schwarz: 15,
  rot: 25,
  gruen: 25,
  gelb: 25,
  blau: 25,
  orange: 25,
}

// Width multiplier (75cm = 1.0, 38cm = 0.6)
const getWidthMultiplier = (width: number) => (width === 75 ? 1.0 : 0.6)

function generateSKU(type: string, width: number, color: string): string {
  const typeCode = type.substring(0, 3).toUpperCase()
  const widthCode = width === 75 ? "75" : "38"
  const colorCode = color.substring(0, 2).toUpperCase()
  return `SC-${typeCode}-${widthCode}-${colorCode}`
}

export function LiveCart({ config, isOpen, onToggle }: LiveCartProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    summary: true,
    modules: true,
    breakdown: true,
    accessories: false,
  })
  const [showExportMenu, setShowExportMenu] = useState(false)

  const cartItems = useMemo(() => {
    const itemsMap = new Map<string, CartItem>()

    config.columns.forEach((column) => {
      column.cells.forEach((cell) => {
        if (cell.type === "empty" || cell.type === "delete") return

        const basePrice = basePrices[cell.type] || 100
        const colorSurcharge = colorSurcharges[cell.color] || 0
        const widthMultiplier = getWidthMultiplier(column.width)
        const unitPrice = Math.round((basePrice + colorSurcharge) * widthMultiplier)

        const key = `${cell.type}-${column.width}-${cell.color}`
        const existing = itemsMap.get(key)

        if (existing) {
          existing.quantity += 1
          existing.totalPrice = existing.quantity * existing.unitPrice
        } else {
          itemsMap.set(key, {
            id: key,
            name: typeLabels[cell.type] || cell.type,
            description: `${column.width}cm breit, ${colorLabels[cell.color] || cell.color}`,
            width: column.width,
            height: 40,
            color: cell.color,
            colorLabel: colorLabels[cell.color] || cell.color,
            type: cell.type,
            quantity: 1,
            unitPrice,
            totalPrice: unitPrice,
            sku: generateSKU(cell.type, column.width, cell.color),
          })
        }
      })
    })

    return Array.from(itemsMap.values())
  }, [config])

  const configSummary = useMemo(() => {
    const totalWidth = config.columns.reduce((sum, col) => sum + col.width, 0)
    const totalHeight = config.columns[0]?.cells.length * 40 || 0
    const totalModules = config.columns.reduce(
      (sum, col) => sum + col.cells.filter((c) => c.type !== "empty" && c.type !== "delete").length,
      0,
    )
    const colorCount = new Map<string, number>()
    const typeCount = new Map<string, number>()
    const widthCount = new Map<number, number>()

    config.columns.forEach((column) => {
      column.cells.forEach((cell) => {
        if (cell.type === "empty" || cell.type === "delete") return
        colorCount.set(cell.color, (colorCount.get(cell.color) || 0) + 1)
        typeCount.set(cell.type, (typeCount.get(cell.type) || 0) + 1)
      })
      widthCount.set(
        column.width,
        (widthCount.get(column.width) || 0) +
          column.cells.filter((c) => c.type !== "empty" && c.type !== "delete").length,
      )
    })

    return {
      totalWidth,
      totalHeight,
      totalModules,
      columns: config.columns.length,
      rows: config.columns[0]?.cells.length || 0,
      colorBreakdown: Array.from(colorCount.entries()).map(([color, count]) => ({
        color,
        label: colorLabels[color] || color,
        count,
      })),
      typeBreakdown: Array.from(typeCount.entries()).map(([type, count]) => ({
        type,
        label: typeLabels[type] || type,
        count,
      })),
      widthBreakdown: Array.from(widthCount.entries()).map(([width, count]) => ({
        width,
        count,
      })),
    }
  }, [config])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const tax = Math.round(subtotal * 0.19)
  const total = subtotal + tax

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const exportAsJSON = () => {
    const data = {
      orderDate: new Date().toISOString(),
      items: cartItems,
      summary: {
        totalItems,
        subtotal,
        tax,
        total,
        currency: "EUR",
      },
      configuration: {
        columns: config.columns.length,
        totalWidth: config.columns.reduce((sum, col) => sum + col.width, 0),
        material: config.material,
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-order-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportAsCSV = () => {
    const headers = ["SKU", "Artikel", "Breite", "Farbe", "Menge", "Einzelpreis", "Gesamtpreis"]
    const rows = cartItems.map((item) => [
      item.sku,
      item.name,
      `${item.width}cm`,
      item.colorLabel,
      item.quantity,
      `${item.unitPrice.toFixed(2)} €`,
      `${item.totalPrice.toFixed(2)} €`,
    ])
    rows.push(["", "", "", "", "", "Netto:", `${subtotal.toFixed(2)} €`])
    rows.push(["", "", "", "", "", "MwSt. (19%):", `${tax.toFixed(2)} €`])
    rows.push(["", "", "", "", "", "Gesamt:", `${total.toFixed(2)} €`])

    const csv = [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-order-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportForERP = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Order xmlns="urn:simpli:erp:order:v1">
  <Header>
    <OrderDate>${new Date().toISOString()}</OrderDate>
    <OrderID>ORD-${Date.now()}</OrderID>
    <Currency>EUR</Currency>
  </Header>
  <Items>
${cartItems
  .map(
    (item) => `    <Item>
      <SKU>${item.sku}</SKU>
      <Description>${item.name}</Description>
      <Width>${item.width}</Width>
      <Color>${item.color}</Color>
      <Quantity>${item.quantity}</Quantity>
      <UnitPrice>${item.unitPrice.toFixed(2)}</UnitPrice>
      <TotalPrice>${item.totalPrice.toFixed(2)}</TotalPrice>
    </Item>`,
  )
  .join("\n")}
  </Items>
  <Summary>
    <Subtotal>${subtotal.toFixed(2)}</Subtotal>
    <Tax>${tax.toFixed(2)}</Tax>
    <Total>${total.toFixed(2)}</Total>
  </Summary>
</Order>`
    const blob = new Blob([xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-order-${Date.now()}.xml`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  return (
    <>
      {/* Cart Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-border/50 bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-card",
          isOpen && "bg-accent-gold/10 border-accent-gold/50",
        )}
      >
        <ShoppingCart className={cn("h-5 w-5", isOpen ? "text-accent-gold" : "text-foreground")} />
        {totalItems > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-gold px-1.5 text-xs font-bold text-white">
            {totalItems}
          </span>
        )}
        <span className="hidden font-semibold text-foreground sm:inline">{total.toFixed(2)} €</span>
      </button>

      {/* Cart Slide Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />

            {/* Cart Panel */}
            <motion.div
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-background shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-gold/10">
                    <ShoppingCart className="h-5 w-5 text-accent-gold" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Warenkorb</h2>
                    <p className="text-sm text-muted-foreground">{totalItems} Module</p>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Warenkorb ist leer</h3>
                    <p className="text-sm text-muted-foreground">
                      Fügen Sie Module hinzu, indem Sie auf das Regal klicken
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <button
                        onClick={() => toggleCategory("summary")}
                        className="flex w-full items-center justify-between rounded-lg bg-accent-gold/10 px-4 py-3"
                      >
                        <span className="flex items-center gap-2 font-medium text-accent-gold">
                          <Box className="h-4 w-4" />
                          Konfigurationsübersicht
                        </span>
                        {expandedCategories.summary ? (
                          <ChevronUp className="h-5 w-5 text-accent-gold" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-accent-gold" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedCategories.summary && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="rounded-lg border border-border bg-card p-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Ruler className="h-4 w-4" />
                                  <span className="text-xs">Gesamtmaße</span>
                                </div>
                                <p className="mt-1 text-lg font-bold">
                                  {configSummary.totalWidth} × {configSummary.totalHeight} cm
                                </p>
                              </div>
                              <div className="rounded-lg border border-border bg-card p-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Layers className="h-4 w-4" />
                                  <span className="text-xs">Spalten × Reihen</span>
                                </div>
                                <p className="mt-1 text-lg font-bold">
                                  {configSummary.columns} × {configSummary.rows}
                                </p>
                              </div>
                            </div>

                            {/* Color Breakdown */}
                            <div className="mt-3 rounded-lg border border-border bg-card p-3">
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Palette className="h-4 w-4" />
                                <span className="text-xs font-medium">Nach Farbe</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {configSummary.colorBreakdown.map(({ color, label, count }) => (
                                  <div
                                    key={color}
                                    className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1"
                                  >
                                    <div
                                      className="h-3 w-3 rounded-full ring-1 ring-border/50"
                                      style={{
                                        backgroundColor:
                                          color === "weiss"
                                            ? "#F5F5F5"
                                            : color === "schwarz"
                                              ? "#1A1A1A"
                                              : color === "rot"
                                                ? "#DC143C"
                                                : color === "gruen"
                                                  ? "#228B22"
                                                  : color === "gelb"
                                                    ? "#FFD700"
                                                    : color === "blau"
                                                      ? "#00A0D6"
                                                      : "#FFA500",
                                      }}
                                    />
                                    <span className="text-xs">{label}</span>
                                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-gold/20 px-1.5 text-xs font-bold text-accent-gold">
                                      {count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Width Breakdown */}
                            <div className="mt-3 rounded-lg border border-border bg-card p-3">
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Ruler className="h-4 w-4" />
                                <span className="text-xs font-medium">Nach Breite</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {configSummary.widthBreakdown.map(({ width, count }) => (
                                  <div
                                    key={width}
                                    className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1"
                                  >
                                    <span className="text-xs">{width} cm</span>
                                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/20 px-1.5 text-xs font-bold text-blue-600">
                                      {count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mb-4">
                      <button
                        onClick={() => toggleCategory("breakdown")}
                        className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <ListOrdered className="h-4 w-4" />
                          Warenzusammenstellung
                        </span>
                        {expandedCategories.breakdown ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedCategories.breakdown && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 overflow-hidden rounded-lg border border-border">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="px-3 py-2.5 text-left font-semibold">Pos.</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Artikelbezeichnung</th>
                                    <th className="px-3 py-2.5 text-center font-semibold">Breite</th>
                                    <th className="px-3 py-2.5 text-center font-semibold">Stk.</th>
                                    <th className="px-3 py-2.5 text-right font-semibold">EP</th>
                                    <th className="px-3 py-2.5 text-right font-semibold">GP</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {cartItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-muted/30">
                                      <td className="px-3 py-2.5 text-muted-foreground">{index + 1}</td>
                                      <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="h-4 w-4 rounded ring-1 ring-border/50"
                                            style={{
                                              backgroundColor:
                                                item.color === "weiss"
                                                  ? "#F5F5F5"
                                                  : item.color === "schwarz"
                                                    ? "#1A1A1A"
                                                    : item.color === "rot"
                                                      ? "#DC143C"
                                                      : item.color === "gruen"
                                                        ? "#228B22"
                                                        : item.color === "gelb"
                                                          ? "#FFD700"
                                                          : item.color === "blau"
                                                            ? "#00A0D6"
                                                            : "#FFA500",
                                            }}
                                          />
                                          <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {item.colorLabel} | SKU: {item.sku}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2.5 text-center">
                                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                                          {item.width} cm
                                        </span>
                                      </td>
                                      <td className="px-3 py-2.5 text-center">
                                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-accent-gold px-2 font-bold text-white">
                                          {item.quantity}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2.5 text-right text-muted-foreground">
                                        {item.unitPrice.toFixed(2)} €
                                      </td>
                                      <td className="px-3 py-2.5 text-right font-semibold">
                                        {item.totalPrice.toFixed(2)} €
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-muted/30 font-semibold">
                                  <tr>
                                    <td colSpan={3} className="px-3 py-2.5 text-right">
                                      Summe:
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-foreground px-2 font-bold text-background">
                                        {totalItems}
                                      </span>
                                    </td>
                                    <td></td>
                                    <td className="px-3 py-2.5 text-right text-accent-gold">{subtotal.toFixed(2)} €</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mb-4">
                      <button
                        onClick={() => toggleCategory("modules")}
                        className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Package className="h-4 w-4" />
                          Nach Modultyp
                        </span>
                        {expandedCategories.modules ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedCategories.modules && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2">
                              {configSummary.typeBreakdown.map(({ type, label, count }) => (
                                <div
                                  key={type}
                                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                                >
                                  <span className="font-medium">{label}</span>
                                  <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-accent-gold px-3 font-bold text-white">
                                    {count}×
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-border bg-card px-6 py-4">
                  {/* Price Summary */}
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zwischensumme ({totalItems} Module)</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MwSt. (19%)</span>
                      <span>{tax.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                      <span>Gesamt (brutto)</span>
                      <span className="text-accent-gold">{total.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="relative mb-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-transparent"
                      onClick={() => setShowExportMenu(!showExportMenu)}
                    >
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export / ERP-Anbindung
                      </span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", showExportMenu && "rotate-180")} />
                    </Button>

                    <AnimatePresence>
                      {showExportMenu && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <button
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                            onClick={exportAsJSON}
                          >
                            <FileJson className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">JSON Export</div>
                              <div className="text-xs text-muted-foreground">Für Webshops & APIs</div>
                            </div>
                          </button>
                          <button
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                            onClick={exportAsCSV}
                          >
                            <FileSpreadsheet className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">CSV Export</div>
                              <div className="text-xs text-muted-foreground">Für Excel & DATEV</div>
                            </div>
                          </button>
                          <button
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                            onClick={exportForERP}
                          >
                            <Database className="h-5 w-5 text-purple-500" />
                            <div>
                              <div className="font-medium">XML Export</div>
                              <div className="text-xs text-muted-foreground">Für SAP, Lexware, JTL</div>
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Order Button */}
                  <Button className="w-full bg-accent-gold text-white hover:bg-accent-gold/90" size="lg">
                    <Send className="mr-2 h-5 w-5" />
                    Anfrage senden
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
