"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { Undo2, Redo2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Product, metallboeden, glasboeden } from "@/lib/simpli-products"
import type { ShoppingItem } from "@/types/shopping-item" // Import ShoppingItem
import type { ShelfColor } from "@/types/shelf-color" // Import ShelfColor

const colorMap: Record<ShelfColor, string> = {
  weiss: "weiss",
  schwarz: "schwarz",
  blau: "blue",
  gruen: "green",
  gelb: "yellow",
  orange: "orange",
  rot: "red",
  lila: "purple",
  satiniert: "satin",
}

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
  panelColor?: ShelfColor
  frontColor?: ShelfColor
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
  cellStyles: Record<string, { panelColor?: ShelfColor; frontColor?: ShelfColor }>
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
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>("ohne-seitenwaende")
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  const [history, setHistory] = useState<ShelfConfig[]>([initialConfig])
  const [historyIndex, setHistoryIndex] = useState(0)

  type PaintMode = "panels" | "fronts"

  const [paintMode, setPaintMode] = useState<PaintMode>("panels")
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [activeColor, setActiveColor] = useState<ShelfColor>("weiss")

  const isUndoRedo = useRef(false)

  const saveToHistory = useCallback(
    (newConfig: ShelfConfig) => {
      if (isUndoRedo.current) {
        isUndoRedo.current = false
        return
      }
      setHistory((prev) => {
        // Remove any future states if we're in the middle of history
        const newHistory = prev.slice(0, historyIndex + 1)
        // Add new state and limit history to 50 entries
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

    // Check if we need to expand left (if there's a filled module at col 0)
    const hasFilledAtCol0 = newGrid.some((row) => row[0] && row[0].type !== "empty" && row[0].type !== "ghost")
    if (hasFilledAtCol0) {
      expandLeft = true
      needsExpansion = true
    }

    // Check if we need to expand right (if there's a filled module at last col)
    const lastColIdx = cols - 1
    const hasFilledAtLastCol = newGrid.some((row) => {
      const cell = row[lastColIdx]
      return cell && cell.type !== "empty" && cell.type !== "ghost"
    })
    if (hasFilledAtLastCol) {
      expandRight = true
      needsExpansion = true
    }

    // Check if we need to expand up (if there's a filled module at top row)
    const topRowIdx = rows - 1
    const hasFilledAtTopRow = newGrid[topRowIdx].some((cell) => cell.type !== "empty" && cell.type !== "ghost")
    if (hasFilledAtTopRow) {
      expandUp = true
      needsExpansion = true
    }

    // Perform expansions
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
          // Create ghost cells in 4 adjacent positions
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
    (row: number, col: number, moduleType: GridCell["type"]) => {
      console.log("[v0] Placing module at", row, col, moduleType)

      setConfig((prev) => {
        const currentCell = prev.grid[row]?.[col]

        // Don't allow placement if not a ghost cell
        if (!currentCell || (currentCell.type !== "ghost" && currentCell.type !== "empty")) {
          console.log("[v0] Cannot place - cell is not ghost or empty")
          return prev
        }

        // Check if cell is connected to existing modules
        if (!isConnectedToExisting(row, col, prev.grid)) {
          console.log("[v0] Cannot place - not connected to existing modules")
          return prev
        }

        // Check if has support below (for non-ground level)
        if (!hasSupportBelow(row, col, prev.grid)) {
          console.log("[v0] Cannot place - no support below")
          return prev
        }

        // Place the module
        let newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return {
                ...cell,
                type: moduleType,
                color: prev.defaultPanelColor,
                material: prev.material,
                panelColor: prev.defaultPanelColor,
                frontColor: prev.defaultFrontColor,
              }
            }
            return cell
          }),
        )

        // Expand grid with new ghost cells around the placement
        newGrid = expandGridAroundPlacement(newGrid, row, col)

        // Update column widths and row heights based on new grid size
        const newColumns = newGrid[0]?.length || 1
        const newRows = newGrid.length

        const newColumnWidths = [...prev.columnWidths]
        while (newColumnWidths.length < newColumns) newColumnWidths.push(75)

        const newRowHeights = [...prev.rowHeights]
        while (newRowHeights.length < newRows) newRowHeights.push(38)

        const prunedCellStyles = pruneOrphanedCellStyles(newGrid, prev.cellStyles)

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newColumns,
          rows: newRows,
          columnWidths: newColumnWidths as (75 | 38)[],
          rowHeights: newRowHeights,
          cellStyles: prunedCellStyles,
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
        // Clear the cell
        placeModule(row, col, "ghost")
      } else {
        // Place the selected module
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
                panelColor: prev.defaultPanelColor,
                frontColor: prev.defaultFrontColor,
              }
            }
            return {
              id: `cell-${rowIndex}-${colIndex}`,
              type: "empty" as const,
              row: rowIndex,
              col: colIndex,
              panelColor: prev.defaultPanelColor,
              frontColor: prev.defaultFrontColor,
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
      // accept any number, not just 38 | 76
      setConfig((prev) => {
        const newHeights = [...prev.rowHeights]
        newHeights[rowIndex] = Math.max(20, Math.min(120, height)) // Clamp between 20 and 120
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
  }, [])

  const { items, totalPrice } = useMemo(() => {
    const items: Map<string, ShoppingItem> = new Map()

    const addItem = (product: Product, quantity: number) => {
      const key = product.sku
      if (items.has(key)) {
        const existing = items.get(key)!
        existing.quantity += quantity
        existing.totalPrice = existing.quantity * existing.unitPrice
      } else {
        items.set(key, {
          ...product,
          quantity,
          totalPrice: product.price * quantity,
          unitPrice: product.price,
        })
      }
    }

    const filledCells = config.grid.flat().filter((c) => c.type !== "empty" && c.type !== "ghost")
    if (filledCells.length === 0) {
      return { items: [], totalPrice: 0 }
    }

    // ... existing ladder calculation code ...

    const panelsByColor: Record<string, { count: number; width: number; material: string }[]> = {}

    filledCells.forEach((cell) => {
      const cellId = getCellId(cell.row, cell.col)
      const panelColor = config.cellStyles[cellId]?.panelColor ?? cell.panelColor ?? config.defaultPanelColor
      const cellMaterial = cell.material || config.material
      const bodenSize = config.columnWidths[cell.col] === 38 ? 38 : 80

      const colorKey = panelColor
      if (!panelsByColor[colorKey]) {
        panelsByColor[colorKey] = []
      }
      panelsByColor[colorKey].push({ count: 1, width: bodenSize, material: cellMaterial })
    })

    // Add panels grouped by color
    Object.entries(panelsByColor).forEach(([color, panels]) => {
      const productColor = color as ShelfColor
      const totalPanels = panels.length
      const panelPacks = Math.ceil(totalPanels / 2)
      const width = panels[0]?.width || 80
      const material = panels[0]?.material || "metal"

      // Find matching product
      let panelProduct: Product | undefined
      if (material === "metal") {
        panelProduct = metallboeden.find(
          (p) =>
            p.name.toLowerCase().includes("metallboden") &&
            p.name.toLowerCase().includes(productColor) &&
            p.width === width,
        )
      } else if (material === "glass") {
        const glassColor = productColor === "schwarz" ? "schwarz" : "satiniert"
        panelProduct = glasboeden.find(
          (p) =>
            p.name.toLowerCase().includes("glasboden") &&
            p.name.toLowerCase().includes(glassColor) &&
            p.width === width,
        )
      }

      if (panelProduct) {
        addItem(panelProduct, panelPacks)
      }
    })

    const frontModuleTypes = ["mit-tueren", "abschliessbare-tueren", "mit-klapptuer", "mit-doppelschublade"]
    const frontsByColorAndType: Record<string, { type: string; count: number; width: number }[]> = {}

    filledCells.forEach((cell) => {
      if (frontModuleTypes.includes(cell.type)) {
        const cellId = getCellId(cell.row, cell.col)
        const frontColor = config.cellStyles[cellId]?.frontColor ?? cell.frontColor ?? config.defaultFrontColor
        const width = config.columnWidths[cell.col] === 38 ? 38 : 80

        const key = `${frontColor}-${cell.type}`
        if (!frontsByColorAndType[key]) {
          frontsByColorAndType[key] = []
        }
        frontsByColorAndType[key].push({ type: cell.type, count: 1, width })
      }
    })

    // Add front modules grouped by color and type
    Object.entries(frontsByColorAndType).forEach(([key, modules]) => {
      const [color, moduleType] = key.split("-")
      const totalCount = modules.length
      const width = modules[0]?.width || 80

      // Find matching product based on type and color
      // This would need to be expanded based on your product catalog
      console.log(`[v0] Front modules: ${totalCount}x ${moduleType} in ${color}, width=${width}`)
    })

    // ... existing sidewalls and other calculations ...

    const itemsArray = Array.from(items.values())
    const totalPrice = itemsArray.reduce((sum, item) => sum + item.totalPrice, 0)

    return { items: itemsArray, totalPrice }
  }, [config])

  const priceFormatted = totalPrice.toFixed(2).replace(".", ",")

  const getCellId = (row: number, col: number) => `c-${row}-${col}`

  const getPanelColor = (row: number, col: number): ShelfColor => {
    const cellId = getCellId(row, col)
    return config.cellStyles[cellId]?.panelColor ?? config.defaultPanelColor
  }

  const getFrontColor = (row: number, col: number): ShelfColor => {
    const cellId = getCellId(row, col)
    return config.cellStyles[cellId]?.frontColor ?? config.defaultFrontColor
  }

  const applyColorToSelected = () => {
    if (selectedCells.size === 0) return

    updateConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      selectedCells.forEach((cellId) => {
        if (!newCellStyles[cellId]) {
          newCellStyles[cellId] = {}
        }
        if (paintMode === "panels") {
          newCellStyles[cellId] = { ...newCellStyles[cellId], panelColor: activeColor }
        } else {
          newCellStyles[cellId] = { ...newCellStyles[cellId], frontColor: activeColor }
        }
      })
      return { ...prev, cellStyles: newCellStyles }
    })
    setSelectedCells(new Set())
  }

  const applyColorToRow = (row: number) => {
    updateConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      for (let col = 0; col < prev.columns; col++) {
        const cell = prev.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          const cellId = getCellId(row, col)
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
  }

  const applyColorToColumn = (col: number) => {
    updateConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      for (let row = 0; row < prev.rows; row++) {
        const cell = prev.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          const cellId = getCellId(row, col)
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
  }

  const applyColorToAll = () => {
    updateConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      for (let row = 0; row < prev.rows; row++) {
        for (let col = 0; col < prev.columns; col++) {
          const cell = prev.grid[row]?.[col]
          if (cell && cell.type !== "empty" && cell.type !== "ghost") {
            const cellId = getCellId(row, col)
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
  }

  const clearPanelColors = () => {
    updateConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      Object.keys(newCellStyles).forEach((cellId) => {
        if (newCellStyles[cellId]) {
          delete newCellStyles[cellId].panelColor
          // Remove empty entries
          if (Object.keys(newCellStyles[cellId]).length === 0) {
            delete newCellStyles[cellId]
          }
        }
      })
      return { ...prev, cellStyles: newCellStyles }
    })
  }

  const clearFrontColors = () => {
    updateConfig((prev) => {
      const newCellStyles = { ...prev.cellStyles }
      Object.keys(newCellStyles).forEach((cellId) => {
        if (newCellStyles[cellId]) {
          delete newCellStyles[cellId].frontColor
          // Remove empty entries
          if (Object.keys(newCellStyles[cellId]).length === 0) {
            delete newCellStyles[cellId]
          }
        }
      })
      return { ...prev, cellStyles: newCellStyles }
    })
  }

  const handleCellSelect = (row: number, col: number, isShiftClick: boolean) => {
    const cellId = getCellId(row, col)
    const cell = config.grid[row]?.[col]

    // Only allow selecting filled cells
    if (!cell || cell.type === "empty" || cell.type === "ghost") return

    setSelectedCells((prev) => {
      const newSet = new Set(prev)
      if (isShiftClick) {
        // Toggle selection
        if (newSet.has(cellId)) {
          newSet.delete(cellId)
        } else {
          newSet.add(cellId)
        }
      } else {
        // Replace selection
        newSet.clear()
        newSet.add(cellId)
      }
      return newSet
    })
  }

  const pruneOrphanedCellStyles = (
    newGrid: GridCell[][],
    newCellStyles: Record<string, { panelColor?: ShelfColor; frontColor?: ShelfColor }>,
  ) => {
    const validCellIds = new Set<string>()
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[row].length; col++) {
        const cell = newGrid[row][col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          validCellIds.add(getCellId(row, col))
        }
      }
    }

    const prunedStyles: Record<string, { panelColor?: ShelfColor; frontColor?: ShelfColor }> = {}
    Object.keys(newCellStyles).forEach((cellId) => {
      if (validCellIds.has(cellId)) {
        prunedStyles[cellId] = newCellStyles[cellId]
      }
    })
    return prunedStyles
  }

  const handleUpdateConfig = useCallback(
    (updates: Partial<ShelfConfig>) => {
      setConfig((prev) => {
        const newConfig = { ...prev, ...updates }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  return (
    <div className="flex h-screen flex-col bg-neutral-900 text-neutral-100">
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
          onUpdateConfig={handleUpdateConfig}
          paintMode={paintMode}
          onPaintModeChange={setPaintMode}
          activeColor={activeColor}
          onActiveColorChange={setActiveColor}
          selectedCells={selectedCells}
          onApplyColorToSelected={applyColorToSelected}
          onApplyColorToRow={applyColorToRow}
          onApplyColorToColumn={applyColorToColumn}
          onApplyColorToAll={applyColorToAll}
          onClearPanelColors={clearPanelColors}
          onClearFrontColors={clearFrontColors}
          shoppingList={items}
          price={priceFormatted}
          showShoppingList={showShoppingList}
          onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
        />
      </div>
    </div>
  )
}

function getToolLabel(tool: GridCell["type"]): string {
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
    lila: "#800080",
  }
  return colors[color] || "#FFFFFF"
}
