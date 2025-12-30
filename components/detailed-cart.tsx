"use client"

import type React from "react"

import { useState, useMemo } from "react"
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Package,
  Ruler,
  Palette,
  Info,
  Tag,
  Percent,
  Calculator,
  Printer,
  Share2,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ShoppingItem } from "@/lib/shopping-item"
import { colorHexMap } from "@/lib/simpli-products"
import { ERPExportDialog } from "./erp-export-dialog"
import type { ShelfConfig } from "./shelf-configurator"

interface DetailedCartProps {
  shoppingList: ShoppingItem[]
  config: ShelfConfig
  onUpdateQuantity?: (artNr: string, quantity: number) => void
  onRemoveItem?: (artNr: string) => void
}

const categoryLabels: Record<string, string> = {
  leiter: "Leitern",
  stangenset: "Stangensets",
  metallboden: "Metallböden",
  glasboden: "Glasböden",
  holzboden: "Holzböden",
  schublade: "Schubladen",
  tuer: "Türen",
  jalousie: "Jalousien",
  funktionswand: "Funktionswände",
  led: "LED-Beleuchtung",
  regalteile: "Regalteile", // Added shelf parts category label
}

const categoryIcons: Record<string, React.ReactNode> = {
  leiter: <Ruler className="h-3.5 w-3.5" />,
  stangenset: <Package className="h-3.5 w-3.5" />,
  metallboden: <Package className="h-3.5 w-3.5" />,
  glasboden: <Package className="h-3.5 w-3.5" />,
  holzboden: <Package className="h-3.5 w-3.5" />,
  schublade: <Package className="h-3.5 w-3.5" />,
  tuer: <Package className="h-3.5 w-3.5" />,
  jalousie: <Package className="h-3.5 w-3.5" />,
  funktionswand: <Package className="h-3.5 w-3.5" />,
  led: <Package className="h-3.5 w-3.5" />,
  regalteile: <Package className="h-3.5 w-3.5" />, // Added shelf parts category icon
}

