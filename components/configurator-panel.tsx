"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import type { ShoppingItem } from "@/lib/shopping-item"
import { cn } from "@/lib/utils"
import { ShoppingCart, X, Plus, Minus, Eraser, Download, Pin, PinOff, Paintbrush, Settings2 } from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"
import { ERPExportDialog } from "./erp-export-dialog"
import { ModulePreviewSVG } from "./module-preview-svg"

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
  onSetColumnWidth: (col: number, width: 75 | 37.5 | 38) => void
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  shoppingList: ShoppingItem[]
  price: string
  showShoppingList: boolean
  onToggleShoppingList: () => void
  showMobilePanel?: boolean
  onCloseMobilePanel?: () => void
  onCollapseSidePanel?: () => void
}

const frameColors = [
  { id: "schwarz" as const, label: "Schwarz", color: colorHexMap.schwarz },
  { id: "grau" as const, label: "Grau", color: colorHexMap.grau },
]

const cellColors = [
  { id: "blau" as const, label: "Blau", color: colorHexMap.blau },
  { id: "gruen" as const, label: "Grün", color: colorHexMap.gruen },
  { id: "gelb" as const, label: "Gelb", color: colorHexMap.gelb },
  { id: "orange" as const, label: "Orange", color: colorHexMap.orange },
  { id: "rot" as const, label: "Rot", color: colorHexMap.rot },
]

const moduleTypes75 = [
  { id: "ohne-seitenwaende" as const, label: "ohne Seitenwände" },
  { id: "mit-seitenwaende" as const, label: "mit Seitenwände" },
  { id: "ohne-rueckwand" as const, label: "ohne Rückwand" },
  { id: "mit-rueckwand" as const, label: "mit Rückwand" },
  { id: "mit-tueren" as const, label: "mit Türen" },
  { id: "mit-klapptuer" as const, label: "mit Klapptür" },
  { id: "mit-doppelschublade" as const, label: "mit Doppelschublade" },
  { id: "abschliessbare-tueren" as const, label: "abschließbare Türen" },
  { id: "leer" as const, label: "Leer" },
]

const moduleTypes38 = [
  { id: "mit-tuer-links" as const, label: "Tür links" },
  { id: "mit-tuer-rechts" as const, label: "Tür rechts" },
  { id: "mit-abschliessbarer-tuer-links" as const, label: "abschließbar links" },
  { id: "mit-abschliessbarer-tuer-rechts" as const, label: "abschließbar rechts" },
]

