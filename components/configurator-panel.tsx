"use client"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import type { ShelfColor } from "@/types/shelf-color"
import type { ShoppingItem } from "@/types/shopping-item"
import { cn } from "@/lib/utils"
import { ShoppingCart, ChevronDown, ChevronRight, Plus, List, Paintbrush } from "lucide-react"
import { colorHexMap } from "@/lib/color-hex-map"

type PaintMode = "panels" | "fronts"

const baseColors: { id: ShelfColor; label: string; color: string }[] = [
  { id: "weiss", label: "Weiß", color: colorHexMap.weiss },
  { id: "schwarz", label: "Schwarz", color: colorHexMap.schwarz },
]

const specialColors: { id: ShelfColor; label: string; color: string }[] = [
  { id: "blau", label: "Blau", color: colorHexMap.blau },
  { id: "gruen", label: "Grün", color: colorHexMap.gruen },
  { id: "gelb", label: "Gelb", color: colorHexMap.gelb },
  { id: "orange", label: "Orange", color: colorHexMap.orange },
  { id: "rot", label: "Rot", color: colorHexMap.rot },
  { id: "lila", label: "Lila", color: colorHexMap.lila },
]

const moduleTypes: { id: GridCell["type"]; label: string; icon: string }[] = [
  { id: "ohne-seitenwaende", label: "ohne Seitenwände", icon: "open" },
  { id: "ohne-rueckwand", label: "ohne Rückwand", icon: "shelf" },
  { id: "mit-rueckwand", label: "mit Rückwand", icon: "back" },
  { id: "mit-tueren", label: "mit Türen", icon: "doors" },
  { id: "mit-klapptuer", label: "mit Klapptür", icon: "flip" },
  { id: "mit-doppelschublade", label: "mit Doppelschublade", icon: "drawer" },
  { id: "abschliessbare-tueren", label: "abschließbare Türen", icon: "lock" },
]

interface ConfiguratorPanelProps {
  config: ShelfConfig
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  paintMode: PaintMode
  onPaintModeChange: (mode: PaintMode) => void
  activeColor: ShelfColor
  onActiveColorChange: (color: ShelfColor) => void
  selectedCells: Set<string>
  onApplyColorToSelected: () => void
  onApplyColorToRow: (row: number) => void
  onApplyColorToColumn: (col: number) => void
  onApplyColorToAll: () => void
  onClearPanelColors: () => void
  onClearFrontColors: () => void
  shoppingList: ShoppingItem[]
  price: string
  showShoppingList: boolean
  onToggleShoppingList: () => void
}

