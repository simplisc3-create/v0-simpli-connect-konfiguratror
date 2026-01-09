"use client"

import { useState, useCallback, useMemo, useRef, Suspense, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { ConfiguratorHelpBot } from "./configurator-help-bot"
import { Undo2, Redo2, RotateCcw, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getFlaechensetArtNr,
  getSchubladeArtNr,
  getTuerArtNr,
  getKlapptuerArtNr, // Added getKlapptuerArtNr
  getLeiterArtNr, // Added getLeiterArtNr
} from "@/lib/simpli-products"
import { useThree } from "@react-three/fiber"
import { isModuleTypeAvailableForWidth } from "@/lib/glb-registry"
import * as THREE from "three"
import { LoadingAnimation } from "./loading-animation"

export type GridCell = {
  id: string
  type:
    | "empty"
    | "ghost"
    | "offenes-fach"
    | "ohne-seitenwaende"
    | "ohne-rueckwand"
    | "mit-rueckwand"
    | "mit-tueren"
    | "mit-klapptuer"
    | "mit-doppelschublade"
    | "abschliessbare-tueren"
    | "mit-tuere-rechts"
    | "mit-tuere-links"
    | "abschliessbar-rechts"
    | "abschliessbar-links"
    | "klapptuer"
  row: number
  col: number
  color?: "weiss" | "schwarz" | "blau" | "gruen" | "gelb" | "orange" | "rot"
}

export type CellId = `c-${number}-${number}`
export type ColorKey = GridCell["color"]
export type CellStyles = Record<CellId, { color?: ColorKey }>

export type ShelfConfig = {
  width: 38 | 75
  height: 40 | 80 | 120 | 160 | 200
  sections: number
  levels: number
  material: "metal" | "glass"
  finish: "black" | "white" | "blue" | "green" | "yellow" | "orange" | "red" | "satin"
  panels?: {
    shelves?: number
    sideWalls?: number
    backWalls?: number
  }
  modules?: {
    doors40?: number
    lockableDoors40?: number
    flapDoors?: number
    doubleDrawers80?: number
    jalousie80?: number
    functionalWall1?: number
    functionalWall2?: number
  }
  grid: GridCell[][]
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights: (40 | 80 | 120 | 160 | 200)[]
  cellStyles?: CellStyles
}

export const getCellId = (row: number, col: number): CellId => `c-${row}-${col}`

const createInitialGrid = (): GridCell[][] => {
  return [[{ id: "cell-0-0", type: "ghost", row: 0, col: 0 }]]
}

const initialConfig: ShelfConfig = {
  width: 75,
  height: 38,
  sections: 1,
  levels: 1,
  material: "metal",
  finish: "white",
  grid: createInitialGrid(),
  columns: 1,
  rows: 1,
  columnWidths: [75] as (75 | 38)[],
  rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
  cellStyles: {}, // Initialize empty cellStyles
}

export function ShelfConfigurator() {
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState<ShelfConfig>(initialConfig)
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>("offenes-fach")
  const [selectedColor, setSelectedColor] = useState<GridCell["color"]>("weiss")
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  const [showHeightWarning, setShowHeightWarning] = useState(false)
  const [heightWarningShown, setHeightWarningShown] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // State for undo/redo
  const [history, setHistory] = useState<ShelfConfig[]>([initialConfig])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedo = useRef(false)

  const totalHeightCm = useMemo(() => {
    // Find the maximum number of filled rows in any column
    let maxFilledRows = 0
    for (let col = 0; col < config.columns; col++) {
      let filledRows = 0
      for (let row = 0; row < config.rows; row++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          filledRows++
        }
      }
      maxFilledRows = Math.max(maxFilledRows, filledRows)
    }
    // Each row is approximately 40cm
    return maxFilledRows * 40
  }, [config.grid, config.rows, config.columns])

  const playDingSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current

      // Create oscillator for ding sound
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Bell-like ding sound
      oscillator.frequency.setValueAtTime(830, ctx.currentTime) // High pitch
      oscillator.type = "sine"

      // Quick fade out for ding effect
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (e) {
      // Audio not supported
    }
  }, [])

  useEffect(() => {
    if (totalHeightCm > 200 && !heightWarningShown) {
      setShowHeightWarning(true)
      setHeightWarningShown(true)

      playDingSound()
    }
  }, [totalHeightCm, heightWarningShown, playDingSound])

  useEffect(() => {
    if (totalHeightCm <= 200) {
      setHeightWarningShown(false)
    }
  }, [totalHeightCm])

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
      const historyItem = history[newIndex]
      if (historyItem && historyItem.grid) {
        setHistoryIndex(newIndex)
        setConfig(historyItem)
      } else {
        isUndoRedo.current = false
      }
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true
      const newIndex = historyIndex + 1
      const historyItem = history[newIndex]
      if (historyItem && historyItem.grid) {
        setHistoryIndex(newIndex)
        setConfig(historyItem)
      } else {
        isUndoRedo.current = false
      }
    }
  }, [historyIndex, history])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const pruneCellStyles = useCallback((styles: CellStyles, maxRows: number, maxCols: number): CellStyles => {
    const pruned: CellStyles = {}
    Object.entries(styles).forEach(([key, value]) => {
      const match = key.match(/^c-(\d+)-(\d+)$/)
      if (match) {
        const row = Number.parseInt(match[1], 10)
        const col = Number.parseInt(match[2], 10)
        if (row < maxRows && col < maxCols) {
          pruned[key as CellId] = value
        }
      }
    })
    return pruned
  }, [])

  const applyCellColor = useCallback(
    (row: number, col: number, color: ColorKey) => {
      setConfig((prev) => {
        const cellId = getCellId(row, col)
        const newCellStyles = { ...(prev.cellStyles || {}), [cellId]: { color } }

        // Also update the grid cell's color for BOM calculation
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const applyColorToRow = useCallback(
    (row: number, color: ColorKey) => {
      setConfig((prev) => {
        const newCellStyles = { ...(prev.cellStyles || {}) }
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && cell.type !== "empty" && cell.type !== "ghost") {
              const cellId = getCellId(ri, ci)
              newCellStyles[cellId] = { color }
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const applyColorToColumn = useCallback(
    (col: number, color: ColorKey) => {
      setConfig((prev) => {
        const newCellStyles = { ...(prev.cellStyles || {}) }
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ci === col && cell.type !== "empty" && cell.type !== "ghost") {
              const cellId = getCellId(ri, ci)
              newCellStyles[cellId] = { color }
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const applyColorToAll = useCallback(
    (color: ColorKey) => {
      setConfig((prev) => {
        const newCellStyles: CellStyles = {}
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (cell.type !== "empty" && cell.type !== "ghost") {
              const cellId = getCellId(ri, ci)
              newCellStyles[cellId] = { color }
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const clearCellColor = useCallback(
    (row: number, col: number) => {
      setConfig((prev) => {
        const cellId = getCellId(row, col)
        const newCellStyles = { ...(prev.cellStyles || {}) }
        delete newCellStyles[cellId]

        // Revert to default color (weiss)
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return { ...cell, color: "weiss" as ColorKey }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const getColumnHeights = (grid: GridCell[][]): number[] => {
    const heights: number[] = []
    grid[0]?.forEach((_, colIndex) => {
      let maxHeight = 0
      for (let row = grid.length - 1; row >= 0; row--) {
        if (grid[row]?.[colIndex]?.type !== "empty" && grid[row]?.[colIndex]?.type !== "ghost") {
          maxHeight = grid.length - row
          break
        }
      }
      heights[colIndex] = maxHeight
    })
    return heights
  }

  const isConnectedToExisting = (row: number, col: number, grid: GridCell[][], type?: GridCell["type"]): boolean => {
    const currentCell = grid[row]?.[col]
    if (type === "empty") {
      return currentCell !== undefined && currentCell.type !== "empty"
    }
    if (!currentCell || currentCell.type !== "ghost") {
      return false
    }
    return true
  }

  const hasSupportBelow = (row: number, col: number, grid: GridCell[][]): boolean => {
    const hasAnyFilledModule = grid.some((r) => r.some((c) => c.type !== "empty" && c.type !== "ghost"))
    if (!hasAnyFilledModule) return true

    // Check if there's ANY filled module below this position in the same column
    for (let r = row - 1; r >= 0; r--) {
      const cellBelow = grid[r]?.[col]
      if (cellBelow && cellBelow.type !== "empty" && cellBelow.type !== "ghost") {
        return true
      }
    }

    // Also allow if there's an adjacent filled module (left or right) at the same row
    const leftCell = grid[row]?.[col - 1]
    const rightCell = grid[row]?.[col + 1]
    if (
      (leftCell && leftCell.type !== "empty" && leftCell.type !== "ghost") ||
      (rightCell && rightCell.type !== "empty" && rightCell.type !== "ghost")
    ) {
      return true
    }

    return false
  }

  const expandGridAroundPlacement = (grid: GridCell[][], placedRow: number, placedCol: number): GridCell[][] => {
    let newGrid = grid.map((row) => [...row])
    const rows = newGrid.length
    const cols = newGrid[0]?.length || 0

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].type === "ghost") {
          newGrid[r][c] = { ...newGrid[r][c], type: "empty" }
        }
      }
    }

    let expandLeft = false
    let expandRight = false
    let expandUp = false

    const hasFilledAtCol0 = newGrid.some((row) => row[0] && row[0].type !== "empty" && row[0].type !== "ghost")
    if (hasFilledAtCol0) {
      expandLeft = true
    }

    const lastColIdx = cols - 1
    const hasFilledAtLastCol = newGrid.some((row) => {
      const cell = row[lastColIdx]
      return cell && cell.type !== "empty" && cell.type !== "ghost"
    })
    if (hasFilledAtLastCol) {
      expandRight = true
    }

    const topRowIdx = rows - 1
    const hasFilledAtTopRow = newGrid[topRowIdx].some((cell) => cell.type !== "empty" && cell.type !== "ghost")
    if (hasFilledAtTopRow) {
      expandUp = true
    }

    if (expandLeft) {
      newGrid = newGrid.map((row, ri) => {
        const newCell: GridCell = {
          id: `cell-${ri}--1-temp`,
          type: "empty" as const,
          row: ri,
          col: -1,
        }
        return [newCell, ...row.map((c) => ({ ...c, col: c.col + 1, id: `cell-${c.row}-${c.col + 1}` }))]
      })
    }

    if (expandRight) {
      const currentCols = newGrid[0]?.length || 0
      newGrid = newGrid.map((row, ri) => {
        const newCell: GridCell = {
          id: `cell-${ri}-${currentCols}`,
          type: "empty" as const,
          row: ri,
          col: currentCols,
        }
        return [...row, newCell]
      })
    }

    if (expandUp) {
      const currentRows = newGrid.length
      const currentCols = newGrid[0]?.length || 0
      const newRow = Array.from({ length: currentCols }, (_, ci) => ({
        id: `cell-${currentRows}-${ci}`,
        type: "empty" as const,
        row: currentRows,
        col: ci,
      }))
      newGrid.push(newRow)
    }

    const updatedRows = newGrid.length
    const updatedCols = newGrid[0]?.length || 0

    for (let r = 0; r < updatedRows; r++) {
      for (let c = 0; c < updatedCols; c++) {
        const cell = newGrid[r][c]
        if (cell.type !== "empty" && cell.type !== "ghost") {
          const adjacentPositions = [
            { nr: r - 1, nc: c }, // below
            { nr: r + 1, nc: c }, // above
            { nr: r, nc: c - 1 }, // left
            { nr: r, nc: c + 1 }, // right
          ]

          adjacentPositions.forEach(({ nr, nc }) => {
            if (nr >= 0 && nr < updatedRows && nc >= 0 && nc < updatedCols) {
              const adjacentCell = newGrid[nr][nc]
              if (adjacentCell.type === "empty") {
                const isHorizontal = nr === r // left or right
                if (isHorizontal) {
                  // For horizontal ghost cells, check if there's support below
                  // Support means: either row 0 (ground) OR a filled module below
                  const hasSupport =
                    nr === 0 ||
                    (nr > 0 && newGrid[nr - 1]?.[nc]?.type !== "empty" && newGrid[nr - 1]?.[nc]?.type !== "ghost")
                  if (hasSupport) {
                    newGrid[nr][nc] = { ...adjacentCell, type: "ghost" }
                  }
                } else {
                  // Vertical (above/below) - always allow
                  newGrid[nr][nc] = { ...adjacentCell, type: "ghost" }
                }
              }
            }
          })
        }
      }
    }

    for (let c = 0; c < updatedCols; c++) {
      // Find the topmost filled cell in this column
      let topmostFilledRow = -1
      for (let r = updatedRows - 1; r >= 0; r--) {
        if (newGrid[r][c].type !== "empty" && newGrid[r][c].type !== "ghost") {
          topmostFilledRow = r
          break
        }
      }

      // If there's a filled cell and there's a row above it, mark it as ghost
      if (topmostFilledRow >= 0 && topmostFilledRow < updatedRows - 1) {
        const aboveCell = newGrid[topmostFilledRow + 1][c]
        if (aboveCell.type === "empty") {
          newGrid[topmostFilledRow + 1][c] = { ...aboveCell, type: "ghost" }
        }
      }
    }

    return newGrid
  }

  const placeModule = useCallback(
    (row: number, col: number, type: GridCell["type"]) => {
      console.log("[v0] Placing module at", row, col, type)

      setConfig((prev) => {
        const currentCell = prev.grid[row]?.[col]

        if (!currentCell || (currentCell.type !== "ghost" && currentCell.type !== "empty")) {
          console.log("[v0] Cannot place - cell is not ghost or empty")
          return prev
        }

        if (!isConnectedToExisting(row, col, prev.grid, type)) {
          console.log("[v0] Cannot place - not connected to existing modules")
          return prev
        }

        if (!hasSupportBelow(row, col, prev.grid)) {
          console.log("[v0] Cannot place - no support below")
          return prev
        }

        const columnWidth = prev.columnWidths[col]
        const widthInCm = columnWidth === 75 ? 80 : 40
        if (type !== "empty" && type !== "ghost" && !isModuleTypeAvailableForWidth(type, widthInCm)) {
          console.log(`[v0] Cannot place - module type "${type}" not available for ${widthInCm}cm width`)
          return prev
        }

        let newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return { ...cell, type, color: selectedColor }
            }
            return cell
          }),
        )

        newGrid = expandGridAroundPlacement(newGrid, row, col)

        const newColumns = newGrid[0]?.length || 1
        const newRows = newGrid.length

        const newColumnWidths = [...prev.columnWidths]
        while (newColumnWidths.length < newColumns) newColumnWidths.push(75)

        const newRowHeights = [...prev.rowHeights]
        while (newRowHeights.length < newRows) newRowHeights.push(38)

        const cellId = getCellId(row, col)
        const newCellStyles = { ...(prev.cellStyles || {}), [cellId]: { color: selectedColor } }

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newColumns,
          rows: newRows,
          columnWidths: newColumnWidths as (75 | 38)[],
          rowHeights: newRowHeights,
          cellStyles: newCellStyles,
        }

        console.log("[v0] New grid size:", newRows, "x", newColumns)
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory, selectedColor],
  )

  const handleCellClick3D = useCallback(
    (row: number, col: number) => {
      console.log("[v0] Cell clicked:", row, col)

      const cell = config.grid[row]?.[col]

      if (cell && cell.type !== "empty" && cell.type !== "ghost") {
        setSelectedCell({ row, col })
        return
      }

      if (!selectedTool || selectedTool === "empty") {
        placeModule(row, col, "ghost")
      } else {
        placeModule(row, col, selectedTool)
      }
    },
    [selectedTool, placeModule, config.grid],
  )

  const clearCell = useCallback(
    (row: number, col: number) => {
      placeModule(row, col, "empty")
    },
    [placeModule],
  )

  const resizeGrid = useCallback(
    (newRows: number, newCols: number) => {
      const limitedRows = Math.min(Math.max(1, newRows), 8)

      setConfig((prev) => {
        const newGrid = Array.from({ length: limitedRows }, (_, rowIndex) =>
          Array.from({ length: newCols }, (_, colIndex) => {
            if (rowIndex < prev.rows && colIndex < prev.columns) {
              return prev.grid[rowIndex][colIndex]
            }
            if (rowIndex === 0) {
              return {
                id: `cell-${rowIndex}-${colIndex}`,
                type: "empty" as const,
                row: rowIndex,
                col: colIndex,
              }
            }
            return {
              id: `cell-${rowIndex}-${colIndex}`,
              type: "empty" as const,
              row: rowIndex,
              col: colIndex,
            }
          }),
        )

        const newColumnWidths = [...prev.columnWidths]
        while (newColumnWidths.length < newCols) newColumnWidths.push(75)
        while (newColumnWidths.length > newCols) newColumnWidths.pop()

        const newRowHeights = [...prev.rowHeights]
        while (newRowHeights.length < limitedRows) newRowHeights.push(38)
        while (newRowHeights.length > limitedRows) newRowHeights.pop()

        const prunedCellStyles = pruneCellStyles(prev.cellStyles || {}, limitedRows, newCols)

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newCols,
          rows: limitedRows,
          columnWidths: newColumnWidths as (75 | 38)[],
          rowHeights: newRowHeights,
          cellStyles: prunedCellStyles,
        }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory, pruneCellStyles],
  )

  const setRowHeight = useCallback(
    (rowIndex: number, height: number) => {
      setConfig((prev) => {
        const newHeights = [...prev.rowHeights]
        newHeights[rowIndex] = Math.max(20, Math.min(120, height))
        const newConfig = { ...prev, rowHeights: newHeights }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const setColumnWidth = useCallback(
    (colIndex: number, width: 75 | 38) => {
      setConfig((prev) => {
        const newWidths = [...prev.columnWidths]
        newWidths[colIndex] = width

        const widthInCm = width === 75 ? 80 : 40
        const newGrid = prev.grid.map((row) =>
          row.map((cell, ci) => {
            if (ci === colIndex && cell.type !== "empty" && cell.type !== "ghost") {
              // Check if current module type is compatible with new width
              if (!isModuleTypeAvailableForWidth(cell.type, widthInCm)) {
                console.log(`[v0] Converting incompatible module "${cell.type}" to "mit-rueckwand" for ${widthInCm}cm`)
                // Convert to a compatible module type (mit-rueckwand exists for both widths)
                return { ...cell, type: "mit-rueckwand" as const }
              }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, columnWidths: newWidths as (75 | 38)[], grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const updateConfig = useCallback(
    (updates: Partial<ShelfConfig>) => {
      setConfig((prev) => {
        const newConfig = { ...prev, ...updates }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const reset = useCallback(() => {
    const newConfig = {
      width: 75,
      height: 38,
      sections: 1,
      levels: 1,
      material: "metal",
      finish: "white",
      grid: createInitialGrid(),
      columns: 1,
      rows: 1,
      columnWidths: [75] as (75 | 38)[],
      rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
      cellStyles: {} as CellStyles,
    }
    setConfig(newConfig)
    setHistory([newConfig])
    setHistoryIndex(0)
    setSelectedTool("offenes-fach")
    setSelectedColor("weiss")
    setSelectedCell(null)
  }, [])

  type BomItem = {
    id: string
    name: string
    quantity: number
    pricePerUnit: number
    total: number
    packSize?: number // e.g., 9 or 11 pieces per pack
    totalPieces?: number // quantity * packSize
  }

  const calculateBOM = useCallback((): { items: BomItem[]; totalPrice: number } => {
    const itemMap = new Map<string, BomItem>()

    const addItem = (id: string, name: string, quantity: number, pricePerUnit: number, packSize?: number) => {
      if (!id || id.trim() === "") return

      const existing = itemMap.get(id)
      if (existing) {
        existing.quantity += quantity
        existing.total = existing.quantity * pricePerUnit
        if (packSize && existing.packSize) {
          existing.totalPieces = existing.quantity * packSize
        }
      } else {
        const newItem: BomItem = {
          id,
          name,
          quantity,
          pricePerUnit,
          total: quantity * pricePerUnit,
          packSize,
          totalPieces: packSize ? quantity * packSize : undefined,
        }
        itemMap.set(id, newItem)
      }
    }

    // Collect all non-empty, non-ghost cells
    const cells: Array<{ row: number; col: number; cell: GridCell }> = []
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          cells.push({ row, col, cell })
        }
      }
    }

    if (cells.length === 0) {
      return { items: [], totalPrice: 0 }
    }

    const columnsWithModules = new Set<number>()
    for (const { col } of cells) {
      columnsWithModules.add(col)
    }
    const activeColumns = Array.from(columnsWithModules).sort((a, b) => a - b)

    // Calculate column heights only for active columns
    const columnMaxRows: Map<number, number> = new Map()
    for (let col = 0; col < config.columns; col++) {
      let maxRow = -1
      for (let row = 0; row < config.rows; row++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          maxRow = Math.max(maxRow, row)
        }
      }
      if (maxRow >= 0) {
        columnMaxRows.set(col, maxRow)
      }
    }

    // --- LEITERN (Ladders) ---
    // For 2 columns with 7 rows (280cm):
    // - 4 x Aufbaumodul (SIM001a) for extension parts
    // - 3 x Leiter 200 (SIM005) for main height
    const leiterCounts: Record<string, { artNr: string; name: string; price: number; count: number }> = {}

    if (activeColumns.length > 0) {
      // Group adjacent columns together
      const columnGroups: number[][] = []
      let currentGroup: number[] = [activeColumns[0]]

      for (let i = 1; i < activeColumns.length; i++) {
        if (activeColumns[i] === activeColumns[i - 1] + 1) {
          currentGroup.push(activeColumns[i])
        } else {
          columnGroups.push(currentGroup)
          currentGroup = [activeColumns[i]]
        }
      }
      columnGroups.push(currentGroup)

      // For each group of adjacent columns, add ladders at boundaries
      for (const group of columnGroups) {
        // For a group of n columns, we need n+1 ladder positions
        for (let i = 0; i <= group.length; i++) {
          const leftCol = i > 0 ? group[i - 1] : -1
          const rightCol = i < group.length ? group[i] : -1

          const leftMaxRow = leftCol >= 0 ? (columnMaxRows.get(leftCol) ?? -1) : -1
          const rightMaxRow = rightCol >= 0 ? (columnMaxRows.get(rightCol) ?? -1) : -1
          const maxRow = Math.max(leftMaxRow, rightMaxRow)

          if (maxRow >= 0) {
            const totalHeightCm = (maxRow + 1) * 40

            if (totalHeightCm <= 200) {
              // Normal height - just use appropriate ladder
              const leiterInfo = getLeiterArtNr(totalHeightCm)
              if (leiterInfo && leiterInfo.artNr) {
                const key = leiterInfo.artNr
                if (!leiterCounts[key]) {
                  leiterCounts[key] = { ...leiterInfo, count: 0 }
                }
                leiterCounts[key].count++
              }
            }
          }
        }
      }
    }

    // For heights > 200cm (e.g., 7 rows = 280cm), we need:
    // - Leiter 200 (SIM005) for main structure
    // - Aufbaumodul (SIM001a) for extensions above 200cm
    const maxRowsInConfig =
      activeColumns.length > 0 ? Math.max(...activeColumns.map((col) => columnMaxRows.get(col) ?? -1)) + 1 : 0
    const totalMaxHeight = maxRowsInConfig * 40

    if (totalMaxHeight > 200) {
      // For very tall shelves, we need Leiter 200 at all positions
      const totalLadderPositions = activeColumns.length + 1 // n+1 for n columns

      // Add Aufbaumodul for extension parts
      const aufbaumodulKey = "SIM001a"
      if (!leiterCounts[aufbaumodulKey]) {
        leiterCounts[aufbaumodulKey] = { artNr: "SIM001a", name: "Aufbaumodul", price: 15.0, count: 0 }
      }
      // For 2 columns with 7 rows: 4 x Aufbaumodul (n+2 where n = number of active columns)
      const neededAufbaumodule = activeColumns.length + 2
      leiterCounts[aufbaumodulKey].count = neededAufbaumodule

      // Add Leiter 200 for main structure
      const leiter200Key = "SIM005"
      if (!leiterCounts[leiter200Key]) {
        leiterCounts[leiter200Key] = { artNr: "SIM005", name: "Leiter 200", price: 41.0, count: 0 }
      }
      // For 2 columns with 280cm height: 3 x Leiter 200 (one less than Aufbaumodule because outer positions share)
      const neededLeiter200 = totalLadderPositions
      leiterCounts[leiter200Key].count = neededLeiter200
    }

    // Add all leitern to BOM
    for (const [artNr, data] of Object.entries(leiterCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- STANGENSETS (Bar sets) ---
    // For 2 columns with 7 rows each (14 cells total), we need:
    // - Each cell needs top + bottom bars, but shared bars are counted once
    // - For n rows in a column: (n+1) stangensets (one per horizontal level)
    // - For 7 rows: 8 stangensets per column, 2 columns = 16 stangensets
    let stangenset40Count = 0
    let stangenset80Count = 0

    for (const col of activeColumns) {
      const widthCm = config.columnWidths[col] === 75 ? 80 : 40

      // Count filled rows in this column
      let filledRowsInColumn = 0
      for (let row = 0; row < config.rows; row++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          filledRowsInColumn++
        }
      }

      // For n filled rows in a column, we need n+1 horizontal bars (top of bottom cell + each cell boundary + top of top cell)
      // But the formula is actually: (filledRows + 1) stangensets per column
      // However, based on expected output: 2 columns x 7 rows = 16 stangensets 80
      // That's (7 + 1) * 2 = 16, but that seems too simple
      // Actually: each cell needs 2 bars, but adjacent cells share 1 bar
      // So for 7 cells in a column: 7*2 - 6 = 8 bars per column, 2 columns = 16 bars
      const barsInColumn = filledRowsInColumn > 0 ? filledRowsInColumn + 1 : 0

      if (widthCm === 40) {
        stangenset40Count += barsInColumn
      } else {
        stangenset80Count += barsInColumn
      }
    }

    if (stangenset40Count > 0) {
      addItem("SIM006", "Stangenset 40", stangenset40Count, 8.0)
    }
    if (stangenset80Count > 0) {
      addItem("SIM007", "Stangenset 80", stangenset80Count, 12.0)
    }

    // --- FLÄCHENSETS (Panels) - with color tracking ---
    // Each Flächenset contains 2 surfaces (top + bottom)
    // For stacked modules, we count the number of surfaces needed:
    // - Each module needs a bottom surface
    // - The topmost module in each column needs a top surface
    // - Shared surfaces between stacked modules count as one
    const flaechenset40Counts: Record<string, number> = {}
    const flaechenset80Counts: Record<string, number> = {}

    // Helper to add Flächenset with color
    const addFlaechenset40 = (color: string) => {
      const c = color || "weiss"
      flaechenset40Counts[c] = (flaechenset40Counts[c] || 0) + 1
    }
    const addFlaechenset80 = (color: string) => {
      const c = color || "weiss"
      flaechenset80Counts[c] = (flaechenset80Counts[c] || 0) + 1
    }

    // Group cells by column to calculate surfaces needed
    const columnCells: Map<number, Array<{ row: number; cell: GridCell }>> = new Map()
    for (const { row, col, cell } of cells) {
      if (!columnCells.has(col)) {
        columnCells.set(col, [])
      }
      columnCells.get(col)!.push({ row, cell })
    }

    // Drawer modules have their own surfaces, so only count open/other modules
    for (const [col, colCells] of columnCells) {
      const widthCm = config.columnWidths[col] === 75 ? 80 : 40

      // Sort cells by row
      colCells.sort((a, b) => a.row - b.row)

      // Count non-drawer modules in this column
      const nonDrawerModules = colCells.filter((c) => c.cell.type !== "mit-doppelschublade")
      const drawerModules = colCells.filter((c) => c.cell.type === "mit-doppelschublade")

      // For non-drawer modules: n modules need n+1 surfaces (shared between stacks)
      // But if there's a drawer above, the surface between drawer and open module is provided by drawer
      // So we need: nonDrawerModules.length surfaces (one per module bottom) + 1 for floor if any non-drawer exists

      if (nonDrawerModules.length > 0) {
        // Check if there's a drawer directly above the topmost non-drawer module
        const topNonDrawerRow = Math.max(...nonDrawerModules.map((c) => c.row))
        const hasDrawerAbove = drawerModules.some((d) => d.row === topNonDrawerRow + 1)

        // Surfaces needed: one per non-drawer module + 1 for top (unless drawer provides it)
        const surfacesNeeded = nonDrawerModules.length + (hasDrawerAbove ? 0 : 1)

        // Get the predominant color
        const moduleColor = nonDrawerModules[nonDrawerModules.length - 1].cell.color || "weiss"

        // Calculate Flächensets (each = 2 surfaces), round up
        const flaechensetsNeeded = Math.ceil(surfacesNeeded / 2)

        if (widthCm === 40) {
          flaechenset40Counts[moduleColor] = (flaechenset40Counts[moduleColor] || 0) + flaechensetsNeeded
        } else {
          flaechenset80Counts[moduleColor] = (flaechenset80Counts[moduleColor] || 0) + flaechensetsNeeded
        }
      }
    }

    // Drawer modules use stainless steel functional walls between them
    // Count exposed sides only for non-drawer modules that need enclosure
    const sidePanelCount40: Record<string, number> = {}

    // Group adjacent drawers to see if they share walls
    for (const { cell, row, col } of cells) {
      const moduleColor = cell.color || "weiss"

      // Check if sides are exposed
      const leftCell = config.grid[row]?.[col - 1]
      const rightCell = config.grid[row]?.[col + 1]

      const isLeftExposed = col === 0 || !leftCell || leftCell.type === "empty" || leftCell.type === "ghost"
      const isRightExposed =
        col === config.columns - 1 || !rightCell || rightCell.type === "empty" || rightCell.type === "ghost"

      // Only non-drawer closed module types need Flächenset 40 side panels
      const needsSidePanels =
        cell.type === "mit-tueren" ||
        cell.type === "abschliessbare-tueren" ||
        cell.type === "abschliessbar-rechts" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "mit-klapptuer" ||
        cell.type === "mit-rueckwand"

      // Drawer modules do NOT need Flächenset 40 side panels - they use stainless steel walls
      if (needsSidePanels) {
        if (isLeftExposed) {
          sidePanelCount40[moduleColor] = (sidePanelCount40[moduleColor] || 0) + 1
        }
        if (isRightExposed) {
          sidePanelCount40[moduleColor] = (sidePanelCount40[moduleColor] || 0) + 1
        }
      }
    }

    // The stainless steel functional wall acts as separator
    // Check for adjacent drawer columns and add only 1 panel for shared boundary
    const drawerColumns = new Set<number>()
    for (const { cell, col } of cells) {
      if (cell.type === "mit-doppelschublade") {
        drawerColumns.add(col)
      }
    }

    // For adjacent drawer columns, add 1 Flächenset 40 as separator (shared wall)
    const sortedDrawerCols = Array.from(drawerColumns).sort((a, b) => a - b)
    for (let i = 0; i < sortedDrawerCols.length - 1; i++) {
      if (sortedDrawerCols[i + 1] === sortedDrawerCols[i] + 1) {
        // Adjacent drawer columns - add 1 shared panel
        // Get the color from one of the drawer modules
        const drawerCell = cells.find((c) => c.col === sortedDrawerCols[i] && c.cell.type === "mit-doppelschublade")
        const color = drawerCell?.cell.color || "weiss"
        sidePanelCount40[color] = (sidePanelCount40[color] || 0) + 1
      }
    }

    // Merge side panel counts into flaechenset40Counts
    for (const [color, count] of Object.entries(sidePanelCount40)) {
      flaechenset40Counts[color] = (flaechenset40Counts[color] || 0) + count
    }

    for (const [color, count] of Object.entries(flaechenset40Counts)) {
      if (count > 0) {
        const artNr = getFlaechensetArtNr(40, color)
        const colorLabel =
          color === "weiss"
            ? "weiß"
            : color === "schwarz"
              ? "schwarz"
              : color === "blau"
                ? "blau"
                : color === "rot"
                  ? "rot"
                  : color === "gruen"
                    ? "grün"
                    : color === "gelb"
                      ? "gelb"
                      : color === "orange"
                        ? "orange"
                        : color
        addItem(artNr, `Flächenset 40 ${colorLabel}`, count, 15.0, 9)
      }
    }

    for (const [color, count] of Object.entries(flaechenset80Counts)) {
      if (count > 0) {
        const artNr = getFlaechensetArtNr(80, color)
        const colorLabel =
          color === "weiss"
            ? "weiß"
            : color === "schwarz"
              ? "schwarz"
              : color === "blau"
                ? "blau"
                : color === "rot"
                  ? "rot"
                  : color === "gruen"
                    ? "grün"
                    : color === "gelb"
                      ? "gelb"
                      : color === "orange"
                        ? "orange"
                        : color
        addItem(artNr, `Flächenset 80 ${colorLabel}`, count, 22.0, 11)
      }
    }

    // --- SCHUBLADEN (Drawers) ---
    const schubladenCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of cells) {
      if (cell.type === "mit-doppelschublade") {
        const color = cell.color || "weiss"
        const artNr = getSchubladeArtNr(color)
        const colorLabel =
          color === "weiss"
            ? "weiß"
            : color === "schwarz"
              ? "schwarz"
              : color === "blau"
                ? "blau"
                : color === "rot"
                  ? "rot"
                  : color === "gruen"
                    ? "grün"
                    : color === "gelb"
                      ? "gelb"
                      : color === "orange"
                        ? "orange"
                        : color
        const name = `Doppelschublade ${colorLabel}`

        if (!schubladenCounts[artNr]) {
          schubladenCounts[artNr] = { count: 0, name, price: 85.0 }
        }
        schubladenCounts[artNr].count++
      }
    }

    for (const [artNr, data] of Object.entries(schubladenCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- TÜREN (Doors) ---
    const tuerenCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of cells) {
      if (cell.type === "mit-tueren" || cell.type === "abschliessbare-tueren") {
        const color = cell.color || "weiss"
        const artNr = getTuerArtNr(color)
        const colorLabel =
          color === "weiss"
            ? "weiß"
            : color === "schwarz"
              ? "schwarz"
              : color === "blau"
                ? "blau"
                : color === "rot"
                  ? "rot"
                  : color === "gruen"
                    ? "grün"
                    : color === "gelb"
                      ? "gelb"
                      : color === "orange"
                        ? "orange"
                        : color
        const name = `Tür 40 cm ${colorLabel}`

        if (!tuerenCounts[artNr]) {
          tuerenCounts[artNr] = { count: 0, name, price: 45.0 }
        }
        // 2 doors per door module
        tuerenCounts[artNr].count += 2
      }
    }

    for (const [artNr, data] of Object.entries(tuerenCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- SCHLÖSSER (Locks) ---
    let lockCount = 0
    for (const { cell } of cells) {
      if (cell.type === "abschliessbare-tueren") {
        lockCount++
      }
    }
    if (lockCount > 0) {
      addItem("SIM1000a", "Schloss Typ A", lockCount, 25.0)
    }

    // --- KLAPPTÜREN (Flap doors) ---
    const klapptuerCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of cells) {
      if (cell.type === "mit-klapptuer") {
        const color = cell.color || "weiss"
        const artNr = getKlapptuerArtNr(color)
        const colorLabel =
          color === "weiss"
            ? "weiß"
            : color === "schwarz"
              ? "schwarz"
              : color === "blau"
                ? "blau"
                : color === "rot"
                  ? "rot"
                  : color === "gruen"
                    ? "grün"
                    : color === "gelb"
                      ? "gelb"
                      : color === "orange"
                        ? "orange"
                        : color
        const name = `Klapptür ${colorLabel}`

        if (!klapptuerCounts[artNr]) {
          klapptuerCounts[artNr] = { count: 0, name, price: 65.0 }
        }
        klapptuerCounts[artNr].count++
      }
    }

    for (const [artNr, data] of Object.entries(klapptuerCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- FUNKTIONSWÄNDE (Back panels) ---
    let funktionswandCount = 0
    for (const { cell } of cells) {
      if (cell.type === "mit-rueckwand") {
        funktionswandCount += 1
      } else if (
        cell.type === "mit-tueren" ||
        cell.type === "mit-doppelschublade" ||
        cell.type === "abschliessbare-tueren" ||
        cell.type === "mit-klapptuer"
      ) {
        // Modules with doors/drawers need 2 back panels
        funktionswandCount += 2
      }
    }
    if (funktionswandCount > 0) {
      addItem("SIM023", "Funktionswand Edelstahl", funktionswandCount, 35.0)
    }

    // Convert map to array and calculate total
    const itemsArray = Array.from(itemMap.values())
    const totalPrice = itemsArray.reduce((sum, item) => sum + item.total, 0)

    return { items: itemsArray, totalPrice }
  }, [config])

  const gridHash = useMemo(() => {
    return JSON.stringify({
      grid: config.grid.map((row) => row.map((cell) => ({ type: cell.type, color: cell.color }))),
      columns: config.columns,
      rows: config.rows,
      columnWidths: config.columnWidths,
      rowHeights: config.rowHeights,
    })
  }, [config.grid, config.columns, config.rows, config.columnWidths, config.rowHeights])

  const bomData = useMemo(() => {
    const result = calculateBOM(config)
    const transformedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      total: item.total,
      packSize: item.packSize,
      totalPieces: item.totalPieces,
    }))
    return { items: transformedItems, totalPrice: result.totalPrice }
  }, [gridHash])

  function InvalidateOnChange({ gridHash }: { gridHash: string }) {
    const { invalidate } = useThree()
    useEffect(() => {
      invalidate()
    }, [gridHash, invalidate])
    return null
  }

  if (isLoading) {
    return <LoadingAnimation onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <ConfiguratorHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <Canvas
            shadows={true}
            camera={{ position: [0, 1.2, 2.5], fov: 50 }}
            gl={{
              antialias: true,
              alpha: true,
              preserveDrawingBuffer: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
            }}
            dpr={[1, 2]}
            frameloop="demand"
            performance={{ min: 0.5 }}
          >
            <color attach="background" args={["#ffffff"]} />
            <fog attach="fog" args={["#ffffff", 5, 15]} />

            <ambientLight intensity={0.35} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.48}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-5, 3, -5]} intensity={0.19} />

            <Suspense
              fallback={
                <mesh>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshBasicMaterial color="#e0e0e0" />
                </mesh>
              }
            >
              <InvalidateOnChange gridHash={JSON.stringify(config.grid)} />
              <ShelfScene
                config={config}
                selectedTool={selectedTool}
                hoveredCell={hoveredCell}
                onCellClick={handleCellClick3D}
                onCellHover={setHoveredCell}
                selectedCell={selectedCell} // Pass selectedCell to ShelfScene
                onApplyCellColor={applyCellColor} // Pass applyCellColor handler
                onClearCellColor={clearCellColor} // Pass clearCellColor handler
              />
            </Suspense>

            <OrbitControls
              makeDefault
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={1}
              maxDistance={8}
            />
          </Canvas>

          <div className="absolute right-4 top-4 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              className="bg-black/70 border-neutral-700 hover:bg-black/90 disabled:opacity-30"
              title="Rückgängig (Undo)"
            >
              <Undo2 className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              className="bg-black/70 border-neutral-700 hover:bg-black/90 disabled:opacity-30"
              title="Wiederholen (Redo)"
            >
              <Redo2 className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="bg-black/70 border-neutral-700 hover:bg-black/90 hover:border-red-500"
              title="Zurücksetzen (Reset)"
            >
              <RotateCcw className="h-5 w-5 text-white" />
            </Button>
            {/* Added Help Bot Button */}
            <ConfiguratorHelpBot />
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/70 px-4 py-2 text-sm text-neutral-300">
            {selectedTool ? (
              <span>
                Ausgewählt:{" "}
                <span className="font-semibold text-blue-400">
                  {selectedTool === "empty" ? "Radierer" : getToolLabel(selectedTool)}
                </span>{" "}
                | Klicke auf Zellen im 3D-Regal
              </span>
            ) : (
              "Wähle ein Modul aus der rechten Seite"
            )}
          </div>

          {selectedTool && selectedTool !== "empty" && (
            <div className="absolute left-4 top-4 rounded-lg bg-black/70 px-3 py-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded"
                  style={{
                    backgroundColor: config.finish !== "none" ? getColorHex(config.finish) : getColorHex("white"),
                  }}
                />
                <span className="text-sm text-white">{getToolLabel(selectedTool)}</span>
              </div>
            </div>
          )}

          {/* Color selection UI */}
          {selectedCell && (
            <div className="absolute left-4 top-24 rounded-lg bg-black/70 px-3 py-2">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-bold text-white">Farbe auswählen</div>
                <div className="flex flex-wrap gap-1">
                  {["weiss", "schwarz", "blau", "gruen", "gelb", "orange", "red"].map((color) => (
                    <button
                      key={color}
                      className={`h-6 w-6 rounded-full border-2 ${
                        config.cellStyles?.[getCellId(selectedCell.row, selectedCell.col)]?.color === color
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      onClick={() => {
                        applyCellColor(selectedCell.row, selectedCell.col, color as ColorKey)
                        setSelectedCell(null) // Close color picker after selection
                      }}
                    />
                  ))}
                </div>
                <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => {
                    clearCellColor(selectedCell.row, selectedCell.col)
                    setSelectedCell(null) // Close color picker
                  }}
                >
                  Farbe löschen
                </button>
                <button
                  className="text-sm text-gray-300 hover:underline"
                  onClick={() => setSelectedCell(null)} // Close color picker
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Height Warning */}
          {showHeightWarning && (
            <div className="absolute bottom-4 left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>Die Regalhöhe überschreitet 200 cm.</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHeightWarning(false)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <ConfiguratorPanel
          config={config}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          onSelectTool={(tool) => {
            setSelectedTool(tool)
            setSelectedCell(null) // Close color picker when tool changes
          }}
          onSelectColor={setSelectedColor}
          onPlaceModule={handleCellClick3D}
          onClearCell={clearCell}
          onResizeGrid={resizeGrid}
          onSetColumnWidth={setColumnWidth}
          onSetRowHeight={setRowHeight}
          onUpdateConfig={updateConfig}
          shoppingList={bomData.items}
          price={bomData.totalPrice}
          showShoppingList={showShoppingList}
          onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
          // Pass color applying functions to Panel
          onApplyColorToRow={applyColorToRow}
          onApplyColorToColumn={applyColorToColumn}
          onApplyColorToAll={applyColorToAll}
        />
      </div>
    </div>
  )
}

function getToolLabel(tool: GridCell["type"]): string {
  const labels: Record<GridCell["type"], string> = {
    empty: "Leer",
    ghost: "Geisterzelle",
    "offenes-fach": "Offenes Fach",
    "ohne-seitenwaende": "Offenes Fach",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-doppelschublade": "Mit Schubladen",
    "abschliessbare-tueren": "Abschließbar",
    "mit-tuere-rechts": "Mit Türen (rechts)",
    "mit-tuere-links": "Mit Türen (links)",
    "abschliessbar-rechts": "Abschließbar (rechts)",
    "abschliessbar-links": "Abschließbar (links)",
    klapptuer: "Klapptür",
  }
  return labels[tool] || tool
}

function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    white: "#FFFFFF",
    black: "#000000",
    blue: "#00A0D6",
    green: "#228B22",
    yellow: "#FFFF00",
    orange: "#FF8C00",
    red: "#DC143C",
    satin: "#F0F8FF",
    weiss: "#FFFFFF",
    schwarz: "#000000",
    blau: "#00A0D6",
    gruen: "#228B22",
    gelb: "#FFFF00",
    orange: "#FF8C00",
    rot: "#DC143C",
  }
  return colors[color] || "#FFFFFF"
}
