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
}

export type ShelfConfig = {
  grid: GridCell[][]
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights: number[] // changed from (38 | 76)[] to flexible number[]
  footType: "standard" | "adjustable"
  baseColor: "weiss" | "schwarz"
  accentColor: "none" | "blau" | "gruen" | "gelb" | "orange" | "rot" | "lila"
  shelfMaterial: "metall" | "glas" | "holz"
}

const createInitialGrid = (): GridCell[][] => {
  return [[{ id: "cell-0-0", type: "ghost", row: 0, col: 0 }]]
}

const initialConfig: ShelfConfig = {
  grid: createInitialGrid(),
  columns: 1,
  rows: 1,
  columnWidths: [75] as (75 | 38)[],
  rowHeights: [38] as number[],
  footType: "standard" as const,
  baseColor: "weiss" as const,
  accentColor: "none" as const,
  shelfMaterial: "metall" as const,
}

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(initialConfig)
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>("ohne-seitenwaende")
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

  const isConnectedToExisting = (row: number, col: number, grid: GridCell[][]): boolean => {
    const hasAnyFilledModule = grid.some((r) => r.some((c) => c.type !== "empty" && c.type !== "ghost"))

    if (!hasAnyFilledModule) {
      return true
    }

    // Check if there's a filled module adjacent (left, right, below)
    const below = grid[row - 1]?.[col]
    const left = grid[row]?.[col - 1]
    const right = grid[row]?.[col + 1]

    const hasFilledBelow = below && below.type !== "empty" && below.type !== "ghost"
    const hasFilledLeft = left && left.type !== "empty" && left.type !== "ghost"
    const hasFilledRight = right && right.type !== "empty" && right.type !== "ghost"

    return !!(hasFilledBelow || hasFilledLeft || hasFilledRight)
  }

  const hasSupportBelow = (row: number, col: number, grid: GridCell[][]): boolean => {
    const hasAnyFilledModule = grid.some((r) => r.some((c) => c.type !== "empty" && c.type !== "ghost"))
    if (!hasAnyFilledModule) return true // First placement

    if (row === 0) return true // Ground level always has support
    const belowCell = grid[row - 1]?.[col]
    return belowCell !== undefined && belowCell.type !== "empty" && belowCell.type !== "ghost"
  }

  const expandGridAroundPlacement = (grid: GridCell[][], placedRow: number, placedCol: number): GridCell[][] => {
    let newGrid = grid.map((row) => [...row])
    const rows = newGrid.length
    const cols = newGrid[0]?.length || 0

    // Add ghost cells to the left if needed
    if (placedCol === 0) {
      newGrid = newGrid.map((row, ri) => {
        const newCell: GridCell = {
          id: `cell-${ri}--1`,
          type: "ghost",
          row: ri,
          col: -1,
        }
        return [newCell, ...row.map((c) => ({ ...c, col: c.col + 1 }))]
      })
      placedCol += 1
    }

    // Add ghost cells to the right if needed
    if (placedCol === newGrid[0].length - 1) {
      newGrid = newGrid.map((row, ri) => {
        const newCell: GridCell = {
          id: `cell-${ri}-${row.length}`,
          type: "ghost" as const,
          row: ri,
          col: row.length,
        }
        return [...row, newCell]
      })
    }

    // Add ghost row above if needed
    if (placedRow === rows - 1) {
      const newRow = newGrid[0].map((_, ci) => ({
        id: `cell-${rows}-${ci}`,
        type: "ghost" as const,
        row: rows,
        col: ci,
      }))
      newGrid.push(newRow)
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
              return { ...cell, type }
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
      grid: createInitialGrid(),
      columns: 1,
      rows: 1,
      columnWidths: [75] as (75 | 38)[],
      rowHeights: [38] as number[],
      footType: "standard" as const,
      baseColor: "weiss" as const,
      accentColor: "none" as const,
      shelfMaterial: "metall" as const,
    }
    setConfig(newConfig)
    setHistory([newConfig])
    setHistoryIndex(0)
    setSelectedTool("ohne-seitenwaende")
  }, [])

  const { shoppingList, totalPrice } = useMemo(() => {
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
      return { shoppingList: [], totalPrice: 0 }
    }

    const totalHeightCm = config.rowHeights.reduce((sum, h) => sum + h, 0)

    let leiterHeight = 40
    if (totalHeightCm > 160) leiterHeight = 200
    else if (totalHeightCm > 120) leiterHeight = 160
    else if (totalHeightCm > 80) leiterHeight = 120
    else if (totalHeightCm > 40) leiterHeight = 80

    const leiterProduct = leitern.find((l) => l.size === leiterHeight)
    if (leiterProduct) {
      addItem(leiterProduct, config.columns + 1)
    }

    const stangenPerLevel = config.columns
    const levels = config.rows + 1

    const col80Count = config.columnWidths.filter((w) => w === 75).length
    const col40Count = config.columnWidths.filter((w) => w === 38).length

    const stange80 = stangensets.find((s) => s.size === 80 && s.variant === "metall")
    const stange40 = stangensets.find((s) => s.size === 40 && s.variant === "metall")

    if (stange80 && col80Count > 0) addItem(stange80, col80Count * levels)
    if (stange40 && col40Count > 0) addItem(stange40, col40Count * levels)

    filledCells.forEach((cell) => {
      const cellWidth = config.columnWidths[cell.col]
      const cellHeight = config.rowHeights[cell.row]
      const bodenSize = cellWidth === 75 ? 80 : 40

      let shelfProduct: Product | undefined
      if (config.shelfMaterial === "metall") {
        shelfProduct =
          metallboeden.find((p) => p.size === bodenSize && p.color === getToolLabel(cell.type)) ||
          metallboeden.find((p) => p.size === bodenSize && p.color === "weiss")
      } else if (config.shelfMaterial === "glas") {
        shelfProduct = glasboeden.find((p) => p.size === bodenSize)
      } else {
        shelfProduct = holzboeden.find((p) => p.size === bodenSize)
      }

      if (shelfProduct) addItem(shelfProduct, 1)

      switch (cell.type) {
        case "mit-rueckwand": {
          const backPanel =
            funktionswaende.find((p) => p.variant === "1-seitig" && p.color === getToolLabel(cell.type)) ||
            funktionswaende.find((p) => p.variant === "1-seitig")
          if (backPanel) addItem(backPanel, 1)
          break
        }
        case "mit-tueren":
        case "abschliessbare-tueren": {
          const door =
            schubladenTueren.find((p) => p.category === "tuer" && p.color === getToolLabel(cell.type)) ||
            schubladenTueren.find((p) => p.category === "tuer")
          if (door) addItem(door, 2)
          break
        }
        case "mit-klapptuer": {
          const door =
            schubladenTueren.find((p) => p.category === "tuer" && p.color === getToolLabel(cell.type)) ||
            schubladenTueren.find((p) => p.category === "tuer")
          if (door) addItem(door, 1)
          break
        }
        case "mit-doppelschublade": {
          const drawer =
            schubladenTueren.find((p) => p.category === "schublade" && p.color === getToolLabel(cell.type)) ||
            schubladenTueren.find((p) => p.category === "schublade")
          if (drawer) addItem(drawer, 1)
          break
        }
      }
    })

    const list = Array.from(items.values())
    const total = list.reduce((sum, item) => sum + item.subtotal, 0)

    return { shoppingList: list, totalPrice: total }
  }, [config])

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
                    backgroundColor:
                      config.accentColor !== "none" ? getColorHex(config.accentColor) : getColorHex(config.baseColor),
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
          onSelectTool={setSelectedTool}
          onPlaceModule={placeModule}
          onClearCell={clearCell}
          onResizeGrid={resizeGrid}
          onSetColumnWidth={setColumnWidth}
          onSetRowHeight={setRowHeight}
          onUpdateConfig={updateConfig}
          shoppingList={shoppingList}
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
    weiss: "#F5F5F5",
    schwarz: "#1A1A1A",
    blau: "#00A0D6",
    gruen: "#228B22",
    gelb: "#FFD700",
    orange: "#FF8C00",
    rot: "#DC143C",
    lila: "#8B008B",
  }
  return colors[color] || "#F5F5F5"
}
