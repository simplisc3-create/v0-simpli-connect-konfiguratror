"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell, ShoppingItem } from "./shelf-configurator"
import { cn } from "@/lib/utils"
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Minus,
  Eraser,
  List,
  Download,
  FileJson,
  FileSpreadsheet,
  Package,
  Ruler,
  Palette,
  Info,
  Sparkles,
  Tag,
  ArrowRight,
} from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"

type Props = {
  config: ShelfConfig
  selectedTool: GridCell["type"] | null
  selectedCell: { row: number; col: number } | null
  onSelectTool: (tool: GridCell["type"] | null) => void
  onSelectCell: (cell: { row: number; col: number } | null) => void
  onUpdateCellColor: (row: number, col: number, color: GridCell["color"]) => void
  onPlaceModule: (row: number, col: number, type: GridCell["type"]) => void
  onClearCell: (row: number, col: number) => void
  onResizeGrid: (rows: number, cols: number) => void
  onSetColumnWidth: (col: number, width: 75 | 38) => void
  onSetRowHeight: (row: number, height: 38 | 76) => void
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  shoppingList: ShoppingItem[]
  price: string
  showShoppingList: boolean
  onToggleShoppingList: () => void
  showMobilePanel?: boolean
  onCloseMobilePanel?: () => void
}

const baseColors = [
  { id: "weiss" as const, label: "Weiß", color: colorHexMap.weiss },
  { id: "schwarz" as const, label: "Schwarz", color: colorHexMap.schwarz },
]

const specialColors = [
  { id: "blau" as const, label: "Blau", color: colorHexMap.blau },
  { id: "gruen" as const, label: "Grün", color: colorHexMap.gruen },
  { id: "gelb" as const, label: "Gelb", color: colorHexMap.gelb },
  { id: "orange" as const, label: "Orange", color: colorHexMap.orange },
  { id: "rot" as const, label: "Rot", color: colorHexMap.rot },
]

const allColors = [...baseColors, ...specialColors]

const moduleTypes = [
  { id: "ohne-seitenwaende" as const, label: "ohne Seitenwände", icon: "open" },
  { id: "ohne-rueckwand" as const, label: "ohne Rückwand", icon: "shelf" },
  { id: "mit-rueckwand" as const, label: "mit Rückwand", icon: "back" },
  { id: "mit-tueren" as const, label: "mit Türen", icon: "doors" },
  { id: "mit-klapptuer" as const, label: "mit Klapptür", icon: "flip" },
  { id: "mit-doppelschublade" as const, label: "mit Doppelschublade", icon: "drawer" },
  { id: "abschliessbare-tueren" as const, label: "abschließbare Türen", icon: "lock" },
]

const materialOptions = [
  { id: "metall" as const, label: "Metall" },
  { id: "glas" as const, label: "Glas" },
  { id: "holz" as const, label: "Holz" },
]

const categoryLabels: Record<string, string> = {
  leiter: "Leitern",
  stangenset: "Stangensets",
  metallboden: "Metallböden",
  glasboden: "Glasböden",
  holzboden: "Holzböden",
  "schublade-tuer": "Schubladen & Türen",
  funktionswand: "Funktionswände",
}