const materialOptions = [
  { id: "metall" as const, label: "Metall" },
  { id: "glas" as const, label: "Glas" },
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
  showMobilePanel = false,
  onCloseMobilePanel,
  onCollapseSidePanel,
}: ConfiguratorPanelProps) {
  const [showERPExport, setShowERPExport] = useState(false)
  const [isModulePinned, setIsModulePinned] = useState(true)
  const [isColorPinned, setIsColorPinned] = useState(false)
  const [colorBrushActive, setColorBrushActive] = useState(false)

  const totalWidth = config.columnWidths.reduce((sum, w) => sum + w, 0)
  const totalHeight = config.rows * 38

  const panelContent = (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
        <span className="font-semibold">Konfigurator</span>
        {onCloseMobilePanel && (
          <button onClick={onCloseMobilePanel} className="p-2 hover:bg-secondary rounded-lg">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Frame Color */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {frameColors.map((c) => (
              <button
                key={c.id}
                onClick={() => onUpdateConfig({ baseColor: c.id })}
                className={cn(
                  "h-10 w-10 rounded-lg border-2 transition-all",
                  config.baseColor === c.id
                    ? "border-accent-blue ring-2 ring-accent-blue ring-offset-2 ring-offset-card"
                    : "border-border hover:border-muted-foreground",
                )}
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-card-foreground">Zellenfarbe</span>
            <button
              onClick={() => {
                setColorBrushActive(!colorBrushActive)
              }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                colorBrushActive
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                  : "bg-secondary text-muted-foreground hover:text-card-foreground",
              )}
            >
              <Paintbrush className="h-3.5 w-3.5" />
              Pinsel
              {colorBrushActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsColorPinned(!isColorPinned)
                  }}
                  className="ml-1"
                >
                  {isColorPinned ? <Pin className="h-3 w-3 text-amber-500" /> : <PinOff className="h-3 w-3" />}
                </button>
              )}
            </button>
          </div>
          <div className="flex gap-2">
            {cellColors.map((c) => (
              <button
                key={c.id}
                onClick={() => onUpdateConfig({ accentColor: c.id })}
                className={cn(
                  "h-10 w-10 rounded-lg border-2 transition-all",
                  config.accentColor === c.id
                    ? "border-white ring-2 ring-white ring-offset-2 ring-offset-card"
                    : "border-transparent hover:border-muted-foreground",
                )}
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
          </div>
          {colorBrushActive && (
            <p className="text-xs text-muted-foreground">
              Klicken Sie auf eine Zelle, um die Farbe anzuwenden
              {isColorPinned && " (Sticky: bleibt aktiv)"}
            </p>
          )}
        </div>

        {/* Floor Material */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-card-foreground">Bodenmaterial</span>
          <div className="flex gap-2">
            {materialOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => onUpdateConfig({ shelfMaterial: m.id })}
                className={cn(
                  "flex-1 py-2.5 text-sm rounded-lg border transition-all",
                  config.shelfMaterial === m.id
                    ? "bg-transparent border-accent-blue text-accent-blue font-medium"
                    : "bg-secondary border-border hover:bg-secondary/80 text-muted-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shelf Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-card-foreground">Regal-Größe</span>
            <span className="text-sm text-muted-foreground">
              {totalWidth} × {totalHeight} cm
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Reihen</span>
              <button
                onClick={() => config.rows > 1 && onResizeGrid(config.rows - 1, config.columns)}
                disabled={config.rows <= 1}
                className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center disabled:opacity-30"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-lg font-bold w-6 text-center">{config.rows}</span>
              <button
                onClick={() => config.rows < 6 && onResizeGrid(config.rows + 1, config.columns)}
                disabled={config.rows >= 6}
                className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center disabled:opacity-30"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Spalten</span>
              <button
                onClick={() => config.columns > 1 && onResizeGrid(config.rows, config.columns - 1)}
                disabled={config.columns <= 1}
                className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center disabled:opacity-30"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-lg font-bold w-6 text-center">{config.columns}</span>
              <button
                onClick={() => config.columns < 6 && onResizeGrid(config.rows, config.columns + 1)}
                disabled={config.columns >= 6}
                className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center disabled:opacity-30"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Column Widths */}
        <div className="space-y-3">
          <span className="text-xs text-muted-foreground">Spaltenbreiten (klicken zum Ändern)</span>
          <div className="flex flex-wrap gap-2">
            {config.columnWidths.map((width, idx) => (
              <button
                key={idx}
                onClick={() => {
                  let nextWidth: 75 | 37.5 | 38
                  if (width === 75) {
                    nextWidth = 37.5
                  } else if (width === 37.5) {
                    nextWidth = 38
                  } else {
                    nextWidth = 75
                  }
                  onSetColumnWidth(idx, nextWidth)
                }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg border transition-all",
                  width === 75
                    ? "border-accent-blue text-accent-blue"
                    : "border-border text-muted-foreground hover:border-accent-blue",
                )}
              >
                {width}cm
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-card-foreground">Module</span>
            </div>
            <button
              onClick={() => setIsModulePinned(!isModulePinned)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                isModulePinned
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                  : "bg-secondary text-muted-foreground hover:text-card-foreground",
              )}
            >
              {isModulePinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
              Sticky
            </button>
          </div>

          {/* Eraser */}
          <button
            onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all",
              selectedTool === "empty"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-border hover:bg-secondary",
            )}
          >
            <Eraser className="h-5 w-5" />
            <span className="text-sm">Radierer</span>
          </button>

          {/* 75cm Modules Header */}
          <div className="pt-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">75cm Module</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {moduleTypes75.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all min-h-[80px]",
                  selectedTool === module.id
                    ? "border-accent-blue bg-slate-800 text-accent-blue"
                    : "border-border hover:bg-secondary bg-secondary/50",
                )}
              >
                {selectedTool === module.id && isModulePinned && (
                  <Pin className="absolute top-2 right-2 h-3 w-3 text-amber-500" />
                )}
                <ModulePreviewSVG type={module.id} selected={selectedTool === module.id} />
                <span className="text-xs text-center leading-tight">{module.label}</span>
              </button>
            ))}
          </div>

          {/* 38cm Modules Header */}
          <div className="pt-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">38cm Module</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {moduleTypes38.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all min-h-[80px]",
                  selectedTool === module.id
                    ? "border-accent-blue bg-slate-800 text-accent-blue"
                    : "border-border hover:bg-secondary bg-secondary/50",
                )}
              >
                {selectedTool === module.id && isModulePinned && (
                  <Pin className="absolute top-2 right-2 h-3 w-3 text-amber-500" />
                )}
                <ModulePreviewSVG type={module.id} selected={selectedTool === module.id} />
                <span className="text-xs text-center leading-tight">{module.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gesamtpreis</span>
          <span className="text-xl font-bold">{price}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleShoppingList}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-blue text-white font-medium"
          >
            <ShoppingCart className="h-4 w-4" />
            Warenkorb ({shoppingList.length})
          </button>
          <button
            onClick={() => setShowERPExport(true)}
            className="p-2.5 rounded-lg border border-border hover:bg-secondary"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ERPExportDialog
        isOpen={showERPExport}
        onClose={() => setShowERPExport(false)}
        shoppingList={shoppingList}
        config={config}
      />
    </div>
  )

  return (
    <>
      {/* Mobile Panel */}
      {showMobilePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobilePanel} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw]">{panelContent}</div>
        </div>
      )}

      {/* Desktop Panel */}
      <div className="hidden lg:block w-80 h-full border-l border-border">{panelContent}</div>
    </>
  )
}
