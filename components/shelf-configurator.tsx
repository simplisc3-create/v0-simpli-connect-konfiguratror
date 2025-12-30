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
  X,
  Palette,
  Layers,
  Settings2,
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
    | "leer" // Added for 40cm width modules
    | "mit-tuer-links" // Added for 40cm width modules
    | "mit-tuer-rechts" // Added for 40cm width modules
    | "mit-abschliessbarer-tuer-links" // Added for 40cm width modules
  color: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau" | "orange"
}

export type ShelfConfig = {
  columns: ColumnData[]
  material: "metall" | "glas"
  accentColor: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau" | "orange"
}

export type ColumnData = {
  width: 38 | 40 | 75
  cells: GridCell[]
}

type ModuleType = GridCell["type"]

const createEmptyCell = (id: string, color: GridCell["color"] = "weiss"): GridCell => ({
  id,
  type: "empty",
  color,
})

const createInitialCell = (id: string, color: GridCell["color"] = "weiss"): GridCell => ({
  id,
  type: "ohne-rueckwand",
  color,
})

const createInitialConfig = (): ShelfConfig => ({
  columns: [
    {
      width: 75,
      cells: [createInitialCell("col-0-cell-0")],
    },
  ],
  material: "metall",
  accentColor: "weiss",
})

const moduleTypes75 = [
  { id: "ohne-seitenwaende" as const, label: "ohne Seitenwände", icon: Square },
  { id: "ohne-rueckwand" as const, label: "ohne Rückwand", icon: LayoutGrid },
  { id: "mit-rueckwand" as const, label: "mit Rückwand", icon: PanelTop },
  { id: "mit-tueren" as const, label: "mit Türen", icon: DoorOpen },
  { id: "mit-klapptuer" as const, label: "mit Klapptür", icon: PanelTopOpen },
  { id: "mit-doppelschublade" as const, label: "mit Doppelschublade", icon: Archive },
  { id: "abschliessbare-tueren" as const, label: "abschließbare Türen", icon: Lock },
] as const

const moduleTypes40 = [
  { id: "leer" as const, label: "Leer (offen)", icon: Square },
  { id: "mit-rueckwand" as const, label: "mit Rückwand", icon: PanelTop },
  { id: "mit-tuer-links" as const, label: "Tür links", icon: DoorOpen },
  { id: "mit-tuer-rechts" as const, label: "Tür rechts", icon: DoorOpen },
  { id: "mit-abschliessbarer-tuer-links" as const, label: "Abschließbare Tür links", icon: Lock },
  { id: "mit-doppelschublade" as const, label: "mit Doppelschublade", icon: Archive },
] as const

const moduleTypes = [
  { id: "ohne-seitenwaende" as const, label: "ohne Seitenwände", icon: Square },
  { id: "ohne-rueckwand" as const, label: "ohne Rückwand", icon: LayoutGrid },
  { id: "mit-rueckwand" as const, label: "mit Rückwand", icon: PanelTop },
  { id: "mit-tueren" as const, label: "mit Türen", icon: DoorOpen },
  { id: "mit-klapptuer" as const, label: "mit Klapptür", icon: PanelTopOpen },
  { id: "mit-doppelschublade" as const, label: "mit Doppelschublade", icon: Archive },
  { id: "abschliessbare-tueren" as const, label: "abschließbare Türen", icon: Lock },
  { id: "leer" as const, label: "Leer", icon: Square },
  { id: "mit-tuer-links" as const, label: "Tür links", icon: DoorOpen },
  { id: "mit-tuer-rechts" as const, label: "Tür rechts", icon: DoorOpen },
  { id: "mit-abschliessbarer-tuer-links" as const, label: "Abschließbare Tür links", icon: Lock },
] as const

const baseColors = [
  { id: "weiss" as const, hex: "#ffffff", label: "Weiß" },
  { id: "schwarz" as const, hex: "#1a1a1a", label: "Schwarz" },
] as const

const specialColorOptions = [
  { id: "rot" as const, hex: "#c41e3a", label: "Rubinrot" },
  { id: "gruen" as const, hex: "#2d5a27", label: "Olivgrün" },
  { id: "gelb" as const, hex: "#e6b800", label: "Goldgelb" },
  { id: "blau" as const, hex: "#1e4d6b", label: "Stahlblau" },
  { id: "orange" as const, hex: "#cc5500", label: "Kupfer" },
] as const

