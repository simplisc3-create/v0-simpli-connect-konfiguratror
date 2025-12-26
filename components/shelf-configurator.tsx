"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useTexture } from "@react-three/drei"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as THREE from "three"
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
import type { ShoppingItem } from "@/lib/shopping-item" // Declare or import ShoppingItem

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
    | "mit-klapptuer"
    | "mit-doppelschublade"
  row: number
  col: number
  color?: "weiss" | "schwarz" | "blau" | "gruen" | "gelb" | "orange" | "rot"
}

export interface ShelfConfig {
  grid: GridCell[][]
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights: 38[]
  footType: "standard" | "adjustable"
  baseColor: "weiss" | "schwarz"
  accentColor: "none" | "blau" | "gruen" | "gelb" | "orange" | "rot"
  shelfMaterial: "metall" | "glas" | "holz"
}

const createEmptyGrid = (rows: number, cols: number): GridCell[][] => {
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `cell-${rowIndex}-${colIndex}`,
      type: "empty" as const,
      row: rowIndex,
      col: colIndex,
    })),
  )
}

const initialConfig: ShelfConfig = {
  grid: createEmptyGrid(1, 1),
  columns: 1,
  rows: 1,
  columnWidths: [75],
  rowHeights: Array(1).fill(38),
  footType: "standard",
  baseColor: "weiss",
  accentColor: "none",
  shelfMaterial: "metall",
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
] as const

const baseColors = [
  { id: "weiss" as const, label: "Weiß" },
  { id: "schwarz" as const, label: "Schwarz" },
]

const specialColors = [
  { id: "blau" as const, label: "Blau" },
  { id: "gruen" as const, label: "Grün" },
  { id: "gelb" as const, label: "Gelb" },
  { id: "orange" as const, label: "Orange" },
  { id: "rot" as const, label: "Rot" },
]

function WoodFloor() {
  const texture = useTexture("/seamless-light-oak-wood-parquet-floor-texture-top-.jpg")

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
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
    default:
      return null
  }
}

