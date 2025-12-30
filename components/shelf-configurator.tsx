"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { ShelfScene } from "./shelf-scene"
import { LiveCart } from "./live-cart"
import {
  Undo2,
  Redo2,
  RotateCcw,
  Eraser,
  Square,
  PanelTop,
  DoorOpen,
  Lock,
  PanelTopOpen,
  Archive,
  Trash2,
  Grid3X3,
  LayoutGrid,
  Plus,
  Minus,
  Package,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type GridCell = {
  id: string
  type:
    | "empty"
    | "ohne-seitenwaende"
    | "mit-seitenwaenden"
    | "ohne-rueckwand"
    | "mit-rueckwand"
    | "mit-tueren"
    | "abschliessbare-tueren"
    | "schubladen"
    | "mit-doppelschublade"
    | "mit-klapptuer"
  color: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau" | "orange"
}

export type ShelfConfig = {
  columns: ColumnData[]
  material: "metall" | "glas" | "holz"
  accentColor: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau" | "orange"
  footType: "standard" | "rollen" | "keine"
}

export type ColumnData = {
  width: 38 | 75
  cells: GridCell[]
}

type ModuleType = GridCell["type"]

const createEmptyCell = (id: string, color: GridCell["color"] = "weiss"): GridCell => ({
  id,
  type: "empty",
  color,
})

const createInitialConfig = (): ShelfConfig => ({
  columns: [
    {
      width: 75,
      cells: [createEmptyCell("col-0-cell-0")],
    },
  ],
  material: "metall",
  accentColor: "weiss",
  footType: "standard",
})

const moduleTypes = [
  { id: "ohne-seitenwaende" as const, label: "ohne Seitenwände", icon: Square },
  { id: "ohne-rueckwand" as const, label: "ohne Rückwand", icon: LayoutGrid },
  { id: "mit-rueckwand" as const, label: "mit Rückwand", icon: PanelTop },
  { id: "mit-tueren" as const, label: "mit Türen", icon: DoorOpen },
  { id: "mit-klapptuer" as const, label: "mit Klapptür", icon: PanelTopOpen },
  { id: "mit-doppelschublade" as const, label: "mit Doppelschublade", icon: Archive },
  { id: "abschliessbare-tueren" as const, label: "abschließbare Türen", icon: Lock },
] as const

const baseColors = [
  { id: "weiss" as const, label: "Weiß", hex: "#F5F5F5" },
  { id: "schwarz" as const, label: "Schwarz", hex: "#1A1A1A" },
]

const specialColorOptions = [
  { id: "blau" as const, label: "Blau", hex: "#00566B" },
  { id: "gruen" as const, label: "Grün", hex: "#228B22" },
  { id: "gelb" as const, label: "Gelb", hex: "#9A8700" },
  { id: "orange" as const, label: "Orange", hex: "#B45309" },
  { id: "rot" as const, label: "Rot", hex: "#7F1D1D" },
]

const footTypeOptions = [
  { id: "standard" as const, label: "Standard" },
  { id: "rollen" as const, label: "Rollen" },
  { id: "keine" as const, label: "Keine" },
]

function ModulePreviewIcon({ type, isSelected }: { type: GridCell["type"] | "empty"; isSelected?: boolean }) {
  const strokeColor = isSelected ? "rgb(0, 180, 216)" : "currentColor"
  const fillColor = "transparent"

  switch (type) {
    case "ohne-seitenwaende":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect
            x="8"
            y="8"
            width="32"
            height="24"
            rx="2"
            stroke={strokeColor}
            strokeWidth="2"
            fill={fillColor}
            strokeDasharray="4 2"
          />
        </svg>
      )
    case "ohne-rueckwand":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
        </svg>
      )
    case "mit-rueckwand":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <rect x="12" y="12" width="24" height="16" rx="1" fill={strokeColor} fillOpacity="0.2" />
        </svg>
      )
    case "mit-tueren":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <circle cx="18" cy="20" r="2" fill={strokeColor} />
          <circle cx="30" cy="20" r="2" fill={strokeColor} />
        </svg>
      )
    case "mit-klapptuer":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <line x1="8" y1="20" x2="40" y2="20" stroke={strokeColor} strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="24" cy="26" r="2" fill={strokeColor} />
        </svg>
      )
    case "mit-doppelschublade":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <line x1="8" y1="20" x2="40" y2="20" stroke={strokeColor} strokeWidth="2" />
          <line x1="20" y1="14" x2="28" y2="14" stroke={strokeColor} strokeWidth="2" />
          <line x1="20" y1="26" x2="28" y2="26" stroke={strokeColor} strokeWidth="2" />
        </svg>
      )
    case "abschliessbare-tueren":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <rect x="16" y="16" width="6" height="8" rx="1" fill={strokeColor} />
          <rect x="26" y="16" width="6" height="8" rx="1" fill={strokeColor} />
        </svg>
      )
    default:
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
        </svg>
      )
  }
}

