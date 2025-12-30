"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart,
  X,
  Package,
  FileJson,
  FileSpreadsheet,
  Database,
  Send,
  Cylinder,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  Truck,
  Ruler,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ShelfConfig } from "./shelf-configurator"
import { getStangensetPrice, getLeiterPrice } from "@/lib/simpli-products"

interface CartItem {
  id: string
  name: string
  width: number
  color: string
  colorLabel: string
  type: string
  quantity: number
  unitPrice: number
  totalPrice: number
  sku: string
  position?: string
}

interface LiveCartProps {
  config: ShelfConfig
  isOpen: boolean
  onToggle: () => void
  alwaysVisible?: boolean
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
  leer: "Leer",
  "mit-tuer-links": "Tür Links (mit Seitenwand)",
  "mit-tuer-rechts": "Tür Rechts (mit Seitenwand)",
  "mit-abschliessbarer-tuer-links": "Abschließbare Tür Links",
}

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
  leer: 69,
  "mit-tuer-links": 159,
  "mit-tuer-rechts": 159,
  "mit-abschliessbarer-tuer-links": 189,
}

const colorSurcharges: Record<string, number> = {
  weiss: 0,
  schwarz: 15,
  rot: 25,
  gruen: 25,
  gelb: 25,
  blau: 25,
  orange: 25,
}

const colorValues: Record<string, string> = {
  weiss: "#F5F5F5",
  schwarz: "#1A1A1A",
  rot: "#DC143C",
  gruen: "#228B22",
  gelb: "#FFD700",
  blau: "#00A0D6",
  orange: "#FFA500",
}

const getWidthMultiplier = (width: number) => (width === 75 ? 1.0 : 0.6)

function generateSKU(type: string, width: number, color: string): string {
  const typeCode = type.substring(0, 3).toUpperCase()
  const widthCode = width === 75 ? "75" : "38"
  const colorCode = color.substring(0, 2).toUpperCase()
  return `SC-${typeCode}-${widthCode}-${colorCode}`
}

