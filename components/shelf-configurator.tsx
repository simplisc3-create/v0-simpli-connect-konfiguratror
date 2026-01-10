"use client"

import { useState, useCallback, useMemo, useRef, Suspense, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { ConfiguratorHelpBot } from "./configurator-help-bot"
import { Undo2, Redo2, RotateCcw, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as THREE from "three"
import { LoadingAnimation } from "./loading-animation"
import { CameraController } from "./camera-controller"
import { ARPreviewButton } from "./ar-preview-button"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

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
    | "mit-klapptuer-oben"
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

type PresetConfig = {
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights: (40 | 80 | 120 | 160 | 200)[]
  grid: GridCell[][]
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
  cellStyles: {},
}

const updateGhostCells = (grid: GridCell[][]): GridCell[][] => {
  const rows = grid.length
  const cols = grid[0]?.length || 0
  const newGrid: GridCell[][] = []

  for (let r = 0; r < rows; r++) {
    newGrid[r] = []
    for (let c = 0; c < cols; c++) {
      const originalCell = grid[r][c]
      if (originalCell.type === "ghost") {
        newGrid[r][c] = { ...originalCell, type: "empty" }
      } else {
        newGrid[r][c] = { ...originalCell, type: originalCell.type, color: originalCell.color }
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    let topmostFilledRow = -1
    for (let r = rows - 1; r >= 0; r--) {
      if (newGrid[r][c].type !== "empty" && newGrid[r][c].type !== "ghost") {
        topmostFilledRow = r
        break
      }
    }

    if (topmostFilledRow >= 0 && topmostFilledRow + 1 < rows) {
      if (newGrid[topmostFilledRow + 1][c].type === "empty") {
        newGrid[topmostFilledRow + 1][c] = { ...newGrid[topmostFilledRow + 1][c], type: "ghost" }
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
      if (c - 1 >= 0 && newGrid[0][c - 1].type === "empty") {
        newGrid[0][c - 1] = { ...newGrid[0][c - 1], type: "ghost" }
      }
      if (c + 1 < cols && newGrid[0][c + 1].type === "empty") {
        newGrid[0][c + 1] = { ...newGrid[0][c + 1], type: "ghost" }
      }
    }
  }

  return newGrid
}

export function ShelfConfigurator({
  initialPreset,
  presetYoutubeId,
}: { initialPreset?: string; presetYoutubeId?: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [showVideoPreview, setShowVideoPreview] = useState(!!presetYoutubeId)
  const sceneGroupRef = useRef<THREE.Group>(null)
  const orbitControlsRef = useRef<OrbitControlsImpl>(null)

  const getInitialConfig = (): ShelfConfig => {
    if (initialPreset) {
      return {
        ...initialConfig,
        columns: 1,
        rows: 1,
        columnWidths: [75] as (75 | 38)[],
        rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
        grid: createInitialGrid(),
      }
    }
    return initialConfig
  }

  const [config, setConfig] = useState<ShelfConfig>(getInitialConfig)
  const [selectedTool, setSelectedTool] = useState<GridCell["type"] | null>("offenes-fach")
  const [selectedColor, setSelectedColor] = useState<GridCell["color"]>("weiss")
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  const [showHeightWarning, setShowHeightWarning] = useState(false)
  const [heightWarningShown, setHeightWarningShown] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const [history, setHistory] = useState<ShelfConfig[]>([getInitialConfig()])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedo = useRef(false)

  useEffect(() => {
    if (initialPreset) {
      setConfig((prev) => {
        const expandedGrid = [...prev.grid.map((row) => [...row])]

        const newTopRow: GridCell[] = expandedGrid[0].map((_, colIndex) => ({
          id: `cell-${expandedGrid.length}-${colIndex}`,
          type: "empty" as const,
          row: expandedGrid.length,
          col: colIndex,
        }))
        expandedGrid.push(newTopRow)

        for (let r = 0; r < expandedGrid.length; r++) {
          expandedGrid[r].unshift({
            id: `cell-${r}-left`,
            type: "empty" as const,
            row: r,
            col: -1,
          })
          expandedGrid[r].push({
            id: `cell-${r}-right`,
            type: "empty" as const,
            row: r,
            col: expandedGrid[r].length,
          })
        }

        for (let r = 0; r < expandedGrid.length; r++) {
          for (let c = 0; c < expandedGrid[r].length; c++) {
            expandedGrid[r][c].row = r
            expandedGrid[r][c].col = c
            expandedGrid[r][c].id = `cell-${r}-${c}`
          }
        }

        const newColumnWidths = [75 as const, ...prev.columnWidths, 75 as const]
        const newRowHeights = [...prev.rowHeights, 38 as const]

        const updatedGrid = updateGhostCells(expandedGrid)

        return {
          ...prev,
          grid: updatedGrid,
          rows: updatedGrid.length,
          columns: updatedGrid[0]?.length || prev.columns,
          columnWidths: newColumnWidths,
          rowHeights: newRowHeights,
        }
      })
    }
  }, [initialPreset])

  const totalHeightCm = useMemo(() => {
    let maxFilledRows = 0
    for (let col = 0; col < config.columns; col++) {
      let filledRows = 0
      for (let row = 0; row < config.rows; row++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          filledRows++
        }
      }
      maxFilledRows = Math.max(maxFilledRows, filledRows)
    }
    return maxFilledRows * 40
  }, [config.grid, config.rows, config.columns])

  const playDingSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(830, ctx.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (e) {
      // Audio not supported
    }
  }, [])

  useEffect(() => {
    if (totalHeightCm > 200 && !heightWarningShown) {
      setShowHeightWarning(true)
      setHeightWarningShown(true)
      playDingSound()
    }
  }, [totalHeightCm, heightWarningShown, playDingSound])

  useEffect(() => {
    if (totalHeightCm <= 200) {
      setHeightWarningShown(false)
    }
  }, [totalHeightCm])

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
      const historyItem = history[newIndex]
      if (historyItem && historyItem.grid) {
        setHistoryIndex(newIndex)
        setConfig(historyItem)
      } else {
        isUndoRedo.current = false
      }
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true
      const newIndex = historyIndex + 1
      const historyItem = history[newIndex]
      if (historyItem && historyItem.grid) {
        setHistoryIndex(newIndex)
        setConfig(historyItem)
      } else {
        isUndoRedo.current = false
      }
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

  const clearCellColor = useCallback(
    (row: number, col: number) => {
      setConfig((prev) => {
        const cellId = getCellId(row, col)
        const newCellStyles = { ...(prev.cellStyles || {}) }
        delete newCellStyles[cellId]

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

  const getToolLabel = (tool: GridCell["type"]): string => {
    const labels: Record<GridCell["type"], string> = {
      empty: "Leer",
      ghost: "Ghost",
      "offenes-fach": "Offenes Fach",
      "ohne-seitenwaende": "Ohne Seitenwände",
      "ohne-rueckwand": "Ohne Rückwand",
      "mit-rueckwand": "Mit Rückwand",
      "mit-tueren": "Mit Türen",
      "mit-klapptuer": "Mit Klapptür",
      "mit-klapptuer-oben": "Klapptür (nach oben)",
      "mit-doppelschublade": "Mit Schubladen",
      "abschliessbare-tueren": "Abschließbar",
      "mit-tuere-rechts": "Tür rechts",
      "mit-tuere-links": "Tür links",
      "abschliessbar-rechts": "Abschließbar rechts",
      "abschliessbar-links": "Abschließbar links",
      klapptuer: "Klapptür",
    }
    return labels[tool] || tool
  }

  const getColorHex = (color: string): string => {
    const colors: Record<string, string> = {
      weiss: "#ffffff",
      schwarz: "#1a1a1a",
      blau: "#3b82f6",
      gruen: "#22c55e",
      gelb: "#eab308",
      orange: "#f97316",
      rot: "#ef4444",
      red: "#ef4444",
      white: "#ffffff",
      black: "#1a1a1a",
      blue: "#3b82f6",
      green: "#22c55e",
      yellow: "#eab308",
      satin: "#c4c4c4",
    }
    return colors[color] || "#ffffff"
  }

  const handleCellClick3D = useCallback(
    (row: number, col: number) => {
      const cell = config.grid[row]?.[col]

      if (cell && cell.type !== "empty" && cell.type !== "ghost") {
        setSelectedCell({ row, col })
        return
      }

      if (!selectedTool || selectedTool === "empty") {
        return
      }

      // Place module logic would go here
      setSelectedCell(null)
    },
    [config.grid, selectedTool],
  )

  const reset = useCallback(() => {
    const newConfig = { ...initialConfig, grid: createInitialGrid() }
    setConfig(newConfig)
    setHistory([newConfig])
    setHistoryIndex(0)
    setSelectedTool("offenes-fach")
    setSelectedColor("weiss")
    setSelectedCell(null)
  }, [])

  // Placeholder for shopping list calculation
  const shoppingList: any[] = []
  const totalPrice = 0

  const placedCells = useMemo(() => {
    let count = 0
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          count++
        }
      }
    }
    return count
  }, [config.grid, config.rows, config.columns])

  return (
    <div className="flex h-screen w-full flex-col bg-neutral-900">
      <ConfiguratorHeader />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          {showVideoPreview && presetYoutubeId && (
            <div className="absolute left-4 top-4 z-50 h-32 w-48 overflow-hidden rounded-lg border border-neutral-700 bg-black shadow-lg">
              <button
                onClick={() => setShowVideoPreview(false)}
                className="absolute right-1 top-1 z-10 rounded-full bg-black/70 p-1 text-white hover:bg-black"
              >
                <X className="h-3 w-3" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${presetYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${presetYoutubeId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                className="h-full w-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}

          <Canvas
            shadows={true}
            camera={{ position: [0, 1.2, 2.5], fov: 50 }}
            gl={{
              antialias: true,
              alpha: true,
              preserveDrawingBuffer: true,
              toneMapping: THREE.ACESFilmicToneMapping,
            }}
            onCreated={() => setIsLoading(false)}
          >
            <ambientLight intensity={0.5} />
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

            <Suspense fallback={<LoadingAnimation />}>
              <ShelfScene
                config={config}
                selectedTool={selectedTool}
                hoveredCell={hoveredCell}
                onCellClick={handleCellClick3D}
                onCellHover={setHoveredCell}
                selectedCell={selectedCell}
                onApplyCellColor={applyCellColor}
                onClearCellColor={clearCellColor}
                sceneGroupRef={sceneGroupRef}
              />
            </Suspense>

            <CameraController selectedCell={selectedCell} config={config} controlsRef={orbitControlsRef} />

            <OrbitControls
              ref={orbitControlsRef}
              makeDefault
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={1}
              maxDistance={8}
            />
          </Canvas>

          <div className="absolute right-4 top-4 flex gap-2">
            <ARPreviewButton sceneRef={sceneGroupRef} disabled={placedCells.length === 0} />
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
            <ConfiguratorHelpBot />
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
                        setSelectedCell(null)
                      }}
                    />
                  ))}
                </div>
                <button className="text-sm text-red-500 hover:underline" onClick={() => setSelectedCell(null)}>
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {showHeightWarning && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="mx-4 max-w-md rounded-lg bg-neutral-800 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <h3 className="text-xl font-bold text-white">Höhenwarnung</h3>
                </div>
                <p className="mb-4 text-neutral-300">
                  Die Gesamthöhe Ihres Regals überschreitet 200cm. Bei Höhen über 2 Metern empfehlen wir eine
                  Wandbefestigung für zusätzliche Stabilität.
                </p>
                <Button onClick={() => setShowHeightWarning(false)} className="w-full">
                  Verstanden
                </Button>
              </div>
            </div>
          )}
        </div>

        <ConfiguratorPanel
          config={config}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          selectedCell={selectedCell}
          onSelectTool={(tool) => {
            setSelectedTool(tool)
            setSelectedCell(null)
          }}
          onSelectColor={setSelectedColor}
          onPlaceModule={handleCellClick3D}
          onClearCell={() => {}}
          onResizeGrid={() => {}}
          onSetColumnWidth={() => {}}
          onSetRowHeight={() => {}}
          onUpdateConfig={() => {}}
          shoppingList={shoppingList}
          price={totalPrice}
          showShoppingList={showShoppingList}
          onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
          onApplyCellColor={applyCellColor}
        />
      </div>
    </div>
  )
}