export function ConfiguratorPanel({
  config,
  selectedTool,
  selectedCell,
  onSelectTool,
  onSelectCell,
  onUpdateCellColor,
  onPlaceModule,
  onClearCell,
  onResizeGrid,
  onSetColumnWidth,
  onSetRowHeight,
  onUpdateConfig,
  shoppingList,
  price,
  showShoppingList,
  onToggleShoppingList,
  showMobilePanel = true,
  onCloseMobilePanel,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>("grid")
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showConfigDetails, setShowConfigDetails] = useState(false)
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null)

  const generateConfigId = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `SC-${timestamp}-${random}`.toUpperCase()
  }

  const totalWidth = config.columnWidths.reduce((sum, w) => sum + w, 0)
  const totalHeight = config.rowHeights.reduce((sum, h) => sum + h, 0)
  const filledCells = config.grid.flat().filter((c) => c.type !== "empty")

  const groupedByCategory = shoppingList.reduce(
    (acc, item) => {
      const cat = item.product.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {} as Record<string, ShoppingItem[]>,
  )

  const moduleCount = filledCells.length

  const nettoPrice = shoppingList.reduce((sum, item) => sum + item.subtotal, 0)
  const mwstPrice = nettoPrice * 0.19
  const bruttoPrice = nettoPrice + mwstPrice
  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0)

  const exportToJSON = () => {
    const configId = generateConfigId()
    const exportData = {
      bestelldaten: {
        konfigurationsId: configId,
        erstelltAm: new Date().toISOString(),
        erstelltAmFormatiert: new Date().toLocaleString("de-DE"),
      },
      konfiguration: {
        abmessungen: {
          breiteGesamt: totalWidth,
          hoeheGesamt: totalHeight,
          spalten: config.columns,
          reihen: config.rows,
          spaltenBreiten: config.columnWidths,
          reihenHoehen: config.rowHeights,
          einheit: "cm",
        },
        material: {
          bodenmaterial: config.shelfMaterial,
          grundfarbe: config.baseColor,
          akzentfarbe: config.accentColor,
          fusstyp: config.footType,
        },
        module: filledCells.map((cell) => ({
          position: { reihe: cell.row + 1, spalte: cell.col + 1 },
          typ: cell.type,
          farbe: cell.color || (config.accentColor !== "none" ? config.accentColor : config.baseColor),
          breite: config.columnWidths[cell.col],
          hoehe: config.rowHeights[cell.row],
        })),
        rasterDaten: config.grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => ({
            id: cell.id,
            typ: cell.type,
            farbe: cell.color,
            position: { reihe: rowIdx + 1, spalte: colIdx + 1 },
          })),
        ),
      },
      artikelliste: shoppingList.map((item) => ({
        artikelNummer: item.product.artNr,
        bezeichnung: item.product.name,
        kategorie: item.product.category,
        kategorieBezeichnung: categoryLabels[item.product.category] || item.product.category,
        groesse: item.product.size,
        farbe: item.product.color || null,
        variante: item.product.variant || null,
        einzelpreis: item.product.price,
        menge: item.quantity,
        gesamtpreis: item.subtotal,
      })),
      preisübersicht: {
        zwischensumme: nettoPrice,
        mwstSatz: 19,
        mwstBetrag: mwstPrice,
        gesamtpreis: bruttoPrice,
        waehrung: "EUR",
      },
      statistik: {
        anzahlArtikel: shoppingList.length,
        anzahlEinzelteile: totalItems,
        anzahlModule: moduleCount,
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-config-${configId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const configId = generateConfigId()
    const timestamp = new Date().toLocaleString("de-DE")

    let csv = "SIMPLI CONNECT KONFIGURATION - WARENWIRTSCHAFT EXPORT\n"
    csv += `Konfigurations-ID;${configId}\n`
    csv += `Erstellt am;${timestamp}\n`
    csv += `Gesamtbreite;${totalWidth} cm\n`
    csv += `Gesamthöhe;${totalHeight} cm\n`
    csv += `Raster;${config.rows}x${config.columns}\n`
    csv += `Bodenmaterial;${config.shelfMaterial}\n`
    csv += `Grundfarbe;${config.baseColor}\n`
    csv += `Akzentfarbe;${config.accentColor}\n`
    csv += "\n"

    csv += "ARTIKELLISTE\n"
    csv += "Art.Nr;Bezeichnung;Kategorie;Größe;Farbe;Variante;Einzelpreis;Menge;Gesamtpreis\n"

    shoppingList.forEach((item) => {
      csv += `${item.product.artNr};`
      csv += `${item.product.name};`
      csv += `${categoryLabels[item.product.category] || item.product.category};`
      csv += `${item.product.size};`
      csv += `${item.product.color || "-"};`
      csv += `${item.product.variant || "-"};`
      csv += `${item.product.price.toFixed(2).replace(".", ",")};`
      csv += `${item.quantity};`
      csv += `${item.subtotal.toFixed(2).replace(".", ",")}\n`
    })

    csv += "\n"
    csv += "PREISÜBERSICHT\n"
    csv += `Netto;${nettoPrice.toFixed(2).replace(".", ",")} EUR\n`
    csv += `MwSt. (19%);${mwstPrice.toFixed(2).replace(".", ",")} EUR\n`
    csv += `Brutto;${bruttoPrice.toFixed(2).replace(".", ",")} EUR\n`

    csv += "\n"
    csv += "MODULÜBERSICHT\n"
    csv += "Position;Typ;Farbe;Breite;Höhe\n"
    filledCells.forEach((cell) => {
      const cellColor = cell.color || (config.accentColor !== "none" ? config.accentColor : config.baseColor)
      csv += `R${cell.row + 1}C${cell.col + 1};${cell.type};${cellColor};${config.columnWidths[cell.col]} cm;${config.rowHeights[cell.row]} cm\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-config-${configId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const selectedCellData = selectedCell ? config.grid[selectedCell.row]?.[selectedCell.col] : null

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-card lg:w-[380px]",
        "fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto",
        showMobilePanel ? "flex" : "hidden lg:flex",
      )}
    >
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
        <h2 className="font-semibold text-card-foreground">Konfiguration</h2>
        <button
          onClick={onCloseMobilePanel}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-control-hover"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Grid Size Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection("grid")}
            className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50"
          >
            {expandedSection === "grid" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Rastergröße</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {config.rows}×{config.columns}
            </span>
          </button>

          {expandedSection === "grid" && (
            <div className="px-4 pb-4 space-y-4">
              {/* Columns */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Spalten ({config.columns})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => config.columns > 1 && onResizeGrid(config.rows, config.columns - 1)}
                    disabled={config.columns <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-card-foreground transition-colors hover:bg-control-hover disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-gold transition-all"
                      style={{ width: `${(config.columns / 6) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => config.columns < 6 && onResizeGrid(config.rows, config.columns + 1)}
                    disabled={config.columns >= 6}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-card-foreground transition-colors hover:bg-control-hover disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Column widths */}
                <div className="flex gap-1 mt-2">
                  {config.columnWidths.map((width, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSetColumnWidth(idx, width === 75 ? 38 : 75)}
                      className={cn(
                        "flex-1 py-1.5 text-xs rounded-md border transition-colors",
                        width === 75
                          ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                          : "bg-secondary border-border text-muted-foreground hover:bg-control-hover",
                      )}
                    >
                      {width}cm
                    </button>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Reihen ({config.rows})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => config.rows > 1 && onResizeGrid(config.rows - 1, config.columns)}
                    disabled={config.rows <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-card-foreground transition-colors hover:bg-control-hover disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-gold transition-all"
                      style={{ width: `${(config.rows / 5) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => config.rows < 5 && onResizeGrid(config.rows + 1, config.columns)}
                    disabled={config.rows >= 5}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-card-foreground transition-colors hover:bg-control-hover disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Row heights */}
                <div className="flex flex-col gap-1 mt-2">
                  {config.rowHeights.map((height, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSetRowHeight(idx, height === 38 ? 76 : 38)}
                      className={cn(
                        "py-1.5 text-xs rounded-md border transition-colors",
                        height === 76
                          ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                          : "bg-secondary border-border text-muted-foreground hover:bg-control-hover",
                      )}
                    >
                      Reihe {idx + 1}: {height}cm {height === 76 ? "(doppelt)" : "(standard)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colors Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection("colors")}
            className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50"
          >
            {expandedSection === "colors" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Farben</span>
            <div className="ml-auto flex gap-1">
              <div
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: colorHexMap[config.baseColor] }}
              />
              {config.accentColor !== "none" && (
                <div
                  className="h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: colorHexMap[config.accentColor] }}
                />
              )}
            </div>
          </button>

          {expandedSection === "colors" && (
            <div className="px-4 pb-4 space-y-4">
              {/* Base Color */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grundfarbe</label>
                <div className="flex gap-2">
                  {baseColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onUpdateConfig({ baseColor: c.id })}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all",
                        config.baseColor === c.id
                          ? "border-accent-gold ring-2 ring-accent-gold/30"
                          : "border-border hover:border-muted-foreground",
                      )}
                      title={c.label}
                    >
                      <div className="h-6 w-6 rounded-md" style={{ backgroundColor: c.color }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Akzentfarbe</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onUpdateConfig({ accentColor: "none" })}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all",
                      config.accentColor === "none"
                        ? "border-accent-gold ring-2 ring-accent-gold/30"
                        : "border-border hover:border-muted-foreground",
                    )}
                    title="Keine"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {specialColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onUpdateConfig({ accentColor: c.id })}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all",
                        config.accentColor === c.id
                          ? "border-accent-gold ring-2 ring-accent-gold/30"
                          : "border-border hover:border-muted-foreground",
                      )}
                      title={c.label}
                    >
                      <div className="h-6 w-6 rounded-md" style={{ backgroundColor: c.color }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Material Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection("material")}
            className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50"
          >
            {expandedSection === "material" ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">Material</span>
            <span className="ml-auto text-xs text-muted-foreground capitalize">{config.shelfMaterial}</span>
          </button>

          {expandedSection === "material" && (
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                {materialOptions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onUpdateConfig({ shelfMaterial: m.id })}
                    className={cn(
                      "flex-1 py-2.5 text-sm rounded-lg border transition-all",
                      config.shelfMaterial === m.id
                        ? "bg-accent-blue/10 border-accent-blue text-accent-blue font-medium"
                        : "bg-secondary border-border text-muted-foreground hover:bg-control-hover",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Module Types (Mobile) */}
        <div className="border-b border-border lg:hidden">
          <button
            onClick={() => toggleSection("modules")}
            className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50"
          >
            {expandedSection === "modules" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Module</span>
          </button>

          {expandedSection === "modules" && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors",
                    selectedTool === "empty"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border text-muted-foreground hover:bg-control-hover",
                  )}
                >
                  <Eraser className="h-5 w-5" />
                  <span className="text-[10px]">Löschen</span>
                </button>
                {moduleTypes.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors",
                      selectedTool === module.id
                        ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                        : "border-border text-muted-foreground hover:bg-control-hover",
                    )}
                  >
                    <ModulePreviewSVG type={module.id} />
                    <span className="text-[10px] leading-tight text-center">{module.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Cell Editor */}
        {selectedCellData && selectedCellData.type !== "empty" && (
          <div className="border-b border-border p-4 bg-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-card-foreground">
                Modul R{selectedCell!.row + 1}C{selectedCell!.col + 1}
              </h4>
              <button
                onClick={() => {
                  onClearCell(selectedCell!.row, selectedCell!.col)
                  onSelectCell(null)
                }}
                className="flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <Eraser className="h-3 w-3" />
                Entfernen
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {moduleTypes.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => onPlaceModule(selectedCell!.row, selectedCell!.col, module.id)}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md border transition-colors",
                      selectedCellData.type === module.id
                        ? "bg-accent-blue/10 border-accent-blue text-accent-blue"
                        : "border-border text-muted-foreground hover:bg-control-hover",
                    )}
                  >
                    {module.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Modulfarbe</label>
                <div className="flex gap-1.5 flex-wrap">
                  {allColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onUpdateCellColor(selectedCell!.row, selectedCell!.col, c.id)}
                      className={cn(
                        "h-7 w-7 rounded-md border-2 transition-all",
                        selectedCellData.color === c.id
                          ? "border-accent-blue ring-2 ring-accent-blue/30"
                          : "border-transparent hover:border-muted-foreground",
                      )}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-border">
          <button
            onClick={onToggleShoppingList}
            className="group flex w-full items-center gap-3 p-4 text-left text-card-foreground transition-all hover:bg-gradient-to-r hover:from-secondary/80 hover:to-transparent"
          >
            {showShoppingList ? (
              <ChevronDown className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue transition-all group-hover:bg-accent-blue group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent-blue/25">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold">Warenkorb</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {shoppingList.length} {shoppingList.length === 1 ? "Artikel" : "Artikel"} · {totalItems} Teile
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-accent-blue">{price} €</div>
              <div className="text-[10px] text-muted-foreground">netto</div>
            </div>
          </button>

          {showShoppingList && (
            <div className="px-4 pb-4 space-y-4">
              {shoppingList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Dein Warenkorb ist leer</p>
                  <p className="text-xs text-muted-foreground/70">Klicke auf das Regal um Module hinzuzufügen</p>
                </div>
              ) : (
                <>
                  {/* Configuration Summary Card */}
                  <div className="group rounded-xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-4 transition-all hover:border-accent-blue/30 hover:shadow-lg hover:shadow-accent-blue/5">
                    <button
                      onClick={() => setShowConfigDetails(!showConfigDetails)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue transition-colors group-hover:bg-accent-blue/20">
                        <Info className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-card-foreground flex-1">Konfigurationsdetails</span>
                      {showConfigDetails ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {showConfigDetails && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2.5">
                          <Ruler className="h-4 w-4 text-accent-blue" />
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Abmessungen</div>
                            <div className="text-sm font-medium text-card-foreground">
                              {totalWidth} × {totalHeight} cm
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2.5">
                          <Package className="h-4 w-4 text-accent-blue" />
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Raster</div>
                            <div className="text-sm font-medium text-card-foreground">
                              {config.rows} × {config.columns}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2.5">
                          <Palette className="h-4 w-4 text-accent-blue" />
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Material</div>
                            <div className="text-sm font-medium text-card-foreground capitalize">
                              {config.shelfMaterial}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2.5">
                          <List className="h-4 w-4 text-accent-blue" />
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Module</div>
                            <div className="text-sm font-medium text-card-foreground">{moduleCount} Stück</div>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center gap-3 rounded-lg bg-background/50 p-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-5 w-5 rounded-md border border-border"
                              style={{ backgroundColor: colorHexMap[config.baseColor] }}
                            />
                            <span className="text-xs text-muted-foreground">Basis</span>
                          </div>
                          {config.accentColor !== "none" && (
                            <>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-5 w-5 rounded-md border border-border"
                                  style={{ backgroundColor: colorHexMap[config.accentColor] }}
                                />
                                <span className="text-xs text-muted-foreground">Akzent</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grouped Articles by Category */}
                  <div className="space-y-4">
                    {Object.entries(groupedByCategory).map(([category, items]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-3 w-3 text-accent-blue" />
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {categoryLabels[category] || category}
                          </h4>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">{items.length}</span>
                        </div>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.product.artNr}
                              onMouseEnter={() => setHoveredArticle(item.product.artNr)}
                              onMouseLeave={() => setHoveredArticle(null)}
                              className={cn(
                                "group relative rounded-xl border p-3 transition-all duration-200 cursor-default",
                                hoveredArticle === item.product.artNr
                                  ? "border-accent-blue/50 bg-gradient-to-r from-accent-blue/5 to-transparent shadow-lg shadow-accent-blue/10 scale-[1.01]"
                                  : "border-border bg-secondary/30 hover:border-border/80",
                              )}
                            >
                              {/* Hover indicator line */}
                              <div
                                className={cn(
                                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200",
                                  hoveredArticle === item.product.artNr ? "h-8 bg-accent-blue" : "h-0 bg-transparent",
                                )}
                              />

                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0 pl-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "font-medium transition-colors",
                                        hoveredArticle === item.product.artNr
                                          ? "text-accent-blue"
                                          : "text-card-foreground",
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
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
                                      {item.product.artNr}
                                    </span>
                                    {item.product.size && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5">
                                        {item.product.size} cm
                                      </span>
                                    )}
                                    {item.product.color && (
                                      <span className="inline-flex items-center gap-1.5 rounded-md bg-background/80 px-1.5 py-0.5">
                                        <span
                                          className="h-2.5 w-2.5 rounded-full ring-1 ring-border"
                                          style={{ backgroundColor: colorHexMap[item.product.color] }}
                                        />
                                        {item.product.color}
                                      </span>
                                    )}
                                    {item.product.variant && (
                                      <span className="rounded-md bg-background/80 px-1.5 py-0.5">
                                        {item.product.variant}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div
                                    className={cn(
                                      "text-sm font-bold transition-colors",
                                      hoveredArticle === item.product.artNr
                                        ? "text-accent-blue"
                                        : "text-card-foreground",
                                    )}
                                  >
                                    {item.subtotal.toFixed(2).replace(".", ",")} €
                                  </div>
                                  {item.quantity > 1 && (
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                      je {item.product.price.toFixed(2).replace(".", ",")} €
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Premium Price Summary */}
                  <div className="rounded-xl border border-border bg-gradient-to-br from-card to-secondary/30 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zwischensumme</span>
                      <span className="text-card-foreground font-medium">
                        {nettoPrice.toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MwSt. (19%)</span>
                      <span className="text-card-foreground">{mwstPrice.toFixed(2).replace(".", ",")} €</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-card-foreground">Gesamtpreis</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent-blue">
                          {bruttoPrice.toFixed(2).replace(".", ",")} €
                        </div>
                        <div className="text-[10px] text-muted-foreground">inkl. MwSt.</div>
                      </div>
                    </div>
                  </div>

                  {/* Export Options for Warenwirtschaft */}
                  <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 transition-all hover:border-accent-blue/30 hover:bg-secondary/30">
                    <button
                      onClick={() => setShowExportOptions(!showExportOptions)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                        <Download className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-card-foreground">Export für Warenwirtschaft</span>
                        <p className="text-[10px] text-muted-foreground">JSON oder CSV für ERP-Systeme</p>
                      </div>
                      {showExportOptions ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {showExportOptions && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          onClick={exportToJSON}
                          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent-blue hover:shadow-lg hover:shadow-accent-blue/10 hover:scale-[1.02]"
                        >
                          <FileJson className="h-6 w-6 text-accent-blue transition-transform group-hover:scale-110" />
                          <span className="text-sm font-medium text-card-foreground">JSON</span>
                          <span className="text-[10px] text-muted-foreground">Strukturiert</span>
                        </button>
                        <button
                          onClick={exportToCSV}
                          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent-blue hover:shadow-lg hover:shadow-accent-blue/10 hover:scale-[1.02]"
                        >
                          <FileSpreadsheet className="h-6 w-6 text-accent-blue transition-transform group-hover:scale-110" />
                          <span className="text-sm font-medium text-card-foreground">CSV</span>
                          <span className="text-[10px] text-muted-foreground">Excel-kompatibel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-gradient-to-t from-card to-card/95 p-4">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Gesamtpreis</span>
            <div className="text-sm text-muted-foreground">(netto)</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-card-foreground">{price} €</div>
            <div className="text-xs text-muted-foreground">{bruttoPrice.toFixed(2).replace(".", ",")} € brutto</div>
          </div>
        </div>
        <button
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent-blue py-4 font-semibold uppercase tracking-wide text-white transition-all hover:shadow-xl hover:shadow-accent-blue/30 hover:scale-[1.02] active:scale-[0.98] md:py-3.5"
          disabled={shoppingList.length === 0}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span>In den Warenkorb</span>
          <Sparkles className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  )
}

function ModulePreviewSVG({ type }: { type: string }) {
  const size = 20
  switch (type) {
    case "ohne-seitenwaende":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" strokeDasharray="4 2" />
        </svg>
      )
    case "ohne-rueckwand":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4v16M20 4v16M4 20h16M4 4h16" />
        </svg>
      )
    case "mit-rueckwand":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" fill="currentColor" fillOpacity="0.2" />
        </svg>
      )
    case "mit-tueren":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
        </svg>
      )
    case "mit-klapptuer":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="4" y1="14" x2="20" y2="14" />
          <circle cx="12" cy="9" r="1" fill="currentColor" />
        </svg>
      )
    case "mit-doppelschublade":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="10" y1="8" x2="14" y2="8" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      )
    case "abschliessbare-tueren":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}
