"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { cn } from "@/lib/utils"
import { ShoppingCart, ChevronDown, ChevronRight, Plus, List } from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"

type Props = {
  config: ShelfConfig
  selectedTool: GridCell["type"] | null
  selectedColor: GridCell["color"]
  onSelectTool: (tool: GridCell["type"] | null) => void
  onSelectColor: (color: GridCell["color"]) => void
  onPlaceModule: (row: number, col: number, type: GridCell["type"]) => void
  onClearCell: (row: number, col: number) => void
  onResizeGrid: (columns: number, rows: number) => void
  onSetColumnWidth: (col: number, width: 38 | 75) => void
  onSetRowHeight: (row: number, height: 38 | 76) => void
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  shoppingList: Array<{ id: string; name: string; quantity: number; pricePerUnit: number; total: number }>
  price: number
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
]

const materialOptions = [
  { id: "metall" as const, label: "Metall" },
  { id: "glas" as const, label: "Glas" },
]

const moduleTypes: Array<{ id: GridCell["type"]; label: string }> = [
  { id: "ohne-seitenwaende", label: "Offenes Fach" },
  { id: "ohne-rueckwand", label: "Ohne Rückwand" },
  { id: "mit-rueckwand", label: "Mit Rückwand" },
  { id: "mit-tueren", label: "Mit Türen" },
  { id: "mit-klapptuer", label: "Mit Klapptür" },
  { id: "mit-doppelschublade", label: "Mit Schubladen" },
  { id: "abschliessbare-tueren", label: "Abschließbar" },
]

export function ConfiguratorPanel({
  config,
  selectedTool,
  selectedColor,
  onSelectTool,
  onSelectColor,
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
    const labels: Record<GridCell["type"], string> = {
      empty: "Leer",
      ghost: "Geisterzelle",
      "ohne-seitenwaende": "Offenes Fach",
      "ohne-rueckwand": "Ohne Rückwand",
      "mit-rueckwand": "Mit Rückwand",
      "mit-tueren": "Mit Türen",
      "mit-klapptuer": "Mit Klapptür",
      "mit-doppelschublade": "Mit Schubladen",
      "abschliessbare-tueren": "Abschließbar",
    }
    return labels[type] || type
  }

  const getModuleShortLabel = (type: GridCell["type"]) => {
    const labels: Record<GridCell["type"], string> = {
      empty: "",
      ghost: "",
      "ohne-seitenwaende": "Offen",
      "ohne-rueckwand": "o.RW",
      "mit-rueckwand": "m.RW",
      "mit-tueren": "Türen",
      "mit-klapptuer": "Klapp",
      "mit-doppelschublade": "Schubl.",
      "abschliessbare-tueren": "Abschl.",
    }
    return labels[type] || ""
  }

  return (
    <div className="flex w-96 flex-col border-l border-neutral-700 bg-neutral-800">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Farbe Section */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Farbe für neues Modul</h3>
          <div className="flex items-start gap-3">
            <div className="flex gap-2">
              {baseColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onSelectColor(color.id)}
                  className={cn(
                    "h-10 w-10 rounded border-2 transition-all",
                    selectedColor === color.id
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
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Sonderfarbe für neues Modul</h3>
          <div className="flex flex-wrap gap-2">
            {specialColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onSelectColor(color.id)}
                className={cn(
                  "h-10 w-10 rounded border-2 transition-all",
                  selectedColor === color.id
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

        {/* Module Type Selector */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Modultyp auswählen</h3>
          <div className="grid grid-cols-2 gap-2">
            {moduleTypes.map((moduleType) => (
              <button
                key={moduleType.id}
                onClick={() => onSelectTool(selectedTool === moduleType.id ? null : moduleType.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-all",
                  selectedTool === moduleType.id
                    ? "border-white bg-neutral-700 text-white ring-2 ring-white"
                    : "border-neutral-600 text-neutral-300 hover:border-neutral-400 hover:bg-neutral-700",
                )}
              >
                {moduleType.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-400">Wähle einen Modultyp und klicke auf grüne Geister-Zellen</p>
        </div>

        {/* Visual Grid Editor */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Konfigurations-Raster</h3>
          <p className="mb-3 text-xs text-neutral-400">
            Klicke auf grüne Geister-Zellen im 3D-Modell um Module zu platzieren
          </p>

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
                  <div
                    key={`row-height-${rowIndex}`}
                    className="flex h-12 w-10 items-center justify-center rounded bg-neutral-700 text-[10px] text-neutral-300"
                  >
                    {height}cm
                  </div>
                )
              })}
            </div>

            {/* Grid cells - visual representation only */}
            <div
              className="grid flex-1 gap-1"
              style={{
                gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
                gridTemplateRows: `repeat(${config.rows}, 3rem)`,
              }}
            >
              {[...config.grid]
                .reverse()
                .flat()
                .map((cell) => {
                  const isEmpty = cell.type === "empty" || cell.type === "ghost"
                  const isGhost = cell.type === "ghost"
                  const cellColor = cell.color || "weiss"
                  const bgColor = isEmpty ? "transparent" : colorHexMap[cellColor]

                  return (
                    <div
                      key={cell.id}
                      className={cn(
                        "relative flex items-center justify-center rounded border-2 text-[8px] font-medium",
                        isEmpty
                          ? isGhost
                            ? "border-dashed border-green-400/50 bg-green-500/10"
                            : "border-dashed border-neutral-600"
                          : "border-solid border-neutral-500",
                      )}
                      style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                      title={isGhost ? "Geister-Zelle" : isEmpty ? "Leer" : getModuleLabel(cell.type)}
                    >
                      {isEmpty ? (
                        isGhost ? (
                          <Plus className="h-3 w-3 text-green-400" />
                        ) : null
                      ) : (
                        <span className={cn("text-center", cellColor === "weiss" ? "text-neutral-800" : "text-white")}>
                          {getModuleShortLabel(cell.type)}
                        </span>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          <p className="mt-2 text-[10px] text-neutral-500">Tipp: Grüne Zellen im 3D-Modell sind klickbar</p>
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
                      key={item.id}
                      className="flex items-center justify-between rounded bg-neutral-700 px-3 py-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="text-neutral-100">{item.name}</div>
                        <div className="text-xs text-neutral-400">
                          Art.Nr: {item.id} | {item.quantity}x à {(item.pricePerUnit || 0).toFixed(2).replace(".", ",")}{" "}
                          €
                        </div>
                      </div>
                      <div className="text-right font-medium text-neutral-100">
                        {(item.total || 0).toFixed(2).replace(".", ",")} €
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
          <span className="text-2xl font-bold text-neutral-100">{(price || 0).toFixed(2).replace(".", ",")} €</span>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium uppercase tracking-wide text-white transition-colors hover:bg-blue-500">
          <ShoppingCart className="h-5 w-5" />
          In den Warenkorb
        </button>
      </div>
    </div>
  )
}
