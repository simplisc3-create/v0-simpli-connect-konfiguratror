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
  shoppingList,
  price,
  showShoppingList,
  onToggleShoppingList,
  showMobilePanel = true,
  onCloseMobilePanel,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>("grid")

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
        <button onClick={onCloseMobilePanel} className="rounded-full p-1 hover:bg-control-hover">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedCellData && selectedCellData.type !== "empty" && (
          <div className="border-b border-border bg-accent-blue/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-card-foreground">
                Ausgewählte Zelle: R{selectedCell!.row + 1}C{selectedCell!.col + 1}
              </h3>
              <button
                onClick={() => onSelectCell(null)}
                className="rounded p-1 hover:bg-control-hover"
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

        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Standardfarbe (für neue Module)</h3>
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
            <div className="ml-auto flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-blue-hover md:h-14 md:w-14">
              <span className="text-3xl font-bold text-primary md:text-2xl">S</span>
            </div>
          </div>
        </div>

        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Sonderfarbe (für neue Module)</h3>
          <div className="flex flex-wrap gap-2">
            {specialColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onUpdateConfig({ accentColor: color.id })}
                className={cn(
                  "h-12 w-12 rounded border-2 transition-all md:h-10 md:w-10",
                  config.accentColor === color.id
                    ? "border-primary bg-secondary text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
            ))}
          </div>
        </div>

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
                    ? "border-primary bg-secondary text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground",
                )}
              >
                {mat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Regal-Größe</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-sm text-muted-foreground">Reihen:</span>
              <button
                onClick={() => config.rows > 1 && onResizeGrid(config.rows - 1, config.columns)}
                className="rounded bg-control-bg p-2 hover:bg-control-hover active:bg-control-hover"
              >
                <Minus className="h-5 w-5 text-muted-foreground" />
              </button>
              <span className="w-8 text-center text-card-foreground">{config.rows}</span>
              <button
                onClick={() => config.rows < 8 && onResizeGrid(config.rows + 1, config.columns)}
                className="rounded bg-control-bg p-2 hover:bg-control-hover active:bg-control-hover"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-sm text-muted-foreground">Spalten:</span>
              <button
                onClick={() => config.columns > 1 && onResizeGrid(config.rows, config.columns - 1)}
                className="rounded bg-control-bg p-2 hover:bg-control-hover active:bg-control-hover"
              >
                <Minus className="h-5 w-5 text-muted-foreground" />
              </button>
              <span className="w-8 text-center text-card-foreground">{config.columns}</span>
              <button
                onClick={() => config.columns < 6 && onResizeGrid(config.rows, config.columns + 1)}
                className="rounded bg-control-bg p-2 hover:bg-control-hover active:bg-control-hover"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">Simpli-Elemente (Klicken zum Auswählen)</h3>

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
              <button
                key={module.id}
                onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                className={cn(
                  "flex flex-col items-center rounded-lg border p-2 transition-all sm:p-3 md:p-2",
                  selectedTool === module.id
                    ? "border-accent-blue bg-accent-blue/20 text-accent-blue"
                    : "border-border text-muted-foreground hover:border-muted-foreground active:border-muted-foreground",
                )}
              >
                <ModulePreviewSVG type={module.id} />
                <span className="mt-0.5 sm:mt-1 text-center text-[9px] leading-tight sm:text-[11px] md:text-[10px]">
                  {module.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-border p-4">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">
            Konfigurations-Raster (Klicken zum Platzieren/Bearbeiten)
          </h3>

          <div className="mb-2 flex gap-1 pl-12">
            {config.columnWidths.map((width, colIndex) => (
              <button
                key={`col-width-${colIndex}`}
                onClick={() => onSetColumnWidth(colIndex, width === 75 ? 38 : 75)}
                className="flex-1 rounded bg-control-bg px-1 py-1 text-[11px] text-muted-foreground hover:bg-control-hover active:bg-control-hover md:py-0.5 md:text-[10px]"
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
                  <button
                    key={cell.id}
                    onClick={() => handleCellClick(cell.row, cell.col)}
                    className={cn(
                      "relative flex items-center justify-center rounded border-2 text-[9px] font-medium transition-all active:scale-95",
                      isEmpty
                        ? "border-dashed border-border hover:border-muted-foreground hover:bg-secondary/30 active:bg-secondary/50"
                        : "border-solid border-muted",
                      isSelected && !isEmpty && "ring-2 ring-accent-blue ring-offset-1",
                      selectedTool && "cursor-pointer",
                    )}
                    style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                  >
                    {isEmpty ? (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <>
                        <span
                          className={cn(
                            "text-center",
                            cellColor === "weiss" ? "text-primary-foreground" : "text-primary",
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
                          className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/80 active:bg-destructive/80 md:p-0.5"
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

          <p className="mt-2 text-[10px] text-muted-foreground">
            Tipp: Klicke auf Module um deren Farbe einzeln zu ändern
          </p>
        </div>

        <div className="border-b border-border">
          <button
            onClick={onToggleShoppingList}
            className="flex w-full items-center gap-2 p-4 text-left text-card-foreground transition-colors hover:bg-secondary/50 active:bg-secondary/50"
          >
            {showShoppingList ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <List className="h-4 w-4" />
            <span className="font-medium">Einkaufsliste ({shoppingList.length} Produkte)</span>
          </button>

          {showShoppingList && (
            <div className="px-4 pb-4">
              {shoppingList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Füge Module hinzu um die Einkaufsliste zu sehen</p>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map((item) => (
                    <div
                      key={item.product.artNr}
                      className="flex items-center justify-between rounded bg-secondary px-3 py-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="text-card-foreground">{item.product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Art.Nr: {item.product.artNr} | {item.quantity}x à{" "}
                          {item.product.price.toFixed(2).replace(".", ",")} €
                        </div>
                      </div>
                      <div className="text-right font-medium text-card-foreground">
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

      <div className="border-t border-border bg-card p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Preis:</span>
          <span className="text-2xl font-bold text-card-foreground">{price} €</span>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue py-4 font-medium uppercase tracking-wide text-primary transition-colors hover:bg-accent-blue-hover active:bg-accent-blue-hover md:py-3">
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
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="40" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="17" x2="45" y2="17" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    case "ohne-rueckwand":
      return (
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="40" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="17" x2="45" y2="17" stroke="currentColor" strokeWidth="1" />
          <rect x="6" y="6" width="38" height="10" fill="currentColor" fillOpacity="0.15" />
          <rect x="6" y="18" width="38" height="11" fill="currentColor" fillOpacity="0.15" />
        </svg>
      )
    case "mit-rueckwand":
      return (
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 50 35" className="h-6 w-10 sm:h-8 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="40" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
  }
}
