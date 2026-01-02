"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { ShelfScene } from "./shelf-scene"
import { LiveCart } from "./live-cart"
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
  Grid3X3,
  LayoutGrid,
  Move3D,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { specialColors } from "@/lib/special-colors" // Import specialColors

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
    | "mit-doppelschublade"
    | "mit-klapptuer"
  color: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau" | "orange"
}

export type ShelfConfig = {
  columns: ColumnData[]
  material: "metall" | "glas" | "holz"
  accentColor: "weiss" | "schwarz" | "rot" | "gruen" | "gelb" | "blau" | "orange"
}

export type ColumnData = {
  width: 38 | 75
  cells: GridCell[] // Index 0 = bottom (floor level), higher indices = stacked up
}

type ModuleType = GridCell["type"]

const createEmptyCell = (id: string, color: GridCell["color"] = "weiss"): GridCell => ({
  id,
  type: "empty",
  color,
})

const createInitialConfig = (): ShelfConfig => ({
  columns: [
    {
      width: 75,
      cells: [createEmptyCell("col-0-cell-0")],
    },
  ],
  material: "metall",
  accentColor: "weiss",
})

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

const hasAnyModules = (config: ShelfConfig): boolean => {
  return config.columns.some((col) => col.cells.some((cell) => cell.type !== "empty"))
}