export function LiveCart({ config, isOpen, onToggle, alwaysVisible = false }: LiveCartProps) {
  const [expandedSections, setExpandedSections] = useState({
    modules: true,
    stangensets: true,
    configuration: true,
    partsList: true,
    shipping: false,
  })

  const [customerInfo, setCustomerInfo] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
    country: "Deutschland",
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const detailedItems = useMemo(() => {
    const items: (CartItem & { colIndex: number; rowIndex: number })[] = []

    config.columns.forEach((column, colIndex) => {
      column.cells.forEach((cell, rowIndex) => {
        if (cell.type === "empty" || cell.type === "delete") return

        const basePrice = basePrices[cell.type] || 100
        const colorSurcharge = colorSurcharges[cell.color] || 0
        const widthMultiplier = getWidthMultiplier(column.width)
        const unitPrice = Math.round((basePrice + colorSurcharge) * widthMultiplier)

        items.push({
          id: `${colIndex}-${rowIndex}`,
          name: typeLabels[cell.type] || cell.type,
          width: column.width,
          color: cell.color,
          colorLabel: colorLabels[cell.color] || cell.color,
          type: cell.type,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice,
          sku: generateSKU(cell.type, column.width, cell.color),
          position: `Spalte ${colIndex + 1}, Reihe ${rowIndex + 1}`,
          colIndex,
          rowIndex,
        })
      })
    })

    return items
  }, [config])

  // Calculate aggregated cart items (grouped)
  const cartItems = useMemo(() => {
    const itemsMap = new Map<string, CartItem>()

    detailedItems.forEach((item) => {
      const key = `${item.type}-${item.width}-${item.color}`
      const existing = itemsMap.get(key)

      if (existing) {
        existing.quantity += 1
        existing.totalPrice = existing.quantity * existing.unitPrice
      } else {
        itemsMap.set(key, {
          id: key,
          name: item.name,
          width: item.width,
          color: item.color,
          colorLabel: item.colorLabel,
          type: item.type,
          quantity: 1,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice,
          sku: item.sku,
        })
      }
    })

    return Array.from(itemsMap.values())
  }, [detailedItems])

  // Calculate stangensets
  const stangensets = useMemo(() => {
    const stangensetMap = new Map<string, { width: number; variant: string; count: number; unitPrice: number }>()

    config.columns.forEach((column) => {
      const filledCells = column.cells.filter((c) => c.type !== "empty" && c.type !== "delete")
      if (filledCells.length === 0) return

      const stangensetSize = column.width === 38 ? 40 : 80
      const variant = config.material === "glas" && stangensetSize === 80 ? "glas" : "metall"
      const key = `${stangensetSize}-${variant}`

      const existing = stangensetMap.get(key)
      const unitPrice = getStangensetPrice(stangensetSize, variant as "metall" | "glas")

      if (existing) {
        existing.count += filledCells.length
      } else {
        stangensetMap.set(key, {
          width: stangensetSize,
          variant,
          count: filledCells.length,
          unitPrice,
        })
      }
    })

    return Array.from(stangensetMap.values())
  }, [config])

  const leitern = useMemo(() => {
    const maxHeight = Math.max(
      ...config.columns.map((col) => {
        const filledCells = col.cells.filter((c) => c.type !== "empty" && c.type !== "delete")
        return filledCells.length * 38 // Each cell is 38cm high
      }),
    )

    // Round up to nearest standard Leiter size (40, 80, 120, 160, 200)
    const leiterSizes = [40, 80, 120, 160, 200]
    const leiterHeight = leiterSizes.find((s) => s >= maxHeight) || 200

    // We need 4 Leitern per shelf unit (one at each corner)
    const filledColumns = config.columns.filter((col) =>
      col.cells.some((c) => c.type !== "empty" && c.type !== "delete"),
    ).length

    // For multiple columns, we share corner posts, so: 2 + (columns * 2)
    const leiterCount = filledColumns > 0 ? 2 + filledColumns * 2 : 0
    const unitPrice = getLeiterPrice(leiterHeight)

    return {
      height: leiterHeight,
      count: leiterCount,
      unitPrice,
      totalPrice: leiterCount * unitPrice,
    }
  }, [config])

  const zwischenwaende = useMemo(() => {
    let count = 0

    config.columns.forEach((col) => {
      col.cells.forEach((cell) => {
        // Modules with side walls need Zwischenwände
        if (
          cell.type === "mit-seitenwaenden" ||
          cell.type === "mit-tueren" ||
          cell.type === "abschliessbare-tueren" ||
          cell.type === "mit-klapptuer" ||
          cell.type === "mit-doppelschublade" ||
          cell.type === "schubladen" ||
          cell.type === "mit-tuer-links" ||
          cell.type === "mit-tuer-rechts"
        ) {
          count += 2 // 2 side walls per closed module
        }
      })
    })

    const unitPrice = 14.5 // Funktionswand 2-seitig price
    return {
      count,
      unitPrice,
      totalPrice: count * unitPrice,
    }
  }, [config])

  const rueckwaende = useMemo(() => {
    let count = 0

    config.columns.forEach((col) => {
      col.cells.forEach((cell) => {
        if (
          cell.type === "mit-rueckwand" ||
          cell.type === "mit-seitenwaenden" ||
          cell.type === "mit-tueren" ||
          cell.type === "abschliessbare-tueren" ||
          cell.type === "mit-klapptuer" ||
          cell.type === "mit-doppelschublade" ||
          cell.type === "schubladen" ||
          cell.type === "mit-abschliessbarer-tuer-links"
        ) {
          count += 1
        }
      })
    })

    const unitPrice = 12.5 // Funktionswand 1-seitig price
    return {
      count,
      unitPrice,
      totalPrice: count * unitPrice,
    }
  }, [config])

  const partsSubtotal = leitern.totalPrice + zwischenwaende.totalPrice + rueckwaende.totalPrice
  const totalModules = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalStangensets = stangensets.reduce((sum, item) => sum + item.count, 0)
  const modulesSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const stangensetsSubtotal = stangensets.reduce((sum, item) => sum + item.count * item.unitPrice, 0)
  const subtotal = modulesSubtotal + stangensetsSubtotal + partsSubtotal
  const tax = Math.round(subtotal * 0.19)
  const total = subtotal + tax
  const totalItems = totalModules + totalStangensets + leitern.count + zwischenwaende.count + rueckwaende.count

  // Export functions
  const exportAsJSON = () => {
    const data = {
      orderDate: new Date().toISOString(),
      configuration: {
        columns: config.columns.length,
        rows: Math.max(...config.columns.map((c) => c.cells.length)),
        material: config.material,
      },
      modules: cartItems,
      detailedConfiguration: detailedItems.map((item) => ({
        position: item.position,
        type: item.name,
        width: item.width,
        color: item.colorLabel,
        price: item.unitPrice,
      })),
      stangensets,
      parts: {
        leitern,
        zwischenwaende,
        rueckwaende,
      },
      summary: { subtotal, tax, total, currency: "EUR" },
      customerInfo,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-order-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsCSV = () => {
    const headers = ["Pos", "Position", "Artikel", "Breite", "Farbe", "EP", "GP"]
    const rows = detailedItems.map((item, i) => [
      i + 1,
      item.position,
      item.name,
      `${item.width}cm`,
      item.colorLabel,
      `${item.unitPrice.toFixed(2)}€`,
      `${item.totalPrice.toFixed(2)}€`,
    ])

    // Add stangensets
    stangensets.forEach((item, i) => {
      rows.push([
        detailedItems.length + i + 1,
        "-",
        `Stangenset ${item.variant} ${item.width}cm`,
        `${item.width}cm`,
        "-",
        `${item.unitPrice.toFixed(2)}€`,
        `${(item.count * item.unitPrice).toFixed(2)}€`,
      ])
    })

    // Add Leitern
    if (leitern.count > 0) {
      rows.push([
        detailedItems.length + stangensets.length + 1,
        "-",
        `Leiter ${leitern.height}cm`,
        "-",
        "-",
        `${leitern.unitPrice.toFixed(2)}€`,
        `${leitern.totalPrice.toFixed(2)}€`,
      ])
    }

    // Add Zwischenwände
    if (zwischenwaende.count > 0) {
      rows.push([
        detailedItems.length + stangensets.length + (leitern.count > 0 ? 2 : 1),
        "-",
        `Seitenwände`,
        "-",
        "-",
        `${zwischenwaende.unitPrice.toFixed(2)}€`,
        `${zwischenwaende.totalPrice.toFixed(2)}€`,
      ])
    }

    // Add Rückwände
    if (rueckwaende.count > 0) {
      rows.push([
        detailedItems.length + stangensets.length + (leitern.count > 0 ? 2 : 1) + (zwischenwaende.count > 0 ? 1 : 0),
        "-",
        `Rückwände`,
        "-",
        "-",
        `${rueckwaende.unitPrice.toFixed(2)}€`,
        `${rueckwaende.totalPrice.toFixed(2)}€`,
      ])
    }

    const csv = [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-order-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportForERP = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Order>
  <Header><OrderDate>${new Date().toISOString()}</OrderDate></Header>
  <Configuration>
    <Columns>${config.columns.length}</Columns>
    <Rows>${Math.max(...config.columns.map((c) => c.cells.length))}</Rows>
    <Material>${config.material}</Material>
  </Configuration>
  <Items>
${cartItems.map((item) => `    <Item sku="${item.sku}" qty="${item.quantity}" price="${item.totalPrice.toFixed(2)}"/>`).join("\n")}
${stangensets.map((item) => `    <Item sku="STG-${item.width}-${item.variant.toUpperCase()}" qty="${item.count}" price="${(item.count * item.unitPrice).toFixed(2)}"/>`).join("\n")}
${leitern.count > 0 ? `    <Item sku="LEITER-${leitern.height}" qty="${leitern.count}" price="${leitern.totalPrice.toFixed(2)}"/>` : ""}
${zwischenwaende.count > 0 ? `    <Item sku="ZWISCHENWAND-2S" qty="${zwischenwaende.count}" price="${zwischenwaende.totalPrice.toFixed(2)}"/>` : ""}
${rueckwaende.count > 0 ? `    <Item sku="RUECKWAND-1S" qty="${rueckwaende.count}" price="${rueckwaende.totalPrice.toFixed(2)}"/>` : ""}
  </Items>
  <Total>${total.toFixed(2)}</Total>
  <CustomerInfo>
    <Company>${customerInfo.company}</Company>
    <Contact>${customerInfo.contact}</Contact>
    <Email>${customerInfo.email}</Email>
    <Phone>${customerInfo.phone}</Phone>
    <Street>${customerInfo.street}</Street>
    <PostalCode>${customerInfo.postalCode}</PostalCode>
    <City>${customerInfo.city}</City>
    <Country>${customerInfo.country}</Country>
  </CustomerInfo>
</Order>`
    const blob = new Blob([xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-order-${Date.now()}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (alwaysVisible) {
    return (
      <div className="h-full w-full flex flex-col bg-[#0a0a0a] border-l border-border/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-[#00b4d8]" />
            <div>
              <h2 className="font-bold text-white">Warenkorb</h2>
              <p className="text-xs text-gray-400">{totalItems} Artikel</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#00b4d8]">{total.toFixed(0)} €</div>
            <div className="text-[10px] text-gray-500">inkl. MwSt.</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {totalModules === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Package className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-sm text-gray-400">Noch keine Module</p>
              <p className="text-xs text-gray-500 mt-1">
                Klicken Sie auf das Regal oder wählen Sie Module aus dem Editor
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="rounded-lg border border-border/30 overflow-hidden">
                <button
                  onClick={() => toggleSection("shipping")}
                  className="w-full flex items-center justify-between p-3 bg-green-900/20 hover:bg-green-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Versanddaten</span>
                  </div>
                  {expandedSections.shipping ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.shipping && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-3 bg-gray-900/20">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Firma</label>
                            <input
                              type="text"
                              value={customerInfo.company}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, company: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                              placeholder="Firmenname"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Ansprechpartner</label>
                            <input
                              type="text"
                              value={customerInfo.contact}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, contact: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                              placeholder="Name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">E-Mail</label>
                            <input
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                              placeholder="email@firma.de"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Telefon</label>
                            <input
                              type="tel"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                              placeholder="+49..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">Straße</label>
                          <input
                            type="text"
                            value={customerInfo.street}
                            onChange={(e) => setCustomerInfo((prev) => ({ ...prev, street: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                            placeholder="Straße + Hausnummer"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">PLZ</label>
                            <input
                              type="text"
                              value={customerInfo.postalCode}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, postalCode: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                              placeholder="12345"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] text-gray-500 block mb-1">Ort</label>
                            <input
                              type="text"
                              value={customerInfo.city}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, city: e.target.value }))}
                              className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                              placeholder="Stadt"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">Land</label>
                          <select
                            value={customerInfo.country}
                            onChange={(e) => setCustomerInfo((prev) => ({ ...prev, country: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                          >
                            <option value="Deutschland">Deutschland</option>
                            <option value="Österreich">Österreich</option>
                            <option value="Schweiz">Schweiz</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="rounded-lg border border-border/30 overflow-hidden">
                <button
                  onClick={() => toggleSection("partsList")}
                  className="w-full flex items-center justify-between p-3 bg-amber-900/20 hover:bg-amber-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Teile-Übersicht</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-amber-400 font-semibold">{partsSubtotal.toFixed(0)} €</span>
                    {expandedSections.partsList ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedSections.partsList && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 space-y-1.5">
                        {/* Leitern */}
                        {leitern.count > 0 && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-900/20">
                            <div className="h-8 w-8 rounded bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                              <Ruler className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white">Leiter {leitern.height}cm</div>
                              <div className="text-[10px] text-gray-400">
                                {leitern.count}x à {leitern.unitPrice.toFixed(2)} €
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-amber-400">
                              {leitern.totalPrice.toFixed(0)} €
                            </div>
                          </div>
                        )}

                        {/* Stangensets */}
                        {stangensets.map((item) => (
                          <div
                            key={`stg-${item.width}-${item.variant}`}
                            className="flex items-center gap-2 p-2 rounded-lg bg-amber-900/20"
                          >
                            <div className="h-8 w-8 rounded bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                              <Cylinder className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white">
                                Stangenset {item.variant === "glas" ? "Glas" : "Metall"} {item.width}cm
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {item.count}x à {item.unitPrice.toFixed(2)} €
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-amber-400">
                              {(item.count * item.unitPrice).toFixed(0)} €
                            </div>
                          </div>
                        ))}

                        {/* Zwischenwände */}
                        {zwischenwaende.count > 0 && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-900/20">
                            <div className="h-8 w-8 rounded bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white">Seitenwände</div>
                              <div className="text-[10px] text-gray-400">
                                {zwischenwaende.count}x à {zwischenwaende.unitPrice.toFixed(2)} €
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-amber-400">
                              {zwischenwaende.totalPrice.toFixed(0)} €
                            </div>
                          </div>
                        )}

                        {/* Rückwände */}
                        {rueckwaende.count > 0 && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-900/20">
                            <div className="h-8 w-8 rounded bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                              <Grid3X3 className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white">Rückwände</div>
                              <div className="text-[10px] text-gray-400">
                                {rueckwaende.count}x à {rueckwaende.unitPrice.toFixed(2)} €
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-amber-400">
                              {rueckwaende.totalPrice.toFixed(0)} €
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="rounded-lg border border-border/30 overflow-hidden">
                <button
                  onClick={() => toggleSection("configuration")}
                  className="w-full flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4 text-[#00b4d8]" />
                    <span className="text-sm font-medium text-white">Konfigurationsübersicht</span>
                  </div>
                  {expandedSections.configuration ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.configuration && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-2 bg-gray-900/20">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Material:</span>
                          <span className="text-white capitalize">{config.material}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Spalten:</span>
                          <span className="text-white">{config.columns.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Reihen:</span>
                          <span className="text-white">{Math.max(...config.columns.map((c) => c.cells.length))}</span>
                        </div>
                        {/* Grid visualization */}
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <div className="text-xs text-gray-500 mb-2">Raster-Vorschau:</div>
                          <div className="flex gap-1">
                            {config.columns.map((col, colIdx) => (
                              <div key={colIdx} className="flex flex-col gap-1">
                                {col.cells.map((cell, rowIdx) => (
                                  <div
                                    key={rowIdx}
                                    className={cn(
                                      "w-6 h-6 rounded text-[8px] flex items-center justify-center",
                                      cell.type !== "empty"
                                        ? "bg-[#00b4d8]/30 border border-[#00b4d8]/50 text-[#00b4d8]"
                                        : "bg-gray-800 border border-dashed border-gray-600 text-gray-500",
                                    )}
                                  >
                                    {cell.type !== "empty" ? "M" : "+"}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="rounded-lg border border-border/30 overflow-hidden">
                <button
                  onClick={() => toggleSection("modules")}
                  className="w-full flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#00b4d8]" />
                    <span className="text-sm font-medium text-white">Module ({totalModules})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#00b4d8] font-semibold">{modulesSubtotal.toFixed(0)} €</span>
                    {expandedSections.modules ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedSections.modules && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 space-y-1.5">
                        {/* Detailed items with positions */}
                        {detailedItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
                          >
                            <div
                              className="h-8 w-8 rounded flex-shrink-0 ring-1 ring-border/50"
                              style={{ backgroundColor: colorValues[item.color] || "#888" }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">{item.name}</div>
                              <div className="text-[10px] text-gray-400">
                                {item.width}cm · {item.colorLabel} · {item.position}
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-white">{item.unitPrice.toFixed(0)} €</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Remove standalone Stangensets section since it's now in Teile-Übersicht */}
            </div>
          )}
        </div>

        {/* Footer with price summary */}
        {totalModules > 0 && (
          <div className="border-t border-border/30 bg-gray-900/50 p-4 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Module</span>
                <span className="text-white">{modulesSubtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Teile (Leitern, Stangen, etc.)</span>
                <span className="text-white">{(stangensetsSubtotal + partsSubtotal).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Netto</span>
                <span className="text-white">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MwSt. 19%</span>
                <span className="text-white">{tax.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/30 font-bold text-lg">
                <span className="text-white">Gesamt</span>
                <span className="text-[#00b4d8]">{total.toFixed(2)} €</span>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={exportAsJSON}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border/30 hover:border-[#00b4d8] hover:bg-[#00b4d8]/10 transition-all"
              >
                <FileJson className="h-4 w-4 text-[#00b4d8]" />
                <span className="text-[10px] text-gray-400">JSON</span>
              </button>
              <button
                onClick={exportAsCSV}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border/30 hover:border-[#00b4d8] hover:bg-[#00b4d8]/10 transition-all"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#00b4d8]" />
                <span className="text-[10px] text-gray-400">CSV</span>
              </button>
              <button
                onClick={exportForERP}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border/30 hover:border-[#00b4d8] hover:bg-[#00b4d8]/10 transition-all"
              >
                <Database className="h-4 w-4 text-[#00b4d8]" />
                <span className="text-[10px] text-gray-400">ERP</span>
              </button>
            </div>

            {/* Order Button */}
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00b4d8] py-3 font-semibold text-white transition-all hover:bg-[#00b4d8]/90">
              <Send className="h-4 w-4" />
              <span>Bestellen</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // Original toggle cart (keeping for mobile compatibility)
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-card",
          isOpen && "bg-[#00b4d8]/10 border-[#00b4d8]/50",
        )}
      >
        <ShoppingCart className={cn("h-5 w-5", isOpen ? "text-[#00b4d8]" : "text-foreground")} />
        {totalItems > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#00b4d8] px-1.5 text-xs font-bold text-white">
            {totalItems}
          </span>
        )}
        <span className="hidden font-semibold sm:inline">{total.toFixed(0)} €</span>
      </button>

      {/* Panel */}
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

            {/* Slide Panel */}
            <motion.div
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[#0a0a0a] shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/30 p-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-[#00b4d8]" />
                  <div>
                    <h2 className="font-bold text-white">Warenkorb</h2>
                    <p className="text-xs text-gray-400">{totalItems} Artikel</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={onToggle} className="rounded-full p-2 text-gray-400 hover:bg-gray-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content - reuse always visible content */}
              <div className="flex-1 overflow-y-auto p-4">
                {totalModules === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-12 w-12 text-gray-600 mb-4" />
                    <p className="text-sm text-gray-400">Noch keine Module</p>
                    <p className="text-xs text-gray-500">Klicken Sie auf das Regal</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detailedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/30">
                        <div
                          className="h-8 w-8 rounded flex-shrink-0 ring-1 ring-border/50"
                          style={{ backgroundColor: colorValues[item.color] || "#888" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{item.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {item.width}cm · {item.colorLabel} · {item.position}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-white">{item.unitPrice.toFixed(0)} €</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {totalModules > 0 && (
                <div className="border-t border-border/30 bg-gray-900/50 p-4 space-y-4">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Netto</span>
                      <span className="text-white">{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">MwSt. 19%</span>
                      <span className="text-white">{tax.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/30 font-bold text-lg">
                      <span className="text-white">Gesamt</span>
                      <span className="text-[#00b4d8]">{total.toFixed(2)} €</span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00b4d8] py-3 font-semibold text-white transition-all hover:bg-[#00b4d8]/90">
                    <Send className="h-4 w-4" />
                    <span>Bestellen</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
