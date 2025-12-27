"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
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
  ZoomIn,
  ZoomOut,
  Move3D,
  Grid3X3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import type { ShoppingItem } from "@/lib/shopping-item"
import { useTexture } from "@react-three/drei"

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
    | "delete"
  color: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau"
}

export type ShelfConfig = {
  rows: number
  columns: number
  grid: GridCell[][]
  rowHeights: 38[]
  colWidths: (38 | 75)[]
  material: "metall" | "glas" | "holz"
  accentColor: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau"
}

type ModuleType = GridCell["type"]

const createEmptyGrid = (rows: number, cols: number): GridCell[][] => {
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `cell-${rowIndex}-${colIndex}`,
      type: "empty" as const,
      row: rowIndex,
      col: colIndex,
      color: "weiss" as const,
    })),
  )
}

const initialConfig: ShelfConfig = {
  rows: 1,
  columns: 1,
  grid: createEmptyGrid(1, 1),
  rowHeights: Array(1).fill(38),
  colWidths: [75],
  material: "metall",
  accentColor: "weiss",
}

const moduleTypes = [
  { id: "ohne-seitenwaende" as const, label: "Ohne Seitenwände", icon: Square },
  { id: "mit-seitenwaenden" as const, label: "Mit Seitenwänden", icon: Grid3X3 },
  { id: "ohne-rueckwand" as const, label: "Ohne Rückwand", icon: LayoutGrid },
  { id: "mit-rueckwand" as const, label: "Mit Rückwand", icon: PanelTop },
  { id: "mit-tueren" as const, label: "Mit Türen", icon: DoorOpen },
  { id: "abschliessbare-tueren" as const, label: "Abschließbare Türen", icon: Lock },
  { id: "mit-klapptuer" as const, label: "Mit Klapptür", icon: PanelTopOpen },
  { id: "mit-doppelschublade" as const, label: "Mit Doppelschublade", icon: Archive },
  { id: "schubladen" as const, label: "Schublade", icon: Archive },
  { id: "delete" as const, label: "Löschen", icon: Trash2 },
] as const

const baseColors = [
  { id: "weiss" as const, label: "Weiß" },
  { id: "schwarz" as const, label: "Schwarz" },
]

const specialColors = [
  { id: "rot" as const, label: "Rot" },
  { id: "gruen" as const, label: "Grün" },
  { id: "gelb" as const, label: "Gelb" },
  { id: "blau" as const, label: "Blau" },
]

function WoodFloor() {
  const texture = useTexture("/seamless-light-oak-wood-parquet-floor-texture-top-.jpg")

  texture.wrapS = texture.wrapT = 1000
  texture.repeat.set(8, 8)
  texture.anisotropy = 16

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial map={texture} roughness={0.7} metalness={0.0} />
    </mesh>
  )
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

