"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import type { ShoppingItem } from "@/lib/shopping-item"
import { cn } from "@/lib/utils"
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Eraser,
  Download,
  FileJson,
  FileSpreadsheet,
  Database,
  Grid3X3,
  Palette,
  Pin,
  PinOff,
} from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"
import { ERPExportDialog } from "./erp-export-dialog"

interface ConfiguratorPanelProps {
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
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  shoppingList: ShoppingItem[]
  price: string
  showShoppingList: boolean
  onToggleShoppingList: () => void
  showMobilePanel?: boolean
  onCloseMobilePanel?: () => void
  onCollapseSidePanel?: () => void
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
  { id: "ohne-seitenwaende" as const, label: "Ohne Seiten", icon: "open" },
  { id: "ohne-rueckwand" as const, label: "Ohne Rück", icon: "shelf" },
  { id: "mit-rueckwand" as const, label: "Mit Rück", icon: "back" },
  { id: "mit-tueren" as const, label: "Türen", icon: "doors" },
  { id: "mit-klapptuer" as const, label: "Klappe", icon: "flip" },
  { id: "mit-doppelschublade" as const, label: "Schublade", icon: "drawer" },
  { id: "abschliessbare-tueren" as const, label: "Abschl.", icon: "lock" },
]

const materialOptions = [
  { id: "metall" as const, label: "Metall" },
  { id: "glas" as const, label: "Glas" },
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
  onUpdateConfig,
  shoppingList,
  price,
  showShoppingList,
  onToggleShoppingList,
  showMobilePanel = false,
  onCloseMobilePanel,
  onCollapseSidePanel,
}: ConfiguratorPanelProps) {
  const [activeTab, setActiveTab] = useState<"raster" | "farben" | "warenkorb">("raster")
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showERPExport, setShowERPExport] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const generateConfigId = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `SC-${timestamp}-${random}`.toUpperCase()
  }

  const totalWidth = config.colWidths?.reduce((sum, w) => sum + w, 0) ?? 0
  const totalHeight = config.rowHeights?.reduce((sum, h) => sum + h, 0) ?? 0
  const filledCells = config.grid?.flat().filter((c) => c.type !== "empty") ?? []
  const moduleCount = filledCells.length

  const nettoPrice = shoppingList.reduce((sum, item) => sum + item.subtotal, 0)
  const mwstPrice = nettoPrice * 0.19
  const bruttoPrice = nettoPrice + mwstPrice
  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0)

  const configMetadata = {
    configurationId: generateConfigId(),
    shelfDimensions: {
      width: totalWidth,
      height: totalHeight,
      depth: 40,
      unit: "cm" as const,
    },
  }

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
          spaltenBreiten: config.colWidths,
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
          breite: config.colWidths[cell.col],
          hoehe: config.rowHeights[cell.row],
        })),
      },
      artikelliste: shoppingList.map((item) => ({
        artikelNummer: item.product.artNr,
        bezeichnung: item.product.name,
        kategorie: item.product.category,
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

    let csv = "SIMPLI CONNECT KONFIGURATION\n"
    csv += `Konfigurations-ID;${configId}\n`
    csv += `Erstellt am;${timestamp}\n`
    csv += `Gesamtbreite;${totalWidth} cm\n`
    csv += `Gesamthöhe;${totalHeight} cm\n`
    csv += "\nARTIKELLISTE\n"
    csv += "Art.Nr;Bezeichnung;Größe;Farbe;Einzelpreis;Menge;Gesamtpreis\n"

    shoppingList.forEach((item) => {
      csv += `${item.product.artNr};`
      csv += `${item.product.name};`
      csv += `${item.product.size};`
      csv += `${item.product.color || "-"};`
      csv += `${item.product.price.toFixed(2).replace(".", ",")};`
      csv += `${item.quantity};`
      csv += `${item.subtotal.toFixed(2).replace(".", ",")}\n`
    })

    csv += `\nNetto;${nettoPrice.toFixed(2).replace(".", ",")} EUR\n`
    csv += `MwSt. (19%);${mwstPrice.toFixed(2).replace(".", ",")} EUR\n`
    csv += `Brutto;${bruttoPrice.toFixed(2).replace(".", ",")} EUR\n`

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simpli-config-${configId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedCellData = selectedCell ? config.grid[selectedCell.row]?.[selectedCell.col] : null

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-card lg:w-[360px]",
        "fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto",
        showMobilePanel ? "flex" : "hidden lg:flex",
      )}
    >
      {/* Header with Pin */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="font-semibold text-card-foreground">Konfigurator</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              isPinned ? "bg-accent-blue/10 text-accent-blue" : "text-muted-foreground hover:bg-secondary",
            )}
            title={isPinned ? "Panel lösen" : "Panel fixieren"}
          >
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </button>
          <button
            onClick={onCloseMobilePanel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("raster")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeTab === "raster"
              ? "border-b-2 border-accent-blue text-accent-blue"
              : "text-muted-foreground hover:text-card-foreground",
          )}
        >
          <Grid3X3 className="h-4 w-4" />
          Raster
        </button>
        <button
          onClick={() => setActiveTab("farben")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeTab === "farben"
              ? "border-b-2 border-accent-blue text-accent-blue"
              : "text-muted-foreground hover:text-card-foreground",
          )}
        >
          <Palette className="h-4 w-4" />
          Farben
        </button>
        <button
          onClick={() => setActiveTab("warenkorb")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative",
            activeTab === "warenkorb"
              ? "border-b-2 border-accent-blue text-accent-blue"
              : "text-muted-foreground hover:text-card-foreground",
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          Liste
          {totalItems > 0 && (
            <span className="absolute -top-1 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-blue px-1 text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* RASTER TAB */}
        {activeTab === "raster" && (
          <div className="p-4 space-y-6">
            {/* Quick Size Info */}
            <div className="flex items-center justify-center gap-4 p-3 bg-secondary/50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">{totalWidth}</div>
                <div className="text-xs text-muted-foreground">cm breit</div>
              </div>
              <div className="text-2xl text-muted-foreground">×</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">{totalHeight}</div>
                <div className="text-xs text-muted-foreground">cm hoch</div>
              </div>
            </div>

            {/* Columns Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">Spalten</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => config.columns > 1 && onResizeGrid(config.rows, config.columns - 1)}
                    disabled={config.columns <= 1}
                    className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{config.columns}</span>
                  <button
                    onClick={() => config.columns < 6 && onResizeGrid(config.rows, config.columns + 1)}
                    disabled={config.columns >= 6}
                    className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Column Widths */}
              <div className="flex gap-2">
                {config.colWidths?.map((width, idx) => {
                  const hasModules = config.grid?.some((row) => row[idx]?.type && row[idx].type !== "empty")
                  return (
                    <button
                      key={idx}
                      onClick={() => !hasModules && onSetColumnWidth(idx, width === 75 ? 38 : 75)}
                      disabled={hasModules}
                      className={cn(
                        "flex-1 py-2 text-xs rounded-lg border transition-all",
                        hasModules
                          ? "opacity-40 cursor-not-allowed bg-secondary/30 border-border"
                          : width === 75
                            ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                            : "bg-secondary border-border hover:bg-control-hover",
                      )}
                    >
                      {width}cm
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Rows Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">Reihen</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => config.rows > 1 && onResizeGrid(config.rows - 1, config.columns)}
                    disabled={config.rows <= 1}
                    className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{config.rows}</span>
                  <button
                    onClick={() => config.rows < 6 && onResizeGrid(config.rows + 1, config.columns)}
                    disabled={config.rows >= 6}
                    className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">Alle Reihen: 38cm Höhe</div>
            </div>

            {/* Material */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-card-foreground">Material</span>
              <div className="flex gap-2">
                {materialOptions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onUpdateConfig({ shelfMaterial: m.id })}
                    className={cn(
                      "flex-1 py-2.5 text-sm rounded-lg border transition-all",
                      config.shelfMaterial === m.id
                        ? "bg-accent-blue/10 border-accent-blue text-accent-blue font-medium"
                        : "bg-secondary border-border hover:bg-control-hover",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Module Types (for Mobile) */}
            <div className="space-y-3 lg:hidden">
              <span className="text-sm font-medium text-card-foreground">Module</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border p-2",
                    selectedTool === "empty"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:bg-secondary",
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
                      "flex flex-col items-center justify-center gap-1 rounded-lg border p-2",
                      selectedTool === module.id
                        ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                        : "border-border hover:bg-secondary",
                    )}
                  >
                    <ModulePreviewSVG type={module.id} />
                    <span className="text-[10px] leading-tight text-center">{module.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FARBEN TAB */}
        {activeTab === "farben" && (
          <div className="p-4 space-y-6">
            {/* Base Color */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-card-foreground">Grundfarbe</span>
              <div className="flex gap-3">
                {baseColors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onUpdateConfig({ baseColor: c.id })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all flex-1",
                      config.baseColor === c.id
                        ? "border-accent-blue bg-accent-blue/5"
                        : "border-border hover:border-muted-foreground",
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg border border-border" style={{ backgroundColor: c.color }} />
                    <span className="text-xs">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-card-foreground">Akzentfarbe</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateConfig({ accentColor: "none" })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    config.accentColor === "none"
                      ? "border-accent-blue bg-accent-blue/5"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  <div className="h-8 w-8 rounded-lg border border-border flex items-center justify-center bg-secondary">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs">Keine</span>
                </button>
                {specialColors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onUpdateConfig({ accentColor: c.id })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      config.accentColor === c.id
                        ? "border-accent-blue bg-accent-blue/5"
                        : "border-transparent hover:border-muted-foreground",
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg border border-border" style={{ backgroundColor: c.color }} />
                    <span className="text-xs">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Cell Color Editor */}
            {selectedCellData && selectedCellData.type !== "empty" && (
              <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    Modul R{selectedCell!.row + 1}C{selectedCell!.col + 1}
                  </span>
                  <button
                    onClick={() => {
                      onClearCell(selectedCell!.row, selectedCell!.col)
                      onSelectCell(null)
                    }}
                    className="text-xs text-destructive hover:underline flex items-center gap-1"
                  >
                    <Eraser className="h-3 w-3" />
                    Entfernen
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onUpdateCellColor(selectedCell!.row, selectedCell!.col, c.id)}
                      className={cn(
                        "h-9 w-9 rounded-lg border-2 transition-all",
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
            )}
          </div>
        )}

        {/* WARENKORB TAB */}
        {activeTab === "warenkorb" && (
          <div className="p-4 space-y-4">
            {shoppingList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">Noch keine Artikel</p>
                <p className="text-xs text-muted-foreground/70">Klicke auf das Regal um Module hinzuzufügen</p>
              </div>
            ) : (
              <>
                {/* Compact Product List */}
                <div className="space-y-1">
                  <div className="grid grid-cols-12 gap-2 px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase">
                    <div className="col-span-6">Artikel</div>
                    <div className="col-span-2 text-center">Anz.</div>
                    <div className="col-span-4 text-right">Preis</div>
                  </div>

                  {shoppingList.map((item, index) => (
                    <div
                      key={item.product.artNr}
                      className={cn(
                        "grid grid-cols-12 gap-2 px-2 py-2 rounded-lg text-sm",
                        index % 2 === 0 ? "bg-secondary/30" : "",
                      )}
                    >
                      <div className="col-span-6 flex items-center gap-2 min-w-0">
                        {item.product.color && (
                          <span
                            className="h-3 w-3 rounded-full ring-1 ring-border shrink-0"
                            style={{ backgroundColor: colorHexMap[item.product.color] }}
                          />
                        )}
                        <span className="truncate text-card-foreground">{item.product.name}</span>
                        {item.product.size && (
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.product.size}cm</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center justify-center h-5 min-w-5 rounded bg-accent-blue/10 text-accent-blue text-xs font-bold px-1">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="col-span-4 text-right font-medium text-card-foreground">
                        {item.subtotal.toFixed(2).replace(".", ",")} €
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Netto</span>
                    <span className="text-card-foreground">{nettoPrice.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MwSt. 19%</span>
                    <span className="text-card-foreground">{mwstPrice.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium text-card-foreground">Brutto</span>
                    <span className="text-xl font-bold text-accent-blue">
                      {bruttoPrice.toFixed(2).replace(".", ",")} €
                    </span>
                  </div>
                </div>

                {/* Export */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className="flex w-full items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-accent-blue" />
                      <span className="text-sm font-medium">Export</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{showExportOptions ? "▲" : "▼"}</span>
                  </button>

                  {showExportOptions && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        onClick={exportToJSON}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-accent-blue hover:bg-accent-blue/5 transition-all"
                      >
                        <FileJson className="h-5 w-5 text-accent-blue" />
                        <span className="text-xs">JSON</span>
                      </button>
                      <button
                        onClick={exportToCSV}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-accent-blue hover:bg-accent-blue/5 transition-all"
                      >
                        <FileSpreadsheet className="h-5 w-5 text-accent-blue" />
                        <span className="text-xs">CSV</span>
                      </button>
                      <button
                        onClick={() => setShowERPExport(true)}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-accent-blue hover:bg-accent-blue/5 transition-all"
                      >
                        <Database className="h-5 w-5 text-accent-blue" />
                        <span className="text-xs">ERP</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-muted-foreground">
            {moduleCount} Module · {totalItems} Teile
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-card-foreground">{price} €</div>
            <div className="text-xs text-muted-foreground">netto</div>
          </div>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-blue py-3 font-semibold text-white transition-all hover:bg-accent-blue/90 disabled:opacity-50"
          disabled={shoppingList.length === 0}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>In den Warenkorb</span>
        </button>
      </div>

      <ERPExportDialog
        isOpen={showERPExport}
        onClose={() => setShowERPExport(false)}
        shoppingList={shoppingList}
        configMetadata={configMetadata}
      />
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
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="4" y1="12" x2="20" y2="12" />
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
          <circle cx="12" cy="17" r="1" fill="currentColor" />
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
          <rect x="8" y="10" width="3" height="4" rx="0.5" />
          <rect x="13" y="10" width="3" height="4" rx="0.5" />
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
        </svg>
      )
  }
}
