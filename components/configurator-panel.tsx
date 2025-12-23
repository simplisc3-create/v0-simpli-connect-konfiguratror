"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell, ShoppingItem } from "./shelf-configurator"
import type { OptimizationSuggestion, BuyingPackage } from "@/lib/shopping-optimizer"
import { DraggableModule } from "./draggable-module"
import { DroppableCell } from "./droppable-cell"
import { cn } from "@/lib/utils"
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Minus,
  Eraser,
  Lightbulb,
  GripVertical,
  Package,
  Check,
} from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"

type Props = {
  config: ShelfConfig
  selectedTool: GridCell["type"] | null
  selectedCell: { row: number; col: number } | null
  onSelectTool: (tool: GridCell["type"] | null) => void
  onSelectCell: (cell: { row: number; col: number } | null) => void
  onUpdateCellColor: (row: number, col: number, color: GridCell["color"]) => void
  onPlaceModule: (row: number, col: number, type: GridCell["type"], color?: GridCell["color"]) => void
  onClearCell: (row: number, col: number) => void
  onResizeGrid: (rows: number, cols: number) => void
  onSetColumnWidth: (col: number, width: 75 | 38) => void
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  onDrop: (row: number, col: number, type: GridCell["type"], color?: GridCell["color"]) => void
  shoppingList: ShoppingItem[]
  price: string
  suggestions: OptimizationSuggestion[]
  optimalPackages?: BuyingPackage[]
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
  onDrop,
  shoppingList,
  price,
  suggestions,
  optimalPackages = [],
  showShoppingList,
  onToggleShoppingList,
  showMobilePanel = true,
  onCloseMobilePanel,
}: Props) {
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showPackages, setShowPackages] = useState(true)

  const handleCellClick = (row: number, col: number) => {
    if (selectedTool === "empty") {
      onClearCell(row, col)
      onSelectCell(null)
    } else if (selectedTool) {
      onPlaceModule(row, col, selectedTool)
      onSelectCell({ row, col })
    } else {
      const cell = config.grid[row]?.[col]
      if (cell?.type !== "empty") {
        onSelectCell({ row, col })
      }
    }
  }

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

  const selectedCellData = selectedCell ? config.grid[selectedCell.row]?.[selectedCell.col] : null

  const getPriorityBadge = (priority: BuyingPackage["priority"]) => {
    switch (priority) {
      case "essential":
        return { label: "Pflicht", className: "bg-[var(--simpli-blue)] text-primary" }
      case "recommended":
        return { label: "Empfohlen", className: "bg-[var(--simpli-success)] text-primary" }
      case "optional":
        return { label: "Optional", className: "bg-muted text-muted-foreground" }
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col border-border bg-card",
        "fixed inset-x-0 bottom-0 top-14 z-30 border-t transition-transform duration-300 lg:relative lg:z-0 lg:top-0 lg:w-96 lg:translate-y-0 lg:border-l lg:border-t-0",
        showMobilePanel ? "translate-y-0" : "translate-y-full lg:translate-y-0",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <h2 className="font-semibold text-card-foreground">Konfigurator</h2>
        <button onClick={onCloseMobilePanel} className="rounded-full p-1 hover:bg-secondary">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Selected cell color picker */}
        {selectedCellData && selectedCellData.type !== "empty" && (
          <div className="border-b border-border bg-[var(--simpli-blue)]/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-card-foreground">
                Ausgewählte Zelle: R{selectedCell!.row + 1}C{selectedCell!.col + 1}
              </h3>
              <button
                onClick={() => onSelectCell(null)}
                className="rounded p-1 hover:bg-secondary"
                title="Auswahl aufheben"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">{getModuleLabel(selectedCellData.type)}</p>
            <h4 className="mb-2 text-xs font-medium text-card-foreground">Farbe dieser Zelle:</h4>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdateCellColor(selectedCell!.row, selectedCell!.col, color.id)}
                  className={cn(
                    "h-10 w-10 rounded border-2 transition-all",
                    selectedCellData.color === color.id
                      ? "border-primary ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : "border-border hover:border-muted-foreground",
                  )}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Base color selection */}
        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Farbe</h3>
          <div className="flex items-start gap-3">
            <div className="flex gap-2">
              {baseColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdateConfig({ baseColor: color.id, accentColor: "none" })}
                  className={cn(
                    "h-12 w-12 rounded border-2 transition-all md:h-10 md:w-10",
                    config.baseColor === color.id && config.accentColor === "none"
                      ? "border-primary ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : "border-border hover:border-muted-foreground",
                  )}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
            <div className="ml-auto flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--simpli-blue)] to-[var(--simpli-blue-hover)] md:h-14 md:w-14">
              <span className="text-3xl font-bold text-primary md:text-2xl">S</span>
            </div>
          </div>
        </div>

        {/* Special colors */}
        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Sonderfarbe</h3>
          <div className="flex flex-wrap gap-2">
            {specialColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onUpdateConfig({ accentColor: color.id })}
                className={cn(
                  "h-12 w-12 rounded border-2 transition-all md:h-10 md:w-10",
                  config.accentColor === color.id
                    ? "border-primary ring-2 ring-ring ring-offset-2 ring-offset-background"
                    : "border-border hover:border-muted-foreground",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Shelf material */}
        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Bodenmaterial</h3>
          <div className="flex gap-2">
            {materialOptions.map((mat) => (
              <button
                key={mat.id}
                onClick={() => onUpdateConfig({ shelfMaterial: mat.id })}
                className={cn(
                  "flex-1 rounded-lg border px-4 py-3 text-sm transition-all md:py-2",
                  config.shelfMaterial === mat.id
                    ? "border-[var(--simpli-blue)] bg-[var(--simpli-blue)]/20 text-[var(--simpli-blue)]"
                    : "border-border text-muted-foreground hover:border-muted-foreground",
                )}
              >
                {mat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid size controls */}
        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Regal-Größe</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-sm text-muted-foreground">Reihen:</span>
              <button
                onClick={() => config.rows > 1 && onResizeGrid(config.rows - 1, config.columns)}
                className="rounded bg-secondary p-2 hover:bg-accent active:bg-accent"
              >
                <Minus className="h-5 w-5 text-muted-foreground" />
              </button>
              <span className="w-8 text-center text-card-foreground">{config.rows}</span>
              <button
                onClick={() => config.rows < 8 && onResizeGrid(config.rows + 1, config.columns)}
                className="rounded bg-secondary p-2 hover:bg-accent active:bg-accent"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-sm text-muted-foreground">Spalten:</span>
              <button
                onClick={() => config.columns > 1 && onResizeGrid(config.rows, config.columns - 1)}
                className="rounded bg-secondary p-2 hover:bg-accent active:bg-accent"
              >
                <Minus className="h-5 w-5 text-muted-foreground" />
              </button>
              <span className="w-8 text-center text-card-foreground">{config.columns}</span>
              <button
                onClick={() => config.columns < 6 && onResizeGrid(config.rows, config.columns + 1)}
                className="rounded bg-secondary p-2 hover:bg-accent active:bg-accent"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Module elements with drag and drop */}
        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">
            Simpli-Elemente <span className="text-muted-foreground">(Klicken oder Ziehen)</span>
          </h3>

          <div className="mb-3">
            <button
              onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border p-3 transition-all md:p-2",
                selectedTool === "empty"
                  ? "border-destructive bg-destructive/20 text-destructive-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground",
              )}
            >
              <Eraser className="h-5 w-5" />
              <span>Radierer (Zelle leeren)</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 sm:grid-cols-2">
            {moduleTypes.map((module) => (
              <DraggableModule
                key={module.id}
                moduleType={module.id}
                color={config.accentColor !== "none" ? config.accentColor : config.baseColor}
              >
                <button
                  onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                  className={cn(
                    "relative flex w-full flex-col items-center rounded-lg border p-2 transition-all sm:p-3 md:p-2",
                    selectedTool === module.id
                      ? "border-[var(--simpli-blue)] bg-[var(--simpli-blue)]/20 text-[var(--simpli-blue)]"
                      : "border-border text-muted-foreground hover:border-muted-foreground active:border-muted-foreground",
                  )}
                >
                  <GripVertical className="absolute right-1 top-1 h-3 w-3 opacity-40" />
                  <ModulePreviewSVG type={module.id} />
                  <span className="mt-0.5 sm:mt-1 text-center text-[9px] leading-tight sm:text-[11px] md:text-[10px]">
                    {module.label}
                  </span>
                </button>
              </DraggableModule>
            ))}
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground">
            Tipp: Ziehe Module direkt auf das Regal oder klicke zum Auswählen
          </p>
        </div>

        {/* Configuration grid */}
        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Konfigurations-Raster</h3>

          <div className="mb-2 flex gap-1 pl-12">
            {config.columnWidths.map((width, colIndex) => (
              <button
                key={`col-width-${colIndex}`}
                onClick={() => onSetColumnWidth(colIndex, width === 75 ? 38 : 75)}
                className="flex-1 rounded bg-secondary px-1 py-1 text-[11px] text-muted-foreground hover:bg-accent active:bg-accent md:py-0.5 md:text-[10px]"
              >
                {width}cm
              </button>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col gap-1 pr-2">
              {config.rowHeights.map((height, rowIndex) => (
                <div
                  key={`row-height-${rowIndex}`}
                  className="flex h-16 w-10 items-center justify-center rounded bg-muted text-[11px] text-muted-foreground md:text-[10px]"
                >
                  38cm
                </div>
              ))}
            </div>

            <div
              className="grid flex-1 gap-1"
              style={{
                gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
                gridTemplateRows: `repeat(${config.rows}, 4rem)`,
              }}
            >
              {config.grid.flat().map((cell) => {
                const isEmpty = cell.type === "empty"
                const cellColor = cell.color || (config.accentColor !== "none" ? config.accentColor : config.baseColor)
                const bgColor = isEmpty ? "transparent" : colorHexMap[cellColor]
                const isSelected = selectedCell?.row === cell.row && selectedCell?.col === cell.col

                return (
                  <DroppableCell key={cell.id} row={cell.row} col={cell.col} onDrop={onDrop} isEmpty={isEmpty}>
                    <button
                      onClick={() => handleCellClick(cell.row, cell.col)}
                      className={cn(
                        "relative flex h-full w-full items-center justify-center rounded border-2 text-[9px] font-medium transition-all active:scale-95",
                        isEmpty
                          ? "border-dashed border-border hover:border-muted-foreground hover:bg-secondary/30 active:bg-secondary/50"
                          : "border-solid border-muted",
                        isSelected && !isEmpty && "ring-2 ring-[var(--simpli-blue)] ring-offset-1",
                        selectedTool && "cursor-pointer",
                      )}
                      style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                    >
                      {isEmpty ? (
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <>
                          <span
                            className={cn("text-center", cellColor === "weiss" ? "text-[#1a1a1a]" : "text-primary")}
                          >
                            {getModuleShortLabel(cell.type)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onClearCell(cell.row, cell.col)
                              if (isSelected) onSelectCell(null)
                            }}
                            className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/80 active:bg-destructive/80 md:p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </button>
                  </DroppableCell>
                )
              })}
            </div>
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground">Ziehe Module hierher oder klicke auf eine Zelle</p>
        </div>

        {optimalPackages.length > 0 && (
          <div className="border-b border-border">
            <button
              onClick={() => setShowPackages(!showPackages)}
              className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50 active:bg-secondary/50"
            >
              {showPackages ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Package className="h-4 w-4 text-[var(--simpli-blue)]" />
              <span className="font-medium">Optimale Bestellpakete ({optimalPackages.length})</span>
            </button>

            {showPackages && (
              <div className="px-4 pb-4 space-y-3">
                {optimalPackages.map((pkg) => {
                  const badge = getPriorityBadge(pkg.priority)
                  return (
                    <div key={pkg.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-card-foreground">{pkg.name}</h4>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", badge.className)}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                        </div>
                        <span className="font-semibold text-[var(--simpli-blue)]">
                          {pkg.packagePrice.toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pkg.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-0.5">
                            <span>
                              {item.quantity}x {item.product.name}
                            </span>
                            <span>{item.subtotal.toFixed(2).replace(".", ",")} €</span>
                          </div>
                        ))}
                      </div>
                      {pkg.savings > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-[var(--simpli-success)]">
                          <Check className="h-3 w-3" />
                          <span>Ersparnis: {pkg.savings.toFixed(2).replace(".", ",")} €</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Optimization suggestions */}
        {suggestions.length > 0 && (
          <div className="border-b border-border">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50 active:bg-secondary/50"
            >
              {showSuggestions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Lightbulb className="h-4 w-4 text-[var(--simpli-warning)]" />
              <span className="font-medium">Optimierungs-Tipps ({suggestions.length})</span>
            </button>

            {showSuggestions && (
              <div className="px-4 pb-4 space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded bg-[var(--simpli-warning)]/10 border border-[var(--simpli-warning)]/20 px-3 py-2 text-sm"
                  >
                    <Lightbulb className="h-4 w-4 text-[var(--simpli-warning)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-card-foreground">{suggestion.message}</p>
                      {suggestion.potentialSavings > 0 && (
                        <p className="text-xs text-[var(--simpli-success)] mt-1">
                          Mögliche Ersparnis: ~{suggestion.potentialSavings.toFixed(2).replace(".", ",")} €
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shopping list */}
        <div className="border-b border-border">
          <button
            onClick={onToggleShoppingList}
            className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50 active:bg-secondary/50"
          >
            {showShoppingList ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">Einkaufsliste</span>
            <span className="ml-auto font-bold text-[var(--simpli-blue)]">{price} €</span>
          </button>

          {showShoppingList && (
            <div className="px-4 pb-4">
              {shoppingList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Füge Module hinzu um die Einkaufsliste zu sehen</p>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded bg-secondary/50 px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="text-card-foreground">{item.product.name}</span>
                        <span className="ml-2 text-muted-foreground">x{item.quantity}</span>
                      </div>
                      <span className="font-medium text-card-foreground">
                        {item.subtotal.toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-semibold text-card-foreground">Gesamt</span>
                    <span className="text-xl font-bold text-[var(--simpli-blue)]">{price} €</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Module preview SVG component
function ModulePreviewSVG({ type }: { type: GridCell["type"] }) {
  const baseClass = "w-full h-12 sm:h-14 md:h-12"

  // 3D isometric box parameters
  const iso = {
    // Base points for isometric cube (centered, viewed from front-right-top)
    // Front face
    frontTopLeft: "15,12",
    frontTopRight: "45,12",
    frontBottomLeft: "15,32",
    frontBottomRight: "45,32",
    // Back face (offset up-left for depth)
    backTopLeft: "10,8",
    backTopRight: "40,8",
    backBottomLeft: "10,28",
    backBottomRight: "40,28",
    // Top face
    topFrontLeft: "15,12",
    topFrontRight: "45,12",
    topBackLeft: "20,6",
    topBackRight: "50,6",
    // Right side
    rightFrontTop: "45,12",
    rightFrontBottom: "45,32",
    rightBackTop: "50,6",
    rightBackBottom: "50,26",
  }

  switch (type) {
    case "ohne-seitenwaende":
      // Open frame - just the outline/frame structure
      return (
        <svg className={baseClass} viewBox="0 0 60 40" fill="none">
          {/* Frame structure - chrome tubes */}
          {/* Bottom frame */}
          <path d="M12,34 L42,34 L50,28 L20,28 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          {/* Top frame */}
          <path d="M12,10 L42,10 L50,4 L20,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          {/* Vertical posts */}
          <line x1="12" y1="10" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="42" y1="10" x2="42" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="4" x2="20" y2="28" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          {/* Shelf surface hint */}
          <path
            d="M14,32 L40,32 L48,26 L22,26 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )
    case "ohne-rueckwand":
      // Open back - frame with floor and sides but no back panel
      return (
        <svg className={baseClass} viewBox="0 0 60 40" fill="none">
          {/* Frame */}
          <path d="M12,34 L42,34 L50,28 L20,28 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M12,10 L42,10 L50,4 L20,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="10" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="42" y1="10" x2="42" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
          {/* Left side panel */}
          <path
            d="M12,10 L20,4 L20,28 L12,34 Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          {/* Floor */}
          <path
            d="M12,32 L42,32 L50,26 L20,26 Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          {/* Right side panel */}
          <path
            d="M42,10 L50,4 L50,28 L42,34 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )
    case "mit-rueckwand":
      // With back panel - fully enclosed back
      return (
        <svg className={baseClass} viewBox="0 0 60 40" fill="none">
          {/* Back panel (visible through opening) */}
          <path
            d="M14,9 L20,4 L20,28 L14,33 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <path
            d="M20,4 L48,4 L48,26 L20,26 Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          {/* Frame */}
          <path d="M12,34 L42,34 L50,28 L20,28 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M12,10 L42,10 L50,4 L20,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="10" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="42" y1="10" x2="42" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
          {/* Floor */}
          <path
            d="M12,32 L42,32 L50,26 L20,26 Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          {/* Right side */}
          <path
            d="M42,10 L50,4 L50,28 L42,34 Z"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )
    case "mit-tueren":
      // With double doors - front doors with handles
      return (
        <svg className={baseClass} viewBox="0 0 60 40" fill="none">
          {/* Back panel */}
          <path d="M20,4 L48,4 L48,26 L20,26 Z" fill="currentColor" fillOpacity="0.15" />
          {/* Frame */}
          <path d="M12,10 L42,10 L50,4 L20,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="10" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="42" y1="10" x2="42" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
          {/* Front doors */}
          <path
            d="M12,10 L42,10 L42,34 L12,34 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Door divider line */}
          <line x1="27" y1="10" x2="27" y2="34" stroke="currentColor" strokeWidth="1" />
          {/* Door handles */}
          <line x1="22" y1="21" x2="22" y2="23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="21" x2="32" y2="23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right side */}
          <path
            d="M42,10 L50,4 L50,28 L42,34 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )
    case "mit-klapptuer":
      // With flap door - single flip-up door at bottom
      return (
        <svg className={baseClass} viewBox="0 0 60 40" fill="none">
          {/* Back panel */}
          <path d="M20,4 L48,4 L48,26 L20,26 Z" fill="currentColor" fillOpacity="0.15" />
          {/* Frame */}
          <path d="M12,10 L42,10 L50,4 L20,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="10" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="42" y1="10" x2="42" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
          {/* Front flap door */}
          <path
            d="M12,10 L42,10 L42,34 L12,34 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Flap hinge line (dashed) */}
          <line x1="12" y1="26" x2="42" y2="26" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 2" />
          {/* Handle at bottom */}
          <line x1="24" y1="30" x2="30" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right side */}
          <path
            d="M42,10 L50,4 L50,28 L42,34 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )
    case "mit-doppelschublade":
      // With double drawer - two stacked drawers with handles
      return (
        <svg className={baseClass} viewBox="0 0 60 40" fill="none">
          {/* Back panel */}
          <path d="M20,4 L48,4 L48,26 L20,26 Z" fill="currentColor" fillOpacity="0.15" />
          {/* Frame */}
          <path d="M12,10 L42,10 L50,4 L20,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="10" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="42" y1="10" x2="42" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
          {/* Upper drawer front */}
          <path
            d="M12,10 L42,10 L42,22 L12,22 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Upper drawer handle */}
          <line x1="20" y1="16" x2="34" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Lower drawer front */}
          <path
            d="M12,22 L42,22 L42,34 L12,34 Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Lower drawer handle */}
          <line x1="20" y1="28" x2="34" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right side */}
          <path
            d="M42,10 L50,4 L50,28 L42,34 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )
    case "abschliessbare-tueren":
      // With lockable doors - doors with lock indicators
      return (
        <svg className={baseClass} viewBox="0 0 60 40" fill="none">
          {/* Back panel */}
          <path d="M20,4 L48,4 L48,26 L20,26 Z" fill="currentColor" fillOpacity="0.15" />
          {/* Frame */}
          <path d="M12,10 L42,10 L50,4 L20,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="10" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="42" y1="10" x2="42" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="4" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
          {/* Front doors */}
          <path
            d="M12,10 L42,10 L42,34 L12,34 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Door divider */}
          <line x1="27" y1="10" x2="27" y2="34" stroke="currentColor" strokeWidth="1" />
          {/* Lock indicators (small rectangles) */}
          <rect x="20" y="19" width="4" height="5" fill="currentColor" rx="0.5" />
          <rect x="30" y="19" width="4" height="5" fill="currentColor" rx="0.5" />
          {/* Right side */}
          <path
            d="M42,10 L50,4 L50,28 L42,34 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      )
    default:
      return null
  }
}