const hasAnyModules = (grid: GridCell[][]): boolean => {
  return grid.some((row) => row.some((cell) => cell.type !== "empty"))
}

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(initialConfig)
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isConfiguratorStarted = hasAnyModules(config.grid)

  const [history, setHistory] = useState<ShelfConfig[]>([initialConfig])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedo = useRef(false)

  useState(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  })

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
              const cellColor = cell.color || (prev.accentColor !== "none" ? prev.accentColor : prev.baseColor)
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
    [saveToHistory, config.accentColor, config.baseColor],
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
      if (selectedTool === "empty") {
        placeModule(row, col, "empty")
        setSelectedCell(null)
      } else if (selectedTool) {
        placeModule(row, col, selectedTool)
        setSelectedCell({ row, col })
      } else {
        const currentType = config.grid[row]?.[col]?.type
        if (currentType === "empty") {
          placeModule(row, col, "ohne-seitenwaende")
          setSelectedCell({ row, col })
        } else {
          setSelectedCell({ row, col })
        }
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
      setConfig((prev) => {
        const newGrid = Array.from({ length: newRows }, (_, rowIndex) =>
          Array.from({ length: newCols }, (_, colIndex) => {
            if (rowIndex < prev.rows && colIndex < prev.columns) {
              return prev.grid[rowIndex][colIndex]
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

        const newRowHeights = Array(newRows).fill(38)

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newCols,
          rows: newRows,
          columnWidths: newColumnWidths as (75 | 38)[],
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
        const newWidths = [...prev.columnWidths]
        newWidths[colIndex] = width
        const newConfig = { ...prev, columnWidths: newWidths as (75 | 38)[] }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  // Removed setRowHeight as rowHeights is now always 38
  // const setRowHeight = useCallback(
  //   (rowIndex: number, height: 38 | 75) => {
  //     setConfig((prev) => {
  //       const newHeights = [...prev.rowHeights]
  //       newHeights[rowIndex] = height
  //       const newConfig = { ...prev, rowHeights: newHeights as (38 | 75)[] }
  //       setTimeout(() => saveToHistory(newConfig), 0)
  //       return newConfig
  //     })
  //   },
  //   [saveToHistory],
  // )

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
      grid: createEmptyGrid(2, 3),
      columns: 3,
      rows: 2,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: Array(2).fill(38),
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

  const onSelectTool = useCallback((tool: GridCell["type"] | null) => {
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      {/* Left side - 3D Configurator */}
      <div className="relative flex flex-1 flex-col">
        {/* 3D Canvas */}
        <div className="relative h-full w-full">
          <Canvas
            shadows
            camera={{ position: [0, 1.2, 2.5], fov: 45 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
            className="touch-none"
          >
            <color attach="background" args={["#f8f8f8"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-3, 4, -2]} intensity={0.4} />

            <ShelfScene
              config={config}
              selectedTool={selectedTool}
              hoveredCell={hoveredCell}
              selectedCell={selectedCell}
              onCellClick={handleCellClick3D}
              onCellHover={setHoveredCell}
              showFrame={isConfiguratorStarted}
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

          {!isConfiguratorStarted && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto max-w-md rounded-2xl border border-border/50 bg-background/95 p-8 text-center shadow-2xl backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/10">
                  <Grid3X3 className="h-8 w-8 text-accent-gold" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-foreground">Willkommen zum Konfigurator</h2>
                <p className="mb-6 text-muted-foreground">
                  Wählen Sie ein Modul aus der Werkzeugleiste und klicken Sie auf ein Feld im Raster, um Ihr
                  individuelles Regal zu gestalten.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {moduleTypes.slice(0, 4).map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedTool(mod.id)}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-all hover:border-accent-gold hover:bg-accent-gold/5"
                    >
                      <mod.icon className="h-4 w-4" />
                      <span>{mod.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Floating toolbar - visible only on desktop and when configurator started */}
          {isConfiguratorStarted && (
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
          )}

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
                      selectedTool === "empty"
                        ? "hsl(var(--destructive))"
                        : config.accentColor !== "none"
                          ? getColorHex(config.accentColor)
                          : getColorHex(config.baseColor),
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
                    backgroundColor:
                      config.accentColor !== "none" ? getColorHex(config.accentColor) : getColorHex(config.baseColor),
                  }}
                />
                <span className="text-sm text-foreground hidden sm:inline">
                  {config.accentColor !== "none"
                    ? specialColors.find((c) => c.id === config.accentColor)?.label
                    : baseColors.find((c) => c.id === config.baseColor)?.label}
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
            </div>
          )}
        </div>
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
        config={config}
        selectedTool={selectedTool}
        selectedCell={selectedCell}
        onSelectTool={onSelectTool}
        onSelectCell={setSelectedCell}
        onUpdateCellColor={updateCellColor}
        onPlaceModule={placeModule}
        onClearCell={clearCell}
        onResizeGrid={resizeGrid}
        onSetColumnWidth={setColumnWidth}
        // Removed onSetRowHeight as rowHeights is now always 38
        // onSetRowHeight={setRowHeight}
        onUpdateConfig={updateConfig}
        shoppingList={shoppingList}
        price={priceFormatted}
        showShoppingList={showShoppingList}
        onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
        showMobilePanel={showMobilePanel}
        onCloseMobilePanel={() => setShowMobilePanel(false)}
      />
    </div>
  )
}

function getToolLabel(tool: GridCell["type"]): string {
  const labels: Record<GridCell["type"], string> = {
    empty: "Leer",
    "ohne-seitenwaende": "Ohne Seitenwände",
    "mit-seitenwaenden": "Mit Seitenwänden",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "abschliessbare-tueren": "Abschließbare Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-doppelschublade": "Mit Doppelschublade",
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
  }
  return colors[color] || "#F5F5F5"
}
