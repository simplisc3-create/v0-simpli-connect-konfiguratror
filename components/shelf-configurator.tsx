"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, useTexture } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { Undo2, Redo2, RotateCcw, Eraser } from "lucide-react"
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

export type GridCell = {
  id: string
  type:
    | "empty"
    | "ohne-seitenwaende"
    | "ohne-rueckwand"
    | "mit-rueckwand"
    | "mit-tueren"
    | "mit-klapptuer"
    | "mit-doppelschublade"
    | "abschliessbare-tueren"
  row: number
  col: number
  color?: "weiss" | "schwarz" | "blau" | "gruen" | "gelb" | "orange" | "rot"
}

export type ShelfConfig = {
  grid: GridCell[][]
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights: (38 | 76)[]
  footType: "standard" | "adjustable"
  baseColor: "weiss" | "schwarz"
  accentColor: "none" | "blau" | "gruen" | "gelb" | "orange" | "rot"
  shelfMaterial: "metall" | "glas" | "holz"
}

export type ShoppingItem = {
  product: Product
  quantity: number
  subtotal: number
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
  grid: createEmptyGrid(2, 3),
  columns: 3,
  rows: 2,
  columnWidths: [75, 75, 75],
  rowHeights: [38, 38],
  footType: "standard",
  baseColor: "weiss",
  accentColor: "none",
  shelfMaterial: "metall",
}

const moduleTypes = [
  { id: "ohne-seitenwaende" as const, label: "Offen", icon: "open" },
  { id: "ohne-rueckwand" as const, label: "O. Rück", icon: "shelf" },
  { id: "mit-rueckwand" as const, label: "M. Rück", icon: "back" },
  { id: "mit-tueren" as const, label: "Türen", icon: "doors" },
  { id: "mit-klapptuer" as const, label: "Klapp", icon: "flip" },
  { id: "mit-doppelschublade" as const, label: "Schub.", icon: "drawer" },
  { id: "abschliessbare-tueren" as const, label: "Schloss", icon: "lock" },
]

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
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" strokeDasharray="4 2" />
        </svg>
      )
    case "ohne-rueckwand":
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4v16M20 4v16M4 20h16M4 4h16" />
        </svg>
      )
    case "mit-rueckwand":
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" fill="currentColor" fillOpacity="0.2" />
        </svg>
      )
    case "mit-tueren":
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
        </svg>
      )
    case "mit-klapptuer":
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="4" y1="14" x2="20" y2="14" />
          <circle cx="12" cy="9" r="1" fill="currentColor" />
        </svg>
      )
    case "mit-doppelschublade":
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="10" y1="8" x2="14" y2="8" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      )
    case "abschliessbare-tueren":
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(initialConfig)
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>("ohne-seitenwaende")
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

        const newRowHeights = [...prev.rowHeights]
        while (newRowHeights.length < newRows) newRowHeights.push(38)
        while (newRowHeights.length > newRows) newRowHeights.pop()

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newCols,
          rows: newRows,
          columnWidths: newColumnWidths as (75 | 38)[],
          rowHeights: newRowHeights as (38 | 76)[],
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

  const setRowHeight = useCallback(
    (rowIndex: number, height: 38 | 76) => {
      setConfig((prev) => {
        const newHeights = [...prev.rowHeights]
        newHeights[rowIndex] = height
        const newConfig = { ...prev, rowHeights: newHeights as (38 | 76)[] }
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
      grid: createEmptyGrid(2, 3),
      columns: 3,
      rows: 2,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38] as (38 | 76)[],
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

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <ConfiguratorHeader />
      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        <div className="relative flex-1 min-h-[400px] lg:min-h-0">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-1 rounded-xl bg-card/95 backdrop-blur-sm border border-border p-2 shadow-lg">
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

          <Canvas
            shadows
            camera={isMobile ? { position: [0, 1.2, 3.5], fov: 60 } : { position: [2, 1.5, 3], fov: 50 }}
            className="h-full w-full touch-none"
          >
            <color attach="background" args={["hsl(var(--canvas-bg))"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-3, 3, -3]} intensity={0.4} />
            <ShelfScene
              config={config}
              selectedTool={selectedTool}
              hoveredCell={hoveredCell}
              selectedCell={selectedCell}
              onCellClick={handleCellClick3D}
              onCellHover={setHoveredCell}
            />
            <ContactShadows position={[0, 0.001, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            <Environment preset="apartment" />
            <OrbitControls
              makeDefault
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={isMobile ? 2 : 1.5}
              maxDistance={isMobile ? 6 : 8}
              enableDamping
              dampingFactor={0.05}
              enablePan={isMobile}
            />
            <WoodFloor />
          </Canvas>

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
          onSetRowHeight={setRowHeight}
          onUpdateConfig={updateConfig}
          shoppingList={shoppingList}
          price={priceFormatted}
          showShoppingList={showShoppingList}
          onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
          showMobilePanel={showMobilePanel}
          onCloseMobilePanel={() => setShowMobilePanel(false)}
        />
      </div>
    </div>
  )
}

function getToolLabel(tool: GridCell["type"]): string {
  const labels: Record<GridCell["type"], string> = {
    empty: "Leer",
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
  }
  return colors[color] || "#F5F5F5"
}