export function DetailedCart({ shoppingList, config, onUpdateQuantity, onRemoveItem }: DetailedCartProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showConfigDetails, setShowConfigDetails] = useState(false)
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null)
  const [showERPExport, setShowERPExport] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Group items by category
  const groupedByCategory = useMemo(() => {
    return shoppingList.reduce(
      (acc, item) => {
        const cat = item.product.category
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
      },
      {} as Record<string, ShoppingItem[]>,
    )
  }, [shoppingList])

  // Calculate totals
  const nettoPrice = shoppingList.reduce((sum, item) => sum + item.subtotal, 0)
  const mwstRate = 19
  const mwstPrice = nettoPrice * (mwstRate / 100)
  const bruttoPrice = nettoPrice + mwstPrice
  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0)
  const totalWeight = shoppingList.reduce((sum, item) => sum + item.quantity * 0.5, 0) // Estimated weight

  // Calculate dimensions from config
  const totalWidth = config.columns.reduce((sum, col) => sum + col.width, 0)
  const maxHeight = config.columns.reduce((max, col) => Math.max(max, col.cells.length * 40), 0)
  const moduleCount = config.columns.reduce(
    (count, col) => count + col.cells.filter((cell) => cell.type !== "empty").length,
    0,
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const formatPrice = (price: number) => price.toFixed(2).replace(".", ",")

  const configMetadata = {
    configurationId: `SC-${Date.now().toString(36).toUpperCase()}`,
    shelfDimensions: {
      width: totalWidth,
      height: maxHeight,
      depth: 40,
      unit: "cm",
    },
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    const shareData = {
      title: "Simpli Connect Konfiguration",
      text: `Meine Regal-Konfiguration: ${moduleCount} Module, ${formatPrice(bruttoPrice)} €`,
      url: window.location.href,
    }

    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  if (shoppingList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-medium text-card-foreground mb-2">Warenkorb ist leer</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Konfigurieren Sie Ihr Regal und fügen Sie Module hinzu, um Artikel in den Warenkorb zu legen.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cart Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-gradient-to-r from-secondary/50 to-transparent p-4 text-left transition-all hover:border-accent-blue/30"
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        )}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue transition-all group-hover:bg-accent-blue group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent-blue/25">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <span className="text-lg font-semibold text-card-foreground">Warenkorb</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{shoppingList.length} Positionen</span>
            <span>·</span>
            <span>{totalItems} Teile</span>
            <span>·</span>
            <span>~{totalWeight.toFixed(1)} kg</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent-blue">{formatPrice(bruttoPrice)} €</div>
          <div className="text-xs text-muted-foreground">inkl. {mwstRate}% MwSt.</div>
        </div>
      </button>

      {isExpanded && (
        <>
          {/* Configuration Summary */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-secondary/30 to-transparent p-4">
            <button
              onClick={() => setShowConfigDetails(!showConfigDetails)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                <Info className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-card-foreground flex-1">Konfigurationsübersicht</span>
              {showConfigDetails ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showConfigDetails && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-3">
                  <Ruler className="h-4 w-4 text-accent-blue" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Abmessungen</div>
                    <div className="text-sm font-medium text-card-foreground">
                      {totalWidth} × {maxHeight} cm
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-3">
                  <Package className="h-4 w-4 text-accent-blue" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Module</div>
                    <div className="text-sm font-medium text-card-foreground">{moduleCount} Stück</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-3">
                  <Palette className="h-4 w-4 text-accent-blue" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Material</div>
                    <div className="text-sm font-medium text-card-foreground capitalize">{config.material}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-3">
                  <div
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: colorHexMap[config.accentColor] }}
                  />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Akzentfarbe</div>
                    <div className="text-sm font-medium text-card-foreground capitalize">{config.accentColor}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Articles by Category */}
          <div className="space-y-3">
            {Object.entries(groupedByCategory).map(([category, items]) => {
              const categoryTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
              const isExpanded = expandedCategories[category] !== false // Default expanded

              return (
                <div key={category} className="rounded-xl border border-border overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center gap-3 bg-secondary/30 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                      {categoryIcons[category] || <Tag className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-card-foreground">
                        {categoryLabels[category] || category}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({items.length} {items.length === 1 ? "Position" : "Positionen"})
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-card-foreground mr-2">
                      {formatPrice(categoryTotal)} €
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div
                          key={item.product.artNr}
                          onMouseEnter={() => setHoveredArticle(item.product.artNr)}
                          onMouseLeave={() => setHoveredArticle(null)}
                          className={cn(
                            "relative p-4 transition-all",
                            hoveredArticle === item.product.artNr ? "bg-accent-blue/5" : "bg-background/50",
                          )}
                        >
                          {/* Hover indicator */}
                          <div
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all",
                              hoveredArticle === item.product.artNr ? "h-12 bg-accent-blue" : "h-0",
                            )}
                          />

                          <div className="flex items-start gap-4 pl-2">
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={cn(
                                    "font-medium transition-colors",
                                    hoveredArticle === item.product.artNr ? "text-accent-blue" : "text-card-foreground",
                                  )}
                                >
                                  {item.product.name}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-blue/10 px-1.5 text-[10px] font-bold text-accent-blue">
                                    ×{item.quantity}
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-mono text-[10px] text-muted-foreground">
                                  {item.product.artNr}
                                </span>
                                {item.product.size && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                                    <Ruler className="h-2.5 w-2.5" />
                                    {item.product.size} cm
                                  </span>
                                )}
                                {item.product.color && (
                                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full ring-1 ring-border"
                                      style={{ backgroundColor: colorHexMap[item.product.color] }}
                                    />
                                    {item.product.color}
                                  </span>
                                )}
                                {item.product.variant && (
                                  <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                                    {item.product.variant}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            {onUpdateQuantity && (
                              <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.artNr, Math.max(0, item.quantity - 1))}
                                  className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary transition-colors"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.artNr, item.quantity + 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Price & Actions */}
                            <div className="text-right shrink-0">
                              <div
                                className={cn(
                                  "text-base font-bold transition-colors",
                                  hoveredArticle === item.product.artNr ? "text-accent-blue" : "text-card-foreground",
                                )}
                              >
                                {formatPrice(item.subtotal)} €
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-[10px] text-muted-foreground">
                                  je {formatPrice(item.product.price)} €
                                </div>
                              )}
                              {onRemoveItem && (
                                <button
                                  onClick={() => onRemoveItem(item.product.artNr)}
                                  className="mt-1 inline-flex items-center gap-1 text-[10px] text-destructive hover:underline"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                  Entfernen
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Price Summary */}
          <div className="rounded-xl border border-dashed border-border bg-gradient-to-br from-secondary/30 to-transparent p-4 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-accent-blue" />
              <span className="text-sm font-medium text-card-foreground">Preisübersicht</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Zwischensumme ({totalItems} Teile)</span>
                <span className="text-card-foreground font-medium">{formatPrice(nettoPrice)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Percent className="h-3 w-3" />
                  MwSt. ({mwstRate}%)
                </span>
                <span className="text-card-foreground">{formatPrice(mwstPrice)} €</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-baseline">
                <span className="text-base font-medium text-card-foreground">Gesamtpreis</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent-blue">{formatPrice(bruttoPrice)} €</div>
                  <div className="text-[10px] text-muted-foreground">inkl. MwSt.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowERPExport(true)}
              className="flex items-center gap-2 rounded-xl border border-accent-blue bg-accent-blue/10 px-4 py-2.5 text-sm font-medium text-accent-blue hover:bg-accent-blue/20 transition-colors"
            >
              <Database className="h-4 w-4" />
              Warenwirtschaft Export
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Printer className="h-4 w-4" />
              Drucken
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Teilen
            </button>
          </div>
        </>
      )}

      {/* ERP Export Dialog */}
      <ERPExportDialog
        isOpen={showERPExport}
        onClose={() => setShowERPExport(false)}
        shoppingList={shoppingList}
        configMetadata={configMetadata}
      />
    </div>
  )
}