function ModuleIconSVG({ type }: { type: GridCell["type"] }) {
  const iconSize = 20
  switch (type) {
    case "ohne-seitenwaende":
      return <Square width={iconSize} height={iconSize} />
    case "mit-seitenwaenden":
      return <Grid3X3 width={iconSize} height={iconSize} />
    case "ohne-rueckwand":
      return <LayoutGrid width={iconSize} height={iconSize} />
    case "mit-rueckwand":
      return <PanelTop width={iconSize} height={iconSize} />
    case "mit-tueren":
      return <DoorOpen width={iconSize} height={iconSize} />
    case "abschliessbare-tueren":
      return <Lock width={iconSize} height={iconSize} />
    case "mit-klapptuer":
      return <PanelTopOpen width={iconSize} height={iconSize} />
    case "mit-doppelschublade":
      return <Archive width={iconSize} height={iconSize} />
    case "schubladen":
      return <Archive width={iconSize} height={iconSize} />
    case "delete":
      return <Trash2 width={iconSize} height={iconSize} />
    default:
      return null
  }
}

const hasAnyModules = (config: ShelfConfig): boolean => {
  return config.columns.some((col) => col.cells.some((cell) => cell.type !== "empty"))
}

const materialOptions = [
  { id: "metall" as const, label: "Metall" },
  { id: "glas" as const, label: "Glas" },
  { id: "holz" as const, label: "Holz" },
]

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(createInitialConfig())
  const [selectedTool, setSelectedTool] = useState<ModuleType | "empty" | null>("ohne-rueckwand")
  const [selectedCell, setSelectedCell] = useState<{ col: number; stackIndex: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ col: number; stackIndex: number } | null>(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAction, setDragAction] = useState<"add" | "remove" | null>(null)
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false)
  const [dragState, setDragState] = useState<{
    active: boolean
    startCell: { col: number; stackIndex: number } | null
  }>({
    active: false,
    startCell: null,
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [expandedWidthSelector, setExpandedWidthSelector] = useState<number | null>(null)

  const isConfiguratorStarted = hasAnyModules(config)

  const [history, setHistory] = useState<ShelfConfig[]>([createInitialConfig()])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedo = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const saveToHistory = useCallback(
    (newConfig: ShelfConfig) => {
      if (isUndoRedo.current) {
        isUndoRedo.current = false
        return
      }
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        return [...newHistory, newConfig].slice(-50)
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 49))
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setConfig(history[newIndex])
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setConfig(history[newIndex])
    }
  }, [historyIndex, history])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleCellClick = useCallback(
    (col: number, stackIndex: number) => {
      if (!selectedTool) return

      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column

          const newCells = column.cells.map((cell, cellIdx) => {
            if (cellIdx !== stackIndex) return cell

            if (selectedTool === "empty" || selectedTool === "delete") {
              if (
                cellIdx === column.cells.length - 1 ||
                column.cells.slice(cellIdx + 1).every((c) => c.type === "empty")
              ) {
                return { ...cell, type: "empty" as const }
              }
              return cell
            }

            return { ...cell, type: selectedTool, color: cell.color || prev.accentColor }
          })

          return { ...column, cells: newCells }
        })

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  const handleExpandUp = useCallback(
    (col: number) => {
      if (!selectedTool || selectedTool === "empty" || selectedTool === "delete") return

      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column

          const hasFilledCell = column.cells.some((c) => c.type !== "empty")
          if (!hasFilledCell) return column

          const newCell: GridCell = {
            id: `col-${col}-cell-${column.cells.length}`,
            type: selectedTool,
            color: prev.accentColor,
          }

          return { ...column, cells: [...column.cells, newCell] }
        })

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  const handleExpandLeft = useCallback(
    (width: 38 | 75 = 75) => {
      setConfig((prev) => {
        const newCell: GridCell = {
          id: `col-0-cell-0`,
          type: selectedTool && selectedTool !== "empty" && selectedTool !== "delete" ? selectedTool : "empty",
          color: prev.accentColor,
        }

        const newColumn: ColumnData = {
          width,
          cells: [newCell],
        }

        const updatedColumns = prev.columns.map((col, idx) => ({
          ...col,
          cells: col.cells.map((cell, cellIdx) => ({
            ...cell,
            id: `col-${idx + 1}-cell-${cellIdx}`,
          })),
        }))

        const newConfig = { ...prev, columns: [newColumn, ...updatedColumns] }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  const handleExpandRight = useCallback(
    (width: 38 | 75 = 75) => {
      setConfig((prev) => {
        const newColIndex = prev.columns.length
        const newCell: GridCell = {
          id: `col-${newColIndex}-cell-0`,
          type: selectedTool && selectedTool !== "empty" && selectedTool !== "delete" ? selectedTool : "empty",
          color: prev.accentColor,
        }

        const newColumn: ColumnData = {
          width,
          cells: [newCell],
        }

        const newConfig = { ...prev, columns: [...prev.columns, newColumn] }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  const handleAddRow = useCallback(() => {
    setConfig((prev) => {
      const newColumns = prev.columns.map((column, colIdx) => {
        const newCell: GridCell = {
          id: `col-${colIdx}-cell-${column.cells.length}`,
          type: "empty",
          color: prev.accentColor,
        }
        return { ...column, cells: [...column.cells, newCell] }
      })
      const newConfig = { ...prev, columns: newColumns }
      setTimeout(() => saveToHistory(newConfig), 0)
      return newConfig
    })
  }, [saveToHistory])

  const handleRemoveRow = useCallback(() => {
    setConfig((prev) => {
      const maxCells = Math.max(...prev.columns.map((col) => col.cells.length))
      if (maxCells <= 1) return prev

      const newColumns = prev.columns.map((column) => {
        if (column.cells.length <= 1) return column
        return { ...column, cells: column.cells.slice(0, -1) }
      })
      const newConfig = { ...prev, columns: newColumns }
      setTimeout(() => saveToHistory(newConfig), 0)
      return newConfig
    })
  }, [saveToHistory])

  const handleAddColumn = useCallback(() => {
    handleExpandRight(38)
  }, [handleExpandRight])

  const handleRemoveColumn = useCallback(() => {
    setConfig((prev) => {
      if (prev.columns.length <= 1) return prev
      const newConfig = { ...prev, columns: prev.columns.slice(0, -1) }
      setTimeout(() => saveToHistory(newConfig), 0)
      return newConfig
    })
  }, [saveToHistory])

  const handleMaterialChange = useCallback(
    (material: "metall" | "glas" | "holz") => {
      setConfig((prev) => {
        const newConfig = { ...prev, material }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleColorChange = useCallback(
    (color: ShelfConfig["accentColor"]) => {
      setConfig((prev) => {
        // Update all cells to new color
        const newColumns = prev.columns.map((column) => ({
          ...column,
          cells: column.cells.map((cell) => ({
            ...cell,
            color: color,
          })),
        }))
        const newConfig = { ...prev, accentColor: color, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleFootTypeChange = useCallback(
    (footType: ShelfConfig["footType"]) => {
      setConfig((prev) => {
        const newConfig = { ...prev, footType }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleColumnWidthChange = useCallback(
    (colIndex: number, newWidth: 38 | 75) => {
      setConfig((prev) => {
        const newColumns = prev.columns.map((col, idx) => {
          if (idx !== colIndex) return col
          return { ...col, width: newWidth }
        })
        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
      setExpandedWidthSelector(null)
    },
    [saveToHistory],
  )

  const reset = useCallback(() => {
    const newConfig = createInitialConfig()
    setConfig(newConfig)
    setHistory([newConfig])
    setHistoryIndex(0)
    setSelectedTool("ohne-rueckwand")
  }, [])

  const onSelectTool = useCallback((tool: ModuleType | "empty" | null) => {
    setSelectedTool(tool)
  }, [])

  const handleUpdateCellColor = useCallback(
    (row: number, col: number, color: GridCell["color"]) => {
      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column

          const newCells = column.cells.map((cell, cellIdx) => {
            if (cellIdx !== row) return cell
            return { ...cell, color }
          })

          return { ...column, cells: newCells }
        })

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const priceFormatted = useMemo(() => {
    return (0).toFixed(2).replace(".", ",")
  }, [config])

  const configWithDefaults = useMemo(
    () => ({
      ...config,
    }),
    [config],
  )

  const rowCount = Math.max(...config.columns.map((col) => col.cells.length))
  const colCount = config.columns.length

  const totalWidth = config.columns.reduce((sum, col) => sum + col.width, 0)
  const totalHeight = rowCount * 38 // Each row is 38cm

  const resetCamera = useCallback(() => {
    // Reset camera logic here
  }, [])

  return (
    <div className="flex h-screen flex-col bg-muted/30 lg:flex-row">
      {/* Mobile cart toggle only */}
      {isMobile && <LiveCart config={config} isOpen={isCartOpen} onToggle={() => setIsCartOpen(!isCartOpen)} />}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[320px] bg-[#0a0a0a] border-r border-border/30 flex-col overflow-y-auto",
          "hidden lg:flex",
        )}
      >
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Farbe</h3>
          <div className="flex gap-2">
            {baseColors.map((c) => (
              <button
                key={c.id}
                onClick={() => handleColorChange(c.id)}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 transition-all",
                  config.accentColor === c.id
                    ? "border-[#00b4d8] ring-2 ring-[#00b4d8]/30"
                    : "border-border/50 hover:border-border",
                )}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 border-t border-border/20">
          <h3 className="text-sm font-semibold text-foreground">Sonderfarbe</h3>
          <div className="flex gap-2 flex-wrap">
            {specialColorOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => handleColorChange(c.id)}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 transition-all",
                  config.accentColor === c.id
                    ? "border-[#00b4d8] ring-2 ring-[#00b4d8]/30"
                    : "border-border/50 hover:border-border",
                )}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Bodenmaterial Section */}
        <div className="p-4 space-y-3 border-t border-border/20">
          <h3 className="text-sm font-semibold text-foreground">Bodenmaterial</h3>
          <div className="flex gap-2">
            {materialOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMaterialChange(m.id)}
                className={cn(
                  "flex-1 py-2.5 text-sm rounded-lg border transition-all",
                  config.material === m.id
                    ? "bg-transparent border-[#00b4d8] text-[#00b4d8] font-medium"
                    : "bg-transparent border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 border-t border-border/20">
          <h3 className="text-sm font-semibold text-foreground">Regalfüße</h3>
          <div className="flex gap-2">
            {footTypeOptions.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFootTypeChange(f.id)}
                className={cn(
                  "flex-1 py-2.5 text-sm rounded-lg border transition-all",
                  config.footType === f.id
                    ? "bg-transparent border-[#00b4d8] text-[#00b4d8] font-medium"
                    : "bg-transparent border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 border-t border-border/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Regal-Größe</h3>
            <span className="text-xs text-muted-foreground">
              {totalWidth} × {totalHeight} cm
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Reihen</span>
              <button
                onClick={handleRemoveRow}
                disabled={rowCount <= 1}
                className="h-8 w-8 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30 hover:bg-[#252525] transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-base font-bold w-5 text-center">{rowCount}</span>
              <button
                onClick={handleAddRow}
                disabled={rowCount >= 6}
                className="h-8 w-8 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30 hover:bg-[#252525] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Spalten</span>
              <button
                onClick={handleRemoveColumn}
                disabled={colCount <= 1}
                className="h-8 w-8 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30 hover:bg-[#252525] transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-base font-bold w-5 text-center">{colCount}</span>
              <button
                onClick={handleAddColumn}
                disabled={colCount >= 6}
                className="h-8 w-8 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30 hover:bg-[#252525] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Spaltenbreiten (klicken zum Ändern)</span>
            <div className="flex gap-2">
              {config.columns.map((col, idx) => (
                <div key={idx} className="relative">
                  <button
                    onClick={() => setExpandedWidthSelector(expandedWidthSelector === idx ? null : idx)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-all",
                      col.width === 75
                        ? "bg-[#00b4d8]/10 border-[#00b4d8]/50 text-[#00b4d8]"
                        : "bg-[#1a1a1a] border-border/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {col.width}cm
                  </button>
                  {expandedWidthSelector === idx && (
                    <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-border/50 rounded-lg shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={() => handleColumnWidthChange(idx, 38)}
                        className={cn(
                          "w-full px-4 py-2 text-xs text-left hover:bg-[#252525] transition-colors",
                          col.width === 38 && "text-[#00b4d8]",
                        )}
                      >
                        38 cm
                      </button>
                      <button
                        onClick={() => handleColumnWidthChange(idx, 75)}
                        className={cn(
                          "w-full px-4 py-2 text-xs text-left hover:bg-[#252525] transition-colors",
                          col.width === 75 && "text-[#00b4d8]",
                        )}
                      >
                        75 cm
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simpli-Elemente Section */}
        <div className="p-4 space-y-3 border-t border-border/20">
          <h3 className="text-sm font-semibold text-foreground">
            Simpli-Elemente <span className="text-muted-foreground font-normal">(Klicken oder Ziehen)</span>
          </h3>

          {/* Eraser Tool */}
          <button
            onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
              selectedTool === "empty"
                ? "border-[#00b4d8] bg-[#00b4d8]/10 text-[#00b4d8]"
                : "border-border/30 bg-[#1a1a1a] text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            <Eraser className="h-5 w-5" />
            <span className="text-sm">Radierer (Zelle leeren)</span>
          </button>

          {/* Module Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-2">
            {moduleTypes.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all min-h-[90px]",
                  selectedTool === module.id
                    ? "border-[#00b4d8] bg-[#00b4d8]/10"
                    : "border-border/30 bg-[#1a1a1a] hover:border-border",
                )}
              >
                <ModulePreviewIcon type={module.id} isSelected={selectedTool === module.id} />
                <span
                  className={cn(
                    "text-xs text-center leading-tight",
                    selectedTool === module.id ? "text-[#00b4d8]" : "text-muted-foreground",
                  )}
                >
                  {module.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar at bottom */}
        <div className="mt-auto p-4 border-t border-border/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-9 px-3 text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
          </div>
        </div>
      </div>

      {/* Main 3D Viewer Area */}
      <div className="flex-1 relative lg:ml-[320px]">
        {/* Desktop cart */}
        {!isMobile && <LiveCart config={config} isOpen={isCartOpen} onToggle={() => setIsCartOpen(!isCartOpen)} />}

        <Canvas
          camera={{ position: [2, 1.5, 2], fov: 45 }}
          shadows
          className="w-full h-full"
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={["#1a1a1a"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
          <directionalLight position={[-3, 4, -3]} intensity={0.4} />

          <ShelfScene
            config={config}
            selectedCell={selectedCell}
            hoveredCell={hoveredCell}
            onCellClick={handleCellClick}
            onCellHover={setHoveredCell}
            onExpandLeft={handleExpandLeft}
            onExpandRight={handleExpandRight}
            onExpandUp={handleExpandUp}
            onUpdateCellColor={handleUpdateCellColor}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={10}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
          />
          <Environment preset="studio" />
        </Canvas>

        {/* Mobile toggle button */}
        {isMobile && (
          <button
            onClick={() => setShowMobilePanel(true)}
            className="fixed bottom-4 left-4 z-30 bg-[#00b4d8] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Package className="h-5 w-5" />
            <span className="font-medium">Konfigurator</span>
          </button>
        )}

        {/* Mobile Panel Overlay */}
        {isMobile && showMobilePanel && (
          <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-border/30 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Konfigurator</h2>
              <button onClick={() => setShowMobilePanel(false)} className="p-2 hover:bg-[#1a1a1a] rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile panel content - same as desktop */}
            <div className="p-4 space-y-6">
              {/* Farbe */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Farbe</h3>
                <div className="flex gap-2">
                  {baseColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleColorChange(c.id)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 transition-all",
                        config.accentColor === c.id
                          ? "border-[#00b4d8] ring-2 ring-[#00b4d8]/30"
                          : "border-border/50 hover:border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Sonderfarbe */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Sonderfarbe</h3>
                <div className="flex gap-2 flex-wrap">
                  {specialColorOptions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleColorChange(c.id)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 transition-all",
                        config.accentColor === c.id
                          ? "border-[#00b4d8] ring-2 ring-[#00b4d8]/30"
                          : "border-border/50 hover:border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Bodenmaterial */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Bodenmaterial</h3>
                <div className="flex gap-2">
                  {materialOptions.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMaterialChange(m.id)}
                      className={cn(
                        "flex-1 py-2.5 text-sm rounded-lg border transition-all",
                        config.material === m.id
                          ? "bg-transparent border-[#00b4d8] text-[#00b4d8] font-medium"
                          : "bg-transparent border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regalfüße */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Regalfüße</h3>
                <div className="flex gap-2">
                  {footTypeOptions.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleFootTypeChange(f.id)}
                      className={cn(
                        "flex-1 py-2.5 text-sm rounded-lg border transition-all",
                        config.footType === f.id
                          ? "bg-transparent border-[#00b4d8] text-[#00b4d8] font-medium"
                          : "bg-transparent border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regal-Größe */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Regal-Größe</h3>
                  <span className="text-xs text-muted-foreground">
                    {totalWidth} × {totalHeight} cm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Reihen</span>
                    <button
                      onClick={handleRemoveRow}
                      disabled={rowCount <= 1}
                      className="h-10 w-10 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-6 text-center">{rowCount}</span>
                    <button
                      onClick={handleAddRow}
                      disabled={rowCount >= 6}
                      className="h-10 w-10 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Spalten</span>
                    <button
                      onClick={handleRemoveColumn}
                      disabled={colCount <= 1}
                      className="h-10 w-10 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-6 text-center">{colCount}</span>
                    <button
                      onClick={handleAddColumn}
                      disabled={colCount >= 6}
                      className="h-10 w-10 rounded-lg bg-[#1a1a1a] border border-border/30 flex items-center justify-center disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Simpli-Elemente */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Simpli-Elemente</h3>
                <button
                  onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                    selectedTool === "empty"
                      ? "border-[#00b4d8] bg-[#00b4d8]/10 text-[#00b4d8]"
                      : "border-border/30 bg-[#1a1a1a] text-muted-foreground",
                  )}
                >
                  <Eraser className="h-5 w-5" />
                  <span className="text-sm">Radierer</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {moduleTypes.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        onSelectTool(selectedTool === module.id ? null : module.id)
                        setShowMobilePanel(false)
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all",
                        selectedTool === module.id
                          ? "border-[#00b4d8] bg-[#00b4d8]/10"
                          : "border-border/30 bg-[#1a1a1a]",
                      )}
                    >
                      <ModulePreviewIcon type={module.id} isSelected={selectedTool === module.id} />
                      <span
                        className={cn(
                          "text-xs text-center",
                          selectedTool === module.id ? "text-[#00b4d8]" : "text-muted-foreground",
                        )}
                      >
                        {module.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
