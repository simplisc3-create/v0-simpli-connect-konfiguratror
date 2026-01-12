"use client"

import { useState, useCallback, useMemo, useRef, Suspense, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import type { ToolMode } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { ConfiguratorHelpBot } from "./configurator-help-bot"
import { Undo2, Redo2, RotateCcw, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getSchubladeArtNr,
  getTuerArtNr,
  getKlapptuerArtNr,
  getLeiterArtNr,
  getKlapptuerObenArtNr,
  getEinzelschubladeArtNr,
  getFlaechensetArtNr,
  flaechensets,
} from "@/lib/simpli-products"
import { useThree } from "@react-three/fiber"
import { isModuleTypeAvailableForWidth } from "@/lib/glb-registry"
import * as THREE from "three"
import { LoadingAnimation } from "./loading-animation"
import { MobileConfiguratorNav } from "./mobile-configurator-nav"

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
    | "mit-klapptuer-oben"
    | "mit-doppelschublade"
    | "abschliessbare-tueren"
    | "mit-tuere-rechts"
    | "mit-tuere-links"
    | "abschliessbar-rechts"
    | "abschliessbar-links"
    | "klapptuer"
    | "mit-einzelschublade"
  row: number
  col: number
  color?: "weiss" | "schwarz" | "blau" | "gruen" | "gelb" | "orange" | "red"
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

type PresetConfig = {
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights: (40 | 80 | 120 | 160 | 200)[]
  grid: GridCell[][]
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

const updateGhostCells = (
  grid: GridCell[][],
  columnWidths: (75 | 38)[],
  defaultNewColumnWidth: 75 | 38 = 75, // Add parameter for default width, default to 80cm (75)
): { grid: GridCell[][]; columnWidths: (75 | 38)[]; shifted: boolean } => {
  const rows = grid.length
  const cols = grid[0]?.length || 0
  const newGrid: GridCell[][] = []
  const newColumnWidths = [...columnWidths]
  let shifted = false

  // First pass: copy all non-ghost cells
  for (let r = 0; r < rows; r++) {
    newGrid[r] = []
    for (let c = 0; c < cols; c++) {
      const originalCell = grid[r][c]
      if (originalCell.type === "ghost") {
        newGrid[r][c] = { ...originalCell, type: "empty" }
      } else {
        newGrid[r][c] = { ...originalCell, type: originalCell.type, color: originalCell.color }
      }
    }
  }

  // Check if there are any filled modules
  const hasFilledModules = newGrid.some((row) => row.some((cell) => cell.type !== "empty" && cell.type !== "ghost"))

  if (!hasFilledModules) {
    if (newGrid[0] && newGrid[0][0]) {
      newGrid[0][0] = { ...newGrid[0][0], type: "ghost" }
    }
    return { grid: newGrid, columnWidths: newColumnWidths, shifted: false }
  }

  let needsTopRow = false
  const currentCols = newGrid[0]?.length || 0
  for (let c = 0; c < currentCols; c++) {
    if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
      needsTopRow = true
      break
    }
  }

  if (needsTopRow) {
    // Prepend a new empty row at top
    const newTopRow: GridCell[] = []
    for (let c = 0; c < currentCols; c++) {
      newTopRow.push({
        id: `cell-0-${c}`,
        type: "empty",
        row: 0,
        col: c,
      })
    }
    newGrid.unshift(newTopRow)
    // Update all row indices
    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        newGrid[r][c].row = r
        newGrid[r][c].id = `cell-${r}-${c}`
      }
    }
    shifted = true
  }

  // Now add vertical stacking ghost cells (above topmost filled in each column)
  const updatedRows = newGrid.length
  const updatedCols = newGrid[0]?.length || 0
  for (let c = 0; c < updatedCols; c++) {
    let topmostFilledRow = -1
    for (let r = 0; r < updatedRows; r++) {
      if (newGrid[r][c].type !== "empty" && newGrid[r][c].type !== "ghost") {
        topmostFilledRow = r
        break
      }
    }
    if (topmostFilledRow > 0) {
      if (newGrid[topmostFilledRow - 1][c].type === "empty") {
        newGrid[topmostFilledRow - 1][c] = { ...newGrid[topmostFilledRow - 1][c], type: "ghost" }
      }
    }
  }

  // Find leftmost and rightmost filled columns at row 0
  let leftmostFilled = cols
  let rightmostFilled = -1
  for (let c = 0; c < cols; c++) {
    if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
      leftmostFilled = Math.min(leftmostFilled, c)
      rightmostFilled = Math.max(rightmostFilled, c)
    }
  }

  if (leftmostFilled === 0) {
    // Prepend a new column
    for (let r = 0; r < newGrid.length; r++) {
      newGrid[r].unshift({
        id: `cell-${r}-0`,
        type: r === 0 ? "ghost" : "empty",
        row: r,
        col: 0,
      })
    }
    // Update all cell IDs and cols
    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        newGrid[r][c].col = c
        newGrid[r][c].id = `cell-${r}-${c}`
      }
    }
    newColumnWidths.unshift(defaultNewColumnWidth)
    shifted = true
  } else if (leftmostFilled > 0) {
    if (newGrid[0][leftmostFilled - 1].type === "empty") {
      newGrid[0][leftmostFilled - 1] = { ...newGrid[0][leftmostFilled - 1], type: "ghost" }
    }
  }

  // Right expansion: add column if rightmost is at last column
  const currentColsAfterLeftExpansion = newGrid[0]?.length || 0
  let currentRightmostFilled = -1
  for (let c = 0; c < currentColsAfterLeftExpansion; c++) {
    if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
      currentRightmostFilled = Math.max(currentRightmostFilled, c)
    }
  }

  if (currentRightmostFilled === currentColsAfterLeftExpansion - 1) {
    // Append a new column
    for (let r = 0; r < newGrid.length; r++) {
      newGrid[r].push({
        id: `cell-${r}-${currentColsAfterLeftExpansion}`,
        type: r === 0 ? "ghost" : "empty",
        row: r,
        col: currentColsAfterLeftExpansion,
      })
    }
    newColumnWidths.push(defaultNewColumnWidth)
  } else if (currentRightmostFilled >= 0 && currentRightmostFilled + 1 < currentColsAfterLeftExpansion) {
    if (newGrid[0][currentRightmostFilled + 1].type === "empty") {
      newGrid[0][currentRightmostFilled + 1] = { ...newGrid[0][currentRightmostFilled + 1], type: "ghost" }
    }
  }

  return { grid: newGrid, columnWidths: newColumnWidths, shifted }
}