const materialOptions = [
  { id: "metall" as const, label: "Metall" },
  { id: "glas" as const, label: "Glas" },
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
    // Added icons for 40cm specific modules
    case "leer":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
        </svg>
      )
    case "mit-tuer-links":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <rect x="16" y="16" width="10" height="8" rx="1" fill={strokeColor} />
        </svg>
      )
    case "mit-tuer-rechts":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <rect x="24" y="16" width="10" height="8" rx="1" fill={strokeColor} />
        </svg>
      )
    case "mit-abschliessbarer-tuer-links":
      return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" stroke={strokeColor} strokeWidth="2" fill={fillColor} />
          <rect x="16" y="16" width="6" height="8" rx="1" fill={strokeColor} />
          <circle cx="25" cy="20" r="1.5" fill={strokeColor} />
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
    // Added icons for 40cm specific modules
    case "leer":
      return <Square width={iconSize} height={iconSize} />
    case "mit-tuer-links":
      return <DoorOpen width={iconSize} height={iconSize} />
    case "mit-tuer-rechts":
      return <DoorOpen width={iconSize} height={iconSize} />
    case "mit-abschliessbarer-tuer-links":
      return <Lock width={iconSize} height={iconSize} />
    default:
      return null
  }
}

const hasAnyModules = (config: ShelfConfig): boolean => {
  return config.columns.some((col) => col.cells.some((cell) => cell.type !== "empty"))
}

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
  const [editMode, setEditMode] = useState<"global" | "cell">("global")
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

  const handleCellSelect = useCallback((col: number, stackIndex: number) => {
    console.log("[v0] Cell selected:", { col, stackIndex })
    setSelectedCell((prev) => {
      if (prev?.col === col && prev?.stackIndex === stackIndex) {
        console.log("[v0] Deselecting cell")
        return null // Deselect if clicking the same cell
      }
      console.log("[v0] Selecting new cell")
      return { col, stackIndex }
    })
    setEditMode("cell")
  }, [])

  const handleCellClick = useCallback(
    (col: number, stackIndex: number) => {
      if (!selectedTool) {
        handleCellSelect(col, stackIndex)
        return
      }

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
    [selectedTool, saveToHistory, handleCellSelect],
  )

  const handleExpandUp = useCallback(
    (col: number) => {
      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column

          const hasFilledCell = column.cells.some((c) => c.type !== "empty")
          if (!hasFilledCell) return column

          const newCell: GridCell = {
            id: `col-${col}-cell-${column.cells.length}`,
            type:
              selectedTool && selectedTool !== "empty" && selectedTool !== "delete" ? selectedTool : "ohne-rueckwand",
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
    (width: 38 | 40 | 75 = 75) => {
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
    (width: 38 | 40 | 75 = 75) => {
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
    (material: "metall" | "glas") => {
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
        const newConfig = { ...prev, accentColor: color }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleCellColorChange = useCallback(
    (col: number, stackIndex: number, color: ShelfConfig["accentColor"]) => {
      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column
          return {
            ...column,
            cells: column.cells.map((cell, cellIdx) => {
              if (cellIdx !== stackIndex) return cell
              return { ...cell, color }
            }),
          }
        })
        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleCellTypeChange = useCallback(
    (col: number, stackIndex: number, type: ModuleType) => {
      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column
          return {
            ...column,
            cells: column.cells.map((cell, cellIdx) => {
              if (cellIdx !== stackIndex) return cell
              return { ...cell, type }
            }),
          }
        })
        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleColumnWidthChange = useCallback(
    (colIndex: number, newWidth: 38 | 40 | 75) => {
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

  const selectedCellData = useMemo(() => {
    if (!selectedCell) return null
    const column = config.columns[selectedCell.col]
    if (!column) return null
    const cell = column.cells[selectedCell.stackIndex]
    if (!cell) return null
    return cell
  }, [selectedCell, config.columns])

  const selectedColumnWidth = useMemo(() => {
    if (!selectedCell) return null
    const column = config.columns[selectedCell.col]
    return column?.width ?? null
  }, [selectedCell, config.columns])

  const availableModuleTypes = useMemo(() => {
    if (selectedColumnWidth && selectedColumnWidth <= 40) {
      return moduleTypes40
    }
    return moduleTypes75
  }, [selectedColumnWidth])

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
    <div className="flex h-screen flex-col lg:flex-row bg-[#f5f0e8]">
      {/* Mobile cart toggle only */}
      {isMobile && <LiveCart config={config} isOpen={isCartOpen} onToggle={() => setIsCartOpen(!isCartOpen)} />}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[300px] bg-white shadow-xl flex-col overflow-y-auto",
          "hidden lg:flex",
        )}
      >
        {/* Logo/Brand Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-light tracking-wide text-gray-800">SIMPLI</h1>
          <p className="text-xs text-gray-400 mt-1 tracking-widest uppercase">Konfigurator</p>
        </div>

        {/* Selected Cell Editor */}
        {selectedCell && selectedCellData && (
          <div className="p-5 space-y-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Zelle {selectedCell.col + 1}.{selectedCell.stackIndex + 1}
              </h3>
              <button
                onClick={() => {
                  setSelectedCell(null)
                  setEditMode("global")
                }}
                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Cell Module Type */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Modul</span>
              <div className="grid grid-cols-2 gap-2">
                {availableModuleTypes.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleCellTypeChange(selectedCell.col, selectedCell.stackIndex, module.id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg text-xs transition-all",
                      selectedCellData.type === module.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    )}
                  >
                    <module.icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{module.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cell Color */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Farbe</span>
              <div className="flex gap-2 flex-wrap">
                {[...baseColors, ...specialColorOptions].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCellColorChange(selectedCell.col, selectedCell.stackIndex, c.id)}
                    className={cn(
                      "w-9 h-9 rounded-full border-2 transition-all shadow-sm",
                      selectedCellData.color === c.id
                        ? "border-gray-900 ring-2 ring-gray-900/20 scale-110"
                        : "border-gray-200 hover:border-gray-400 hover:scale-105",
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Clear Cell Button */}
            <button
              onClick={() => handleCellTypeChange(selectedCell.col, selectedCell.stackIndex, "empty")}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Eraser className="h-4 w-4" />
              <span className="text-xs font-medium">Zelle leeren</span>
            </button>
          </div>
        )}

        {/* Color Selection */}
        <div className="p-5 space-y-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700">Farben</h3>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500 mb-2 block">Basis</span>
              <div className="flex gap-2">
                {baseColors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorChange(c.id)}
                    className={cn(
                      "w-11 h-11 rounded-full border-2 transition-all shadow-sm",
                      config.accentColor === c.id
                        ? "border-gray-900 ring-2 ring-gray-900/20 scale-110"
                        : "border-gray-200 hover:border-gray-400 hover:scale-105",
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 mb-2 block">Akzent</span>
              <div className="flex gap-2 flex-wrap">
                {specialColorOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorChange(c.id)}
                    className={cn(
                      "w-11 h-11 rounded-full border-2 transition-all shadow-sm",
                      config.accentColor === c.id
                        ? "border-gray-900 ring-2 ring-gray-900/20 scale-110"
                        : "border-gray-200 hover:border-gray-400",
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Material Selection */}
        <div className="p-5 space-y-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700">Material</h3>
          </div>
          <div className="flex gap-2">
            {materialOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMaterialChange(m.id)}
                className={cn(
                  "flex-1 py-2.5 text-sm rounded-lg transition-all font-medium",
                  config.material === m.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Module Tools */}
        <div className="p-5 space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700">Module</h3>
          </div>

          {/* Eraser Tool */}
          <button
            onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
              selectedTool === "empty" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <Eraser className="h-5 w-5" />
            <span className="text-sm font-medium">Radierer</span>
          </button>

          {/* Module Grid */}
          <div className="grid grid-cols-2 gap-2">
            {availableModuleTypes.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-all min-h-[80px]",
                  selectedTool === module.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                <ModulePreviewIcon type={module.id} isSelected={selectedTool === module.id} />
                <span className="text-xs text-center leading-tight font-medium">{module.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar at bottom */}
        <div className="mt-auto p-5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="h-9 w-9 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="h-9 w-9 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-9 px-3 text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span className="text-sm">Reset</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main 3D Viewer Area */}
      <div className="flex-1 relative lg:ml-[300px]">
        {/* Desktop cart */}
        {!isMobile && <LiveCart config={config} isOpen={isCartOpen} onToggle={() => setIsCartOpen(!isCartOpen)} />}

        <Canvas
          camera={{ position: [2, 1.5, 2], fov: 45 }}
          shadows
          className="w-full h-full"
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={["#f5f0e8"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow />
          <directionalLight position={[-3, 4, -3]} intensity={0.3} />

          <ShelfScene
            config={configWithDefaults}
            selectedTool={selectedTool}
            hoveredCell={hoveredCell}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            onCellHover={setHoveredCell}
            onCellSelect={handleCellSelect}
            onExpandLeft={handleExpandLeft}
            onExpandRight={handleExpandRight}
            onExpandUp={handleExpandUp}
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

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">B</span>
              <span className="font-medium text-gray-700">{totalWidth} cm</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-gray-400">H</span>
              <span className="font-medium text-gray-700">{totalHeight} cm</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-gray-400">T</span>
              <span className="font-medium text-gray-700">38 cm</span>
            </div>
          </div>
        </div>

        {/* Mobile toggle button */}
        {isMobile && (
          <button
            onClick={() => setShowMobilePanel(true)}
            className="fixed bottom-4 left-4 z-30 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <Settings2 className="h-5 w-5" />
            <span className="font-medium">Konfigurieren</span>
          </button>
        )}

        {/* Mobile Panel Overlay */}
        {isMobile && showMobilePanel && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">Konfigurator</h2>
              <button onClick={() => setShowMobilePanel(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile panel content - same structure as desktop but with adjusted spacing */}
            <div className="p-5 space-y-6">
              {selectedCell && selectedCellData && (
                <div className="p-4 space-y-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                      Zelle {selectedCell.col + 1}.{selectedCell.stackIndex + 1}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCell(null)
                        setEditMode("global")
                      }}
                      className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Cell Module Type */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Modul</span>
                    <div className="grid grid-cols-2 gap-2">
                      {availableModuleTypes.map((module) => (
                        <button
                          key={module.id}
                          onClick={() => handleCellTypeChange(selectedCell.col, selectedCell.stackIndex, module.id)}
                          className={cn(
                            "flex items-center gap-2 p-2.5 rounded-lg text-xs transition-all",
                            selectedCellData.type === module.id
                              ? "bg-gray-900 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200",
                          )}
                        >
                          <module.icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{module.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cell Color */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Farbe</span>
                    <div className="flex gap-2 flex-wrap">
                      {[...baseColors, ...specialColorOptions].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleCellColorChange(selectedCell.col, selectedCell.stackIndex, c.id)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all shadow-sm",
                            selectedCellData.color === c.id
                              ? "border-gray-900 ring-2 ring-gray-900/20 scale-110"
                              : "border-gray-200 hover:border-gray-400",
                          )}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Colors */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-400" />
                  Standard-Farbe
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {[...baseColors, ...specialColorOptions].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleColorChange(c.id)}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 transition-all shadow-sm",
                        config.accentColor === c.id
                          ? "border-gray-900 ring-2 ring-gray-900/20 scale-110"
                          : "border-gray-200 hover:border-gray-400",
                      )}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Material */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-400" />
                  Material
                </h3>
                <div className="flex gap-2">
                  {materialOptions.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMaterialChange(m.id)}
                      className={cn(
                        "flex-1 py-3 text-sm rounded-lg transition-all font-medium",
                        config.material === m.id
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-gray-400" />
                  Module
                </h3>

                <button
                  onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                    selectedTool === "empty" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  <Eraser className="h-5 w-5" />
                  <span className="text-sm font-medium">Radierer</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {availableModuleTypes.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-all min-h-[80px]",
                        selectedTool === module.id
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                      )}
                    >
                      <ModulePreviewIcon type={module.id} isSelected={selectedTool === module.id} />
                      <span className="text-xs text-center leading-tight font-medium">{module.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo}
                    className="h-10 w-10 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Undo2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo}
                    className="h-10 w-10 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Redo2 className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="h-10 px-4 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
