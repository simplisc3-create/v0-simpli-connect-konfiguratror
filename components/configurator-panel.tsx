"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell, ShoppingItem } from "./shelf-configurator"
import { cn } from "@/lib/utils"
import { ShoppingCart, ChevronDown, ChevronRight, X, Plus, Minus, Eraser, List } from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"

type Props = {
  config: ShelfConfig
  selectedTool: GridCell["type"] | null
  selectedCell: { row: number; col: number } | null
  shoppingList: ShoppingItem[]
  totalPrice: number
  showShoppingList: boolean
  onToolSelect: (tool: GridCell["type"] | null) => void
  onConfigUpdate: (updates: Partial<ShelfConfig>) => void
  onCellColorUpdate: (row: number, col: number, color: GridCell["color"]) => void
  onClearCell: (row: number, col: number) => void
  onToggleShoppingList: () => void
  onAddCellToColumn: (col: number) => void
  onRemoveCellFromColumn: (col: number) => void
  onAddColumnLeft: () => void
  onAddColumnRight: () => void
  onRemoveColumn: (col: number) => void
  isMobile?: boolean
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

function ModulePreviewSVG({ type }: { type: GridCell["type"] }) {
  const baseStyle = "stroke-current"
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8">
      <rect x="2" y="2" width="36" height="36" fill="none" className={baseStyle} strokeWidth="2" rx="2" />
      {type === "mit-rueckwand" && <rect x="6" y="6" width="28" height="28" fill="currentColor" opacity="0.3" />}
      {type === "mit-tueren" && (
        <>
          <line x1="20" y1="6" x2="20" y2="34" className={baseStyle} strokeWidth="2" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
          <circle cx="28" cy="20" r="2" fill="currentColor" />
        </>
      )}
      {type === "mit-klapptuer" && (
        <>
          <line x1="6" y1="20" x2="34" y2="20" className={baseStyle} strokeWidth="2" />
          <circle cx="20" cy="14" r="2" fill="currentColor" />
        </>
      )}
      {type === "mit-doppelschublade" && (
        <>
          <line x1="6" y1="20" x2="34" y2="20" className={baseStyle} strokeWidth="2" />
          <line x1="10" y1="12" x2="30" y2="12" className={baseStyle} strokeWidth="2" />
          <line x1="10" y1="28" x2="30" y2="28" className={baseStyle} strokeWidth="2" />
        </>
      )}
      {type === "abschliessbare-tueren" && (
        <>
          <line x1="20" y1="6" x2="20" y2="34" className={baseStyle} strokeWidth="2" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
          <circle cx="28" cy="20" r="2" fill="currentColor" />
          <rect x="16" y="24" width="8" height="4" fill="currentColor" rx="1" />
        </>
      )}
    </svg>
  )
}

