"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { Undo2, Redo2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type Product,
  leitern,
  stangensets,
  metallboeden,
  glasboeden,
  holzboeden,
  schubladenTueren,
  funktionswaende,
} from "@/lib/simpli-products"
import type { ShoppingItem } from "@/types/shopping-item"
import type { ShelfColor } from "@/types/shelf-color"

const colorMap: Record<ShelfColor, string> = {
  weiss: "weiss",
  schwarz: "schwarz",
  blau: "blue",
  gruen: "green",
  gelb: "yellow",
  orange: "orange",
  rot: "red",
  satiniert: "satin",
}

export type CellStyles = Record<string, { panelColor?: ShelfColor; frontColor?: ShelfColor }>

export type PaintMode = "panels" | "fronts"

export type GridCell = {
  id: string
  type:
    | "empty"
    | "ghost"
    | "ohne-seitenwaende"
    | "ohne-rueckwand"
    | "mit-rueckwand"
    | "mit-tueren"
    | "mit-klapptuer"
    | "mit-doppelschublade"
    | "abschliessbare-tueren"
  row: number
  col: number
  color?: ShelfColor
  material?: "metal" | "glass"
}

export type ShelfConfig = {
  width: 38 | 75
  height: 40 | 80 | 120 | 160 | 200
  sections: number
  levels: number
  material: "metal" | "glass"
  finish: "black" | "white" | "blue" | "green" | "yellow" | "orange" | "red" | "satin"
  color: ShelfColor
  defaultPanelColor: ShelfColor
  defaultFrontColor: ShelfColor
  cellStyles: CellStyles
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
}

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
  color: "weiss",
  defaultPanelColor: "weiss",
  defaultFrontColor: "weiss",
  cellStyles: {},
  grid: createInitialGrid(),
  columns: 1,
  rows: 1,
  columnWidths: [75] as (75 | 38)[],
  rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
}

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(initialConfig)
  const [selectedTool, setSelectedTool] = useState<string>("ohne-seitenwaende")
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [paintMode, setPaintMode] = useState<PaintMode>("panels")
  const [activeColor, setActiveColor] = useState<ShelfColor>("weiss")
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [showShoppingList, setShowShoppingList] = useState<boolean>(false)

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

  const isConnectedToExisting = (row: number, col: number, grid: GridCell[][]): boolean => {
    const currentCell = grid[row]?.[col]
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
          type: "empty",
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

        if (!isConnectedToExisting(row, col, prev.grid)) {
          console.log("[v0] Cannot place - not connected to existing modules")
          return prev
        }

        if (!hasSupportBelow(row, col, prev.grid)) {
          console.log("[v0] Cannot place - no support below")
          return prev
        }

        let newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return {
                ...cell,
                type,
                color: prev.color,
                material: prev.material,
              }
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

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newColumns,
          rows: newRows,
          columnWidths: newColumnWidths as (75 | 38)[],
          rowHeights: newRowHeights,
        }

        console.log("[v0] New grid size:", newRows, "x", newColumns)
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleCellClick3D = useCallback(
    (row: number, col: number) => {
      console.log("[v0] Cell clicked:", row, col)

      if (!selectedTool || selectedTool === "empty") {
        placeModule(row, col, "ghost")
      } else {
        placeModule(row, col, selectedTool)
      }
    },
    [selectedTool, placeModule],
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

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newCols,
          rows: limitedRows,
          columnWidths: newColumnWidths as (75 | 38)[],
          rowHeights: newRowHeights,
        }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
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
        const newConfig = { ...prev, columnWidths: newWidths as (75 | 38)[] }
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
      color: "weiss",
      defaultPanelColor: "weiss",
      defaultFrontColor: "weiss",
      cellStyles: {},
      grid: createInitialGrid(),
      columns: 1,
      rows: 1,
      columnWidths: [75] as (75 | 38)[],
      rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
    }
    setConfig(newConfig)
    setHistory([newConfig])
    setHistoryIndex(0)
    setSelectedTool("ohne-seitenwaende")
    setPaintMode("panels")
    setShowShoppingList(false)
  }, [])

  const getPanelColor = useCallback(
    (cellId: string): ShelfColor => {
      return config.cellStyles[cellId]?.panelColor ?? config.defaultPanelColor
    },
    [config.cellStyles, config.defaultPanelColor],
  )

  const getFrontColor = useCallback(
    (cellId: string): ShelfColor => {
      return config.cellStyles[cellId]?.frontColor ?? config.defaultFrontColor
    },
    [config.cellStyles, config.defaultFrontColor],
  )

  const applyColorToCell = useCallback((row: number, col: number, color: ShelfColor, mode: PaintMode) => {
    const cellId = `c-${row}-${col}`
    setConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      if (!newCellStyles[cellId]) {
        newCellStyles[cellId] = {}
      }
      if (mode === "panels") {
        newCellStyles[cellId] = { ...newCellStyles[cellId], panelColor: color }
      } else {
        newCellStyles[cellId] = { ...newCellStyles[cellId], frontColor: color }
      }
      return { ...prev, cellStyles: newCellStyles }
    })
  }, [])

  const applyColorToRow = useCallback(() => {
    if (!selectedCell) return
    setConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      for (let col = 0; col < prev.columns; col++) {
        const cell = prev.grid[selectedCell.row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          const cellId = `c-${selectedCell.row}-${col}`
          if (!newCellStyles[cellId]) {
            newCellStyles[cellId] = {}
          }
          if (paintMode === "panels") {
            newCellStyles[cellId] = { ...newCellStyles[cellId], panelColor: activeColor }
          } else {
            newCellStyles[cellId] = { ...newCellStyles[cellId], frontColor: activeColor }
          }
        }
      }
      return { ...prev, cellStyles: newCellStyles }
    })
  }, [selectedCell, paintMode, activeColor])

  const applyColorToColumn = useCallback(() => {
    if (!selectedCell) return
    setConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      for (let row = 0; row < prev.rows; row++) {
        const cell = prev.grid[row]?.[selectedCell.col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          const cellId = `c-${row}-${selectedCell.col}`
          if (!newCellStyles[cellId]) {
            newCellStyles[cellId] = {}
          }
          if (paintMode === "panels") {
            newCellStyles[cellId] = { ...newCellStyles[cellId], panelColor: activeColor }
          } else {
            newCellStyles[cellId] = { ...newCellStyles[cellId], frontColor: activeColor }
          }
        }
      }
      return { ...prev, cellStyles: newCellStyles }
    })
  }, [selectedCell, paintMode, activeColor])

  const applyColorToAll = useCallback(() => {
    setConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      for (let row = 0; row < prev.rows; row++) {
        for (let col = 0; col < prev.columns; col++) {
          const cell = prev.grid[row]?.[col]
          if (cell && cell.type !== "empty" && cell.type !== "ghost") {
            const cellId = `c-${row}-${col}`
            if (!newCellStyles[cellId]) {
              newCellStyles[cellId] = {}
            }
            if (paintMode === "panels") {
              newCellStyles[cellId] = { ...newCellStyles[cellId], panelColor: activeColor }
            } else {
              newCellStyles[cellId] = { ...newCellStyles[cellId], frontColor: activeColor }
            }
          }
        }
      }
      return { ...prev, cellStyles: newCellStyles }
    })
  }, [paintMode, activeColor])

  const clearPanelColor = useCallback(() => {
    if (!selectedCell) return
    const cellId = `c-${selectedCell.row}-${selectedCell.col}`
    setConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      if (newCellStyles[cellId]) {
        const { panelColor, ...rest } = newCellStyles[cellId]
        if (Object.keys(rest).length === 0) {
          delete newCellStyles[cellId]
        } else {
          newCellStyles[cellId] = rest
        }
      }
      return { ...prev, cellStyles: newCellStyles }
    })
  }, [selectedCell])

  const clearFrontColor = useCallback(() => {
    if (!selectedCell) return
    const cellId = `c-${selectedCell.row}-${selectedCell.col}`
    setConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      if (newCellStyles[cellId]) {
        const { frontColor, ...rest } = newCellStyles[cellId]
        if (Object.keys(rest).length === 0) {
          delete newCellStyles[cellId]
        } else {
          newCellStyles[cellId] = rest
        }
      }
      return { ...prev, cellStyles: newCellStyles }
    })
  }, [selectedCell])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setSelectedCell({ row, col })
      const cell = config.grid[row]?.[col]
      if (cell && cell.type !== "empty" && cell.type !== "ghost") {
        applyColorToCell(row, col, activeColor, paintMode)
      }
      placeModule(row, col, selectedTool)
    },
    [config.grid, activeColor, paintMode, applyColorToCell, selectedTool, placeModule],
  )

  const pruneCellStyles = useCallback((newRows: number, newCols: number) => {
    setConfig((prev) => {
      const newCellStyles: CellStyles = {}
      for (const [cellId, style] of Object.entries(prev.cellStyles)) {
        const match = cellId.match(/c-(\d+)-(\d+)/)
        if (match) {
          const row = Number.parseInt(match[1])
          const col = Number.parseInt(match[2])
          if (row < newRows && col < newCols) {
            newCellStyles[cellId] = style
          }
        }
      }
      return { ...prev, cellStyles: newCellStyles }
    })
  }, [])

  const { shoppingList, totalPrice } = useMemo(() => {
    const items: ShoppingItem[] = []
    const itemMap = new Map<string, ShoppingItem>()

    const addItem = (product: Product, quantity: number, colorKey?: ShelfColor) => {
      const key = colorKey ? `${product.sku}-${colorKey}` : product.sku
      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!
        existing.quantity += quantity
        existing.totalPrice = existing.quantity * existing.unitPrice
      } else {
        const newItem: ShoppingItem = {
          sku: product.sku,
          name: colorKey ? `${product.name} (${colorKey})` : product.name,
          quantity,
          unitPrice: product.price,
          totalPrice: quantity * product.price,
          category: product.category,
        }
        itemMap.set(key, newItem)
        items.push(newItem)
      }
    }

    const filledCells = config.grid.flat().filter((cell) => cell.type !== "empty" && cell.type !== "ghost")

    if (filledCells.length === 0) {
      return { shoppingList: items, totalPrice: 0 }
    }

    const panelsByColor: Record<ShelfColor, { count: number; width: 75 | 38 }[]> = {} as any

    filledCells.forEach((cell) => {
      const cellId = `c-${cell.row}-${cell.col}`
      const panelColor = getPanelColor(cellId)
      const width = config.columnWidths[cell.col] || 75

      if (!panelsByColor[panelColor]) {
        panelsByColor[panelColor] = []
      }
      panelsByColor[panelColor].push({ count: 1, width })
    })

    for (const [colorKey, panels] of Object.entries(panelsByColor)) {
      const color = colorKey as ShelfColor
      const panelCount = panels.length
      const packs = Math.ceil(panelCount / 2)
      const deliveredPanels = packs * 2

      const width = panels[0]?.width || 75
      let product: Product | undefined

      if (config.material === "metal") {
        product = metallboeden.find((p) => p.width === width && p.color?.toLowerCase() === color.toLowerCase())
      } else if (config.material === "glass") {
        product = glasboeden.find((p) => p.width === width && p.color?.toLowerCase() === color.toLowerCase())
      }

      if (product) {
        addItem(product, packs, color)
      }
    }

    const frontModuleTypes = ["mit-tueren", "mit-klapptuer", "mit-doppelschublade", "abschliessbare-tueren"]
    const frontsByColorAndType: Record<string, { color: ShelfColor; type: string; count: number; width: 75 | 38 }> = {}

    filledCells.forEach((cell) => {
      if (frontModuleTypes.includes(cell.type)) {
        const cellId = `c-${cell.row}-${cell.col}`
        const frontColor = getFrontColor(cellId)
        const width = config.columnWidths[cell.col] || 75
        const key = `${cell.type}-${frontColor}-${width}`

        if (!frontsByColorAndType[key]) {
          frontsByColorAndType[key] = { color: frontColor, type: cell.type, count: 0, width }
        }
        frontsByColorAndType[key].count++
      }
    })

    for (const [_, data] of Object.entries(frontsByColorAndType)) {
      const product = schubladenTueren.find(
        (p) =>
          p.moduleType === data.type && p.width === data.width && p.color?.toLowerCase() === data.color.toLowerCase(),
      )

      if (product) {
        addItem(product, data.count, data.color)
      }
    }

    const ladderHeightsNeeded: number[] = []

    const columnGroups: number[][] = []
    let currentGroup: number[] = []

    const usedColIndices = Array.from(new Set(filledCells.map((cell) => cell.col)).values()).sort((a, b) => a - b)

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

    columnGroups.forEach((group) => {
      for (let i = 0; i <= group.length; i++) {
        let ladderHeight: number

        if (i === 0) {
          ladderHeight = config.rowHeights[group[0]] || 0
        } else if (i === group.length) {
          ladderHeight = config.rowHeights[group[group.length - 1]] || 0
        } else {
          const leftColHeight = config.rowHeights[group[i - 1]] || 0
          const rightColHeight = config.rowHeights[group[i]] || 0
          ladderHeight = Math.max(leftColHeight, rightColHeight)
        }

        ladderHeightsNeeded.push(ladderHeight)
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

    let tube80Levels = 0
    let tube40Levels = 0

    usedColIndices.forEach((colIdx) => {
      const cells = filledCells.filter((cell) => cell.col === colIdx)
      if (cells.length === 0) return

      const numCells = cells.length
      const tubesNeeded = numCells + 1

      if (config.columnWidths[colIdx] === 75) {
        tube80Levels += tubesNeeded
      } else {
        tube40Levels += tubesNeeded
      }
    })

    const stange80 = stangensets.find((s) => s.size === 80 && s.variant === "metall")
    const stange40 = stangensets.find((s) => s.size === 40 && s.variant === "metall")

    if (stange80 && tube80Levels > 0) addItem(stange80, tube80Levels)
    if (stange40 && tube40Levels > 0) addItem(stange40, tube40Levels)

    const shelfCounts: Map<string, { product: Product; needed: number }> = new Map()

    const cellsByRow: Map<number, typeof filledCells> = new Map()
    filledCells.forEach((cell) => {
      const existing = cellsByRow.get(cell.row) || []
      existing.push(cell)
      cellsByRow.set(cell.row, existing)
    })

    const sidewallCounts: Map<string, { product: Product; needed: number }> = new Map()

    cellsByRow.forEach((rowCells, rowIdx) => {
      const sortedCells = rowCells.sort((a, b) => a.col - b.col)

      let currentBlock: typeof filledCells = []
      const blocks: (typeof filledCells)[] = []

      sortedCells.forEach((cell, idx) => {
        if (
          ["mit-rueckwand", "mit-tueren", "abschliessbare-tueren", "mit-klapptuer", "mit-doppelschublade"].includes(
            cell.type,
          )
        ) {
          if (currentBlock.length === 0) {
            currentBlock.push(cell)
          } else {
            const lastCell = currentBlock[currentBlock.length - 1]
            if (cell.col === lastCell.col + 1) {
              currentBlock.push(cell)
            } else {
              blocks.push(currentBlock)
              currentBlock = [cell]
            }
          }
        } else {
          if (currentBlock.length > 0) {
            blocks.push(currentBlock)
            currentBlock = []
          }
        }
      })
      if (currentBlock.length > 0) {
        blocks.push(currentBlock)
      }

      blocks.forEach((block) => {
        const n = block.length
        const sidewallsNeeded = n + 1

        const representativeCell = block[0]
        const cellColor = representativeCell.color || config.color
        const cellMaterial = representativeCell.material || config.material
        const productColor = colorMap[cellColor] || "weiss"
        const bodenSize = config.columnWidths[representativeCell.col] === 38 ? 38 : 80

        let sidewallProduct: Product | undefined

        if (cellMaterial === "metal") {
          sidewallProduct =
            metallboeden.find((p) => p.size === bodenSize && p.color === productColor) ||
            metallboeden.find((p) => p.size === bodenSize)
        } else if (cellMaterial === "glass") {
          const glassColor = productColor === "schwarz" ? "schwarz" : undefined
          sidewallProduct = glasboeden.find(
            (p) => p.size === bodenSize && (glassColor ? p.color === glassColor : p.variant === "satiniert"),
          )
        } else {
          sidewallProduct = holzboeden.find((p) => p.size === bodenSize)
        }

        if (sidewallProduct) {
          const key = `sidewall-${sidewallProduct.artNr}`
          const existing = sidewallCounts.get(key)
          if (existing) {
            existing.needed += sidewallsNeeded
          } else {
            sidewallCounts.set(key, { product: sidewallProduct, needed: sidewallsNeeded })
          }
        }
      })
    })

    sidewallCounts.forEach(({ product, needed }, key) => {
      const packsNeeded = Math.ceil(needed / 2)
      const delivered = packsNeeded * 2

      const sidewallProduct: Product = {
        ...product,
        artNr: `sw-${product.artNr}`,
        name: `Seitenwand ${product.name}`,
      }
      addItem(sidewallProduct, needed)
    })

    filledCells.forEach((cell) => {
      const colIndex = cell.col
      const bodenSize = config.columnWidths[colIndex] === 38 ? 38 : 80

      const cellColor = cell.color || config.color
      const cellMaterial = cell.material || config.material
      const productColor = colorMap[cellColor] || "weiss"

      let shelfProduct: (typeof metallboeden)[0] | (typeof glasboeden)[0] | (typeof holzboeden)[0] | undefined

      if (cellMaterial === "metal") {
        shelfProduct =
          metallboeden.find((p) => p.size === bodenSize && p.color === productColor) ||
          metallboeden.find((p) => p.size === bodenSize)
      } else if (cellMaterial === "glass") {
        const glassColor = productColor === "schwarz" ? "schwarz" : undefined
        shelfProduct = glasboeden.find(
          (p) => p.size === bodenSize && (glassColor ? p.color === glassColor : p.variant === "satiniert"),
        )
      } else {
        shelfProduct = holzboeden.find((p) => p.size === bodenSize)
      }

      if (shelfProduct) {
        const key = shelfProduct.artNr
        const existing = shelfCounts.get(key)
        if (existing) {
          existing.needed += 1
        } else {
          shelfCounts.set(key, { product: shelfProduct, needed: 1 })
        }
      }

      switch (cell.type) {
        case "mit-rueckwand": {
          const backPanel =
            funktionswaende.find((p) => p.variant === "1-seitig" && p.color === "weiss") ||
            funktionswaende.find((p) => p.variant === "1-seitig")
          if (backPanel) addItem(backPanel, 1)
          break
        }
        case "mit-tueren":
        case "abschliessbare-tueren": {
          const door =
            schubladenTueren.find((p) => p.category === "tuer" && p.color === "weiss") ||
            schubladenTueren.find((p) => p.category === "tuer")
          if (door) addItem(door, 2)
          break
        }
        case "mit-klapptuer": {
          const door =
            schubladenTueren.find((p) => p.category === "tuer" && p.color === "weiss") ||
            schubladenTueren.find((p) => p.category === "tuer")
          if (door) addItem(door, 1)
          break
        }
        case "mit-doppelschublade": {
          const drawer =
            schubladenTueren.find((p) => p.category === "schublade" && p.color === "weiss") ||
            schubladenTueren.find((p) => p.category === "schublade")
          if (drawer) addItem(drawer, 1)
          break
        }
      }
    })

    shelfCounts.forEach(({ product, needed }) => {
      const packsNeeded = Math.ceil(needed / 2)
      const delivered = packsNeeded * 2
      addItem(product, packsNeeded)
    })

    return { shoppingList: items, totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0) }
  }, [config, getPanelColor, getFrontColor])

  const priceFormatted = totalPrice.toFixed(2).replace(".", ",")

  return (
    <div className="flex h-full w-full flex-col bg-neutral-950">
      <ConfiguratorHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <Canvas shadows camera={{ position: [2, 1.5, 3], fov: 45 }} className="h-full w-full">
            <color attach="background" args={["#1a1a1a"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-3, 3, -3]} intensity={0.4} />
            <ShelfScene
              config={config}
              selectedTool={selectedTool}
              hoveredCell={hoveredCell}
              onCellClick={handleCellClick3D}
              onCellHover={setHoveredCell}
              paintMode={paintMode}
            />
            <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={10} blur={2} far={4} />
            <Environment preset="apartment" />
            <OrbitControls
              makeDefault
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={1.5}
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
        </div>

        <ConfiguratorPanel
          config={config}
          onUpdateConfig={updateConfig}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onPlaceModule={placeModule}
          onClearCell={clearCell}
          onResizeGrid={resizeGrid}
          onSetColumnWidth={setColumnWidth}
          onSetRowHeight={setRowHeight}
          selectedCell={selectedCell}
          paintMode={paintMode}
          onPaintModeChange={setPaintMode}
          activeColor={activeColor}
          onActiveColorChange={setActiveColor}
          onApplyColorToRow={applyColorToRow}
          onApplyColorToColumn={applyColorToColumn}
          onApplyColorToAll={applyColorToAll}
          onClearPanelColor={clearPanelColor}
          onClearFrontColor={clearFrontColor}
          shoppingList={shoppingList}
          price={priceFormatted}
          showShoppingList={showShoppingList}
          onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
        />
      </div>
    </div>
  )
}

function getToolLabel(tool: string): string {
  const labels: Record<string, string> = {
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
  }
  return colors[color] || "#FFFFFF"
}