export function ConfiguratorPanel({
  config,
  onUpdateConfig,
  paintMode,
  onPaintModeChange,
  activeColor,
  onActiveColorChange,
  selectedCells,
  onApplyColorToSelected,
  onApplyColorToRow,
  onApplyColorToColumn,
  onApplyColorToAll,
  onClearPanelColors,
  onClearFrontColors,
  shoppingList,
  price,
  showShoppingList,
  onToggleShoppingList,
}: ConfiguratorPanelProps) {
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

  const getCellId = (row: number, col: number) => `c-${row}-${col}`

  // Get cell color for display in grid
  const getCellDisplayColor = (cell: GridCell): string => {
    const cellId = getCellId(cell.row, cell.col)
    const styleColor = config.cellStyles?.[cellId]?.panelColor
    const cellColor = styleColor ?? cell.panelColor ?? cell.color ?? config.defaultPanelColor ?? "weiss"
    return colorHexMap[cellColor] || colorHexMap.weiss
  }

  return (
    <div className="flex w-96 flex-col border-l border-neutral-700 bg-neutral-800">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-neutral-700 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-neutral-100">Farbmodus</h3>
          </div>
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => onPaintModeChange("panels")}
              className={cn(
                "flex-1 rounded px-3 py-2 text-sm font-medium transition-all",
                paintMode === "panels"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600",
              )}
            >
              Böden & Wände
            </button>
            <button
              onClick={() => onPaintModeChange("fronts")}
              className={cn(
                "flex-1 rounded px-3 py-2 text-sm font-medium transition-all",
                paintMode === "fronts"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600",
              )}
            >
              Fronten
            </button>
          </div>
          <p className="text-xs text-neutral-400">
            {paintMode === "panels"
              ? "Farbe für Regalböden und Seitenwände"
              : "Farbe für Türen, Klappen und Schubladen"}
          </p>
        </div>

        {/* Active Color Section */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">
            Aktive Farbe ({paintMode === "panels" ? "Böden" : "Fronten"})
          </h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {[...baseColors, ...specialColors].map((color) => (
              <button
                key={color.id}
                onClick={() => onActiveColorChange(color.id)}
                className={cn(
                  "h-10 w-10 rounded border-2 transition-all",
                  activeColor === color.id
                    ? "border-white ring-2 ring-white ring-offset-2 ring-offset-neutral-800"
                    : "border-neutral-600 hover:border-neutral-400",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
            ))}
          </div>

          {/* Apply Actions */}
          <div className="space-y-2">
            <button
              onClick={onApplyColorToSelected}
              disabled={selectedCells.size === 0}
              className={cn(
                "w-full rounded px-3 py-2 text-sm font-medium transition-all",
                selectedCells.size > 0
                  ? "bg-green-600 text-white hover:bg-green-500"
                  : "bg-neutral-700 text-neutral-500 cursor-not-allowed",
              )}
            >
              Auf Auswahl anwenden ({selectedCells.size} Zellen)
            </button>
            <button
              onClick={onApplyColorToAll}
              className="w-full rounded bg-neutral-700 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-600"
            >
              Auf alle Zellen anwenden
            </button>
          </div>
        </div>

        {/* Clear Colors Section */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Farben zurücksetzen</h3>
          <div className="flex gap-2">
            <button
              onClick={onClearPanelColors}
              className="flex-1 rounded bg-neutral-700 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-red-600 hover:text-white"
            >
              Böden-Farben
            </button>
            <button
              onClick={onClearFrontColors}
              className="flex-1 rounded bg-neutral-700 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-red-600 hover:text-white"
            >
              Fronten-Farben
            </button>
          </div>
        </div>

        {/* Default Color for New Modules */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Standard-Farbe (für neue Module)</h3>
          <div className="flex flex-wrap gap-2">
            {[...baseColors, ...specialColors].map((color) => (
              <button
                key={color.id}
                onClick={() =>
                  onUpdateConfig({
                    color: color.id,
                    defaultPanelColor: color.id,
                    defaultFrontColor: color.id,
                  })
                }
                className={cn(
                  "h-8 w-8 rounded border-2 transition-all",
                  config.defaultPanelColor === color.id
                    ? "border-white ring-2 ring-white ring-offset-2 ring-offset-neutral-800"
                    : "border-neutral-600 hover:border-neutral-400",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              />
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
                onClick={() =>
                  onUpdateConfig({
                    columnWidths: config.columnWidths.map((w, i) => (i === colIndex ? (w === 75 ? 38 : 75) : w)) as (
                      | 75
                      | 38
                    )[],
                  })
                }
                className="flex-1 rounded bg-neutral-700 px-1 py-0.5 text-[10px] text-neutral-300 hover:bg-neutral-600"
              >
                {width}cm
              </button>
            ))}
          </div>

          <div className="flex">
            {/* Row height controls */}
            <div className="flex flex-col gap-1 pr-2">
              {[...config.rowHeights].reverse().map((height, reverseIndex) => {
                const rowIndex = config.rowHeights.length - 1 - reverseIndex
                return (
                  <div
                    key={`row-height-${rowIndex}`}
                    className="flex h-16 w-10 items-center justify-center rounded bg-neutral-700 text-[10px] text-neutral-300"
                  >
                    {height}cm
                  </div>
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
                  const cellId = getCellId(cell.row, cell.col)
                  const isSelected = selectedCells.has(cellId)
                  const bgColor = isEmpty ? "transparent" : getCellDisplayColor(cell)

                  return (
                    <button
                      key={cell.id}
                      className={cn(
                        "relative flex items-center justify-center rounded border-2 text-[9px] font-medium transition-all",
                        isEmpty
                          ? isGhost
                            ? "border-dashed border-blue-400/50 hover:border-blue-400 hover:bg-blue-500/10"
                            : "border-dashed border-neutral-600 hover:border-neutral-400 hover:bg-neutral-700/30"
                          : isSelected
                            ? "border-solid border-yellow-400 ring-2 ring-yellow-400"
                            : "border-solid border-neutral-500 hover:border-blue-400",
                        "cursor-pointer",
                      )}
                      style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                      title={
                        isGhost
                          ? "Geister-Zelle: Klicken zum Platzieren"
                          : isEmpty
                            ? "Leere Zelle"
                            : `${getModuleLabel(cell.type)} - Shift+Klick zum Auswählen`
                      }
                    >
                      {isEmpty ? (
                        <Plus className={cn("h-4 w-4", isGhost ? "text-blue-400" : "text-neutral-500")} />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "text-center",
                              bgColor === colorHexMap.weiss || bgColor === colorHexMap.gelb
                                ? "text-neutral-800"
                                : "text-white",
                            )}
                          >
                            {getModuleShortLabel(cell.type)}
                          </span>
                          {isSelected && (
                            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-400" />
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>

          <p className="mt-2 text-[10px] text-neutral-500">
            Tipp: Blaue Zellen sind Geister-Zellen - platziere Module dort um das Regal zu erweitern. Shift+Klick zum
            Auswählen mehrerer Zellen.
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
                      key={item.sku}
                      className="flex items-center justify-between rounded bg-neutral-700 px-3 py-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="text-neutral-100">{item.name}</div>
                        <div className="text-xs text-neutral-400">
                          Art.Nr: {item.sku} | {item.quantity}x à {item.unitPrice.toFixed(2).replace(".", ",")} €
                        </div>
                      </div>
                      <div className="text-right font-medium text-neutral-100">
                        {item.totalPrice.toFixed(2).replace(".", ",")} €
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
