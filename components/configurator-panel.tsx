"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell, ShoppingItem } from "./shelf-configurator"
import { cn } from "@/lib/utils"
import { ShoppingCart, ChevronDown, ChevronRight, X, Plus, Minus, Eraser, List } from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"

type Props = {
  config: ShelfConfig
  selectedTool: GridCell["type"] | null
  onSelectTool: (tool: GridCell["type"] | null) => void
  onPlaceModule: (row: number, col: number, type: GridCell["type"]) => void
  onClearCell: (row: number, col: number) => void
  onResizeGrid: (rows: number, cols: number) => void
  onSetColumnWidth: (col: number, width: 75 | 38) => void
  onSetRowHeight: (row: number, height: number) => void
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  shoppingList: ShoppingItem[]
  price: string
  showShoppingList: boolean
  onToggleShoppingList: () => void
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
  { id: "lila" as const, label: "Lila", color: colorHexMap.lila },
]

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
  onSelectTool,
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
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>("grid")

  const handleCellClick = (row: number, col: number) => {
    if (selectedTool === "empty") {
      onClearCell(row, col)
    } else if (selectedTool) {
      onPlaceModule(row, col, selectedTool)
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

  return (
    <div className="flex w-96 flex-col border-l border-neutral-700 bg-neutral-800">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Farbe Section */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Farbe</h3>
          <div className="flex items-start gap-3">
            <div className="flex gap-2">
              {baseColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdateConfig({ baseColor: color.id, accentColor: "none" })}
                  className={cn(
                    "h-10 w-10 rounded border-2 transition-all",
                    config.baseColor === color.id && config.accentColor === "none"
                      ? "border-white ring-2 ring-white ring-offset-2 ring-offset-neutral-800"
                      : "border-neutral-600 hover:border-neutral-400",
                  )}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
            <div className="ml-auto flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
          </div>
        </div>

        {/* Sonderfarbe Section */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Sonderfarbe</h3>
          <div className="flex flex-wrap gap-2">
            {specialColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onUpdateConfig({ accentColor: color.id })}
                className={cn(
                  "h-10 w-10 rounded border-2 transition-all",
                  config.accentColor === color.id
                    ? "border-white ring-2 ring-white ring-offset-2 ring-offset-neutral-800"
                    : "border-neutral-600 hover:border-neutral-400",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Material Section */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Bodenmaterial</h3>
          <div className="flex gap-2">
            {materialOptions.map((mat) => (
              <button
                key={mat.id}
                onClick={() => onUpdateConfig({ shelfMaterial: mat.id })}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-all",
                  config.shelfMaterial === mat.id
                    ? "border-white bg-neutral-700 text-white"
                    : "border-neutral-600 text-neutral-300 hover:border-neutral-400",
                )}
              >
                {mat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Size Controls */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Regal-Größe</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Spalten:</span>
              <button
                onClick={() => config.columns > 1 && onResizeGrid(config.rows, config.columns - 1)}
                className="rounded bg-neutral-700 p-1 hover:bg-neutral-600"
              >
                <Minus className="h-4 w-4 text-neutral-300" />
              </button>
              <span className="w-6 text-center text-neutral-100">{config.columns}</span>
              <button
                onClick={() => config.columns < 6 && onResizeGrid(config.rows, config.columns + 1)}
                className="rounded bg-neutral-700 p-1 hover:bg-neutral-600"
              >
                <Plus className="h-4 w-4 text-neutral-300" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Reihen:</span>
              <span className="w-6 text-center text-neutral-100">{config.rows}</span>
              <button
                onClick={() => config.rows < 8 && onResizeGrid(config.rows + 1, config.columns)}
                className="rounded bg-neutral-700 p-1 hover:bg-neutral-600"
              >
                <Plus className="h-4 w-4 text-neutral-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Row Height Controls - Individual per row */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Reihen-Höhen (individuell anpassbar)</h3>
          <div className="space-y-2">
            {config.rowHeights.map((height, rowIndex) => {
              const rowNumberFromBottom = config.rowHeights.length - rowIndex
              return (
                <div key={`row-control-${rowIndex}`} className="flex items-center gap-2">
                  <span className="w-16 text-sm text-neutral-400">Reihe {rowNumberFromBottom}:</span>
                  <input
                    type="number"
                    min="20"
                    max="120"
                    value={height}
                    onChange={(e) => {
                      const newHeight = Number.parseInt(e.target.value) || 38
                      onSetRowHeight(rowIndex, newHeight)
                    }}
                    className="flex-1 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-neutral-300"
                  />
                  <span className="w-12 text-sm text-neutral-500">cm</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Module Tools */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Simpli-Elemente (Klicken zum Auswählen)</h3>

          {/* Eraser tool */}
          <div className="mb-3">
            <button
              onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border p-2 transition-all",
                selectedTool === "empty"
                  ? "border-red-500 bg-red-500/20 text-red-300"
                  : "border-neutral-600 text-neutral-300 hover:border-neutral-400",
              )}
            >
              <Eraser className="h-5 w-5" />
              <span>Radierer (Zelle leeren)</span>
            </button>
          </div>

          {/* Module type buttons */}
          <div className="grid grid-cols-2 gap-2">
            {moduleTypes.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                className={cn(
                  "flex flex-col items-center rounded-lg border p-2 transition-all",
                  selectedTool === module.id
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-neutral-600 text-neutral-300 hover:border-neutral-400",
                )}
              >
                <ModulePreviewSVG type={module.id} />
                <span className="mt-1 text-center text-[10px] leading-tight">{module.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Grid Editor */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Konfigurations-Raster (Klicken zum Platzieren)</h3>

          {/* Column width controls */}
          <div className="mb-2 flex gap-1 pl-12">
            {config.columnWidths.map((width, colIndex) => (
              <button
                key={`col-width-${colIndex}`}
                onClick={() => onSetColumnWidth(colIndex, width === 75 ? 38 : 75)}
                className="flex-1 rounded bg-neutral-700 px-1 py-0.5 text-[10px] text-neutral-300 hover:bg-neutral-600"
              >
                {width}cm
              </button>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col gap-1 pr-2">
              {[...config.rowHeights].reverse().map((height, reverseIndex) => {
                const rowIndex = config.rowHeights.length - 1 - reverseIndex
                return (
                  <button
                    key={`row-height-${rowIndex}`}
                    onClick={() => onSetRowHeight(rowIndex, height === 38 ? 76 : 38)}
                    className="flex h-16 w-10 items-center justify-center rounded bg-neutral-700 text-[10px] text-neutral-300 hover:bg-neutral-600"
                  >
                    {height}cm
                  </button>
                )
              })}
            </div>

            {/* Grid cells */}
            <div
              className="grid flex-1 gap-1"
              style={{
                gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
                gridTemplateRows: `repeat(${config.rows}, 4rem)`,
              }}
            >
              {[...config.grid]
                .reverse()
                .flat()
                .map((cell) => {
                  const isEmpty = cell.type === "empty" || cell.type === "ghost"
                  const isGhost = cell.type === "ghost"
                  const effectiveColor = config.accentColor !== "none" ? config.accentColor : config.baseColor
                  const bgColor = isEmpty ? "transparent" : colorHexMap[effectiveColor]

                  return (
                    <button
                      key={cell.id}
                      onClick={() => handleCellClick(cell.row, cell.col)}
                      className={cn(
                        "relative flex items-center justify-center rounded border-2 text-[9px] font-medium transition-all",
                        isEmpty
                          ? isGhost
                            ? "border-dashed border-blue-400/50 hover:border-blue-400 hover:bg-blue-500/10"
                            : "border-dashed border-neutral-600 hover:border-neutral-400 hover:bg-neutral-700/30"
                          : "border-solid border-neutral-500",
                        selectedTool && "cursor-pointer",
                      )}
                      style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                      title={
                        isGhost
                          ? "Geister-Zelle: Klicken zum Platzieren"
                          : isEmpty
                            ? "Leere Zelle"
                            : getModuleLabel(cell.type)
                      }
                    >
                      {isEmpty ? (
                        <Plus className={cn("h-4 w-4", isGhost ? "text-blue-400" : "text-neutral-500")} />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "text-center",
                              effectiveColor === "weiss" ? "text-neutral-800" : "text-white",
                            )}
                          >
                            {getModuleShortLabel(cell.type)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onClearCell(cell.row, cell.col)
                            }}
                            className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>

          <p className="mt-2 text-[10px] text-neutral-500">
            Tipp: Blaue Zellen sind Geister-Zellen - platziere Module dort um das Regal zu erweitern
          </p>
        </div>

        {/* Shopping List */}
        <div className="border-b border-neutral-700">
          <button
            onClick={onToggleShoppingList}
            className="flex w-full items-center gap-2 p-4 text-left text-neutral-100 transition-colors hover:bg-neutral-700/50"
          >
            {showShoppingList ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <List className="h-4 w-4" />
            <span className="font-medium">Einkaufsliste ({shoppingList.length} Produkte)</span>
          </button>

          {showShoppingList && (
            <div className="px-4 pb-4">
              {shoppingList.length === 0 ? (
                <p className="text-sm text-neutral-400">Füge Module hinzu um die Einkaufsliste zu sehen</p>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map((item) => (
                    <div
                      key={item.product.artNr}
                      className="flex items-center justify-between rounded bg-neutral-700 px-3 py-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="text-neutral-100">{item.product.name}</div>
                        <div className="text-xs text-neutral-400">
                          Art.Nr: {item.product.artNr} | {item.quantity}x à{" "}
                          {item.product.price.toFixed(2).replace(".", ",")} €
                        </div>
                      </div>
                      <div className="text-right font-medium text-neutral-100">
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

      {/* Price & Cart - Fixed at bottom */}
      <div className="border-t border-neutral-700 bg-neutral-800 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-neutral-400">Preis:</span>
          <span className="text-2xl font-bold text-neutral-100">{price} €</span>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium uppercase tracking-wide text-white transition-colors hover:bg-blue-500">
          <ShoppingCart className="h-5 w-5" />
          In den Warenkorb
        </button>
      </div>
    </div>
  )
}

function ModulePreviewSVG({ type }: { type: string }) {
  const baseStyle = "stroke-current"

  switch (type) {
    case "ohne-seitenwaende":
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect x="5" y="5" width="40" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="17" x2="45" y2="17" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    case "ohne-rueckwand":
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect x="5" y="5" width="40" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="17" x2="45" y2="17" stroke="currentColor" strokeWidth="1" />
          <rect x="6" y="6" width="38" height="10" fill="currentColor" fillOpacity="0.15" />
          <rect x="6" y="18" width="38" height="11" fill="currentColor" fillOpacity="0.15" />
        </svg>
      )
    case "mit-rueckwand":
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect
            x="5"
            y="5"
            width="40"
            height="25"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="5" y1="17" x2="45" y2="17" stroke="currentColor" strokeWidth="1" />
          <rect x="5" y="5" width="2" height="25" fill="currentColor" fillOpacity="0.4" />
          <rect x="43" y="5" width="2" height="25" fill="currentColor" fillOpacity="0.4" />
        </svg>
      )
    case "mit-tueren":
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect
            x="5"
            y="5"
            width="40"
            height="25"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="25" y1="5" x2="25" y2="30" stroke="currentColor" strokeWidth="1" />
          <circle cx="22" cy="17" r="1.5" fill="currentColor" />
          <circle cx="28" cy="17" r="1.5" fill="currentColor" />
        </svg>
      )
    case "mit-klapptuer":
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect
            x="5"
            y="5"
            width="40"
            height="25"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="5" y1="25" x2="45" y2="25" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="27" x2="30" y2="27" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case "mit-doppelschublade":
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect
            x="5"
            y="5"
            width="40"
            height="25"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="5" y1="17" x2="45" y2="17" stroke="currentColor" strokeWidth="1" />
          <line x1="18" y1="11" x2="32" y2="11" stroke="currentColor" strokeWidth="2" />
          <line x1="18" y1="23" x2="32" y2="23" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case "abschliessbare-tueren":
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect
            x="5"
            y="5"
            width="40"
            height="25"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="25" y1="5" x2="25" y2="30" stroke="currentColor" strokeWidth="1" />
          <circle cx="22" cy="15" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="21" y="15" width="2" height="4" fill="currentColor" />
          <circle cx="28" cy="15" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="27" y="15" width="2" height="4" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 50 35" className="h-8 w-12">
          <rect x="5" y="5" width="40" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
  }
}