export function ShelfConfigurator() {
  const [config, setConfig] = useState<ShelfConfig>(createInitialConfig())
  const [selectedTool, setSelectedTool] = useState<ModuleType | "empty" | null>("ohne-rueckwand")
  const [selectedCell, setSelectedCell] = useState<{ col: number; stackIndex: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ col: number; stackIndex: number } | null>(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAction, setDragAction] = useState<"add" | "remove" | null>(null)
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false)
  const [dragState, setDragState] = useState<{
    active: boolean
    startCell: { col: number; stackIndex: number } | null
  }>({
    active: false,
    startCell: null,
  })

  const [isCartOpen, setIsCartOpen] = useState(false)

  const isConfiguratorStarted = hasAnyModules(config)

  const [history, setHistory] = useState<ShelfConfig[]>([createInitialConfig()])
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

  const handleCellClick = useCallback(
    (col: number, stackIndex: number) => {
      if (!selectedTool) return

      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column

          const newCells = column.cells.map((cell, cellIdx) => {
            if (cellIdx !== stackIndex) return cell

            if (selectedTool === "empty" || selectedTool === "delete") {
              // Can only delete top cell of stack
              if (
                cellIdx === column.cells.length - 1 ||
                column.cells.slice(cellIdx + 1).every((c) => c.type === "empty")
              ) {
                return { ...cell, type: "empty" as const }
              }
              return cell
            }

            return { ...cell, type: selectedTool, color: cell.color || prev.accentColor }
          })

          return { ...column, cells: newCells }
        })

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  const handleExpandUp = useCallback(
    (col: number) => {
      if (!selectedTool || selectedTool === "empty" || selectedTool === "delete") return

      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx !== col) return column

          // Only expand if there's at least one filled cell
          const hasFilledCell = column.cells.some((c) => c.type !== "empty")
          if (!hasFilledCell) return column

          const newCell: GridCell = {
            id: `col-${col}-cell-${column.cells.length}`,
            type: selectedTool,
            color: prev.accentColor,
          }

          return { ...column, cells: [...column.cells, newCell] }
        })

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  const handleExpandLeft = useCallback(
    (width: 38 | 75 = 75) => {
      setConfig((prev) => {
        const newCell: GridCell = {
          id: `col-0-cell-0`,
          type: selectedTool && selectedTool !== "empty" && selectedTool !== "delete" ? selectedTool : "empty",
          color: prev.accentColor,
        }

        const newColumn: ColumnData = {
          width,
          cells: [newCell],
        }

        // Renumber existing columns
        const updatedColumns = prev.columns.map((col, idx) => ({
          ...col,
          cells: col.cells.map((cell, cellIdx) => ({
            ...cell,
            id: `col-${idx + 1}-cell-${cellIdx}`,
          })),
        }))

        const newConfig = { ...prev, columns: [newColumn, ...updatedColumns] }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  const handleExpandRight = useCallback(
    (width: 38 | 75 = 75) => {
      setConfig((prev) => {
        const newColIndex = prev.columns.length
        const newCell: GridCell = {
          id: `col-${newColIndex}-cell-0`,
          type: selectedTool && selectedTool !== "empty" && selectedTool !== "delete" ? selectedTool : "empty",
          color: prev.accentColor,
        }

        const newColumn: ColumnData = {
          width,
          cells: [newCell],
        }

        const newConfig = { ...prev, columns: [...prev.columns, newColumn] }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [selectedTool, saveToHistory],
  )

  // Removed unused functions:
  // placeModule, updateCellColor, handleCellClick3D, handleDragStart, handleDragOver, handleDragEnd, clearCell, resizeGrid, setColumnWidth, updateConfig, handleZoomIn, handleZoomOut, handleResetView, handleResizeUp, handleResizeDown, handleResizeLeft, handleResizeRight, handleExpandDown, handleColumnAdd

  const reset = useCallback(() => {
    const newConfig = createInitialConfig()
    setConfig(newConfig)
    setHistory([newConfig])
    setHistoryIndex(0)
    setSelectedTool("ohne-rueckwand")
  }, [])

  const onSelectTool = useCallback((tool: ModuleType | "empty" | null) => {
    setSelectedTool(tool)
  }, [])

  const priceFormatted = useMemo(() => {
    // Placeholder for price calculation, as product data is missing
    return (0).toFixed(2).replace(".", ",")
  }, [config])

  const configWithDefaults = useMemo(
    () => ({
      ...config,
    }),
    [config],
  )

  return (
    <div className="flex h-screen flex-col bg-muted/30 lg:flex-row">
      <LiveCart config={config} isOpen={isCartOpen} onToggle={() => setIsCartOpen(!isCartOpen)} />

      {/* Left side - 3D Configurator */}
      <div className="relative flex flex-1 flex-col">
        {/* 3D Canvas */}
        <div className="relative h-full w-full">
          <Canvas
            shadows
            camera={{ position: [0, 1.5, 3], fov: 45 }}
            onPointerMissed={() => setSelectedCell(null)}
            onPointerUp={() => setDragState({ active: false, startCell: null })} // Added to handle drag end properly
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
              onCellClick={handleCellClick}
              onCellHover={setHoveredCell}
              onExpandLeft={handleExpandLeft}
              onExpandRight={handleExpandRight}
              onExpandUp={handleExpandUp}
              // Removed unused props: onDragStart, onDragOver, onDragEnd, isDragging, showFrame, onExpandDown
            />

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
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" />
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
          <button
            onClick={() => onSelectTool(selectedTool === "empty" ? null : "empty")}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-lg transition-all",
              selectedTool === "empty"
                ? "bg-destructive/20 text-destructive border border-destructive"
                : "text-muted-foreground hover:bg-control-hover border border-transparent",
            )}
          >
            <Eraser className="h-5 w-5" />
          </button>
          {moduleTypes.slice(0, 6).map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectTool(selectedTool === module.id ? null : module.id)}
              className={cn(
                "flex items-center justify-center w-11 h-11 rounded-lg transition-all",
                selectedTool === module.id
                  ? "bg-accent-gold/20 text-accent-gold border border-accent-gold"
                  : "text-muted-foreground hover:bg-control-hover border border-transparent",
              )}
            >
              <ModuleIconSVG type={module.id} />
            </button>
          ))}
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
                // onClick={handleZoomIn} // Placeholder
                title="Vergrößern"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                // onClick={handleZoomOut} // Placeholder
                title="Verkleinern"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                // onClick={handleResetView} // Placeholder
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
                // onClick={handleResizeUp} // Placeholder
                title="Hochskalieren"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                // onClick={handleResizeDown} // Placeholder
                title="Runterskalieren"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                // onClick={handleResizeLeft} // Placeholder
                title="Linksskalieren"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                // onClick={handleResizeRight} // Placeholder
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
            ({config.columns.length}x{config.columns.reduce((max, col) => Math.max(max, col.cells.length), 0)})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-accent-gold">{priceFormatted} €</span>
          <Eraser className={cn("h-5 w-5 transition-transform", showMobilePanel && "rotate-180")} />
        </div>
      </button>

      {/* Removed ConfiguratorPanel component as it seems to be replaced by the mobile panel logic */}
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
    orange: "#FFA500",
  }
  return colors[color] || "#F5F5F5"
}