export function ShelfConfigurator({
  initialPreset,
  presetYoutubeId,
}: { initialPreset?: PresetConfig; presetYoutubeId?: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [showVideoPreview, setShowVideoPreview] = useState(!!presetYoutubeId)

  const [defaultNewColumnWidth, setDefaultNewColumnWidth] = useState<75 | 38>(75)

  const getInitialConfig = (): ShelfConfig => {
    if (initialPreset) {
      return {
        ...initialConfig,
        columns: initialPreset.columns,
        rows: initialPreset.rows,
        columnWidths: initialPreset.columnWidths,
        rowHeights: initialPreset.rowHeights,
        grid: initialPreset.grid,
      }
    }
    return initialConfig
  }

  const [config, setConfig] = useState<ShelfConfig>(getInitialConfig)
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>("offenes-fach")
  const [selectedColor, setSelectedColor] = useState<GridCell["color"]>("weiss")
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  const [toolMode, setToolMode] = useState<ToolMode>("select")

  const [showHeightWarning, setShowHeightWarning] = useState(false)
  const [heightWarningShown, setHeightWarningShown] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // State for undo/redo
  const [history, setHistory] = useState<ShelfConfig[]>([getInitialConfig()])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedo = useRef(false)

  useEffect(() => {
    if (initialPreset) {
      const {
        grid: updatedGrid,
        columnWidths: updatedColumnWidths,
        shifted,
      } = updateGhostCells(initialPreset.grid, initialPreset.columnWidths, defaultNewColumnWidth)

      setConfig((prev) => ({
        ...prev,
        grid: updatedGrid,
        columns: updatedGrid[0]?.length || prev.columns,
        rows: updatedGrid.length,
        columnWidths: updatedColumnWidths, // Use updated columnWidths
      }))
    }
  }, [initialPreset])

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

  const expandGridAroundPlacement = (
    grid: GridCell[][],
    placedRow: number,
    placedCol: number,
    columnWidths: (75 | 38)[] = [],
  ): { grid: GridCell[][]; columnWidths: (75 | 38)[]; shifted: boolean } => {
    let newGrid = grid.map((row) => [...row])
    let newColumnWidths = [...columnWidths]
    let shifted = false
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
    const hasFilledAtTopRow = newGrid[topRowIdx]?.some((cell) => cell.type !== "empty" && cell.type !== "ghost")
    if (hasFilledAtTopRow) {
      expandUp = true
    }

    if (expandLeft) {
      shifted = true
      newGrid = newGrid.map((row, ri) => {
        const newCell: GridCell = {
          id: `cell-${ri}--1-temp`,
          type: "empty" as const,
          row: ri,
          col: -1,
        }
        return [newCell, ...row.map((c) => ({ ...c, col: c.col + 1, id: `cell-${c.row}-${c.col + 1}` }))]
      })
      newColumnWidths = [defaultNewColumnWidth as const, ...newColumnWidths]
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
      newColumnWidths.push(defaultNewColumnWidth as const)
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

    // Rule: Ghost cells only appear:
    // 1. Directly above a filled cell (for vertical stacking)
    // 2. Left/right of horizontal groups at row 0 (for horizontal expansion)
    for (let c = 0; c < updatedCols; c++) {
      // Find the topmost filled cell in this column
      let topmostFilledRow = -1
      for (let r = updatedRows - 1; r >= 0; r--) {
        if (newGrid[r][c].type !== "empty" && newGrid[r][c].type !== "ghost") {
          topmostFilledRow = r
          break
        }
      }

      // Add ghost cell directly above for vertical stacking
      if (topmostFilledRow >= 0 && topmostFilledRow < updatedRows - 1) {
        const aboveCell = newGrid[topmostFilledRow + 1][c]
        if (aboveCell.type === "empty") {
          newGrid[topmostFilledRow + 1][c] = { ...aboveCell, type: "ghost" }
        }
      }
    }

    // Horizontal expansion - add ghosts only at row 0 (ground level), adjacent to filled groups
    if (updatedRows > 0) {
      // Find leftmost and rightmost filled cells at row 0
      let leftmostFilled = -1
      let rightmostFilled = -1
      for (let c = 0; c < updatedCols; c++) {
        if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
          if (leftmostFilled === -1) leftmostFilled = c
          rightmostFilled = c
        }
      }

      // Add ghost only to the left of leftmost filled cell
      if (leftmostFilled > 0 && newGrid[0][leftmostFilled - 1].type === "empty") {
        newGrid[0][leftmostFilled - 1] = { ...newGrid[0][leftmostFilled - 1], type: "ghost" }
      }

      // Add ghost only to the right of rightmost filled cell
      if (
        rightmostFilled >= 0 &&
        rightmostFilled + 1 < updatedCols &&
        newGrid[0][rightmostFilled + 1].type === "empty"
      ) {
        newGrid[0][rightmostFilled + 1] = { ...newGrid[0][rightmostFilled + 1], type: "ghost" }
      }
    }

    return { grid: newGrid, columnWidths: newColumnWidths, shifted }
  }

  const placeModule = useCallback(
    (row: number, col: number, type: GridCell["type"]) => {
      setConfig((prev) => {
        const currentCell = prev.grid[row]?.[col]

        if (!currentCell || (currentCell.type !== "ghost" && currentCell.type !== "empty")) {
          return prev
        }

        if (!isConnectedToExisting(row, col, prev.grid, type)) {
          return prev
        }

        if (!hasSupportBelow(row, col, prev.grid)) {
          return prev
        }

        const columnWidth = prev.columnWidths[col]
        const widthInCm = columnWidth === 75 ? 80 : 40
        if (type !== "empty" && type !== "ghost" && !isModuleTypeAvailableForWidth(type, widthInCm)) {
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

        const {
          grid: expandedGrid,
          columnWidths: updatedColumnWidths,
          shifted,
        } = expandGridAroundPlacement(newGrid, row, col, prev.columnWidths)
        newGrid = expandedGrid

        const newColumns = newGrid[0]?.length || 1
        const newRows = newGrid.length

        const newColumnWidths = [...updatedColumnWidths] // Use updated columnWidths

        // If columns were shifted, we might need to adjust columnWidths more carefully
        // This logic needs to be more robust if columns can be inserted in the middle
        if (shifted) {
          // If a column was prepended, the original columnWidths array needs to reflect this.
          // The 'updateGhostCells' function now handles prepending/appending a width of 38.
          // This part might need further refinement if complex column reordering occurs.
        }

        const newRowHeights = [...prev.rowHeights]
        while (newRowHeights.length < newRows) newRowHeights.push(38)
        while (newRowHeights.length > newRows) newRowHeights.pop()

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

        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory, selectedColor, defaultNewColumnWidth],
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

  const swapModules = useCallback(
    (row: number, col1: number, col2: number) => {
      setConfig((prev) => {
        const cell1 = prev.grid[row]?.[col1]
        const cell2 = prev.grid[row]?.[col2]

        if (!cell1 || !cell2) return prev
        if (cell1.type === "empty" || cell1.type === "ghost") return prev
        if (cell2.type === "empty" || cell2.type === "ghost") return prev

        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col1) {
              return { ...cell2 }
            }
            if (ri === row && ci === col2) {
              return { ...cell1 }
            }
            return cell
          }),
        )

        // Also swap column widths if they differ
        const newColumnWidths = [...prev.columnWidths] as (75 | 38)[]
        const tempWidth = newColumnWidths[col1]
        newColumnWidths[col1] = newColumnWidths[col2]
        newColumnWidths[col2] = tempWidth

        // Swap cell styles
        const cellId1 = getCellId(row, col1)
        const cellId2 = getCellId(row, col2)
        const newCellStyles = { ...(prev.cellStyles || {}) }
        const tempStyle = newCellStyles[cellId1]
        newCellStyles[cellId1] = newCellStyles[cellId2]
        newCellStyles[cellId2] = tempStyle

        const newConfig = {
          ...prev,
          grid: newGrid,
          columnWidths: newColumnWidths,
          cellStyles: newCellStyles,
        }

        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  // Execute swap for row 1, columns 1 and 3 (0-indexed: row 1, cols 1 and 3)
  useEffect(() => {
    // This is a one-time swap - remove after execution
    // swapModules(1, 1, 3)
  }, [])

  const resizeGrid = useCallback(
    (newRows: number, newCols: number) => {
      const limitedRows = Math.min(Math.max(1, newRows), 8)

      // Pass columnWidths to updateGhostCells when resizing
      const { grid: newGrid, columnWidths: newColumnWidths } = updateGhostCells(
        Array.from({ length: limitedRows }, (_, rowIndex) =>
          Array.from({ length: newCols }, (_, colIndex) => {
            // Create a placeholder grid for updateGhostCells
            // This might need a more sophisticated approach if we want to preserve existing content precisely
            if (rowIndex < config.rows && colIndex < config.columns) {
              return config.grid[rowIndex][colIndex]
            }
            return {
              id: `cell-${rowIndex}-${colIndex}`,
              type: "empty" as const,
              row: rowIndex,
              col: colIndex,
            }
          }),
        ),
        Array.from({ length: newCols }, () => defaultNewColumnWidth), // Default to the selected default width
      )

      const newRowHeights = [...config.rowHeights]
      while (newRowHeights.length < limitedRows) newRowHeights.push(38)
      while (newRowHeights.length > limitedRows) newRowHeights.pop()

      const prunedCellStyles = pruneCellStyles(config.cellStyles || {}, limitedRows, newCols)

      const newConfig = {
        ...config,
        grid: newGrid,
        columns: newCols,
        rows: limitedRows,
        columnWidths: newColumnWidths as (75 | 38)[],
        rowHeights: newRowHeights,
        cellStyles: prunedCellStyles,
      }
      setTimeout(() => saveToHistory(newConfig), 0)
      setConfig(newConfig)
    },
    [
      saveToHistory,
      pruneCellStyles,
      config,
      config.rows,
      config.columns,
      config.grid,
      config.cellStyles,
      config.rowHeights,
      defaultNewColumnWidth,
    ],
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
      // Changed type to number for colIndex
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
    setToolMode("select") // Reset tool mode
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

      let totalAufbaumodule = 0

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
            } else {
              const leiter200Key = "SIM005"
              if (!leiterCounts[leiter200Key]) {
                leiterCounts[leiter200Key] = { artNr: "SIM005", name: "Leiter 200", price: 41.0, count: 0 }
              }
              leiterCounts[leiter200Key].count++

              // Calculate Aufbaumodule needed for this position
              const extraHeight = totalHeightCm - 200
              const aufbaumoduleForPosition = Math.ceil(extraHeight / 40)
              totalAufbaumodule += aufbaumoduleForPosition
            }
          }
        }
      }

      if (totalAufbaumodule > 0) {
        const aufbaumodulKey = "SIM001a"
        if (!leiterCounts[aufbaumodulKey]) {
          leiterCounts[aufbaumodulKey] = { artNr: "SIM001a", name: "Aufbaumodul", price: 15.0, count: 0 }
        }
        leiterCounts[aufbaumodulKey].count = totalAufbaumodule
      }
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

    // ==========================================
    // --- FLÄCHENSETS (Surface sets) ---
    // ==========================================
    // Rules:
    // 1) Each active cell requires panels based on module type
    // 2) Aggregate required panels by (size, color)
    // 3) Convert to sets: ceil(panels / 2)
    // 4) Use getFlaechensetArtNr for correct SKU

    // Track panel pieces by size and color
    const panelPieces: Record<string, Record<string, number>> = {
      "40": {},
      "80": {},
    }

    // Modules that need backwall panels
    const modulesWithBackwall = [
      "mit-rueckwand",
      "ohne-seitenwaende",
      "abschliessbare-tueren",
      "abschliessbar-links",
      "abschliessbar-rechts",
      "mit-tuere-links",
      "mit-tuere-rechts",
      "mit-klapptuer",
      "mit-doppelschublade",
      "mit-klapptuer-oben",
      "mit-einzelschublade",
      "mit-tueren",
    ]

    // Modules that need side wall panels (40cm)
    const modulesWithSideWalls = [
      "mit-rueckwand",
      "ohne-rueckwand",
      "abschliessbare-tueren",
      "abschliessbar-links",
      "abschliessbar-rechts",
      "mit-tuere-links",
      "mit-tuere-rechts",
      "mit-klapptuer",
      "mit-doppelschublade",
      "mit-klapptuer-oben",
      "mit-einzelschublade",
      "mit-tueren",
    ]

    // Group cells by column for horizontal panel calculation
    const columnGroups: Record<number, { cells: typeof cells; rows: number[] }> = {}
    for (const { cell, row, col } of cells) {
      if (!columnGroups[col]) {
        columnGroups[col] = { cells: [], rows: [] }
      }
      columnGroups[col].cells.push({ cell, row, col })
      columnGroups[col].rows.push(row)
    }

    // Track which rows in each column have side walls for shared wall detection
    const columnSideWallRows: Record<number, number[]> = {}

    // Calculate panels per column
    for (const [colStr, group] of Object.entries(columnGroups)) {
      const col = Number.parseInt(colStr)
      const modulesInCol = group.cells
      const widthCm =
        config.columnWidths[col] === 75 ? 80 : config.columnWidths[col] === 38 ? 40 : config.columnWidths[col]
      const sizeKey = widthCm === 40 ? "40" : "80"

      // Sort rows
      const sortedRows = [...group.rows].sort((a, b) => a - b)

      // For each module in column
      for (const { cell, row } of modulesInCol) {
        const color = cell.color === "black" ? "schwarz" : cell.color || "weiss"

        // Horizontal panels: floor + ceiling
        // First module in column = 2 panels (floor + ceiling)
        // Additional stacked modules share floor with ceiling below = 1 panel each
        const isFirstInColumn = row === sortedRows[0]
        const horizontalPanels = isFirstInColumn ? 2 : 1

        // Backwall panel
        const backwallPanels = modulesWithBackwall.includes(cell.type) ? 1 : 0

        // Side wall panels (always 40cm)
        let sideWallPanels = 0
        if (modulesWithSideWalls.includes(cell.type)) {
          sideWallPanels = 2
          if (!columnSideWallRows[col]) columnSideWallRows[col] = []
          columnSideWallRows[col].push(row)
        }

        // Add horizontal + backwall panels to correct size bucket
        if (sizeKey === "40") {
          // 40cm: all panels go to 40cm bucket
          panelPieces["40"][color] =
            (panelPieces["40"][color] || 0) + horizontalPanels + backwallPanels + sideWallPanels
        } else {
          // 80cm: horizontal + backwall go to 80cm, side walls go to 40cm
          panelPieces["80"][color] = (panelPieces["80"][color] || 0) + horizontalPanels + backwallPanels
          if (sideWallPanels > 0) {
            panelPieces["40"][color] = (panelPieces["40"][color] || 0) + sideWallPanels
          }
        }
      }
    }

    // Reduce shared side walls between adjacent columns
    const colKeys = Object.keys(columnGroups)
      .map(Number)
      .sort((a, b) => a - b)
    for (let i = 0; i < colKeys.length - 1; i++) {
      const leftCol = colKeys[i]
      const rightCol = colKeys[i + 1]

      // Only adjacent columns (no gap)
      if (rightCol !== leftCol + 1) continue

      const leftRows = columnSideWallRows[leftCol] || []
      const rightRows = columnSideWallRows[rightCol] || []

      // Shared rows reduce panels
      const sharedRows = leftRows.filter((r) => rightRows.includes(r))
      if (sharedRows.length > 0) {
        // Get color from left column (arbitrary choice for shared wall)
        const leftGroup = columnGroups[leftCol]
        for (const sharedRow of sharedRows) {
          const cellData = leftGroup.cells.find((c) => c.row === sharedRow)
          if (cellData) {
            const color = cellData.cell.color === "black" ? "schwarz" : cellData.cell.color || "weiss"
            panelPieces["40"][color] = Math.max(0, (panelPieces["40"][color] || 0) - 1)
          }
        }
      }
    }

    // Handle Funktionswand shared panels
    const modulesWithFunktionswand = [
      "mit-tueren",
      "mit-doppelschublade",
      "abschliessbare-tueren",
      "mit-klapptuer",
      "mit-klapptuer-oben",
      "mit-tuere-links",
      "mit-tuere-rechts",
      "abschliessbar-links",
      "abschliessbar-rechts",
      "mit-einzelschublade",
    ]
    const modulesWithLeftFunktionswandOnly = ["mit-tuere-links", "abschliessbar-links"]
    const modulesWithRightFunktionswandOnly = ["mit-tuere-rechts", "abschliessbar-rechts"]

    // Count meeting Funktionswände
    for (let rowIdx = 0; rowIdx < config.rows; rowIdx++) {
      for (let i = 0; i < colKeys.length - 1; i++) {
        const leftCol = colKeys[i]
        const rightCol = colKeys[i + 1]
        if (rightCol !== leftCol + 1) continue

        const leftCell = config.grid[rowIdx]?.[leftCol]
        const rightCell = config.grid[rowIdx]?.[rightCol]
        if (!leftCell || !rightCell) continue

        const leftHasFunktionswand = modulesWithFunktionswand.includes(leftCell.type)
        const rightHasFunktionswand = modulesWithFunktionswand.includes(rightCell.type)

        const leftHasRightFunktionswand =
          leftHasFunktionswand && !modulesWithLeftFunktionswandOnly.includes(leftCell.type)
        const rightHasLeftFunktionswand =
          rightHasFunktionswand && !modulesWithRightFunktionswandOnly.includes(rightCell.type)

        if (leftHasRightFunktionswand && rightHasLeftFunktionswand) {
          // Both have Funktionswand on meeting side - reduce 1 panel
          const color = leftCell.color === "black" ? "schwarz" : leftCell.color || "weiss"
          panelPieces["40"][color] = Math.max(0, (panelPieces["40"][color] || 0) - 1)
        }
      }
    }

    // Convert panel pieces to sets and add to BOM
    console.log("[v0] Panel pieces before set conversion:", JSON.stringify(panelPieces))

    // Add Flächenset 40 products
    for (const [color, pieceCount] of Object.entries(panelPieces["40"])) {
      if (pieceCount > 0) {
        const setsNeeded = Math.ceil(pieceCount / 2)
        const artNr = getFlaechensetArtNr(40, color)
        const product = flaechensets.find((p) => p.artNr === artNr)
        if (product) {
          addItem(artNr, product.name, setsNeeded, product.price)
        } else {
          // Fallback if product not found
          const colorLabel = color === "weiss" ? "weiß" : color === "schwarz" ? "schwarz" : color
          addItem(artNr, `Flächenset 40 ${colorLabel}`, setsNeeded, 15.0)
        }
        console.log(`[v0] Flächenset 40 ${color}: ${pieceCount} pieces -> ${setsNeeded} sets (artNr: ${artNr})`)
      }
    }

    // Add Flächenset 80 products
    for (const [color, pieceCount] of Object.entries(panelPieces["80"])) {
      if (pieceCount > 0) {
        const setsNeeded = Math.ceil(pieceCount / 2)
        const artNr = getFlaechensetArtNr(80, color)
        const product = flaechensets.find((p) => p.artNr === artNr)
        if (product) {
          addItem(artNr, product.name, setsNeeded, product.price)
        } else {
          // Fallback if product not found
          const colorLabel = color === "weiss" ? "weiß" : color === "schwarz" ? "schwarz" : color
          addItem(artNr, `Flächenset 80 ${colorLabel}`, setsNeeded, 22.0)
        }
        console.log(`[v0] Flächenset 80 ${color}: ${pieceCount} pieces -> ${setsNeeded} sets (artNr: ${artNr})`)
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
      if (
        cell.type === "mit-tueren" ||
        cell.type === "abschliessbare-tueren" ||
        cell.type === "mit-tuere-links" ||
        cell.type === "mit-tuere-rechts" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "abschliessbar-rechts"
      ) {
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
        // 80cm modules have 2 doors, 40cm modules have 1 door
        if (
          cell.type === "mit-tuere-links" ||
          cell.type === "mit-tuere-rechts" ||
          cell.type === "abschliessbar-links" ||
          cell.type === "abschliessbar-rechts"
        ) {
          tuerenCounts[artNr].count += 1
        } else {
          tuerenCounts[artNr].count += 2
        }
      }
    }

    for (const [artNr, data] of Object.entries(tuerenCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- SCHLÖSSER (Locks) ---
    let lockCount = 0
    for (const { cell } of cells) {
      if (
        cell.type === "abschliessbare-tueren" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "abschliessbar-rechts"
      ) {
        lockCount++
      }
    }
    if (lockCount > 0) {
      addItem("SIM1000a", "Schloss Typ A", lockCount, 25.0)
    }

    // --- KLAPPTÜREN (Flap doors - nach unten öffnend) ---
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

    // --- KLAPPTÜREN NACH OBEN (Upward-opening flip doors) ---
    const klapptuerObenCounts: Record<string, { count: number; name: string; price: number }> = {}
    let totalGasdruckdaempfer = 0

    for (const { cell } of cells) {
      if (cell.type === "mit-klapptuer-oben") {
        const color = cell.color || "weiss"
        const artNr = getKlapptuerObenArtNr(color)
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
        const name = `Klapptür ${colorLabel} (nach oben)`

        if (!klapptuerObenCounts[artNr]) {
          klapptuerObenCounts[artNr] = { count: 0, name, price: 65.0 }
        }
        klapptuerObenCounts[artNr].count++
        // Each upward-opening flip door requires 2 gas dampers (for Warenwirtschaft only)
        totalGasdruckdaempfer += 2
      }
    }

    for (const [artNr, data] of Object.entries(klapptuerObenCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    const einzelschubladeCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of cells) {
      if (cell.type === "mit-einzelschublade") {
        const color = cell.color || "weiss"
        const artNr = `ES-${getEinzelschubladeArtNr(color)}` // Prefix to differentiate from Klapptür oben
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
        const name = `Einzelschublade ${colorLabel}`

        if (!einzelschubladeCounts[artNr]) {
          einzelschubladeCounts[artNr] = { count: 0, name, price: 55.0 }
        }
        einzelschubladeCounts[artNr].count++
      }
    }

    for (const [artNr, data] of Object.entries(einzelschubladeCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- FUNKTIONSWÄNDE (Back panels) ---
    let funktionswandCount = 0

    for (const { col, cell } of cells) {
      const widthCm = config.columnWidths[col] === 75 ? 80 : 40

      if (
        cell.type === "mit-tueren" ||
        cell.type === "mit-doppelschublade" ||
        cell.type === "abschliessbare-tueren" ||
        cell.type === "mit-klapptuer" ||
        cell.type === "mit-klapptuer-oben" ||
        cell.type === "mit-tuere-links" ||
        cell.type === "mit-tuere-rechts" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "abschliessbar-rechts" ||
        cell.type === "mit-einzelschublade"
      ) {
        if (
          widthCm === 40 &&
          (cell.type === "mit-tuere-links" ||
            cell.type === "mit-tuere-rechts" ||
            cell.type === "abschliessbar-links" ||
            cell.type === "abschliessbar-rechts")
        ) {
          funktionswandCount += 1 // 40cm door module = 1 Funktionswand
        } else {
          funktionswandCount += 2 // 80cm module = 2 Funktionswände
        }
      }
    }

    if (funktionswandCount > 0) {
      addItem("SIM023", "Funktionswand Edelstahl", funktionswandCount, 35.0)
    }

    const cellsForDebug = config.grid.flatMap((row, ri) =>
      row.map((cell, ci) => ({
        row: ri,
        col: ci,
        cell: cell,
      })),
    )

    console.log("[v0] BOM Calculation - Grid size:", config.grid.length, "x", config.grid[0]?.length)
    console.log("[v0] BOM Calculation - columnWidths:", config.columnWidths)
    console.log(
      "[v0] BOM Calculation - Filled cells:",
      cellsForDebug.filter((c) => c.cell.type !== "empty" && c.cell.type !== "ghost").length,
    )
    console.log(
      "[v0] BOM Calculation - Einzelschubladen:",
      Object.keys(einzelschubladeCounts).length > 0 ? einzelschubladeCounts : "none",
    )

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
    const result = calculateBOM()
    const transformedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      total: item.total,
      packSize: item.packSize,
      totalPieces: item.totalPieces,
    }))
    // Filter out Gasdruckdämpfer from customer-facing BOM
    const filteredItems = transformedItems.filter((item) => item.id !== "SIM033")
    const filteredTotalPrice = filteredItems.reduce((sum, item) => sum + item.total, 0)
    return { items: filteredItems, totalPrice: filteredTotalPrice }
  }, [gridHash])

  function InvalidateOnChange({ gridHash }: { gridHash: string }) {
    const { invalidate } = useThree()
    useEffect(() => {
      invalidate()
    }, [gridHash, invalidate])
    return null
  }

  const toggleDefaultColumnWidth = () => {
    setDefaultNewColumnWidth((prev) => (prev === 75 ? 38 : 75))
  }

  if (isLoading) {
    return <LoadingAnimation onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#1a1a1a]">
      <ConfiguratorHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          {showVideoPreview && presetYoutubeId && (
            <div className="absolute top-20 left-4 z-50 w-48 h-32 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
              <button
                onClick={() => setShowVideoPreview(false)}
                className="absolute top-1 right-1 z-10 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${presetYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${presetYoutubeId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full object-cover pointer-events-none"
                style={{ border: "none" }}
              />
            </div>
          )}

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

          <div className="absolute right-4 top-4 flex gap-2 mx-0 px-0 py-0">
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
            <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow-lg">
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
          selectedCell={selectedCell}
          onSelectTool={setSelectedTool}
          onSelectColor={setSelectedColor}
          onPlaceModule={placeModule} // Renamed to handlePlaceModule in updates
          onClearCell={clearCell} // Renamed to handleClearCell in updates
          onResizeGrid={resizeGrid} // Renamed to handleResizeGrid in updates
          onSetColumnWidth={setColumnWidth} // Renamed to handleSetColumnWidth in updates
          onSetRowHeight={setRowHeight} // Renamed to handleSetRowHeight in updates
          onUpdateConfig={updateConfig} // Renamed to handleUpdateConfig in updates
          shoppingList={bomData.items}
          price={bomData.totalPrice}
          showShoppingList={showShoppingList}
          onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
          onApplyCellColor={applyCellColor} // Renamed to handleApplyCellColor in updates
          onApplyColorToRow={applyColorToRow} // Renamed to handleApplyColorToRow in updates
          onApplyColorToColumn={applyColorToColumn} // Renamed to handleApplyColorToColumn in updates
          onApplyColorToAll={applyColorToAll} // Renamed to handleApplyColorToAll in updates
          onClearCellColor={clearCellColor} // Renamed to handleClearCellColor in updates
          onDeselectCell={() => setSelectedCell(null)}
          toolMode={toolMode}
          onSetToolMode={setToolMode}
        />

        <MobileConfiguratorNav
          config={config}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          onSelectTool={(tool) => {
            setSelectedTool(tool)
            setSelectedCell(null)
          }}
          onSelectColor={setSelectedColor}
          onUpdateConfig={updateConfig}
          shoppingList={bomData.items}
          price={bomData.totalPrice}
        />
      </div>
      {/* Sticky toggle button for column width */}
      <div className="fixed left-4 bottom-20 z-50 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDefaultColumnWidth}
          className={`rounded-full px-4 py-2 text-xs font-medium shadow-lg transition-all ${
            defaultNewColumnWidth === 75
              ? "bg-teal-600 text-white border-teal-500 hover:bg-teal-700"
              : "bg-amber-600 text-white border-amber-500 hover:bg-amber-700"
          }`}
        >
          Neue Spalten: {defaultNewColumnWidth === 75 ? "80cm" : "40cm"}
        </Button>
      </div>
    </div>
  )
}

// Function to get the user-friendly name of a module type
function getModuleName(type: GridCell["type"]) {
  const moduleNames: Record<GridCell["type"], string> = {
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
    "abschliessbare-tueren": "Abschließbar",
    "mit-tuere-rechts": "Mit Türen (rechts)",
    "mit-tuere-links": "Mit Türen (links)",
    "abschliessbar-rechts": "Abschließbar (rechts)",
    "abschliessbar-links": "Abschließbar (links)",
    "mit-einzelschublade": "Einzelschublade",
  }
  return moduleNames[type] ?? type
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
    "mit-klapptuer-oben": "Klapptür (nach oben)",
    "mit-doppelschublade": "Mit Schubladen",
    "abschliessbare-tueren": "Abschließbar",
    "mit-tuere-rechts": "Mit Türen (rechts)",
    "mit-tuere-links": "Mit Türen (links)",
    "abschliessbar-rechts": "Abschließbar (rechts)",
    "abschliessbar-links": "Abschließbar (links)",
    klapptuer: "Klapptür",
    "mit-einzelschublade": "Mit Einzelschublade",
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
    satin: "#F0F8FF", // Assuming satin is a valid color, though not in the list above
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