const hasAnyModules = (grid: GridCell[][] | undefined): boolean => {
  if (!grid || !Array.isArray(grid)) return false
  return grid.some((row) => row.some((cell) => cell.type !== "empty"))
}

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(initialConfig)
  const [selectedTool, setSelectedTool] = useState<ModuleType | "empty" | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAction, setDragAction] = useState<"add" | "remove" | null>(null)
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false)

  const isConfiguratorStarted = config?.grid ? hasAnyModules(config.grid) : false

  const [history, setHistory] = useState<ShelfConfig[]>([initialConfig])
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

  const placeModule = useCallback(
    (row: number, col: number, type: GridCell["type"]) => {
      setConfig((prev) => {
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              const cellColor = cell.color || prev.accentColor
              return { ...cell, type, color: type !== "empty" ? cellColor : undefined }
            }
            return cell
          }),
        )
        const newConfig = { ...prev, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory, config.accentColor],
  )

  const updateCellColor = useCallback(
    (row: number, col: number, color: GridCell["color"]) => {
      setConfig((prev) => {
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col && cell.type !== "empty") {
              return { ...cell, color }
            }
            return cell
          }),
        )
        const newConfig = { ...prev, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleCellClick3D = useCallback(
    (row: number, col: number) => {
      const lastRow = config.rows - 1
      console.log("[v0] handleCellClick3D:", {
        row,
        col,
        lastRow,
        selectedTool,
        gridRows: config.grid.length,
        gridCols: config.grid[0]?.length,
      })

      const currentType = config.grid[row]?.[col]?.type
      const isEmpty = !currentType || currentType === "empty"

      // If eraser tool or clicking on filled cell with no tool, remove
      if (selectedTool === "empty" || (!selectedTool && !isEmpty)) {
        // Check if there are modules above - can't remove if supporting modules above
        let hasModuleAbove = false
        for (let r = 0; r < row; r++) {
          if (config.grid[r]?.[col]?.type && config.grid[r][col].type !== "empty") {
            hasModuleAbove = true
            break
          }
        }

        if (hasModuleAbove) {
          console.log("[v0] Cannot remove - has modules above")
          return // Can't remove, has modules above
        }

        console.log("[v0] Removing module")
        placeModule(row, col, "empty")
        return
      }

      // If no tool selected and cell is empty, do nothing
      if (!selectedTool && isEmpty) {
        console.log("[v0] No tool selected and cell is empty")
        return
      }

      // Placing a module - check stacking constraints
      if (isEmpty) {
        const isGroundLevel = row === lastRow

        if (!isGroundLevel) {
          // Check if the cell directly below has a module
          const cellBelow = config.grid[row + 1]?.[col]
          const hasSupportBelow = cellBelow?.type && cellBelow.type !== "empty"

          if (!hasSupportBelow) {
            console.log("[v0] Cannot place - no support below at row", row + 1)
            return
          }
        }

        console.log("[v0] Placing module:", selectedTool)
        placeModule(row, col, selectedTool)
      }
    },
    [config.grid, config.rows, selectedTool, placeModule],
  )

  const handleDragStart = useCallback(
    (row: number, col: number) => {
      setIsDragging(true)
      const currentType = config.grid[row]?.[col]?.type
      const isEmpty = !currentType || currentType === "empty"

      if (selectedTool === "empty" || (!selectedTool && !isEmpty)) {
        setDragAction("remove")
      } else {
        setDragAction("add")
      }

      // Trigger the initial click
      handleCellClick3D(row, col)
    },
    [config.grid, selectedTool, handleCellClick3D],
  )

  const handleDragOver = useCallback(
    (row: number, col: number) => {
      if (!isDragging) return

      const currentType = config.grid[row]?.[col]?.type
      const isEmpty = !currentType || currentType === "empty"

      if (dragAction === "add" && isEmpty) {
        handleCellClick3D(row, col)
      } else if (dragAction === "remove" && !isEmpty) {
        // Check if we can remove (no modules above)
        let hasModuleAbove = false
        for (let r = 0; r < row; r++) {
          if (config.grid[r]?.[col]?.type !== "empty") {
            hasModuleAbove = true
            break
          }
        }
        if (!hasModuleAbove) {
          placeModule(row, col, "empty")
        }
      }
    },
    [isDragging, dragAction, config.grid, handleCellClick3D, placeModule],
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDragAction(null)
  }, [])

  const clearCell = useCallback(
    (row: number, col: number) => {
      placeModule(row, col, "empty")
    },
    [placeModule],
  )

  const resizeGrid = useCallback(
    (newRows: number, newCols: number) => {
      setConfig((prev) => {
        const newGrid = Array.from({ length: newRows }, (_, rowIndex) =>
          Array.from({ length: newCols }, (_, colIndex) => {
            if (rowIndex < prev.rows && colIndex < prev.columns) {
              return prev.grid[rowIndex][colIndex]
            }
            return {
              id: `cell-${rowIndex}-${colIndex}`,
              type: "empty" as const,
              color: "weiss" as const,
            }
          }),
        )

        const newColWidths = [...prev.colWidths]
        while (newColWidths.length < newCols) newColWidths.push(75)
        while (newColWidths.length > newCols) newColWidths.pop()

        const newRowHeights = Array(newRows).fill(38)

        const newConfig = {
          ...prev,
          grid: newGrid,
          rows: newRows,
          columns: newCols,
          colWidths: newColWidths as (75 | 38)[],
          rowHeights: newRowHeights,
        }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const setColumnWidth = useCallback(
    (colIndex: number, width: 75 | 38) => {
      setConfig((prev) => {
        const hasModulesInColumn = prev.grid.some((row) => row[colIndex]?.type && row[colIndex].type !== "empty")

        if (hasModulesInColumn) {
          // Cannot change width when modules exist in this column
          console.log("[v0] Cannot change column width - modules exist in column", colIndex)
          return prev
        }

        const newWidths = [...prev.colWidths]
        newWidths[colIndex] = width
        const newConfig = { ...prev, colWidths: newWidths as (75 | 38)[] }
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
      rows: 2,
      columns: 3,
      grid: createEmptyGrid(2, 3),
      rowHeights: Array(2).fill(38),
      colWidths: [75, 75, 75] as (75 | 38)[],
      material: "metall" as const,
      accentColor: "weiss" as const,
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

    const filledCells = config.grid.flat().filter((c) => c.type !== "empty")
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

    const col80Count = config.colWidths.filter((w) => w === 75).length
    const col40Count = config.colWidths.filter((w) => w === 38).length

    const stange80 = stangensets.find((s) => s.size === 80 && s.variant === "metall")
    const stange40 = stangensets.find((s) => s.size === 40 && s.variant === "metall")

    if (stange80 && col80Count > 0) addItem(stange80, col80Count * levels)
    if (stange40 && col40Count > 0) addItem(stange40, col40Count * levels)

    filledCells.forEach((cell) => {
      const cellWidth = config.colWidths[cell.col]
      const cellHeight = config.rowHeights[cell.row]
      const bodenSize = cellWidth === 75 ? 80 : 40

      let shelfProduct: Product | undefined
      if (config.material === "metall") {
        shelfProduct =
          metallboeden.find((p) => p.size === bodenSize && p.color === getToolLabel(cell.type)) ||
          metallboeden.find((p) => p.size === bodenSize && p.color === "weiss")
      } else if (config.material === "glas") {
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
        case "schubladen": {
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

  const onSelectTool = useCallback((tool: ModuleType | "empty" | null) => {
    setSelectedTool(tool)
  }, [])

  const handleZoomIn = useCallback(() => {
    // Implement zoom in functionality
  }, [])

  const handleZoomOut = useCallback(() => {
    // Implement zoom out functionality
  }, [])

  const handleResetView = useCallback(() => {
    // Implement reset view functionality
  }, [])

  const handleResizeUp = useCallback(() => {
    resizeGrid(config.rows + 1, config.columns)
  }, [resizeGrid, config.rows, config.columns])

  const handleResizeDown = useCallback(() => {
    resizeGrid(config.rows - 1, config.columns)
  }, [resizeGrid, config.rows, config.columns])

  const handleResizeLeft = useCallback(() => {
    resizeGrid(config.rows, config.columns - 1)
  }, [resizeGrid, config.rows, config.columns])

  const handleResizeRight = useCallback(() => {
    resizeGrid(config.rows, config.columns + 1)
  }, [resizeGrid, config.rows, config.columns])

  const handleExpandLeft = useCallback(
    (row: number, col: number, width?: 38 | 75) => {
      const columnWidth = width || 75
      setConfig((prev) => {
        // Add a new column at the left (shift all columns right)
        const newCols = prev.columns + 1
        const newGrid = prev.grid.map((r, rIdx) => [
          {
            id: `cell-${rIdx}-new-left`,
            type: "empty" as const,
            color: "weiss" as const,
          },
          ...r,
        ])
        const newColWidths = [columnWidth as const, ...prev.colWidths] as (75 | 38)[]
        const newConfig = {
          ...prev,
          columns: newCols,
          grid: newGrid,
          colWidths: newColWidths,
        }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleExpandRight = useCallback(
    (row: number, col: number, width?: 38 | 75) => {
      const columnWidth = width || 75
      setConfig((prev) => {
        const newCols = prev.columns + 1
        const newGrid = prev.grid.map((r, rowIndex) => [
          ...r,
          {
            id: `cell-${rowIndex}-${prev.columns}`,
            type: "empty" as const,
            color: "weiss" as const,
          },
        ])
        const newColWidths = [...prev.colWidths, columnWidth as const] as (75 | 38)[]
        const newConfig = {
          ...prev,
          columns: newCols,
          grid: newGrid,
          colWidths: newColWidths,
        }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleExpandUp = useCallback(
    (row: number, col: number) => {
      setConfig((prev) => {
        // Only add one row at top, but the user clicked on a specific column
        // We add a full row but keep other cells empty - the frame only renders around modules
        const newRows = prev.rows + 1
        const newRow = Array.from({ length: prev.columns }, (_, colIndex) => ({
          id: `cell-0-${colIndex}`,
          type: "empty" as const,
          color: "weiss" as const,
        }))
        const newGrid = [newRow, ...prev.grid]
        const newRowHeights = [38, ...prev.rowHeights] as 38[]
        const newConfig = {
          ...prev,
          rows: newRows,
          grid: newGrid,
          rowHeights: newRowHeights,
        }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const handleExpandDown = useCallback(
    (row: number, col: number) => {
      setConfig((prev) => {
        const newRows = prev.rows + 1
        const newRow = Array.from({ length: prev.columns }, (_, colIndex) => ({
          id: `cell-${prev.rows}-${colIndex}`,
          type: "empty" as const,
          color: "weiss" as const,
        }))
        const newGrid = [...prev.grid, newRow]
        const newRowHeights = [...prev.rowHeights, 38] as 38[]
        const newConfig = {
          ...prev,
          rows: newRows,
          grid: newGrid,
          rowHeights: newRowHeights,
        }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const configWithDefaults = useMemo(
    () => ({
      ...config,
      colWidths: config.colWidths || (Array(config.columns).fill(75) as (75 | 38)[]),
      rowHeights: config.rowHeights || (Array(config.rows).fill(38) as 38[]),
      columns: config.columns, // Alias for panel compatibility
      grid: config.grid || createEmptyGrid(config.rows, config.columns),
    }),
    [config],
  )

  return (
    <div className="flex h-screen flex-col bg-muted/30 lg:flex-row">
      {/* Left side - 3D Configurator */}
      <div className="relative flex flex-1 flex-col">
        {/* 3D Canvas */}
        <div className="relative h-full w-full">
          <Canvas
            shadows
            camera={{ position: [0, 1.5, 3], fov: 45 }}
            onPointerMissed={() => {
              setSelectedCell(null)
              handleDragEnd()
            }}
            onPointerUp={handleDragEnd}
          >
            <color attach="background" args={["#f8f8f8"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-3, 4, -2]} intensity={0.4} />

            <ShelfScene
              config={configWithDefaults}
              selectedTool={selectedTool}
              hoveredCell={hoveredCell}
              selectedCell={selectedCell}
              onCellClick={handleCellClick3D}
              onCellHover={setHoveredCell}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              isDragging={isDragging}
              showFrame={!isSidePanelCollapsed || selectedTool !== "empty"}
              onExpandLeft={handleExpandLeft}
              onExpandRight={handleExpandRight}
              onExpandUp={handleExpandUp}
              onExpandDown={handleExpandDown}
            />

            {/* Wood floor */}
            <WoodFloor />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              minDistance={1}
              maxDistance={6}
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2 - 0.1}
            />
            <Environment preset="city" />
          </Canvas>
        </div>

        {/* Floating toolbar - always visible on desktop */}
        <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 flex-col gap-1 rounded-xl border border-border/50 bg-background/90 p-2 shadow-lg backdrop-blur-sm lg:flex">
          <button
            onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-lg transition-all",
              selectedTool === "empty"
                ? "bg-destructive/20 text-destructive border border-destructive"
                : "text-muted-foreground hover:bg-control-hover border border-transparent",
            )}
            title="Radierer"
          >
            <Eraser className="h-5 w-5" />
          </button>
          <div className="h-px bg-border my-1" />
          {moduleTypes.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
              className={cn(
                "flex flex-col items-center justify-center w-11 h-11 rounded-lg transition-all",
                selectedTool === module.id
                  ? "bg-accent-gold/20 text-accent-gold border border-accent-gold"
                  : "text-muted-foreground hover:bg-control-hover border border-transparent",
              )}
              title={module.label}
            >
              <ModuleIconSVG type={module.id} />
            </button>
          ))}
        </div>

        <div className="absolute right-3 top-3 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            className="h-10 w-10 bg-card/95 backdrop-blur-sm border-border hover:bg-control-hover disabled:opacity-30"
            title="Rückgängig"
          >
            <Undo2 className="h-5 w-5 text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            className="h-10 w-10 bg-card/95 backdrop-blur-sm border-border hover:bg-control-hover disabled:opacity-30"
            title="Wiederholen"
          >
            <Redo2 className="h-5 w-5 text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            className="h-10 w-10 bg-card/95 backdrop-blur-sm border-border hover:bg-control-hover hover:border-destructive"
            title="Zurücksetzen"
          >
            <RotateCcw className="h-5 w-5 text-foreground" />
          </Button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/95 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground border border-border shadow-lg">
          {selectedTool ? (
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    selectedTool === "empty" ? "hsl(var(--destructive))" : getColorHex(config.accentColor),
                }}
              />
              <span className="font-medium text-foreground">
                {selectedTool === "empty" ? "Radierer" : getToolLabel(selectedTool)}
              </span>
              <span className="text-muted-foreground">aktiv</span>
            </span>
          ) : (
            <span>Klicke auf ein Modul links</span>
          )}
        </div>

        {selectedTool && selectedTool !== "empty" && (
          <div className="absolute left-16 lg:left-20 top-3 rounded-full bg-card/95 backdrop-blur-sm border border-border px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full ring-2 ring-border"
                style={{
                  backgroundColor: getColorHex(config.accentColor),
                }}
              />
              <span className="text-sm text-foreground hidden sm:inline">
                {specialColors.find((c) => c.id === config.accentColor)?.label}
              </span>
            </div>
          </div>
        )}

        {/* Module selector - mobile */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-xl border border-border/50 bg-background/90 p-2 shadow-lg backdrop-blur-sm lg:hidden">
          {moduleTypes.map((mod) => (
            <Button
              key={mod.id}
              variant={selectedTool === mod.id ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-10 w-10",
                selectedTool === mod.id && "bg-accent-gold text-white hover:bg-accent-gold/90",
              )}
              onClick={() => setSelectedTool(selectedTool === mod.id ? null : mod.id)}
              title={mod.label}
            >
              <mod.icon className="h-5 w-5" />
            </Button>
          ))}
          <div className="mx-1 w-px bg-border" />
          <Button
            variant={selectedTool === "empty" ? "destructive" : "ghost"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setSelectedTool(selectedTool === "empty" ? null : "empty")}
            title="Modul entfernen"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Status bar with controls */}
        {isConfiguratorStarted && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border/50 bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
              <Move3D className="mr-1 h-3.5 w-3.5" />
              Ziehen zum Drehen
            </div>
            <div className="flex gap-1 rounded-full border border-border/50 bg-background/90 p-1 shadow-sm backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleZoomIn}
                title="Vergrößern"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleZoomOut}
                title="Verkleinern"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleResetView}
                title="Ansicht zurücksetzen"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex gap-1 rounded-full border border-border/50 bg-background/90 p-1 shadow-sm backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleResizeUp}
                title="Hochskalieren"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleResizeDown}
                title="Runterskalieren"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleResizeLeft}
                title="Linksskalieren"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleResizeRight}
                title="Rechtsskalieren"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowMobilePanel(!showMobilePanel)}
        className="sticky bottom-0 z-20 flex items-center justify-between gap-2 border-t border-border bg-card px-4 py-4 text-foreground lg:hidden active:bg-control-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-base">Konfigurator</span>
          <span className="text-sm text-muted-foreground">
            ({config.rows}x{config.columns})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-accent-gold">{priceFormatted} €</span>
          <Eraser className={cn("h-5 w-5 transition-transform", showMobilePanel && "rotate-180")} />
        </div>
      </button>

      <ConfiguratorPanel
        config={configWithDefaults}
        selectedTool={selectedTool}
        selectedCell={selectedCell}
        onSelectTool={onSelectTool}
        onSelectCell={setSelectedCell}
        onUpdateCellColor={updateCellColor}
        onPlaceModule={placeModule}
        onClearCell={clearCell}
        onResizeGrid={resizeGrid}
        onSetColumnWidth={setColumnWidth}
        onUpdateConfig={updateConfig}
        shoppingList={shoppingList}
        price={priceFormatted}
        showShoppingList={showShoppingList}
        onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
        showMobilePanel={showMobilePanel}
        onCloseMobilePanel={() => setShowMobilePanel(false)}
        onCollapseSidePanel={() => setIsSidePanelCollapsed(!isSidePanelCollapsed)}
      />
    </div>
  )
}

function getToolLabel(tool: ModuleType | "empty"): string {
  const labels: Record<ModuleType | "empty", string> = {
    empty: "Leer",
    "ohne-seitenwaende": "Ohne Seitenwände",
    "mit-seitenwaenden": "Mit Seitenwänden",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "abschliessbare-tueren": "Abschließbare Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-doppelschublade": "Mit Doppelschublade",
    schubladen: "Schublade",
    delete: "Löschen",
  }
  return labels[tool] || tool
}

function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    weiss: "#F5F5F5",
    schwarz: "#1A1A1A",
    rot: "#DC143C",
    gruen: "#228B22",
    gelb: "#FFD700",
    blau: "#00A0D6",
  }
  return colors[color] || "#F5F5F5"
}
