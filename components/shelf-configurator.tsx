"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { DragDropProvider } from "./drag-drop-context"
import { Undo2, Redo2, RotateCcw, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { optimizeShoppingList, type OptimizationResult } from "@/lib/shopping-optimizer"
import * as THREE from "three"

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
  rowHeights: 38[]
  footType: "standard" | "adjustable"
  baseColor: "weiss" | "schwarz"
  accentColor: "none" | "blau" | "gruen" | "gelb" | "orange" | "rot"
  shelfMaterial: "metall" | "glas" | "holz"
}

export type ShoppingItem = {
  product: {
    artNr: string
    name: string
    price: number
  }
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

  useEffect(() => {
    if (typeof window === "undefined") return

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
    (row: number, col: number, type: GridCell["type"], color?: GridCell["color"]) => {
      setConfig((prev) => {
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              const cellColor = color || cell.color || (prev.accentColor !== "none" ? prev.accentColor : prev.baseColor)
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
    [saveToHistory],
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

  const handleDrop = useCallback(
    (row: number, col: number, type: GridCell["type"], color?: GridCell["color"]) => {
      placeModule(row, col, type, color)
      setSelectedCell({ row, col })
    },
    [placeModule],
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
          rowHeights: newRowHeights as 38[],
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
      rowHeights: [38, 38] as 38[],
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

  const optimizationResult = useMemo<OptimizationResult>(() => {
    return optimizeShoppingList(config)
  }, [config])

  const { shoppingList, totalPrice, suggestions, optimalPackages } = optimizationResult
  const priceFormatted = totalPrice.toFixed(2).replace(".", ",")

  return (
    <DragDropProvider>
      <div className="flex h-full w-full flex-col bg-background">
        <ConfiguratorHeader />
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="relative flex-1 lg:flex-none lg:w-[60%]">
            <Canvas
              shadows="soft"
              camera={isMobile ? { position: [0, 1.2, 3.5], fov: 60 } : { position: [2, 1.5, 3], fov: 50 }}
              className="h-full w-full touch-none"
              gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
            >
              <color attach="background" args={["#2a2a2a"]} />
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[4, 10, 6]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={0.5}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.0001}
              />
              <directionalLight position={[-4, 6, -4]} intensity={0.4} />
              <directionalLight position={[0, 3, 8]} intensity={0.3} />
              <pointLight position={[0, 2, 0]} intensity={0.2} />
              <ShelfScene
                config={config}
                selectedTool={selectedTool}
                hoveredCell={hoveredCell}
                selectedCell={selectedCell}
                onCellClick={handleCellClick3D}
                onCellHover={setHoveredCell}
              />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <shadowMaterial opacity={0.35} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#4a3c2e" roughness={0.85} />
              </mesh>
              <Environment preset="studio" />
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
            </Canvas>

            <div className="absolute right-2 top-2 flex gap-1 md:right-3 md:top-3 md:gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                className="h-8 w-8 md:h-9 md:w-9 bg-card/80 backdrop-blur-sm border-border hover:bg-secondary disabled:opacity-30"
                title="Rückgängig (Undo)"
              >
                <Undo2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                className="h-8 w-8 md:h-9 md:w-9 bg-card/80 backdrop-blur-sm border-border hover:bg-secondary disabled:opacity-30"
                title="Wiederholen (Redo)"
              >
                <Redo2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={reset}
                className="h-8 w-8 md:h-9 md:w-9 bg-card/80 backdrop-blur-sm border-border hover:bg-secondary hover:border-destructive"
                title="Zurücksetzen (Reset)"
              >
                <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4 text-foreground" />
              </Button>
            </div>

            <div className="pointer-events-none absolute bottom-2 left-2 right-2 rounded-lg bg-card/80 backdrop-blur-sm px-2.5 py-1.5 text-xs md:bottom-3 md:left-3 md:right-auto md:text-sm text-muted-foreground border border-border">
              {selectedTool ? (
                <span>
                  <span className="font-semibold text-simpli-blue">
                    {selectedTool === "empty" ? "Radierer" : getToolLabel(selectedTool)}
                  </span>
                  <span className="hidden sm:inline"> | Klicke auf Zellen oder ziehe Module</span>
                </span>
              ) : (
                <span className="hidden sm:inline">Wähle ein Modul oder ziehe es auf das Regal</span>
              )}
            </div>

            {selectedTool && selectedTool !== "empty" && (
              <div className="absolute left-2 top-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border px-2 py-1 md:left-3 md:top-3 md:px-2.5 md:py-1.5">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div
                    className="h-3.5 w-3.5 rounded md:h-5 md:w-5 shadow-sm"
                    style={{
                      backgroundColor:
                        config.accentColor !== "none" ? getColorHex(config.accentColor) : getColorHex(config.baseColor),
                    }}
                  />
                  <span className="text-sm md:text-base text-foreground">{getToolLabel(selectedTool)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowMobilePanel(!showMobilePanel)}
            className="sticky bottom-0 z-20 flex items-center justify-between gap-2 border-t border-border bg-card px-4 py-4 text-foreground lg:hidden active:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-base">Konfigurator</span>
              <span className="text-sm text-muted-foreground">
                ({config.rows}x{config.columns})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-simpli-blue">{priceFormatted} €</span>
              <ChevronDown className={cn("h-5 w-5 transition-transform", showMobilePanel && "rotate-180")} />
            </div>
          </button>

          <ConfiguratorPanel
            config={config}
            selectedTool={selectedTool}
            selectedCell={selectedCell}
            onSelectTool={setSelectedTool}
            onSelectCell={setSelectedCell}
            onUpdateCellColor={updateCellColor}
            onPlaceModule={placeModule}
            onClearCell={clearCell}
            onResizeGrid={resizeGrid}
            onSetColumnWidth={setColumnWidth}
            onUpdateConfig={updateConfig}
            onDrop={handleDrop}
            shoppingList={shoppingList}
            price={priceFormatted}
            suggestions={suggestions}
            optimalPackages={optimalPackages}
            showShoppingList={showShoppingList}
            onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
            showMobilePanel={showMobilePanel}
            onCloseMobilePanel={() => setShowMobilePanel(false)}
          />
        </div>
      </div>
    </DragDropProvider>
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
