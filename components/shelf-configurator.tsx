"use client"

import { useState, useCallback, useMemo, useRef, Suspense, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { Undo2, Redo2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type Product,
  leitern,
  metallboeden,
  glasboeden,
  seitenwaende,
  adapter,
  schrauben,
  funktionswaende,
} from "@/lib/simpli-products"
import type { ShoppingItem } from "@/types/shopping-item"
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

  const [history, setHistory] = useState<ShelfConfig[]>([initialConfig])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedo = useRef(false)

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

    if (row === 0) return true
    const belowCell = grid[row - 1]?.[col]
    return belowCell !== undefined && belowCell.type !== "empty" && belowCell.type !== "ghost"
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

    let needsExpansion = false
    let expandLeft = false
    let expandRight = false
    let expandUp = false

    const hasFilledAtCol0 = newGrid.some((row) => row[0] && row[0].type !== "empty" && row[0].type !== "ghost")
    if (hasFilledAtCol0) {
      expandLeft = true
      needsExpansion = true
    }

    const lastColIdx = cols - 1
    const hasFilledAtLastCol = newGrid.some((row) => {
      const cell = row[lastColIdx]
      return cell && cell.type !== "empty" && cell.type !== "ghost"
    })
    if (hasFilledAtLastCol) {
      expandRight = true
      needsExpansion = true
    }

    const topRowIdx = rows - 1
    const hasFilledAtTopRow = newGrid[topRowIdx].some((cell) => cell.type !== "empty" && cell.type !== "ghost")
    if (hasFilledAtTopRow) {
      expandUp = true
      needsExpansion = true
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
            { nr: r - 1, nc: c },
            { nr: r + 1, nc: c },
            { nr: r, nc: c - 1 },
            { nr: r, nc: c + 1 },
          ]

          adjacentPositions.forEach(({ nr, nc }) => {
            if (nr >= 0 && nr < updatedRows && nc >= 0 && nc < updatedCols) {
              const adjacentCell = newGrid[nr][nc]
              if (adjacentCell.type === "empty") {
                newGrid[nr][nc] = { ...adjacentCell, type: "ghost" }
              }
            }
          })
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

  const calculateBOM = (config: ShelfConfig) => {
    const items: Map<string, ShoppingItem> = new Map()

    const addItem = (product: Product, qty = 1) => {
      const existing = items.get(product.artNr)
      if (existing) {
        existing.quantity += qty
        existing.subtotal = existing.quantity * existing.product.price
      } else {
        items.set(product.artNr, {
          product,
          quantity: qty,
          subtotal: product.price * qty,
        })
      }
    }

    const filledCells = config.grid.flat().filter((c) => c.type !== "empty" && c.type !== "ghost")
    if (filledCells.length === 0) {
      return { items: [], totalPrice: 0 }
    }

    const cellsByColumn: Map<number, typeof filledCells> = new Map()
    filledCells.forEach((cell) => {
      const existing = cellsByColumn.get(cell.col) || []
      existing.push(cell)
      cellsByColumn.set(cell.col, existing)
    })

    const columnHeights: Map<number, number> = new Map()

    cellsByColumn.forEach((cells, colIdx) => {
      const rows = cells.map((c) => c.row).sort((a, b) => a - b)
      let heightCm = 0
      rows.forEach((rowIdx) => {
        heightCm += config.rowHeights[rowIdx] || 38
      })
      columnHeights.set(colIdx, heightCm)
    })

    const usedColIndices = Array.from(cellsByColumn.keys()).sort((a, b) => a - b)

    const columnGroups: number[][] = []
    let currentGroup: number[] = []

    usedColIndices.forEach((col, idx) => {
      if (idx === 0) {
        currentGroup.push(col)
      } else {
        const prevCol = usedColIndices[idx - 1]
        if (col === prevCol + 1) {
          currentGroup.push(col)
        } else {
          columnGroups.push(currentGroup)
          currentGroup = [col]
        }
      }
    })
    if (currentGroup.length > 0) {
      columnGroups.push(currentGroup)
    }

    const ladderHeightsNeeded: number[] = []
    let totalLadderCount = 0

    columnGroups.forEach((group) => {
      for (let i = 0; i <= group.length; i++) {
        let ladderHeight: number

        if (i === 0) {
          ladderHeight = columnHeights.get(group[0]) || 0
        } else if (i === group.length) {
          ladderHeight = columnHeights.get(group[group.length - 1]) || 0
        } else {
          const leftColHeight = columnHeights.get(group[i - 1]) || 0
          const rightColHeight = columnHeights.get(group[i]) || 0
          ladderHeight = Math.max(leftColHeight, rightColHeight)
        }

        ladderHeightsNeeded.push(ladderHeight)
        totalLadderCount++
      }
    })

    const ladderSizeCounts: Map<number, number> = new Map()

    ladderHeightsNeeded.forEach((heightCm) => {
      let leiterSize = 40
      if (heightCm > 160) leiterSize = 200
      else if (heightCm > 120) leiterSize = 160
      else if (heightCm > 80) leiterSize = 120
      else if (heightCm > 40) leiterSize = 80

      const current = ladderSizeCounts.get(leiterSize) || 0
      ladderSizeCounts.set(leiterSize, current + 1)
    })

    ladderSizeCounts.forEach((count, size) => {
      const leiterProduct = leitern.find((l) => l.size === size)
      if (leiterProduct) {
        addItem(leiterProduct, count)
      }
    })

    const adapterProduct = adapter.find((a) => a.category === "adapter")
    if (adapterProduct && totalLadderCount > 0) {
      addItem(adapterProduct, totalLadderCount * 2)
    }

    const startSchraube = schrauben.find((s) => s.variant === "start")
    const erweiterungsSchraube = schrauben.find((s) => s.variant === "erweiterung")

    if (startSchraube) {
      addItem(startSchraube, columnGroups.length)
    }

    if (erweiterungsSchraube) {
      columnGroups.forEach((group) => {
        const laddersInGroup = group.length + 1
        if (laddersInGroup > 2) {
          addItem(erweiterungsSchraube, laddersInGroup - 2)
        }
      })
    }

    const panelCountByColor: Map<string, { color: string; width: number; count: number }> = new Map()
    let glass80Count = 0
    let glass40Count = 0

    filledCells.forEach((cell) => {
      const cellWidth = config.columnWidths[cell.col]
      const bodenSize = cellWidth === 75 ? 80 : 40
      const cellColor = cell.color || "weiss"

      if (config.material === "metal") {
        const key = `metal-${bodenSize}-${cellColor}`
        const existing = panelCountByColor.get(key)
        if (existing) {
          existing.count += 1
        } else {
          panelCountByColor.set(key, { color: cellColor, width: bodenSize, count: 1 })
        }
      } else if (config.material === "glass") {
        if (bodenSize === 80) glass80Count++
        else glass40Count++
      }
    })

    if (config.material === "metal") {
      panelCountByColor.forEach(({ color, width, count }) => {
        const packs = Math.ceil(count / 2)
        const shelfProduct =
          metallboeden.find((p) => p.size === width && p.color === color) ||
          metallboeden.find((p) => p.size === width && p.color === "weiss") ||
          metallboeden.find((p) => p.size === width)
        if (shelfProduct) {
          addItem(shelfProduct, packs)
        }
      })
    } else if (config.material === "glass") {
      // Glass shelves also in 2-packs
      const glass80Packs = Math.ceil(glass80Count / 2)
      const glass40Packs = Math.ceil(glass40Count / 2)

      const glass80Product = glasboeden.find((p) => p.size === 80)
      const glass40Product = glasboeden.find((p) => p.size === 40)

      if (glass80Product && glass80Packs > 0) addItem(glass80Product, glass80Packs)
      if (glass40Product && glass40Packs > 0) addItem(glass40Product, glass40Packs)
    }

    const sidewallCountByColor: Map<string, { color: string; width: number; count: number }> = new Map()

    config.grid.forEach((row, rowIndex) => {
      const rowCells = row.filter((c) => c.type !== "empty" && c.type !== "ghost")
      if (rowCells.length === 0) return

      const needsSidewalls = (type: GridCell["type"]) =>
        type !== "offenes-fach" && type !== "ohne-seitenwaende" && type !== "empty" && type !== "ghost"

      const consecutiveGroups: { cols: number[]; width: number; color: string }[] = []
      let currentGroup: number[] = []
      let currentColor = ""
      let currentWidth = 0

      rowCells.forEach((cell, idx) => {
        if (needsSidewalls(cell.type)) {
          const cellWidth = config.columnWidths[cell.col] === 75 ? 80 : 40
          const cellColor = cell.color || "weiss"

          if (
            idx === 0 ||
            rowCells[idx - 1].col + 1 !== cell.col ||
            cellWidth !== currentWidth ||
            cellColor !== currentColor
          ) {
            if (currentGroup.length > 0) {
              consecutiveGroups.push({ cols: currentGroup, width: currentWidth, color: currentColor })
            }
            currentGroup = [cell.col]
            currentColor = cellColor
            currentWidth = cellWidth
          } else {
            currentGroup.push(cell.col)
          }
        } else {
          if (currentGroup.length > 0) {
            consecutiveGroups.push({ cols: currentGroup, width: currentWidth, color: currentColor })
            currentGroup = []
            currentColor = ""
            currentWidth = 0
          }
        }
      })

      if (currentGroup.length > 0) {
        consecutiveGroups.push({ cols: currentGroup, width: currentWidth, color: currentColor })
      }

      // N+1 sidewalls for consecutive modules, aggregate by color
      consecutiveGroups.forEach((group) => {
        const sidewallsNeeded = group.cols.length + 1
        const key = `sidewall-${group.width}-${group.color}`
        const existing = sidewallCountByColor.get(key)
        if (existing) {
          existing.count += sidewallsNeeded
        } else {
          sidewallCountByColor.set(key, { color: group.color, width: group.width, count: sidewallsNeeded })
        }
      })
    })

    sidewallCountByColor.forEach(({ color, width, count }) => {
      const packs = Math.ceil(count / 2)
      const sideWall =
        seitenwaende.find((p) => p.size === width && p.color === color) ||
        seitenwaende.find((p) => p.size === width && p.color === "weiss") ||
        seitenwaende.find((p) => p.size === width)
      if (sideWall) {
        addItem(sideWall, packs)
      }
    })

    const backwallCountByColor: Map<string, { color: string; width: number; count: number }> = new Map()

    filledCells.forEach((cell) => {
      const needsBackwall = (type: GridCell["type"]) =>
        type === "ohne-seitenwaende" || // has back wall, no side walls
        type === "mit-rueckwand" || // has back wall + side walls
        type === "mit-tuere-rechts" ||
        type === "mit-tuere-links" ||
        type === "abschliessbar-rechts" ||
        type === "abschliessbar-links" ||
        type === "klapptuer"

      if (needsBackwall(cell.type)) {
        const cellWidth = config.columnWidths[cell.col] === 75 ? 80 : 40
        const cellColor = cell.color || "weiss"
        const key = `backwall-${cellWidth}-${cellColor}`

        const existing = backwallCountByColor.get(key)
        if (existing) {
          existing.count += 1
        } else {
          backwallCountByColor.set(key, { color: cellColor, width: cellWidth, count: 1 })
        }
      }
    })

    // Add back walls as 2-packs
    backwallCountByColor.forEach(({ color, width, count }) => {
      const packs = Math.ceil(count / 2)
      const funktionswand =
        funktionswaende.find((p) => p.size === width && p.color === color) ||
        funktionswaende.find((p) => p.size === width && p.color === "weiss") ||
        funktionswaende.find((p) => p.size === width)
      if (funktionswand) {
        addItem(funktionswand, packs)
      }
    })

    const list = Array.from(items.values())
    const total = list.reduce((sum, item) => sum + item.subtotal, 0)

    return { items: list, totalPrice: total }
  }

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
      id: item.product.artNr,
      name: item.product.name,
      quantity: item.quantity,
      pricePerUnit: item.product.price,
      total: item.subtotal,
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
                  {["weiss", "schwarz", "blau", "gruen", "gelb", "orange", "rot"].map((color) => (
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
