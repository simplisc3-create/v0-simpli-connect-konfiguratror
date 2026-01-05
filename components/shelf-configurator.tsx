"use client"

import { useState, useCallback, useMemo, useRef, Suspense } from "react"
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
  schubladenTueren,
  funktionswaende,
} from "@/lib/simpli-products"
import type { ShoppingItem } from "@/types/shopping-item" // Import ShoppingItem

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
  color?: "weiss" | "schwarz" | "blau" | "gruen" | "gelb" | "orange" | "rot" // Per-module color
}

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
  grid: createInitialGrid(),
  columns: 1,
  rows: 1,
  columnWidths: [75] as (75 | 38)[],
  rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
}

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(initialConfig)
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>("ohne-seitenwaende")
  const [selectedColor, setSelectedColor] = useState<GridCell["color"]>("weiss") // Add selected color state
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

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

  const isConnectedToExisting = (row: number, col: number, grid: GridCell[][], type?: GridCell["type"]): boolean => {
    const currentCell = grid[row]?.[col]
    if (type === "empty") {
      // Allow clearing any non-empty cell
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
    (row: number, col: number, type: GridCell["type"]) => {
      console.log("[v0] Placing module at", row, col, type)

      setConfig((prev) => {
        const currentCell = prev.grid[row]?.[col]

        // Don't allow placement if not a ghost cell
        if (!currentCell || (currentCell.type !== "ghost" && currentCell.type !== "empty")) {
          console.log("[v0] Cannot place - cell is not ghost or empty")
          return prev
        }

        if (!isConnectedToExisting(row, col, prev.grid, type)) {
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
              return { ...cell, type, color: selectedColor }
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
    [saveToHistory, selectedColor], // Added selectedColor to dependencies
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
    setSelectedColor("weiss") // Reset selected color
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

    // Group filled cells by column
    const cellsByColumn: Map<number, typeof filledCells> = new Map()
    filledCells.forEach((cell) => {
      const existing = cellsByColumn.get(cell.col) || []
      existing.push(cell)
      cellsByColumn.set(cell.col, existing)
    })

    // For each column, calculate the height based on the number of filled cells (rows)
    const columnHeights: Map<number, number> = new Map()

    cellsByColumn.forEach((cells, colIdx) => {
      // Get all row indices for this column
      const rows = cells.map((c) => c.row).sort((a, b) => a - b)

      // Calculate total height by summing the row heights for filled cells
      let heightCm = 0
      rows.forEach((rowIdx) => {
        heightCm += config.rowHeights[rowIdx] || 38
      })

      columnHeights.set(colIdx, heightCm)
      console.log(`[v0] Column ${colIdx}: rows=${JSON.stringify(rows)}, height=${heightCm}cm`)
    })

    // Find all column indices that have at least one filled cell
    const usedColIndices = Array.from(cellsByColumn.keys()).sort((a, b) => a - b)

    // Group consecutive columns
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

    console.log("[v0] Ladder calc - Used columns:", usedColIndices)
    console.log("[v0] Ladder calc - Column groups:", columnGroups)

    // A ladder between two columns needs to be as tall as the taller column
    // A ladder at the edge needs to match the height of its adjacent column
    const ladderHeightsNeeded: number[] = []

    columnGroups.forEach((group) => {
      // For a group of N columns, we need N+1 ladders
      for (let i = 0; i <= group.length; i++) {
        let ladderHeight: number

        if (i === 0) {
          // Left edge ladder - height of first column in group
          ladderHeight = columnHeights.get(group[0]) || 0
        } else if (i === group.length) {
          // Right edge ladder - height of last column in group
          ladderHeight = columnHeights.get(group[group.length - 1]) || 0
        } else {
          // Middle ladder - max height of left and right columns
          const leftColHeight = columnHeights.get(group[i - 1]) || 0
          const rightColHeight = columnHeights.get(group[i]) || 0
          ladderHeight = Math.max(leftColHeight, rightColHeight)
        }

        ladderHeightsNeeded.push(ladderHeight)
      }
    })

    console.log("[v0] Ladder heights needed (cm):", ladderHeightsNeeded)

    // Convert needed heights to actual ladder sizes and count them
    const ladderSizeCounts: Map<number, number> = new Map()

    ladderHeightsNeeded.forEach((heightCm) => {
      // Find the appropriate ladder size (must be >= height)
      let leiterSize = 40
      if (heightCm > 160) leiterSize = 200
      else if (heightCm > 120) leiterSize = 160
      else if (heightCm > 80) leiterSize = 120
      else if (heightCm > 40) leiterSize = 80

      const current = ladderSizeCounts.get(leiterSize) || 0
      ladderSizeCounts.set(leiterSize, current + 1)
    })

    console.log("[v0] Ladder size counts:", Object.fromEntries(ladderSizeCounts))

    // Add ladders to shopping list
    ladderSizeCounts.forEach((count, size) => {
      const leiterProduct = leitern.find((l) => l.size === size)
      if (leiterProduct) {
        addItem(leiterProduct, count)
      }
    })

    // For each column, we need levels+1 tube sets (one above and one below each cell)
    let tube80Levels = 0
    let tube40Levels = 0

    usedColIndices.forEach((colIdx) => {
      const cells = cellsByColumn.get(colIdx) || []
      if (cells.length === 0) return

      // Count actual cells in this column
      const numCells = cells.length
      // We need numCells + 1 tube sets for each column (top, between cells, bottom)
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

    console.log("[v0] Tube sets - 80cm:", tube80Levels, "40cm:", tube40Levels)

    const shelfCounts: Map<string, { product: Product; needed: number }> = new Map()

    // Calculate shelves and accessories per cell
    filledCells.forEach((cell) => {
      const cellWidth = config.columnWidths[cell.col]
      const bodenSize = cellWidth === 75 ? 80 : 40

      let shelfProduct: Product | undefined
      if (config.material === "metal") {
        shelfProduct =
          metallboeden.find((p) => p.size === bodenSize && p.color === "weiss") ||
          metallboeden.find((p) => p.size === bodenSize)
      } else if (config.material === "glass") {
        shelfProduct = glasboeden.find((p) => p.size === bodenSize)
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

      // Add accessories based on cell type
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
      // Panels come in 2-packs, so calculate packs needed
      const packsNeeded = Math.ceil(needed / 2)
      const delivered = packsNeeded * 2
      console.log(`[v0] Shelf ${product.name}: needed=${needed}, packs=${packsNeeded}, delivered=${delivered}`)
      // Add the actual needed quantity (price is per piece)
      addItem(product, needed)
    })

    const list = Array.from(items.values())
    const total = list.reduce((sum, item) => sum + item.subtotal, 0)

    return { items: list, totalPrice: total }
  }

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
  }, [config]) // Updated dependency to include config

  return (
    <div className="flex h-screen w-screen flex-col bg-neutral-900">
      <ConfiguratorHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <Canvas shadows camera={{ position: [2, 1.5, 3], fov: 45 }} className="h-full w-full">
            <color attach="background" args={["#1a1a1a"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-3, 3, -3]} intensity={0.4} />
            <Suspense
              fallback={
                <mesh>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshStandardMaterial color="#333" />
                </mesh>
              }
            >
              <ShelfScene
                config={config}
                selectedTool={selectedTool}
                hoveredCell={hoveredCell}
                onCellClick={handleCellClick3D}
                onCellHover={setHoveredCell}
              />
            </Suspense>
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
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          onSelectTool={(tool) => {
            setSelectedTool(tool)
          }}
          onSelectColor={setSelectedColor}
          onPlaceModule={handleCellClick3D}
          onClearCell={clearCell}
          onResizeGrid={resizeGrid}
          onSetColumnWidth={setColumnWidth}
          onSetRowHeight={setRowHeight}
          onUpdateConfig={updateConfig}
          shoppingList={bomData.items}
          price={bomData.totalPrice} // Pass raw number instead of formatted string
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