export function ConfiguratorPanel({
  config,
  selectedTool,
  selectedCell,
  shoppingList,
  totalPrice,
  showShoppingList,
  onToolSelect,
  onConfigUpdate,
  onCellColorUpdate,
  onClearCell,
  onToggleShoppingList,
  onAddCellToColumn,
  onRemoveCellFromColumn,
  onAddColumnLeft,
  onAddColumnRight,
  onRemoveColumn,
  isMobile = false,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>("grid")

  const getModuleLabel = (type: GridCell["type"]) => {
    if (type === "empty") return ""
    const found = moduleTypes.find((m) => m.id === type)
    return found?.label || type
  }

  const getModuleShortLabel = (type: GridCell["type"]) => {
    switch (type) {
      case "ohne-seitenwaende":
        return "Offen"
      case "ohne-rueckwand":
        return "O.Rück"
      case "mit-rueckwand":
        return "M.Rück"
      case "mit-tueren":
        return "Türen"
      case "mit-klapptuer":
        return "Klapp"
      case "mit-doppelschublade":
        return "Schub"
      case "abschliessbare-tueren":
        return "Schloss"
      default:
        return ""
    }
  }

  // Get selected cell data from new structure
  const selectedCellData = selectedCell
    ? config.columns[selectedCell.col]?.cells.find((c) => c.row === selectedCell.row)
    : null

  const maxCellsInColumn = Math.max(...config.columns.map((c) => c.cells.length))
  const priceFormatted = totalPrice.toFixed(2).replace(".", ",")

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        !isMobile && "bg-card/80 backdrop-blur-xl rounded-l-2xl border-l border-border/50",
      )}
    >
      {!isMobile && (
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h2 className="font-semibold text-card-foreground">Konfigurator</h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected cell editing */}
        {selectedCellData && selectedCellData.type !== "empty" && (
          <div className="rounded-lg border border-accent-blue/30 bg-accent-blue/10 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-card-foreground">
                Ausgewählte Zelle: Spalte {selectedCell!.col + 1}, Fach {selectedCell!.row + 1}
              </h3>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">{getModuleLabel(selectedCellData.type)}</p>
            <h4 className="mb-2 text-xs font-medium text-card-foreground">Farbe dieser Zelle:</h4>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onCellColorUpdate(selectedCell!.row, selectedCell!.col, color.id)}
                  className={cn(
                    "h-8 w-8 rounded border-2 transition-all",
                    selectedCellData.color === color.id
                      ? "border-primary ring-2 ring-ring ring-offset-1 ring-offset-background"
                      : "border-border hover:border-muted-foreground",
                  )}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Base color */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-foreground">Standardfarbe</h3>
          <div className="flex gap-2">
            {baseColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onConfigUpdate({ baseColor: color.id, accentColor: "none" })}
                className={cn(
                  "h-10 w-10 rounded border-2 transition-all",
                  config.baseColor === color.id && config.accentColor === "none"
                    ? "border-primary ring-2 ring-ring ring-offset-1 ring-offset-background"
                    : "border-border hover:border-muted-foreground",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Special colors */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-foreground">Sonderfarbe</h3>
          <div className="flex flex-wrap gap-2">
            {specialColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onConfigUpdate({ accentColor: color.id })}
                className={cn(
                  "h-10 w-10 rounded border-2 transition-all",
                  config.accentColor === color.id
                    ? "border-primary ring-2 ring-ring ring-offset-1 ring-offset-background"
                    : "border-border hover:border-muted-foreground",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Material */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-foreground">Bodenmaterial</h3>
          <div className="flex gap-2">
            {materialOptions.map((mat) => (
              <button
                key={mat.id}
                onClick={() => onConfigUpdate({ shelfMaterial: mat.id })}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm transition-all",
                  config.shelfMaterial === mat.id
                    ? "border-primary bg-secondary text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground",
                )}
              >
                {mat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column-based grid controls */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-card-foreground">Spalten & Fächer</h3>
          <p className="text-xs text-muted-foreground">
            Jede Spalte kann unabhängig erweitert werden. Fahre im 3D-View über die Spalten um Fächer hinzuzufügen.
          </p>

          {/* Add column buttons */}
          <div className="flex gap-2">
            <button
              onClick={onAddColumnLeft}
              disabled={config.columns.length >= 6}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Links
            </button>
            <button
              onClick={onAddColumnRight}
              disabled={config.columns.length >= 6}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Rechts
            </button>
          </div>

          {/* Column visualization */}
          <div className="flex gap-2">
            {config.columns.map((column, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-1">
                {/* Column header */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>{column.width}cm</span>
                  {config.columns.length > 1 && (
                    <button
                      onClick={() => onRemoveColumn(colIdx)}
                      className="text-destructive hover:text-destructive/80"
                      title="Spalte entfernen"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Add cell button on top */}
                <button
                  onClick={() => onAddCellToColumn(colIdx)}
                  disabled={column.cells.length >= 6}
                  className="flex items-center justify-center rounded border border-dashed border-green-500/50 py-1 text-green-500 hover:bg-green-500/10 disabled:opacity-30 transition-colors"
                  title="Fach hinzufügen"
                >
                  <Plus className="h-4 w-4" />
                </button>

                {/* Cells in column (reversed to show bottom at bottom) */}
                <div className="flex flex-col-reverse gap-1">
                  {column.cells.map((cell) => {
                    const isEmpty = cell.type === "empty"
                    const cellColor =
                      cell.color || (config.accentColor !== "none" ? config.accentColor : config.baseColor)
                    const bgColor = isEmpty ? "transparent" : colorHexMap[cellColor]
                    const isSelected = selectedCell?.row === cell.row && selectedCell?.col === colIdx

                    return (
                      <div
                        key={cell.id}
                        className={cn(
                          "relative flex items-center justify-center rounded border h-12 text-[9px] font-medium transition-all",
                          isEmpty ? "border-dashed border-border" : "border-solid border-muted",
                          isSelected && "ring-2 ring-accent-blue",
                        )}
                        style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                      >
                        {isEmpty ? (
                          <span className="text-muted-foreground">leer</span>
                        ) : (
                          <span
                            className={cn("text-center", cellColor === "weiss" ? "text-foreground" : "text-primary")}
                          >
                            {getModuleShortLabel(cell.type)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Remove cell button */}
                {column.cells.length > 1 && (
                  <button
                    onClick={() => onRemoveCellFromColumn(colIdx)}
                    className="flex items-center justify-center rounded border border-dashed border-destructive/50 py-1 text-destructive hover:bg-destructive/10 transition-colors"
                    title="Oberstes Fach entfernen"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Module types */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-foreground">Modul-Typen</h3>

          <button
            onClick={() => onToolSelect(selectedTool === "empty" ? null : "empty")}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border p-2 transition-all",
              selectedTool === "empty"
                ? "border-destructive bg-destructive/20 text-destructive"
                : "border-border text-muted-foreground hover:border-muted-foreground",
            )}
          >
            <Eraser className="h-4 w-4" />
            <span className="text-sm">Radierer</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {moduleTypes.map((module) => (
              <button
                key={module.id}
                onClick={() => onToolSelect(selectedTool === module.id ? null : module.id)}
                className={cn(
                  "flex flex-col items-center rounded-lg border p-2 transition-all",
                  selectedTool === module.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground",
                )}
              >
                <ModulePreviewSVG type={module.id} />
                <span className="mt-1 text-center text-[10px] leading-tight">{module.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shopping list */}
        <div className="space-y-2">
          <button
            onClick={onToggleShoppingList}
            className="flex w-full items-center gap-2 text-left text-card-foreground"
          >
            {showShoppingList ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <List className="h-4 w-4" />
            <span className="text-sm font-medium">Einkaufsliste ({shoppingList.length})</span>
          </button>

          {showShoppingList && (
            <div className="space-y-2">
              {shoppingList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Füge Module hinzu</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {shoppingList.map((item) => (
                    <div
                      key={item.product.artNr}
                      className="flex items-center justify-between rounded bg-secondary px-2 py-1.5 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-card-foreground truncate">{item.product.name}</div>
                        <div className="text-muted-foreground">
                          {item.quantity}x à {item.product.price.toFixed(2).replace(".", ",")} €
                        </div>
                      </div>
                      <div className="text-right font-medium text-card-foreground ml-2">
                        {item.subtotal.toFixed(2).replace(".", ",")} €
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price footer */}
      <div className="border-t border-border/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gesamtpreis</span>
          <span className="text-xl font-bold text-card-foreground">{priceFormatted} €</span>
        </div>
        <button className="mt-3 w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          In den Warenkorb
        </button>
      </div>
    </div>
  )
}
