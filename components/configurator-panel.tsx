"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell, ColorKey } from "./shelf-configurator"
import { cn } from "@/lib/utils"
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Paintbrush,
  X,
  Rows,
  Columns,
  Grid,
  Check,
  Eraser,
  MousePointer,
} from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"
import { isModuleTypeAvailableForWidth } from "@/lib/glb-registry"
import { useCartStore } from "@/lib/cart-store"
import { ModulePreview3D } from "./module-preview-3d"
import type { ModuleType } from "@/lib/glb-registry"

export type ToolMode = "select" | "brush" | "eraser"

export type WidthFilter = 40 | 80 | "all"

type Props = {
  config: ShelfConfig
  selectedTool: GridCell["type"] | null
  selectedColor: GridCell["color"]
  selectedCell: { row: number; col: number } | null
  onSelectTool: (tool: GridCell["type"] | null) => void
  onSelectColor: (color: ColorKey) => void
  onPlaceModule: (row: number, col: number, type: GridCell["type"]) => void
  onClearCell: (row: number, col: number) => void
  onResizeGrid: (columns: number, rows: number) => void
  onSetColumnWidth: (col: number, width: 38 | 75) => void
  onSetRowHeight: (row: number, height: 38 | 76) => void
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  shoppingList: Array<{
    id: string
    name: string
    quantity: number
    pricePerUnit: number
    total: number
    packSize?: number
    totalPieces?: number
  }>
  price: number
  showShoppingList: boolean
  onToggleShoppingList: () => void
  onApplyCellColor?: (row: number, col: number, color: ColorKey) => void
  onApplyColorToRow?: (row: number, color: ColorKey) => void
  onApplyColorToColumn?: (col: number, color: ColorKey) => void
  onApplyColorToAll?: (color: ColorKey) => void
  onClearCellColor?: (row: number, col: number) => void
  onDeselectCell?: () => void
  toolMode?: ToolMode
  onSetToolMode?: (mode: ToolMode) => void
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

const moduleTypes: Array<{ id: GridCell["type"]; label: string; shortLabel: string; icon: string }> = [
  { id: "offenes-fach", label: "Offenes Fach", shortLabel: "Offen", icon: "□" },
  { id: "ohne-seitenwaende", label: "Ohne Seitenwände", shortLabel: "Ohne Seiten", icon: "⊏⊐" },
  { id: "ohne-rueckwand", label: "Ohne Rückwand", shortLabel: "Ohne Rück", icon: "⊔" },
  { id: "mit-rueckwand", label: "Mit Rückwand", shortLabel: "Mit Rück", icon: "▣" },
  { id: "mit-tueren", label: "Mit Türen", shortLabel: "Mit Türen", icon: "▤" },
  { id: "mit-klapptuer", label: "Mit Klapptür", shortLabel: "Mit Klapptür", icon: "▥" },
  { id: "mit-klapptuer-oben", label: "Klapptür (nach oben)", shortLabel: "Klapptür (nach oben)", icon: "▦" },
  { id: "mit-doppelschublade", label: "Mit Schubladen", shortLabel: "Mit Schubladen", icon: "≡" },
  { id: "mit-einzelschublade", label: "Einzelschublade", shortLabel: "Einzelschublade", icon: "▭" },
  { id: "abschliessbare-tueren", label: "Abschließbar", shortLabel: "Abschließbar", icon: "🔒" },
  { id: "mit-tuere-links", label: "Mit Türe Links", shortLabel: "Mit Türe Links", icon: "◧" },
  { id: "mit-tuere-rechts", label: "Mit Türe Rechts", shortLabel: "Mit Türe Rechts", icon: "◨" },
  { id: "abschliessbar-links", label: "Abschließbar Links", shortLabel: "Abschließbar Links", icon: "🔐" },
  { id: "abschliessbar-rechts", label: "Abschließbar Rechts", shortLabel: "Abschließbar Rechts", icon: "🔐" },
]

export function ConfiguratorPanel({
  config,
  selectedTool,
  selectedColor,
  selectedCell,
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
  onApplyCellColor,
  onApplyColorToRow,
  onApplyColorToColumn,
  onApplyColorToAll,
  onClearCellColor,
  onDeselectCell,
  toolMode = "select",
  onSetToolMode,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>("grid")
  const { setItem } = useCartStore()
  const [addedToCart, setAddedToCart] = useState(false)
  const [widthFilter, setWidthFilter] = useState<WidthFilter>("all")

  const handleCellClick = (row: number, col: number) => {
    if (toolMode === "eraser") {
      onClearCell(row, col)
    } else if (toolMode === "brush" && selectedTool && selectedTool !== "empty") {
      onPlaceModule(row, col, selectedTool)
    } else if (selectedTool === "empty") {
      onClearCell(row, col)
    } else if (selectedTool) {
      onPlaceModule(row, col, selectedTool)
    }
  }

  const getModuleLabel = (type: GridCell["type"]) => {
    const labels: Record<GridCell["type"], string> = {
      empty: "Leer",
      ghost: "Geisterzelle",
      "offenes-fach": "Offenes Fach",
      "ohne-seitenwaende": "Ohne Seitenwände",
      "ohne-rueckwand": "Ohne Rückwand",
      "mit-rueckwand": "Mit Rückwand",
      "mit-tueren": "Mit Türen",
      "mit-klapptuer": "Mit Klapptür",
      "mit-klapptuer-oben": "Klapptür (nach oben)",
      "mit-doppelschublade": "Mit Schubladen",
      "mit-einzelschublade": "Einzelschublade",
      "abschliessbare-tueren": "Abschließbar",
      "mit-tuere-links": "Mit Türe Links",
      "mit-tuere-rechts": "Mit Türe Rechts",
      "abschliessbar-links": "Abschließbar Links",
      "abschliessbar-rechts": "Abschließbar Rechts",
    }
    return labels[type] || type
  }

  const getModuleShortLabel = (type: GridCell["type"]) => {
    const labels: Record<GridCell["type"], string> = {
      empty: "",
      ghost: "",
      "offenes-fach": "Offen",
      "ohne-seitenwaende": "o.SW",
      "ohne-rueckwand": "o.RW",
      "mit-rueckwand": "m.RW",
      "mit-tueren": "Türen",
      "mit-klapptuer": "Klapp",
      "mit-klapptuer-oben": "Klapp↑",
      "mit-doppelschublade": "Schubl.",
      "mit-einzelschublade": "ESchubl.",
      "abschliessbare-tueren": "Abschl.",
      "mit-tuere-links": "Türe Links",
      "mit-tuere-rechts": "Türe Rechts",
      "abschliessbar-links": "Abschl. Links",
      "abschliessbar-rechts": "Abschl. Rechts",
    }
    return labels[type] || ""
  }

  const selectedCellInfo = selectedCell ? config.grid[selectedCell.row]?.[selectedCell.col] : null

  const usedWidths = Array.from(new Set(config.columnWidths))
  const allModulesAvailable = usedWidths.length === 0

  const getModuleAvailability = (moduleTypeId: GridCell["type"]) => {
    // If a specific width filter is selected, use that
    if (widthFilter !== "all") {
      return isModuleTypeAvailableForWidth(moduleTypeId as ModuleType, widthFilter)
    }
    // Otherwise, use the existing logic based on used column widths
    return (
      allModulesAvailable ||
      usedWidths.some((width) => isModuleTypeAvailableForWidth(moduleTypeId as ModuleType, width === 75 ? 80 : 40))
    )
  }

  const handleAddToCart = () => {
    if (shoppingList.length === 0) return

    console.log("[v0] handleAddToCart called")
    console.log("[v0] shoppingList:", JSON.stringify(shoppingList, null, 2))

    for (const item of shoppingList) {
      console.log("[v0] Adding item:", item.id, "name:", item.name, "quantity:", item.quantity)
      setItem(
        {
          id: item.id,
          name: item.name,
          artNr: item.id,
          price: item.pricePerUnit || 0,
        },
        item.quantity,
      )
    }

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const totalPrice = price || 0

  return (
    <div className="hidden md:flex w-96 flex-col border-l border-neutral-700 bg-neutral-900">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedCell && selectedCellInfo && selectedCellInfo.type !== "empty" && selectedCellInfo.type !== "ghost" && (
          <div className="border-b border-neutral-700 bg-neutral-800 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-medium text-neutral-100">Zelle bearbeiten</h3>
              </div>
              <button
                onClick={onDeselectCell}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 rounded-xl bg-neutral-900 p-3 text-xs text-neutral-300">
              <span className="font-medium">{getModuleLabel(selectedCellInfo.type)}</span>
              <span className="ml-2 text-neutral-500">
                Zeile {selectedCell.row + 1}, Spalte {selectedCell.col + 1}
              </span>
            </div>

            {/* Color selection for selected cell */}
            <div className="mb-3">
              <p className="mb-2 text-xs text-neutral-400">Farbe wählen:</p>
              <div className="flex flex-wrap gap-2">
                {[...baseColors, ...specialColors].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onApplyCellColor?.(selectedCell.row, selectedCell.col, color.id)}
                    className={cn(
                      "relative h-10 w-10 rounded-xl transition-all",
                      selectedCellInfo.color === color.id
                        ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-800"
                        : "ring-1 ring-neutral-600 hover:ring-neutral-400",
                    )}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  >
                    {selectedCellInfo.color === color.id && (
                      <Check
                        className={cn(
                          "absolute inset-0 m-auto h-5 w-5",
                          color.id === "weiss" ? "text-neutral-800" : "text-white",
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <p className="text-xs text-neutral-400">Schnellaktionen:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onApplyColorToRow?.(selectedCell.row, selectedColor)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-600 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700 transition-all"
                >
                  <Rows className="h-3.5 w-3.5" />
                  Zeile färben
                </button>
                <button
                  onClick={() => onApplyColorToColumn?.(selectedCell.col, selectedColor)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-600 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700 transition-all"
                >
                  <Columns className="h-3.5 w-3.5" />
                  Spalte färben
                </button>
                <button
                  onClick={() => onApplyColorToAll?.(selectedColor)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-600 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700 transition-all"
                >
                  <Grid className="h-3.5 w-3.5" />
                  Alle färben
                </button>
                <button
                  onClick={() => onClearCellColor?.(selectedCell.row, selectedCell.col)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-600/50 px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-100">Werkzeuge</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onSetToolMode?.("select")}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-xl p-3 transition-all",
                toolMode === "select"
                  ? "bg-teal-600 text-white ring-2 ring-teal-400"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
              )}
              title="Auswahl-Modus: Klicken um einzelne Module zu platzieren"
            >
              <MousePointer className="h-5 w-5" />
              <span className="text-[10px] font-medium">Auswahl</span>
            </button>
            <button
              onClick={() => onSetToolMode?.("brush")}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-xl p-3 transition-all",
                toolMode === "brush"
                  ? "bg-teal-600 text-white ring-2 ring-teal-400"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
              )}
              title="Pinsel-Modus: Ziehen um mehrere Module zu platzieren"
            >
              <Paintbrush className="h-5 w-5" />
              <span className="text-[10px] font-medium">Pinsel</span>
            </button>
            <button
              onClick={() => onSetToolMode?.("eraser")}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-xl p-3 transition-all",
                toolMode === "eraser"
                  ? "bg-red-600 text-white ring-2 ring-red-400"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
              )}
              title="Radiergummi-Modus: Klicken oder Ziehen um Module zu entfernen"
            >
              <Eraser className="h-5 w-5" />
              <span className="text-[10px] font-medium">Radierer</span>
            </button>
          </div>
          <p className="mt-2 text-[10px] text-neutral-500">
            {toolMode === "select" && "Klicke auf Zellen um Module einzeln zu platzieren"}
            {toolMode === "brush" && "Wähle ein Modul und ziehe über die Zellen"}
            {toolMode === "eraser" && "Klicke oder ziehe um Module zu entfernen"}
          </p>
        </div>

        <div className="border-b border-neutral-700 p-4">
          <div className="mb-4">
            <p className="mb-2 text-xs text-neutral-400">Modulbreite filtern:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setWidthFilter(widthFilter === 40 ? "all" : 40)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
                  widthFilter === 40
                    ? "bg-teal-600 text-white ring-2 ring-teal-400"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
                )}
              >
                40er Module
              </button>
              <button
                onClick={() => setWidthFilter(widthFilter === 80 ? "all" : 80)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
                  widthFilter === 80
                    ? "bg-teal-600 text-white ring-2 ring-teal-400"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
                )}
              >
                80er Module
              </button>
            </div>
          </div>

          {widthFilter !== "all" ? (
            <p className="mb-3 rounded-xl bg-teal-900/30 px-3 py-2 text-xs text-teal-300">
              Module für {widthFilter}cm werden angezeigt
            </p>
          ) : !allModulesAvailable && usedWidths.length > 0 ? (
            <p className="mb-3 rounded-xl bg-teal-900/30 px-3 py-2 text-xs text-teal-300">
              {usedWidths.length === 1 ? (
                <>Module für {usedWidths[0] === 75 ? "80" : "40"}cm verfügbar</>
              ) : (
                <>40cm und 80cm Module verfügbar</>
              )}
            </p>
          ) : null}

          <div className="grid grid-cols-4 gap-2">
            {moduleTypes.map((moduleType) => {
              const isAvailable = getModuleAvailability(moduleType.id)

              return (
                <button
                  key={moduleType.id}
                  onClick={() =>
                    isAvailable ? onSelectTool(selectedTool === moduleType.id ? null : moduleType.id) : null
                  }
                  disabled={!isAvailable}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl p-1 transition-all overflow-hidden",
                    !isAvailable && "opacity-30 cursor-not-allowed",
                    selectedTool === moduleType.id
                      ? "bg-teal-600 text-white ring-2 ring-teal-400"
                      : isAvailable
                        ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                        : "bg-neutral-800/50 text-neutral-500",
                  )}
                  title={moduleType.label}
                >
                  <div className="w-12 h-10 pointer-events-none">
                    <ModulePreview3D
                      moduleType={moduleType.id as ModuleType}
                      width={
                        widthFilter !== "all" ? widthFilter : usedWidths.length === 1 && usedWidths[0] === 38 ? 40 : 80
                      }
                    />
                  </div>
                  <span className="text-[8px] font-medium leading-tight text-center line-clamp-1">
                    {moduleType.shortLabel}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[10px] text-neutral-500">
            Ausgegraute Module sind für die gewählte Breite nicht verfügbar
          </p>

          <div className="mt-4 pt-4 border-t border-neutral-700">
            <p className="mb-2 text-xs text-neutral-400">Farbe für neue Module:</p>
            <div className="flex flex-wrap gap-2">
              {[...baseColors, ...specialColors].map((color) => (
                <button
                  key={color.id}
                  onClick={() => onSelectColor(color.id)}
                  className={cn(
                    "relative h-8 w-8 rounded-lg transition-all",
                    selectedColor === color.id
                      ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-neutral-800"
                      : "ring-1 ring-neutral-600 hover:ring-neutral-400",
                  )}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                >
                  {selectedColor === color.id && (
                    <Check
                      className={cn(
                        "absolute inset-0 m-auto h-4 w-4",
                        color.id === "weiss" || color.id === "gelb" ? "text-neutral-800" : "text-white",
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Grid Editor */}
        <div className="border-b border-neutral-700 p-4">
          <h3 className="mb-2 text-sm font-medium text-neutral-100">Konfigurations-Raster</h3>
          <p className="mb-3 text-xs text-neutral-400">
            Klicke auf grüne Geister-Zellen im 3D-Modell um Module zu platzieren
          </p>

          {/* Column width controls */}
          <div className="mb-2 flex gap-1 pl-12">
            {config.columnWidths.map((width, colIndex) => (
              <button
                key={`col-width-${colIndex}`}
                onClick={() => onSetColumnWidth(colIndex, width === 75 ? 38 : 75)}
                className="flex-1 rounded-lg bg-neutral-800 px-1 py-0.5 text-[10px] text-neutral-300 hover:bg-neutral-700 transition-all"
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
                    className="flex h-12 w-10 items-center justify-center rounded-lg bg-neutral-800 text-[10px] text-neutral-300"
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
                        "relative flex items-center justify-center rounded-lg border-2 text-[8px] font-medium cursor-pointer transition-all",
                        isEmpty
                          ? isGhost
                            ? "border-dashed border-green-400/50 bg-green-500/10 hover:bg-green-500/20"
                            : "border-dashed border-neutral-600"
                          : "border-solid border-neutral-500 hover:border-neutral-400",
                      )}
                      style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                      title={isGhost ? "Geister-Zelle" : isEmpty ? "Leer" : getModuleLabel(cell.type)}
                      onClick={() => handleCellClick(cell.row, cell.col)}
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
            className="flex w-full items-center gap-2 p-4 text-left text-neutral-100 transition-colors hover:bg-neutral-800"
          >
            {showShoppingList ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <List className="h-4 w-4" />
            <span className="font-medium">Einkaufsliste ({shoppingList.length} Produkte)</span>
          </button>

          {showShoppingList && (
            <div className="px-4 pb-4">
              {shoppingList.length === 0 ? (
                <div className="py-6 text-center">
                  <ShoppingCart className="mx-auto mb-2 h-10 w-10 text-neutral-600" />
                  <p className="text-sm text-neutral-400">Noch keine Module hinzugefügt</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-neutral-800 px-3 py-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="text-neutral-100 font-medium">{item.name}</div>
                        <div className="text-xs text-neutral-400">
                          Art.Nr: {item.id} | {item.quantity}x à {(item.pricePerUnit || 0).toFixed(2).replace(".", ",")}{" "}
                          €
                        </div>
                      </div>
                      <div className="text-right font-semibold text-teal-400">
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
      <div className="border-t border-neutral-700 bg-neutral-900 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-neutral-400">Preis:</span>
          <span className="text-3xl font-bold text-neutral-100">{totalPrice.toFixed(2).replace(".", ",")} €</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={shoppingList.length === 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-all",
            addedToCart
              ? "bg-green-600 text-white"
              : shoppingList.length === 0
                ? "cursor-not-allowed bg-neutral-700 text-neutral-500"
                : "bg-teal-600 text-white hover:bg-teal-700",
          )}
        >
          {addedToCart ? (
            <>
              <Check className="h-5 w-5" />
              Hinzugefügt!
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              In den Warenkorb
            </>
          )}
        </button>
        {addedToCart && (
          <a
            href="/warenkorb"
            className="mt-2 block text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            Zum Warenkorb →
          </a>
        )}
      </div>
    </div>
  )
}
