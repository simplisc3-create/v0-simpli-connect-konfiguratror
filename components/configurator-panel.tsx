"use client"

import { useState, useCallback } from "react"
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
} from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"
import { isModuleTypeAvailableForWidth } from "@/lib/glb-registry"
import { useCartStore } from "@/lib/cart-store"
import { ModulePreview3D } from "./module-preview-3d"
import { ModuleThumbnail3D } from "./module-thumbnail-3d"
import type { ModuleType } from "@/lib/glb-registry"
import { getModuleLabel, getModuleShortLabel } from "@/lib/module-utils"
import { modules80, modules40, getModuleTypeFromThumbnailId } from "@/lib/module-thumbnails"
import type { FootType } from "./shelf-configurator"
import Image from "next/image"



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
  defaultNewColumnWidth?: 75 | 38
  onSetDefaultColumnWidth?: (width: 75 | 38) => void
  footType?: FootType
  onSetFootType?: (footType: FootType) => void
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
  defaultNewColumnWidth = 75,
  onSetDefaultColumnWidth,
  footType = "black-plastic",
  onSetFootType,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string>("modules")
  const { setItem } = useCartStore()
  const [addedToCart, setAddedToCart] = useState(false)
  const [widthFilter, setWidthFilter] = useState<WidthFilter>(80)

  const totalWidthCm = config.columnWidths.reduce((sum, w) => {
    // Filter out ghost columns (columns that only have ghost cells)
    const colIndex = config.columnWidths.indexOf(w)
    const hasRealModule = config.grid.some((row) => {
      const cell = row[colIndex]
      return cell && cell.type !== "ghost" && cell.type !== "empty"
    })
    return hasRealModule ? sum + (w === 38 ? 40 : 80) : sum
  }, 0)

  const totalHeightCm = config.rowHeights.reduce((sum, h, rowIndex) => {
    // Check if this row has any real modules
    const hasRealModule = config.grid[rowIndex]?.some((cell) => cell && cell.type !== "ghost" && cell.type !== "empty")
    return hasRealModule ? sum + h : sum
  }, 0)

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (selectedTool === "empty") {
        onClearCell(row, col)
      } else if (selectedTool) {
        onPlaceModule(row, col, selectedTool)
      }
    },
    [selectedTool, onClearCell, onPlaceModule],
  )

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

    for (const item of shoppingList) {
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
    <div className="flex h-full flex-col bg-card text-foreground overflow-hidden shadow-xl">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedCell && selectedCellInfo && selectedCellInfo.type !== "empty" && selectedCellInfo.type !== "ghost" && (
          <div className="border-b border-border bg-muted p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Paintbrush className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Zelle bearbeiten</h3>
              </div>
              <button
                onClick={onDeselectCell}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 rounded-xl bg-background border border-border p-3 text-xs text-foreground shadow-sm">
              <span className="font-semibold text-foreground">{getModuleLabel(selectedCellInfo.type)}</span>
              <span className="ml-2 text-muted-foreground">
                Zeile {selectedCell.row + 1}, Spalte {selectedCell.col + 1}
              </span>
            </div>

            {/* Color selection for selected cell */}
            <div className="mb-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Farbe wählen:</p>
              <div className="flex flex-wrap gap-2">
                {[...baseColors, ...specialColors].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onApplyCellColor?.(selectedCell.row, selectedCell.col, color.id)}
                    className={cn(
                      "relative h-10 w-10 rounded-xl transition-all shadow-sm",
                      selectedCellInfo.color === color.id
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                        : "ring-1 ring-border hover:ring-foreground/50 hover:scale-105",
                    )}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  >
                    {selectedCellInfo.color === color.id && (
                      <Check
                        className={cn(
                          "absolute inset-0 m-auto h-5 w-5",
                          color.id === "weiss" || color.id === "gelb" ? "text-gray-800" : "text-white",
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Schnellaktionen:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onApplyColorToRow?.(selectedCell.row, selectedColor)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Rows className="h-3.5 w-3.5" />
                  Zeile färben
                </button>
                <button
                  onClick={() => onApplyColorToColumn?.(selectedCell.col, selectedColor)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Columns className="h-3.5 w-3.5" />
                  Spalte färben
                </button>
                <button
                  onClick={() => onApplyColorToAll?.(selectedColor)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Grid className="h-3.5 w-3.5" />
                  Alle färben
                </button>
                <button
                  onClick={() => onClearCellColor?.(selectedCell.row, selectedCell.col)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100 hover:border-red-300 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-gray-100 p-4">
          {/* Tab Navigation */}
          <div className="mb-4">
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => {
                  setWidthFilter(80)
                  onSetDefaultColumnWidth?.(75)
                }}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
                  widthFilter === 80
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                80er Module
              </button>
              <button
                onClick={() => {
                  setWidthFilter(40)
                  onSetDefaultColumnWidth?.(38)
                }}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
                  widthFilter === 40
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                40er Module
              </button>
            </div>
          </div>

          {/* Module Grid with 3D Thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {(widthFilter === 80 ? modules80 : modules40).map((module) => {
              const actualModuleType = getModuleTypeFromThumbnailId(module.id)
              
              return (
                <button
                  key={module.id}
                  className={cn(
                    "group relative flex flex-col items-center justify-center rounded-xl p-2 transition-all border-2 cursor-pointer",
                    selectedTool === actualModuleType
                      ? "bg-teal-50 border-teal-400 text-teal-700 shadow-md shadow-teal-100"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
                  )}
                  onClick={() => onSelectTool(actualModuleType)}
                  title={module.name}
                >
                  <div className="relative h-16 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                    <ModuleThumbnail3D
                      moduleType={actualModuleType as ModuleType}
                      width={widthFilter === 80 ? 80 : 40}
                      color={selectedColor === "weiss" ? "white" : selectedColor === "schwarz" ? "black" : selectedColor === "blau" ? "blue" : selectedColor === "gruen" ? "green" : selectedColor === "gelb" ? "yellow" : selectedColor === "rot" ? "red" : "white"}
                    />
                  </div>
                  <span className="mt-1.5 text-[9px] font-semibold leading-tight text-center line-clamp-2">
                    {module.name}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[10px] text-gray-500">
            {widthFilter === 80 ? "80cm breite Module" : widthFilter === 40 ? "40cm breite Module" : "Alle Module"}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="mb-2 text-xs font-medium text-gray-600">Farbe für neue Module:</p>
            <div className="flex flex-wrap gap-2">
              {[...baseColors, ...specialColors].map((color) => (
                <button
                  key={color.id}
                  onClick={() => onSelectColor(color.id)}
                  className={cn(
                    "relative h-8 w-8 rounded-lg transition-all shadow-sm",
                    selectedColor === color.id
                      ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-white scale-110"
                      : "ring-1 ring-gray-200 hover:ring-gray-300 hover:scale-105",
                  )}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                >
                  {selectedColor === color.id && (
                    <Check
                      className={cn(
                        "absolute inset-0 m-auto h-4 w-4",
                        color.id === "weiss" || color.id === "gelb" ? "text-gray-800" : "text-white",
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Foot Type Selection */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="mb-2 text-xs font-medium text-gray-600">Fuss-Optionen (4 Stück pro Bodenmodul):</p>
            <div className="grid grid-cols-3 gap-2">
              {/* Black Plastic Feet */}
              <button
                onClick={() => onSetFootType?.("black-plastic")}
                className={cn(
                  "relative flex flex-col items-center rounded-xl p-2 transition-all border-2",
                  footType === "black-plastic"
                    ? "bg-teal-50 border-teal-400 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="h-12 w-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-gray-800" />
                    ))}
                  </div>
                </div>
                <span className="mt-1 text-[9px] font-semibold text-gray-700">Standard</span>
                {footType === "black-plastic" && (
                  <Check className="absolute top-1 right-1 h-3 w-3 text-teal-600" />
                )}
              </button>

              {/* Casters */}
              <button
                onClick={() => onSetFootType?.("casters")}
                className={cn(
                  "relative flex flex-col items-center rounded-xl p-2 transition-all border-2",
                  footType === "casters"
                    ? "bg-teal-50 border-teal-400 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="h-12 w-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/feet/casters.webp"
                    alt="Rollen"
                    width={80}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="mt-1 text-[9px] font-semibold text-gray-700">Rollen</span>
                {footType === "casters" && (
                  <Check className="absolute top-1 right-1 h-3 w-3 text-teal-600" />
                )}
              </button>

              {/* Chrome Adjustable */}
              <button
                onClick={() => onSetFootType?.("chrome-adjustable")}
                className={cn(
                  "relative flex flex-col items-center rounded-xl p-2 transition-all border-2",
                  footType === "chrome-adjustable"
                    ? "bg-teal-50 border-teal-400 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="h-12 w-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/feet/chrome-adjustable.webp"
                    alt="Verchromte Stellfüße"
                    width={80}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="mt-1 text-[9px] font-semibold text-gray-700">Stellfüße</span>
                {footType === "chrome-adjustable" && (
                  <Check className="absolute top-1 right-1 h-3 w-3 text-teal-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Visual Grid Editor */}
        <div className="border-b border-gray-100 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Konfigurations-Raster</h3>
          <p className="mb-3 text-xs text-gray-500">
            Klicke auf grüne Geister-Zellen im 3D-Modell um Module zu platzieren
          </p>

          {/* Column width controls */}
          <div className="mb-2 flex gap-1 pl-12">
            {config.columnWidths.map((width, colIndex) => (
              <button
                key={`col-width-${colIndex}`}
                onClick={() => onSetColumnWidth(colIndex, width === 75 ? 38 : 75)}
                className="flex-1 rounded-lg bg-gray-100 px-1 py-0.5 text-[10px] text-gray-600 hover:bg-gray-200 transition-all font-medium"
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
                    className="flex h-12 w-10 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-600 font-medium"
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
                        "relative flex items-center justify-center rounded-lg border-2 text-[8px] font-semibold cursor-pointer transition-all",
                        isEmpty
                          ? isGhost
                            ? "border-dashed border-teal-400/60 bg-teal-500/10 hover:bg-teal-500/20"
                            : "border-dashed border-gray-300"
                          : "border-solid border-gray-300 hover:border-gray-400 shadow-sm",
                      )}
                      style={{ backgroundColor: isEmpty ? undefined : bgColor }}
                      title={isGhost ? "Geister-Zelle" : isEmpty ? "Leer" : getModuleLabel(cell.type)}
                      onClick={() => handleCellClick(cell.row, cell.col)}
                    >
                      {isEmpty ? (
                        isGhost ? (
                          <Plus className="h-3 w-3 text-teal-500" />
                        ) : null
                      ) : (
                        <span className={cn("text-center", cellColor === "weiss" || cellColor === "gelb" ? "text-gray-800" : "text-white")}>
                          {getModuleShortLabel(cell.type)}
                        </span>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          <p className="mt-2 text-[10px] text-gray-500">Tipp: Grüne Zellen im 3D-Modell sind klickbar</p>
        </div>

        {/* Shopping List */}
        <div className="border-b border-gray-100">
          <button
            onClick={onToggleShoppingList}
            className="flex w-full items-center gap-2 p-4 text-left text-gray-900 transition-colors hover:bg-gray-50"
          >
            {showShoppingList ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            <List className="h-4 w-4 text-gray-500" />
            <span className="font-semibold">Einkaufsliste ({shoppingList.length} Produkte)</span>
          </button>

          {showShoppingList && (
            <div className="px-4 pb-4">
              {shoppingList.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShoppingCart className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Noch keine Module hinzugefügt</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-sm"
                    >
                      <div className="flex-1">
                        <div className="text-gray-900 font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          Art.Nr: {item.id} | {item.quantity}x à {(item.pricePerUnit || 0).toFixed(2).replace(".", ",")}{" "}
                          EUR
                        </div>
                      </div>
                      <div className="text-right font-bold text-teal-600">
                        {(item.total || 0).toFixed(2).replace(".", ",")} EUR
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
      <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-medium text-gray-600">Gesamtpreis:</span>
          <span className="text-3xl font-bold text-gray-900">{totalPrice.toFixed(2).replace(".", ",")} EUR</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={shoppingList.length === 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-all shadow-sm",
            addedToCart
              ? "bg-green-500 text-white shadow-green-200 shadow-md"
              : shoppingList.length === 0
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-md",
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
            className="mt-2 block text-center text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Zum Warenkorb
          </a>
        )}
      </div>
    </div>
  )
}
