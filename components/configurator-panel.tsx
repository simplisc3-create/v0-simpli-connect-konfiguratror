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
  { id: "ohne-seitenwaende" as const, label: "Ohne Seitenwände", icon: "open" },
  { id: "ohne-rueckwand" as const, label: "Ohne Rückwand", icon: "shelf" },
  { id: "mit-rueckwand" as const, label: "Mit Rückwand", icon: "back" },
  { id: "mit-tueren" as const, label: "Mit Türen", icon: "doors" },
  { id: "mit-klapptuer" as const, label: "Mit Klapptür", icon: "flip" },
  { id: "mit-doppelschublade" as const, label: "Doppelschublade", icon: "drawer" },
  { id: "abschliessbare-tueren" as const, label: "Abschließbar", icon: "lock" },
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
        return "OS"
      case "ohne-rueckwand":
        return "OR"
      case "mit-rueckwand":
        return "MR"
      case "mit-tueren":
        return "MT"
      case "mit-klapptuer":
        return "KT"
      case "mit-doppelschublade":
        return "DS"
      case "abschliessbare-tueren":
        return "AT"
      default:
        return ""
    }
  }

  const selectedCellData = selectedCell ? config.grid[selectedCell.row]?.[selectedCell.col] : null

  const getPriorityBadge = (priority: BuyingPackage["priority"]) => {
    switch (priority) {
      case "essential":
        return { label: "Pflicht", className: "bg-foreground text-background" }
      case "recommended":
        return { label: "Empfohlen", className: "bg-muted text-foreground" }
      case "optional":
        return { label: "Optional", className: "bg-secondary text-muted-foreground" }
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col border-border bg-card",
        "fixed inset-x-0 bottom-0 top-14 z-30 border-t transition-transform duration-300 lg:relative lg:z-0 lg:top-0 lg:w-[360px] lg:translate-y-0 lg:border-l lg:border-t-0",
        showMobilePanel ? "translate-y-0" : "translate-y-full lg:translate-y-0",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">CONFIGURATION</span>
        <button onClick={onCloseMobilePanel} className="p-1 hover:bg-secondary transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Selected cell color picker */}
        {selectedCellData && selectedCellData.type !== "empty" && (
          <div className="border-b border-border bg-secondary/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                SELECTED: R{selectedCell!.row + 1} × C{selectedCell!.col + 1}
              </span>
              <button
                onClick={() => onSelectCell(null)}
                className="p-1 hover:bg-secondary transition-colors"
                title="Auswahl aufheben"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="mb-3 text-xs text-foreground">{getModuleLabel(selectedCellData.type)}</p>
            <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground mb-2 block">FINISH</span>
            <div className="flex flex-wrap gap-1.5">
              {allColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdateCellColor(selectedCell!.row, selectedCell!.col, color.id)}
                  className={cn(
                    "h-8 w-8 transition-all border",
                    selectedCellData.color === color.id
                      ? "border-foreground ring-1 ring-foreground ring-offset-1 ring-offset-background"
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
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mb-3 block">BASE FINISH</span>
          <div className="flex items-start gap-3">
            <div className="flex gap-1.5">
              {baseColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdateConfig({ baseColor: color.id, accentColor: "none" })}
                  className={cn(
                    "h-10 w-10 transition-all border",
                    config.baseColor === color.id && config.accentColor === "none"
                      ? "border-foreground ring-1 ring-foreground ring-offset-1 ring-offset-background"
                      : "border-border hover:border-muted-foreground",
                  )}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
            <div className="ml-auto flex h-12 w-12 items-center justify-center border border-border">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <rect x="2" y="2" width="8" height="8" fill="currentColor" className="text-foreground" />
                <rect
                  x="14"
                  y="2"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-foreground"
                  fill="none"
                />
                <rect
                  x="2"
                  y="14"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-foreground"
                  fill="none"
                />
                <rect x="14" y="14" width="8" height="8" fill="currentColor" className="text-foreground" />
              </svg>
            </div>
          </div>
        </div>

        {/* Special colors */}
        <div className="border-b border-border p-4">
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mb-3 block">ACCENT FINISH</span>
          <div className="flex flex-wrap gap-1.5">
            {specialColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onUpdateConfig({ accentColor: color.id })}
                className={cn(
                  "h-10 w-10 transition-all border",
                  config.accentColor === color.id
                    ? "border-foreground ring-1 ring-foreground ring-offset-1 ring-offset-background"
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
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mb-3 block">
            SHELF MATERIAL
          </span>
          <div className="flex gap-1.5">
            {materialOptions.map((mat) => (
              <button
                key={mat.id}
                onClick={() => onUpdateConfig({ shelfMaterial: mat.id })}
                className={cn(
                  "flex-1 py-2 text-xs transition-all border font-mono tracking-wide",
                  config.shelfMaterial === mat.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                )}
              >
                {mat.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Grid size controls */}
        <div className="border-b border-border p-4">
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mb-3 block">DIMENSIONS</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-12">ROWS</span>
              <button
                onClick={() => config.rows > 1 && onResizeGrid(config.rows - 1, config.columns)}
                className="h-8 w-8 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
              >
                <Minus className="h-3.5 w-3.5 text-foreground" />
              </button>
              <span className="w-8 text-center font-mono text-sm text-foreground">{config.rows}</span>
              <button
                onClick={() => config.rows < 8 && onResizeGrid(config.rows + 1, config.columns)}
                className="h-8 w-8 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-12">COLS</span>
              <button
                onClick={() => config.columns > 1 && onResizeGrid(config.rows, config.columns - 1)}
                className="h-8 w-8 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
              >
                <Minus className="h-3.5 w-3.5 text-foreground" />
              </button>
              <span className="w-8 text-center font-mono text-sm text-foreground">{config.columns}</span>
              <button
                onClick={() => config.columns < 6 && onResizeGrid(config.rows, config.columns + 1)}
                className="h-8 w-8 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Module elements with drag and drop */}
        <div className="border-b border-border p-4">
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mb-3 block">MODULES</span>

          <div className="mb-3">
            <button
              onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
              className={cn(
                "flex w-full items-center gap-2 p-2.5 transition-all border",
                selectedTool === "empty"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
              )}
            >
              <Eraser className="h-4 w-4" />
              <span className="font-mono text-[10px] tracking-wide">ERASER</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-2">
            {moduleTypes.map((module) => (
              <DraggableModule
                key={module.id}
                moduleType={module.id}
                color={config.accentColor !== "none" ? config.accentColor : config.baseColor}
              >
                <button
                  onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                  className={cn(
                    "relative flex w-full flex-col items-center p-2.5 transition-all border",
                    selectedTool === module.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                  )}
                >
                  <GripVertical className="absolute right-1 top-1 h-2.5 w-2.5 opacity-30" />
                  <ModulePreviewSVG type={module.id} selected={selectedTool === module.id} />
                  <span className="mt-1.5 text-center font-mono text-[8px] leading-tight tracking-wide">
                    {module.label.toUpperCase()}
                  </span>
                </button>
              </DraggableModule>
            ))}
          </div>

          <p className="mt-2 font-mono text-[9px] text-muted-foreground tracking-wide">DRAG OR CLICK TO PLACE</p>
        </div>

        {/* Configuration grid */}
        <div className="border-b border-border p-4">
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mb-3 block">GRID VIEW</span>

          <div className="mb-2 flex gap-1 pl-10">
            {config.columnWidths.map((width, colIndex) => (
              <button
                key={`col-width-${colIndex}`}
                onClick={() => onSetColumnWidth(colIndex, width === 75 ? 38 : 75)}
                className="flex-1 py-1 font-mono text-[9px] text-muted-foreground hover:bg-secondary transition-colors border border-border"
              >
                {width}CM
              </button>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col gap-1 pr-2">
              {config.rowHeights.map((height, rowIndex) => (
                <div
                  key={`row-height-${rowIndex}`}
                  className="flex h-14 w-8 items-center justify-center border border-border font-mono text-[9px] text-muted-foreground"
                >
                  38
                </div>
              ))}
            </div>

            <div
              className="grid flex-1 gap-1"
              style={{
                gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
                gridTemplateRows: `repeat(${config.rows}, 3.5rem)`,
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
                        "relative flex h-full w-full items-center justify-center border transition-all",
                        isEmpty
                          ? "border-dashed border-border hover:border-muted-foreground hover:bg-secondary/30"
                          : "border-solid border-muted-foreground/30",
                        isSelected && !isEmpty && "ring-1 ring-foreground ring-offset-1 ring-offset-background",
                        selectedTool && "cursor-pointer",
                      )}
                      style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                    >
                      {isEmpty ? (
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "font-mono text-[9px] font-medium",
                              cellColor === "weiss" ? "text-[#1a1a1a]" : "text-white",
                            )}
                          >
                            {getModuleShortLabel(cell.type)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onClearCell(cell.row, cell.col)
                              if (isSelected) onSelectCell(null)
                            }}
                            className="absolute -right-1 -top-1 h-4 w-4 flex items-center justify-center bg-foreground text-background hover:bg-foreground/80 transition-colors"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </>
                      )}
                    </button>
                  </DroppableCell>
                )
              })}
            </div>
          </div>
        </div>

        {optimalPackages.length > 0 && (
          <div className="border-b border-border">
            <button
              onClick={() => setShowPackages(!showPackages)}
              className="flex w-full items-center gap-2 p-4 text-left text-foreground transition-colors hover:bg-secondary/50"
            >
              {showPackages ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Package className="h-4 w-4" />
              <span className="font-mono text-[10px] tracking-wide">PACKAGES ({optimalPackages.length})</span>
            </button>

            {showPackages && (
              <div className="px-4 pb-4 space-y-3">
                {optimalPackages.map((pkg, index) => {
                  const badge = getPriorityBadge(pkg.priority)
                  return (
                    <div key={index} className="border border-border p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={cn("font-mono text-[9px] px-1.5 py-0.5", badge.className)}>
                            {badge.label.toUpperCase()}
                          </span>
                          <h4 className="text-sm text-foreground mt-1.5">{pkg.name}</h4>
                        </div>
                        <span className="font-mono text-sm text-foreground">
                          {(pkg.packagePrice ?? 0).toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {pkg.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {item.quantity}× {item.product.name}
                            </span>
                            <span className="font-mono">{(item.subtotal ?? 0).toFixed(2).replace(".", ",")} €</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Suggestions section */}
        {suggestions.length > 0 && (
          <div className="border-b border-border">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex w-full items-center gap-2 p-4 text-left text-foreground transition-colors hover:bg-secondary/50"
            >
              {showSuggestions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Lightbulb className="h-4 w-4" />
              <span className="font-mono text-[10px] tracking-wide">SUGGESTIONS ({suggestions.length})</span>
            </button>

            {showSuggestions && (
              <div className="px-4 pb-4 space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 text-xs border",
                      suggestion.type === "warning"
                        ? "border-destructive/30 bg-destructive/5 text-destructive"
                        : "border-border bg-secondary/30 text-muted-foreground",
                    )}
                  >
                    {suggestion.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shopping list section */}
        <div className="border-b border-border">
          <button
            onClick={onToggleShoppingList}
            className="flex w-full items-center gap-2 p-4 text-left text-foreground transition-colors hover:bg-secondary/50"
          >
            {showShoppingList ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <ShoppingCart className="h-4 w-4" />
            <span className="font-mono text-[10px] tracking-wide">ORDER LIST</span>
            <span className="ml-auto font-mono text-sm text-foreground">{price} €</span>
          </button>

          {showShoppingList && (
            <div className="px-4 pb-4">
              {shoppingList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No items configured yet.</p>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-xs text-foreground">{item.product.name}</p>
                        <p className="font-mono text-[9px] text-muted-foreground">
                          {item.quantity}× {(item.product.price ?? 0).toFixed(2).replace(".", ",")} €
                        </p>
                      </div>
                      <span className="font-mono text-xs text-foreground">
                        {(item.subtotal ?? 0).toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t border-foreground">
                    <span className="font-mono text-[10px] tracking-wide text-foreground">TOTAL</span>
                    <span className="font-mono text-base font-medium text-foreground">{price} €</span>
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

function ModulePreviewSVG({ type, selected = false }: { type: GridCell["type"]; selected?: boolean }) {
  const strokeColor = selected ? "currentColor" : "currentColor"
  const fillColor = selected ? "currentColor" : "none"

  const baseProps = {
    className: "h-7 w-7 sm:h-8 sm:w-8",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: strokeColor,
    strokeWidth: 1,
  }

  switch (type) {
    case "ohne-seitenwaende":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="16" strokeDasharray="2 2" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      )
    case "ohne-rueckwand":
      return (
        <svg {...baseProps}>
          <path d="M3 4 L3 20 L21 20 L21 4" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      )
    case "mit-rueckwand":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="16" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      )
    case "mit-tueren":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="16" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <circle cx="10" cy="12" r="1" fill={strokeColor} />
          <circle cx="14" cy="12" r="1" fill={strokeColor} />
        </svg>
      )
    case "mit-klapptuer":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="16" />
          <line x1="3" y1="8" x2="21" y2="8" />
          <circle cx="12" cy="6" r="0.75" fill={strokeColor} />
        </svg>
      )
    case "mit-doppelschublade":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="16" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      )
    case "abschliessbare-tueren":
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="16" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <rect x="9" y="10" width="2" height="4" fill={strokeColor} />
          <rect x="13" y="10" width="2" height="4" fill={strokeColor} />
        </svg>
      )
    default:
      return null
  }
}
