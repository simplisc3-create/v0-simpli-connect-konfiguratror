"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"

import { useState, useCallback, useMemo, Suspense, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"

// Error Boundary to catch 3D rendering errors and prevent white screen
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class Canvas3DErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[v0] 3D Canvas Error:", error)
    console.error("[v0] 3D Canvas Error Info:", errorInfo)
    console.error("[v0] 3D Canvas Error Stack:", error.stack)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-700 p-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">3D-Ansicht konnte nicht geladen werden</h3>
            <p className="text-sm text-neutral-500 mb-4 text-center max-w-md">
              Es gab ein Problem beim Laden der 3D-Vorschau. Bitte versuchen Sie es erneut.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
import { OrbitControls, Environment, Lightformer } from "@react-three/drei"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { ConfiguratorHelpBot } from "./configurator-help-bot"
import { Undo2, Redo2, RotateCcw, AlertTriangle, X, MousePointer2, Move, ZoomIn, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getSchubladeArtNr,
  getTuerArtNr,
  getKlapptuerArtNr,
  getLeiterArtNr,
  getKlapptuerObenArtNr,
  getEinzelschubladeArtNr,
  getFlaechensetArtNr,
  flaechensets,
} from "@/lib/simpli-products"
import { useThree } from "@react-three/fiber"
import { isModuleTypeAvailableForWidth } from "@/lib/glb-registry"
import * as THREE from "three"
import { LoadingAnimation } from "./loading-animation"
import { MobileConfiguratorNav } from "./mobile-configurator-nav"
import { getModuleLabel, getModuleShortLabel, getColorHex, getColorLabel } from "@/lib/module-utils"
import {
  getCellId,
  createInitialGrid,
  updateGhostCells,
  pruneCellStyles,
  isConnectedToExisting,
  hasSupportBelow,
  expandGridAroundPlacement,
} from "@/lib/grid-utils"
import { useConfigHistory } from "@/hooks/use-config-history"
import { useHeightWarning } from "@/hooks/use-height-warning"
import { useCellColors } from "@/hooks/use-cell-colors"

// CameraController component for smooth camera animation to new modules
function CameraController({
  target,
  controlsRef,
  initialTarget,
}: {
  target: [number, number, number] | null
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  initialTarget: [number, number, number]
}) {
  const smoothTarget = useRef(new THREE.Vector3(initialTarget[0], initialTarget[1], initialTarget[2]))
  const isAnimating = useRef(false)
  const hasInitialized = useRef(false)

  useFrame(() => {
    if (!controlsRef.current) return
    
    // On first frame, set target to center of shelf
    if (!hasInitialized.current) {
      controlsRef.current.target.set(initialTarget[0], initialTarget[1], initialTarget[2])
      controlsRef.current.update()
      hasInitialized.current = true
    }
    
    if (!target) return

    const targetVec = new THREE.Vector3(target[0], target[1], target[2])

    // Smoothly interpolate current target toward new target
    smoothTarget.current.lerp(targetVec, 0.08)

    // Update orbit controls target
    controlsRef.current.target.copy(smoothTarget.current)
    controlsRef.current.update()

    // Check if animation is complete (close enough to target)
    const distance = smoothTarget.current.distanceTo(targetVec)
    if (distance < 0.01 && isAnimating.current) {
      isAnimating.current = false
    }
  })

  // Trigger animation when target changes
  useEffect(() => {
    if (target) {
      isAnimating.current = true
    }
  }, [target])

  return null
}

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
    | "mit-einzelschublade"
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

export { getCellId } from "@/lib/grid-utils"

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
  cellStyles: {}, // Initialize empty cellStyles
}

export function ShelfConfigurator({
  initialPreset,
  presetYoutubeId,
}: { initialPreset?: PresetConfig; presetYoutubeId?: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [showVideoPreview, setShowVideoPreview] = useState(!!presetYoutubeId)

  const [defaultNewColumnWidth, setDefaultNewColumnWidth] = useState<75 | 38>(75)

  const getInitialConfig = (): ShelfConfig => {
    if (initialPreset) {
      return {
        ...initialConfig,
        columns: initialPreset.columns,
        rows: initialPreset.rows,
        columnWidths: initialPreset.columnWidths,
        rowHeights: initialPreset.rowHeights,
        grid: initialPreset.grid,
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

  // Camera focus state for smooth animation to newest module
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null)
  const orbitControlsRef = useRef<OrbitControlsImpl>(null)

  // Calculate initial camera target - focus on the ghost cell at the start (bottom center)
  // For the initial state with just a ghost cell, we want to focus near ground level
  const initialCameraTarget = useMemo<[number, number, number]>(() => {
    // Check if there are any real modules (not ghost or empty)
    const hasRealModules = config.grid.some(row => 
      row.some(cell => cell.type !== "ghost" && cell.type !== "empty")
    )
    
    if (hasRealModules) {
      // If there are real modules, center on the shelf
      const totalHeight = config.rowHeights.reduce((sum, h) => sum + h, 0) / 100
      return [0, totalHeight / 2, 0]
    }
    
    // For initial ghost cell state, focus at roughly the ghost cell position (y=0.2)
    return [0, 0.2, 0]
  }, [config.grid, config.rowHeights])

  const smoothTarget = useRef(new THREE.Vector3(0, 0.3, 0))
  const isAnimating = useRef(false)

  const {
    saveToHistory,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
    resetHistory,
    setHistory,
    setHistoryIndex,
  } = useConfigHistory(config)

  const totalHeightCm = useMemo(() => {
    // Find the maximum number of filled rows in any column
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
    // Each row is approximately 40cm
    return maxFilledRows * 40
  }, [config.grid, config.rows, config.columns])

  const { showHeightWarning, setShowHeightWarning, heightWarningShown, setHeightWarningShown, playDingSound } =
    useHeightWarning(totalHeightCm)

  const { applyCellColor, applyColorToRow, applyColorToColumn, applyColorToAll, clearCellColor } = useCellColors(
    setConfig,
    saveToHistory,
  )

  useEffect(() => {
    if (initialPreset) {
      const { grid: updatedGrid, columnWidths: updatedColumnWidths } = updateGhostCells(
        initialPreset.grid,
        initialPreset.columnWidths,
        defaultNewColumnWidth,
      )

      setConfig((prev) => ({
        ...prev,
        grid: updatedGrid,
        columns: updatedGrid[0]?.length || prev.columns,
        rows: updatedGrid.length,
        columnWidths: updatedColumnWidths, // Use updated columnWidths
      }))
    }
  }, [initialPreset])

  useEffect(() => {
    if (totalHeightCm > 200 && !heightWarningShown) {
      setShowHeightWarning(true)
      setHeightWarningShown(true)

      playDingSound()
    }
  }, [totalHeightCm, heightWarningShown, playDingSound, setShowHeightWarning, setHeightWarningShown])

  useEffect(() => {
    if (totalHeightCm <= 200) {
      setHeightWarningShown(false)
    }
  }, [totalHeightCm, setHeightWarningShown])

  const undo = useCallback(() => {
    const historyItem = undoHistory()
    if (historyItem) {
      setConfig(historyItem)
    }
  }, [undoHistory])

  const redo = useCallback(() => {
    const historyItem = redoHistory()
    if (historyItem) {
      setConfig(historyItem)
    }
  }, [redoHistory])

  const pruneCellStylesMemo = useCallback((styles: CellStyles, maxRows: number, maxCols: number): CellStyles => {
    return pruneCellStyles(styles, maxRows, maxCols)
  }, [])

  // --- REMOVED: Inline Cell Color Functions ---
  // The logic for applyCellColor, applyColorToRow, applyColorToColumn, applyColorToAll, and clearCellColor
  // has been moved to the useCellColors hook.

  // Calculate 3D position for a cell (same logic as ShelfScene)
  const calculateCellPosition = useCallback(
    (row: number, col: number): [number, number, number] => {
      const columnTubeOverlap = 0.003
      const rowTubeOverlap = 0.003
      const depth = 0.38

      // Calculate column centers
      const columnCenters: number[] = []
      let totalWidth = 0
      for (let c = 0; c < config.columns; c++) {
        const colWidth = config.columnWidths[c] / 100
        let xPos = 0
        for (let cc = 0; cc < c; cc++) {
          xPos += config.columnWidths[cc] / 100 - columnTubeOverlap
        }
        columnCenters.push(xPos + colWidth / 2)
        totalWidth += colWidth
        if (c > 0) totalWidth -= columnTubeOverlap
      }

      // Calculate row centers
      const rowCenters: number[] = []
      for (let r = 0; r < config.rows; r++) {
        const rowHeight = config.rowHeights[r] / 100
        let yPos = 0
        for (let rr = 0; rr < r; rr++) {
          yPos += config.rowHeights[rr] / 100 - rowTubeOverlap
        }
        rowCenters.push(yPos + rowHeight / 2)
      }

      const offsetX = -totalWidth / 2

      return [
        (columnCenters[col] || 0) + offsetX,
        rowCenters[row] || 0,
        -depth / 2,
      ]
    },
    [config.columns, config.rows, config.columnWidths, config.rowHeights],
  )

  const placeModule = useCallback(
    (row: number, col: number, type: GridCell["type"]) => {
      setConfig((prev) => {
        const currentCell = prev.grid[row]?.[col]

        if (!currentCell || (currentCell.type !== "ghost" && currentCell.type !== "empty")) {
          return prev
        }

        if (!isConnectedToExisting(row, col, prev.grid, type)) {
          return prev
        }

        if (!hasSupportBelow(row, col, prev.grid)) {
          return prev
        }

        const columnWidth = prev.columnWidths[col]
        const widthInCm = columnWidth === 75 ? 80 : 40
        if (type !== "empty" && type !== "ghost" && !isModuleTypeAvailableForWidth(type, widthInCm)) {
          return prev
        }

        let newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return { ...cell, type, color: selectedColor }
            }
            return cell
          }),
        )

        const {
          grid: expandedGrid,
          columnWidths: updatedColumnWidths,
          shifted,
        } = expandGridAroundPlacement(newGrid, row, col, prev.columnWidths)
        newGrid = expandedGrid

        const newColumns = newGrid[0]?.length || 1
        const newRows = newGrid.length

        const newColumnWidths = [...updatedColumnWidths] // Use updated columnWidths

        // If columns were shifted, we might need to adjust columnWidths more carefully
        // This logic needs to be more robust if columns can be inserted in the middle
        if (shifted) {
          // If a column was prepended, the original columnWidths array needs to reflect this.
          // The 'updateGhostCells' function now handles prepending/appending a width of 38.
          // This part might need further refinement if complex column reordering occurs.
        }

        const newRowHeights = [...prev.rowHeights]
        while (newRowHeights.length < newRows) newRowHeights.push(38)
        while (newRowHeights.length > newRows) newRowHeights.pop()

        const cellId = getCellId(row, col)
        const newCellStyles = { ...(prev.cellStyles || {}), [cellId]: { color: selectedColor } }

        const newConfig = {
          ...prev,
          grid: newGrid,
          columns: newColumns,
          rows: newRows,
          columnWidths: newColumnWidths as (75 | 38)[],
          rowHeights: newRowHeights,
          cellStyles: newCellStyles,
        }

        setTimeout(() => saveToHistory(newConfig), 0)

        // Animate camera to focus on the newly placed module (only for real modules)
        if (type !== "empty" && type !== "ghost") {
          // Calculate position after grid expansion - need to account for shifted columns
          const actualCol = shifted ? col + 1 : col
          setTimeout(() => {
            const position = calculateCellPosition(row, actualCol)
            setCameraTarget(position)
          }, 50)
        }

        return newConfig
      })
    },
    [saveToHistory, selectedColor, defaultNewColumnWidth, calculateCellPosition],
  )

  const handleCellClick3D = useCallback(
    (row: number, col: number) => {
      const cell = config.grid[row]?.[col]

      // Select existing modules or place new ones
      if (cell && cell.type !== "empty" && cell.type !== "ghost") {
        setSelectedCell({ row, col })
        return
      }

      if (!selectedTool || selectedTool === "empty") {
        placeModule(row, col, "ghost")
      } else {
        placeModule(row, col, selectedTool)
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
      const limitedRows = Math.min(Math.max(1, newRows), 8)

      // Pass columnWidths to updateGhostCells when resizing
      const { grid: newGrid, columnWidths: newColumnWidths } = updateGhostCells(
        Array.from({ length: limitedRows }, (_, rowIndex) =>
          Array.from({ length: newCols }, (_, colIndex) => {
            // Create a placeholder grid for updateGhostCells
            // This might need a more sophisticated approach if we want to preserve existing content precisely
            if (rowIndex < config.rows && colIndex < config.columns) {
              return config.grid[rowIndex][colIndex]
            }
            return {
              id: `cell-${rowIndex}-${colIndex}`,
              type: "empty" as const,
              row: rowIndex,
              col: colIndex,
            }
          }),
        ),
        Array.from({ length: newCols }, () => defaultNewColumnWidth), // Default to the selected default width
      )

      const newRowHeights = [...config.rowHeights]
      while (newRowHeights.length < limitedRows) newRowHeights.push(38)
      while (newRowHeights.length > limitedRows) newRowHeights.pop()

      const prunedCellStyles = pruneCellStylesMemo(config.cellStyles || {}, limitedRows, newCols)

      const newConfig = {
        ...config,
        grid: newGrid,
        columns: newCols,
        rows: limitedRows,
        columnWidths: newColumnWidths as (75 | 38)[],
        rowHeights: newRowHeights,
        cellStyles: prunedCellStyles,
      }
      setTimeout(() => saveToHistory(newConfig), 0)
      setConfig(newConfig)
    },
    [
      saveToHistory,
      pruneCellStylesMemo,
      config,
      config.rows,
      config.columns,
      config.grid,
      config.cellStyles,
      config.rowHeights,
      defaultNewColumnWidth,
    ],
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
      // Changed type to number for colIndex
      setConfig((prev) => {
        const newWidths = [...prev.columnWidths]
        newWidths[colIndex] = width

        const widthInCm = width === 75 ? 80 : 40
        const newGrid = prev.grid.map((row) =>
          row.map((cell, ci) => {
            if (ci === colIndex && cell.type !== "empty" && cell.type !== "ghost") {
              // Check if current module type is compatible with new width
              if (!isModuleTypeAvailableForWidth(cell.type, widthInCm)) {
                return { ...cell, type: "mit-rueckwand" as const }
              }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, columnWidths: newWidths as (75 | 38)[], grid: newGrid }
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
      cellStyles: {} as CellStyles,
    }
    setConfig(newConfig)
    // Use resetHistory hook instead of manual history manipulation
    resetHistory()
    setSelectedTool("offenes-fach")
    setSelectedColor("weiss")
    setSelectedCell(null)
    setToolMode("select") // Reset tool mode
    
    // Reset camera to focus on ghost sphere at initial position (center of first module)
    // Initial grid has 1 row with height 38cm = 0.38m, so center is at y = 0.19m
    const initialTargetY = 0.38 / 2 // Center of the first 38cm row
    setCameraTarget([0, initialTargetY, 0])
    
    // Also reset OrbitControls to initial state
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.set(0, initialTargetY, 0)
      orbitControlsRef.current.update()
    }
  }, [resetHistory])

  type BomItem = {
    id: string
    name: string
    quantity: number
    pricePerUnit: number
    total: number
    packSize?: number // e.g., 9 or 11 pieces per pack
    totalPieces?: number // quantity * packSize
  }

  const calculateBOM = useCallback((): { items: BomItem[]; totalPrice: number } => {
    const itemMap = new Map<string, BomItem>()

    const addItem = (id: string, name: string, quantity: number, pricePerUnit: number, packSize?: number) => {
      if (!id || id.trim() === "") return

      const existing = itemMap.get(id)
      if (existing) {
        existing.quantity += quantity
        existing.total = existing.quantity * pricePerUnit
        if (packSize && existing.packSize) {
          existing.totalPieces = existing.quantity * packSize
        }
      } else {
        const newItem: BomItem = {
          id,
          name,
          quantity,
          pricePerUnit,
          total: quantity * pricePerUnit,
          packSize,
          totalPieces: packSize ? quantity * packSize : undefined,
        }
        itemMap.set(id, newItem)
      }
    }

    // Collect all non-empty, non-ghost cells
    const filledCells: Array<{ row: number; col: number; cell: GridCell }> = []
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          filledCells.push({ row, col, cell })
        }
      }
    }

    if (filledCells.length === 0) {
      return { items: [], totalPrice: 0 }
    }

    const columnsWithModules = new Set<number>()
    for (const { col } of filledCells) {
      columnsWithModules.add(col)
    }
    const activeColumns = Array.from(columnsWithModules).sort((a, b) => a - b)

    // Calculate column heights only for active columns
    const columnMaxRows: Map<number, number> = new Map()
    for (let col = 0; col < config.columns; col++) {
      let maxRow = -1
      for (let row = 0; row < config.rows; row++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          maxRow = Math.max(maxRow, row)
        }
      }
      if (maxRow >= 0) {
        columnMaxRows.set(col, maxRow)
      }
    }

    // --- LEITERN (Ladders) ---
    const leiterCounts: Record<string, { artNr: string; name: string; price: number; count: number }> = {}

    if (activeColumns.length > 0) {
      // Group adjacent columns together
      const columnGroups: number[][] = []
      let currentGroup: number[] = [activeColumns[0]]

      for (let i = 1; i < activeColumns.length; i++) {
        if (activeColumns[i] === activeColumns[i - 1] + 1) {
          currentGroup.push(activeColumns[i])
        } else {
          columnGroups.push(currentGroup)
          currentGroup = [activeColumns[i]]
        }
      }
      columnGroups.push(currentGroup)

      let totalAufbaumodule = 0

      // For each group of adjacent columns, add ladders at boundaries
      for (const group of columnGroups) {
        // For a group of n columns, we need n+1 ladder positions
        for (let i = 0; i <= group.length; i++) {
          const leftCol = i > 0 ? group[i - 1] : -1
          const rightCol = i < group.length ? group[i] : -1

          const leftMaxRow = leftCol >= 0 ? (columnMaxRows.get(leftCol) ?? -1) : -1
          const rightMaxRow = rightCol >= 0 ? (columnMaxRows.get(rightCol) ?? -1) : -1
          const maxRow = Math.max(leftMaxRow, rightMaxRow)

          if (maxRow >= 0) {
            const totalHeightCm = (maxRow + 1) * 40

            if (totalHeightCm <= 200) {
              // Normal height - just use appropriate ladder
              const leiterInfo = getLeiterArtNr(totalHeightCm)
              if (leiterInfo && leiterInfo.artNr) {
                const key = leiterInfo.artNr
                if (!leiterCounts[key]) {
                  leiterCounts[key] = { ...leiterInfo, count: 0 }
                }
                leiterCounts[key].count++
              }
            } else {
              const leiter200Key = "SIM005"
              if (!leiterCounts[leiter200Key]) {
                leiterCounts[leiter200Key] = { artNr: "SIM005", name: "Leiter 200", price: 41.0, count: 0 }
              }
              leiterCounts[leiter200Key].count++

              // Calculate Aufbaumodule needed for this position
              const extraHeight = totalHeightCm - 200
              const aufbaumoduleForPosition = Math.ceil(extraHeight / 40)
              totalAufbaumodule += aufbaumoduleForPosition
            }
          }
        }
      }

      if (totalAufbaumodule > 0) {
        const aufbaumodulKey = "SIM001a"
        if (!leiterCounts[aufbaumodulKey]) {
          leiterCounts[aufbaumodulKey] = { artNr: "SIM001a", name: "Aufbaumodul", price: 15.0, count: 0 }
        }
        leiterCounts[aufbaumodulKey].count = totalAufbaumodule
      }
    }

    // Add all leitern to BOM
    for (const [artNr, data] of Object.entries(leiterCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- STANGENSETS (Bar sets) ---
    // For 2 columns with 7 rows each (14 cells total), we need:
    // - Each cell needs top + bottom bars, but shared bars are counted once
    // - For n rows in a column: (n+1) stangensets (one per horizontal level)
    // - For 7 rows: 8 stangensets per column, 2 columns = 16 stangensets
    let stangenset40Count = 0
    let stangenset80Count = 0

    for (const col of activeColumns) {
      const widthCm = config.columnWidths[col] === 75 ? 80 : 40
      // Count filled rows in this column
      let filledRowsInColumn = 0
      for (let row = 0; row < config.rows; row++) {
        const cell = config.grid[row]?.[col]
        if (cell && cell.type !== "empty" && cell.type !== "ghost") {
          filledRowsInColumn++
        }
      }

      // For n filled rows in a column, we need n+1 horizontal bars (top of bottom cell + each cell boundary + top of top cell)
      // But the formula is actually: (filledRows + 1) stangensets per column
      // However, based on expected output: 2 columns x 7 rows = 16 stangensets 80
      // That's (7 + 1) * 2 = 16, but that seems too simple
      // Actually: each cell needs 2 bars, but adjacent cells share 1 bar
      // So for 7 cells in a column: 7*2 - 6 = 8 bars per column, 2 columns = 16 bars
      const barsInColumn = filledRowsInColumn > 0 ? filledRowsInColumn + 1 : 0

      if (widthCm === 40) {
        stangenset40Count += barsInColumn
      } else {
        stangenset80Count += barsInColumn
      }
    }

    if (stangenset40Count > 0) {
      addItem("SIM006", "Stangenset 40", stangenset40Count, 8.0)
    }
    if (stangenset80Count > 0) {
      addItem("SIM007", "Stangenset 80", stangenset80Count, 12.0)
    }

    // --- FLÄCHENSETS (Surface sets) ---
    // Rules:
    // Flächenset 80: For horizontal surfaces (shelves) - ONLY for 80cm columns
    // Flächenset 40: For horizontal surfaces (shelves) - ONLY for 40cm columns
    //   + Side panels on outer edges for modules that need them
    // SPECIAL: 80cm Klapptür nach oben has 2 additional side panels (40cm) that fold up

    // This replaces the column-based color assignment with per-cell color tracking
    const panels40cmByColorPerCell: Record<string, number> = {}
    const panels80cmByColorPerCell: Record<string, number> = {}

    // Count horizontal panels (floor/ceiling) per cell
    for (const { cell, row, col } of filledCells) {
      const cellColor = cell.color || "weiss" // Default to 'weiss' if color is not set
      const widthCm =
        config.columnWidths[col] === 75 ? 80 : config.columnWidths[col] === 38 ? 40 : config.columnWidths[col]

      // Check if the cell is the bottom-most in its column or if the cell below is empty/ghost
      const isBottomCell = row === 0 || filledCells.every((c) => c.col !== col || c.row < row)

      let horizontalPanels = 0
      if (isBottomCell) {
        horizontalPanels += 1 // Floor for the bottom-most module
      }
      horizontalPanels += 1 // Ceiling for every module

      if (widthCm === 40) {
        panels40cmByColorPerCell[cellColor] = (panels40cmByColorPerCell[cellColor] || 0) + horizontalPanels
      } else {
        panels80cmByColorPerCell[cellColor] = (panels80cmByColorPerCell[cellColor] || 0) + horizontalPanels
      }

      // Count backwall panels
      const modulesWithBackwall = [
        "mit-rueckwand",
        "ohne-seitenwaende",
        "abschliessbare-tueren",
        "abschliessbar-links",
        "abschliessbar-rechts",
        "mit-tuere-links",
        "mit-tuere-rechts",
        "mit-klapptuer",
        "mit-doppelschublade",
        "mit-klapptuer-oben",
        "mit-einzelschublade",
        "mit-tueren",
      ]
      if (modulesWithBackwall.includes(cell.type)) {
        if (widthCm === 40) {
          panels40cmByColorPerCell[cellColor] = (panels40cmByColorPerCell[cellColor] || 0) + 1
        } else {
          panels80cmByColorPerCell[cellColor] = (panels80cmByColorPerCell[cellColor] || 0) + 1
        }
      }

      // Count side wall panels (always 40cm)
      const modulesWithSideWalls = [
        "mit-tueren",
        "mit-klapptuer",
        "mit-klapptuer-oben",
        "mit-rueckwand",
        "ohne-rueckwand",
        "abschliessbar",
        "abschliessbare-tueren",
        "abschliessbar-links",
        "mit-tuere-links",
        "mit-tuere-rechts",
        "abschliessbar-rechts",
        "mit-einzelschublade",
        "mit-doppelschublade",
      ]
      // Modules with Funktionswand only on LEFT side (hinge/mechanism on left)
      const modulesWithFunktionswandLeft = [
        "mit-tuere-links",
        "abschliessbar-rechts", // Lock is right, so hinge/Funktionswand is LEFT
      ]
      // Modules with Funktionswand only on RIGHT side (hinge/mechanism on right)
      const modulesWithFunktionswandRight = [
        "mit-tuere-rechts",
        "abschliessbar-links", // Lock is left, so hinge/Funktionswand is RIGHT
      ]
      // Modules with Funktionswand on both sides
      const modulesWithFunktionswandBothSides = [
        "mit-tueren",
        "mit-klapptuer",
        "mit-klapptuer-oben",
        "abschliessbare-tueren",
        "mit-doppelschublade",
        "mit-einzelschublade",
      ]

      // Helper to check if module has Funktionswand on a specific side
      const hasFunktionswandOnSide = (moduleType: string, side: "left" | "right"): boolean => {
        if (modulesWithFunktionswandBothSides.includes(moduleType)) return true
        if (side === "left") return modulesWithFunktionswandLeft.includes(moduleType)
        if (side === "right") return modulesWithFunktionswandRight.includes(moduleType)
        return false
      }

      if (modulesWithSideWalls.includes(cell.type)) {
        // 2 side walls per module, check for shared walls with neighbors
        let sideWalls = 0
        const leftNeighbor = filledCells.find((c) => c.col === col - 1 && c.row === row)
        const rightNeighbor = filledCells.find((c) => c.col === col + 1 && c.row === row)

        const thisHasFunktionswandLeft = hasFunktionswandOnSide(cell.type, "left")
        const thisHasFunktionswandRight = hasFunktionswandOnSide(cell.type, "right")
        const leftNeighborHasFunktionswandRight =
          leftNeighbor && hasFunktionswandOnSide(leftNeighbor.cell.type, "right")
        const rightNeighborHasFunktionswandLeft =
          rightNeighbor && hasFunktionswandOnSide(rightNeighbor.cell.type, "left")

        // LEFT side wall logic
        if (!leftNeighbor || !modulesWithSideWalls.includes(leftNeighbor.cell.type)) {
          // No left neighbor with side walls - count this wall
          sideWalls += 1
        } else if (leftNeighbor && modulesWithSideWalls.includes(leftNeighbor.cell.type)) {
          // Left neighbor has side walls - check if BOTH have Funktionswand on shared side
          if (thisHasFunktionswandLeft && leftNeighborHasFunktionswandRight) {
            // Both have Funktionswand on shared side - no panel needed
          } else {
            // At least one doesn't have Funktionswand - left module owns the shared panel
          }
        }

        // RIGHT side wall logic - this module owns the right wall
        if (!rightNeighbor || !modulesWithSideWalls.includes(rightNeighbor.cell.type)) {
          // No right neighbor with side walls - count this wall
          sideWalls += 1
        } else if (rightNeighbor && modulesWithSideWalls.includes(rightNeighbor.cell.type)) {
          // Right neighbor has side walls - check if BOTH have Funktionswand on shared side
          if (thisHasFunktionswandRight && rightNeighborHasFunktionswandLeft) {
            // Both have Funktionswand on shared side - no panel needed
          } else {
            // At least one doesn't have Funktionswand - this module owns the shared panel
            sideWalls += 1
          }
        }

        panels40cmByColorPerCell[cellColor] = (panels40cmByColorPerCell[cellColor] || 0) + sideWalls
      }
    }

    // --- FLÄCHENSETS (Surface sets) ---
    // Combine panel counts and calculate sets
    const flaechenset40Counts: Record<string, number> = {}
    const flaechenset80Counts: Record<string, number> = {}

    // Calculate Flächenset 40 from panels40cmByColorPerCell
    for (const [colorKey, panelCount] of Object.entries(panels40cmByColorPerCell)) {
      if (panelCount > 0) {
        const setsNeeded = Math.ceil(panelCount / 2) // Each set covers 2 panels
        flaechenset40Counts[colorKey] = (flaechenset40Counts[colorKey] || 0) + setsNeeded
      }
    }

    // Add Flächenset 40 products
    for (const [colorKey, count] of Object.entries(flaechenset40Counts)) {
      if (count > 0) {
        const colorLabel = getColorLabel(colorKey) // Use imported helper
        const artNr = getFlaechensetArtNr(40, colorKey)
        const product = flaechensets.find((p) => p.artNr === artNr)
        addItem(artNr, `Flächenset 40 ${colorLabel}`, count, product?.price || 15.0)
      }
    }

    // Calculate Flächenset 80 from panels80cmByColorPerCell
    for (const [colorKey, panelCount] of Object.entries(panels80cmByColorPerCell)) {
      if (panelCount > 0) {
        const setsNeeded = Math.ceil(panelCount / 2) // Each set covers 2 panels
        flaechenset80Counts[colorKey] = (flaechenset80Counts[colorKey] || 0) + setsNeeded
      }
    }

    // Add Flächenset 80 products
    for (const [colorKey, count] of Object.entries(flaechenset80Counts)) {
      if (count > 0) {
        const colorLabel = getColorLabel(colorKey) // Use imported helper
        const artNr = getFlaechensetArtNr(80, colorKey)
        const product = flaechensets.find((p) => p.artNr === artNr)
        addItem(artNr, `Flächenset 80 ${colorLabel}`, count, product?.price || 22.0)
      }
    }

    // --- SCHUBLADEN (Drawers) ---
    const schubladenCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of filledCells) {
      if (cell.type === "mit-doppelschublade") {
        const color = cell.color || "weiss"
        const artNr = getSchubladeArtNr(color)
        const colorLabel = getColorLabel(color) // Use imported helper
        const name = `Doppelschublade ${colorLabel}`

        if (!schubladenCounts[artNr]) {
          schubladenCounts[artNr] = { count: 0, name, price: 85.0 }
        }
        schubladenCounts[artNr].count++
      }
    }

    for (const [artNr, data] of Object.entries(schubladenCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- TÜREN (Doors) ---
    const tuerenCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of filledCells) {
      if (
        cell.type === "mit-tueren" ||
        cell.type === "abschliessbare-tueren" ||
        cell.type === "mit-tuere-links" ||
        cell.type === "mit-tuere-rechts" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "abschliessbar-rechts"
      ) {
        const color = cell.color || "weiss"
        const artNr = getTuerArtNr(color)
        const colorLabel = getColorLabel(color) // Use imported helper
        const name = `Tür 40 cm ${colorLabel}`

        if (!tuerenCounts[artNr]) {
          tuerenCounts[artNr] = { count: 0, name, price: 45.0 }
        }
        // 80cm modules have 2 doors, 40cm modules have 1 door
        if (
          cell.type === "mit-tuere-links" ||
          cell.type === "mit-tuere-rechts" ||
          cell.type === "abschliessbar-links" ||
          cell.type === "abschliessbar-rechts"
        ) {
          tuerenCounts[artNr].count += 1
        } else {
          tuerenCounts[artNr].count += 2
        }
      }
    }

    for (const [artNr, data] of Object.entries(tuerenCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- SCHLÖSSER (Locks) ---
    let lockCount = 0
    for (const { cell } of filledCells) {
      if (
        cell.type === "abschliessbare-tueren" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "abschliessbar-rechts"
      ) {
        lockCount++
      }
    }
    if (lockCount > 0) {
      addItem("SIM1000a", "Schloss Typ A", lockCount, 25.0)
    }

    // --- KLAPPTÜREN (Flap doors - nach unten öffnend) ---
    const klapptuerCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of filledCells) {
      if (cell.type === "mit-klapptuer") {
        const color = cell.color || "weiss"
        const artNr = getKlapptuerArtNr(color)
        const colorLabel = getColorLabel(color) // Use imported helper
        const name = `Klapptür ${colorLabel}`

        if (!klapptuerCounts[artNr]) {
          klapptuerCounts[artNr] = { count: 0, name, price: 65.0 }
        }
        klapptuerCounts[artNr].count++
      }
    }

    for (const [artNr, data] of Object.entries(klapptuerCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- KLAPPTÜREN NACH OBEN (Upward-opening flip doors) ---
    const klapptuerObenCounts: Record<string, { count: number; name: string; price: number }> = {}
    let totalGasdruckdaempfer = 0

    for (const { cell } of filledCells) {
      if (cell.type === "mit-klapptuer-oben") {
        const color = cell.color || "weiss"
        const artNr = getKlapptuerObenArtNr(color)
        const colorLabel = getColorLabel(color) // Use imported helper
        const name = `Klapptür ${colorLabel} (nach oben)`

        if (!klapptuerObenCounts[artNr]) {
          klapptuerObenCounts[artNr] = { count: 0, name, price: 65.0 }
        }
        klapptuerObenCounts[artNr].count++
        // Each upward-opening flip door requires 2 gas dampers (for Warenwirtschaft only)
        totalGasdruckdaempfer += 2
      }
    }

    for (const [artNr, data] of Object.entries(klapptuerObenCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    const einzelschubladeCounts: Record<string, { count: number; name: string; price: number }> = {}

    for (const { cell } of filledCells) {
      if (cell.type === "mit-einzelschublade") {
        const color = cell.color || "weiss"
        const artNr = `ES-${getEinzelschubladeArtNr(color)}` // Prefix to differentiate from Klapptür oben
        const colorLabel = getColorLabel(color) // Use imported helper
        const name = `Einzelschublade ${colorLabel}`

        if (!einzelschubladeCounts[artNr]) {
          einzelschubladeCounts[artNr] = { count: 0, name, price: 55.0 }
        }
        einzelschubladeCounts[artNr].count++
      }
    }

    for (const [artNr, data] of Object.entries(einzelschubladeCounts)) {
      addItem(artNr, data.name, data.count, data.price)
    }

    // --- FUNKTIONSWÄNDE (Back panels) ---
    let funktionswandCount = 0

    for (const { col, cell } of filledCells) {
      const widthCm = config.columnWidths[col] === 75 ? 80 : config.columnWidths[col] === 38 ? 40 : config.columnWidths[col]

      if (
        cell.type === "mit-tueren" ||
        cell.type === "mit-doppelschublade" ||
        cell.type === "abschliessbare-tueren" ||
        cell.type === "mit-klapptuer" ||
        cell.type === "mit-klapptuer-oben" ||
        cell.type === "mit-tuere-links" ||
        cell.type === "mit-tuere-rechts" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "abschliessbar-rechts" ||
        cell.type === "mit-einzelschublade"
      ) {
        if (
          widthCm === 40 &&
          (cell.type === "mit-tuere-links" ||
            cell.type === "mit-tuere-rechts" ||
            cell.type === "abschliessbar-links" ||
            cell.type === "abschliessbar-rechts")
        ) {
          funktionswandCount += 1 // 40cm door module = 1 Funktionswand
        } else {
          funktionswandCount += 2 // 80cm module = 2 Funktionswände
        }
      }
    }

    if (funktionswandCount > 0) {
      addItem("SIM023", "Funktionswand Edelstahl", funktionswandCount, 35.0)
    }

    const cellsForDebug = config.grid.flatMap((row, ri) =>
      row.map((cell, ci) => ({
        row: ri,
        col: ci,
        cell: cell,
      })),
    )

    // Convert map to array and calculate total
    const itemsArray = Array.from(itemMap.values())
    const totalPrice = itemsArray.reduce((sum, item) => sum + item.total, 0)

    return { items: itemsArray, totalPrice }
  }, [config])

  const gridHash = useMemo(() => {
    return JSON.stringify({
      grid: config.grid.map((row) => row.map((cell) => ({ type: cell.type, color: cell.color }))),
      columns: config.columns,
      rows: config.rows,
      columnWidths: config.columnWidths,
      rowHeights: config.rowHeights,
    })
  }, [config.grid, config.columns, config.rows, config.columnWidths, config.rowHeights])

  const bomData = useMemo(() => {
    const result = calculateBOM()
    const transformedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      total: item.total,
      packSize: item.packSize,
      totalPieces: item.totalPieces,
    }))
    // Filter out Gasdruckdämpfer from customer-facing BOM
    const filteredItems = transformedItems.filter((item) => item.id !== "SIM033")
    const filteredTotalPrice = filteredItems.reduce((sum, item) => sum + item.total, 0)
    return { items: filteredItems, totalPrice: filteredTotalPrice }
  }, [gridHash])

  function InvalidateOnChange({ gridHash }: { gridHash: string }) {
    const { invalidate } = useThree()
    useEffect(() => {
      invalidate()
    }, [gridHash, invalidate])
    return null
  }

  const toggleDefaultColumnWidth = () => {
    setDefaultNewColumnWidth((prev) => (prev === 75 ? 38 : 75))
  }

  if (isLoading) {
    return <LoadingAnimation onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#1a1a1a]">
      <ConfiguratorHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          {showVideoPreview && presetYoutubeId && (
            <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-50 w-32 sm:w-48 h-20 sm:h-32 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
              <button
                onClick={() => setShowVideoPreview(false)}
                className="absolute top-1 right-1 z-10 w-5 h-5 sm:w-6 sm:h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${presetYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${presetYoutubeId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full object-cover pointer-events-none"
                style={{ border: "none" }}
              />
            </div>
          )}

          <Canvas3DErrorBoundary>
            <Canvas
              shadows={true}
              camera={{ position: [0, 0.4, 2.5], fov: 50 }}
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.0,
                failIfMajorPerformanceCaveat: false,
              }}
dpr={[1, 2]}
                frameloop="always"
                performance={{ min: 0.5 }}
              onCreated={(state) => {
                // Ensure WebGL context is properly initialized
                state.gl.setClearColor("#f5f5f5", 1)
              }}
            >
              <color attach="background" args={["#f5f5f5"]} />
              <fog attach="fog" args={["#f5f5f5", 6, 20]} />

              {/* Flat lighting for true panel colors */}
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[2, 5, 3]}
                intensity={0.35}
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
              <directionalLight position={[-2, 3, 1]} intensity={0.15} />
              
              {/* Environment only for chrome reflections */}
              <Environment preset="studio" background={false} />

              <Suspense
                fallback={
                  <mesh>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshBasicMaterial color="#e0e0e0" />
                  </mesh>
                }
              >
                <InvalidateOnChange gridHash={JSON.stringify(config.grid)} />
                <ShelfScene
                  config={config}
                  selectedTool={selectedTool}
                  hoveredCell={hoveredCell}
                  onCellClick={handleCellClick3D}
                  onCellHover={setHoveredCell}
                  selectedCell={selectedCell}
                />
              </Suspense>

              <OrbitControls
                ref={orbitControlsRef}
                makeDefault
                target={initialCameraTarget}
                minPolarAngle={0.3}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={1}
                maxDistance={8}
                enableDamping
                dampingFactor={0.05}
                maxAzimuthAngle={Infinity}
                minAzimuthAngle={-Infinity}
                enablePan={true}
                panSpeed={0.8}
                screenSpacePanning={true}
                onChange={(e) => {
                  // Prevent camera target from going below floor (y < 0)
                  if (e && e.target) {
                    const controls = e.target as OrbitControlsImpl
                    if (controls.target.y < 0) {
                      controls.target.y = 0
                    }
                  }
                }}
              />
              <CameraController target={cameraTarget} controlsRef={orbitControlsRef} initialTarget={initialCameraTarget} />
            </Canvas>
          </Canvas3DErrorBoundary>

          {/* CHANGE: Added camera controls info box in top left corner */}
          <div className="absolute left-2 sm:left-4 top-2 sm:top-4 z-10">
            {/* Desktop version - visible info box */}
            <div className="hidden sm:block bg-black/70 backdrop-blur-sm rounded-lg border border-neutral-700 p-3 text-xs text-white">
              <div className="font-medium mb-2 text-teal-400">Kamerasteuerung</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-3.5 w-3.5 text-teal-400" />
                  <span>Linksklick + Ziehen = Drehen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Move className="h-3.5 w-3.5 text-teal-400" />
                  <span>Rechtsklick + Ziehen = Verschieben</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomIn className="h-3.5 w-3.5 text-teal-400" />
                  <span>Mausrad = Zoomen</span>
                </div>
              </div>
            </div>

            {/* Mobile version - compact help button with tooltip */}
            <div className="sm:hidden group relative">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg border border-neutral-700 p-2">
                <HelpCircle className="h-5 w-5 text-teal-400" />
              </div>
              <div className="absolute left-0 top-full mt-1 bg-black/90 backdrop-blur-sm rounded-lg border border-neutral-700 p-3 text-xs text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto min-w-[180px] z-20">
                <div className="font-medium mb-2 text-teal-400">Kamerasteuerung</div>
                <div className="space-y-1.5">
                  <div>1 Finger = Drehen</div>
                  <div>2 Finger = Verschieben/Zoomen</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-2 sm:right-4 top-2 sm:top-4 flex gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              className="h-9 w-9 sm:h-10 sm:w-10 bg-black/70 border-neutral-700 hover:bg-black/90 disabled:opacity-30"
              title="Rückgängig (Undo)"
            >
              <Undo2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              className="h-9 w-9 sm:h-10 sm:w-10 bg-black/70 border-neutral-700 hover:bg-black/90 disabled:opacity-30"
              title="Wiederholen (Redo)"
            >
              <Redo2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="h-9 w-9 sm:h-10 sm:w-10 bg-black/70 border-neutral-700 hover:bg-black/90 hover:border-red-500"
              title="Zurücksetzen (Reset)"
            >
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
            <div className="hidden sm:block">
              <ConfiguratorHelpBot />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/70 px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-300 hidden md:block">
            {selectedTool ? (
              <span>
                Ausgewählt:{" "}
                <span className="font-semibold text-blue-400">
                  {selectedTool === "empty" ? "Radierer" : getModuleLabel(selectedTool)}{" "}
                  {/* Changed to getModuleLabel */}
                </span>{" "}
                | Klicke auf Zellen im 3D-Regal
              </span>
            ) : (
              "Wähle ein Modul aus der rechten Seite"
            )}
          </div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white">
            <div className="flex items-center gap-4">
              <span>
                Breite:{" "}
                <span className="font-semibold text-teal-400">
                  {(() => {
                    // Calculate total width from columns that have at least one non-ghost module
                    let totalWidth = 0
                    for (let col = 0; col < config.columns; col++) {
                      const hasModule = config.grid.some(
                        (row, rowIndex) => row[col] && row[col].type !== "ghost" && row[col].type !== "empty",
                      )
                      if (hasModule) {
                        const colWidth = config.columnWidths?.[col] ?? 75
                        totalWidth += colWidth === 75 ? 80 : 40
                      }
                    }
                    return totalWidth
                  })()} cm
                </span>
              </span>
              <span className="text-neutral-500">|</span>
              <span>
                Höhe:{" "}
                <span className="font-semibold text-teal-400">
                  {(() => {
                    // Calculate total height from rows that have at least one non-ghost module
                    let totalHeight = 0
                    for (let row = 0; row < config.rows; row++) {
                      const hasModule = config.grid[row]?.some(
                        (cell) => cell && cell.type !== "ghost" && cell.type !== "empty",
                      )
                      if (hasModule) {
                        totalHeight += config.rowHeights?.[row] ?? 40
                      }
                    }
                    return totalHeight
                  })()} cm
                </span>
              </span>
            </div>
          </div>

          {/* Color selection UI */}
          {selectedCell && (
            <div className="absolute left-4 top-24 rounded-lg bg-black/70 px-3 py-2">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-bold text-white">Farbe auswählen</div>
                <div className="flex flex-wrap gap-1">
                  {["weiss", "schwarz", "blau", "gruen", "gelb", "orange", "red"].map((color) => (
                    <button
                      key={color}
                      className={`h-6 w-6 rounded-full border-2 ${
                        config.cellStyles?.[getCellId(selectedCell.row, selectedCell.col)]?.color === color
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: getColorHex(color) }} // Use imported helper
                      onClick={() => {
                        applyCellColor(selectedCell.row, selectedCell.col, color as ColorKey)
                        setSelectedCell(null) // Close color picker after selection
                      }}
                    />
                  ))}
                </div>
                <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => {
                    clearCellColor(selectedCell.row, selectedCell.col)
                    setSelectedCell(null) // Close color picker
                  }}
                >
                  Farbe löschen
                </button>
                <button
                  className="text-sm text-gray-300 hover:underline"
                  onClick={() => setSelectedCell(null)} // Close color picker
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Height Warning */}
          {showHeightWarning && (
            <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>Die Regalhöhe überschreitet 200 cm.</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHeightWarning(false)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <ConfiguratorPanel
            config={config}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            selectedCell={selectedCell}
            onSelectTool={setSelectedTool}
            onSelectColor={setSelectedColor}
            onPlaceModule={placeModule} // Renamed to handlePlaceModule in updates
            onClearCell={clearCell} // Renamed to handleClearCell in updates
            onResizeGrid={resizeGrid} // Renamed to handleResizeGrid in updates
            onSetColumnWidth={setColumnWidth} // Renamed to handleSetColumnWidth in updates
            onSetRowHeight={setRowHeight} // Renamed to handleSetRowHeight in updates
            onUpdateConfig={updateConfig} // Renamed to handleUpdateConfig in updates
            shoppingList={bomData.items}
            price={bomData.totalPrice}
            showShoppingList={showShoppingList}
            onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
            onApplyCellColor={applyCellColor} // Renamed to handleApplyCellColor in updates
            onApplyColorToRow={applyColorToRow} // Renamed to handleApplyColorToRow in updates
            onApplyColorToColumn={applyColorToColumn} // Renamed to handleApplyColorToColumn in updates
            onApplyColorToAll={applyColorToAll} // Renamed to handleApplyColorToAll in updates
            onClearCellColor={clearCellColor} // Renamed to handleClearCellColor in updates
            onDeselectCell={() => setSelectedCell(null)}
            defaultNewColumnWidth={defaultNewColumnWidth}
            onSetDefaultColumnWidth={setDefaultNewColumnWidth}
          />
        </div>

        <div className="lg:hidden">
          <MobileConfiguratorNav
            config={config}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            onSelectTool={(tool) => {
              setSelectedTool(tool)
              setSelectedCell(null)
            }}
            onSelectColor={setSelectedColor}
            onUpdateConfig={updateConfig}
            shoppingList={bomData.items}
            price={bomData.totalPrice}
            defaultNewColumnWidth={defaultNewColumnWidth}
            onSetDefaultColumnWidth={setDefaultNewColumnWidth}
          />
        </div>
      </div>
    </div>
  )
}

// Function to get the user-friendly name of a module type
// Removed local getModuleName, getToolLabel, getColorHex, getColorLabel, COLOR_LABEL_MAP - now imported
function getModuleName(type: GridCell["type"]) {
  const moduleNames: Record<GridCell["type"], string> = {
    empty: "Leer",
    ghost: "Geisterzelle",
    "offenes-fach": "Offenes Fach",
    "ohne-seitenwaende": "Offenes Fach",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-klapptuer-oben": "Klapptür (nach oben)",
    "mit-doppelschublade": "Mit Schubladen",
    "abschliessbare-tueren": "Abschließbar",
    "mit-tuere-rechts": "Mit Türen (rechts)",
    "mit-tuere-links": "Mit Türen (links)",
    "abschliessbar-rechts": "Abschließbar (rechts)",
    "abschliessbar-links": "Abschließbar (links)",
    "mit-einzelschublade": "Mit Einzelschublade",
    klapptuer: "Klapptür",
  }
  return moduleNames[type] ?? getModuleLabel(type)
}

function getToolLabel(tool: GridCell["type"]): string {
  const labels: Record<GridCell["type"], string> = {
    empty: "Leer",
    ghost: "Geisterzelle",
    "offenes-fach": "Offenes Fach",
    "ohne-seitenwaende": "Offenes Fach",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-klapptuer-oben": "Klapptür (nach oben)",
    "mit-doppelschublade": "Mit Schubladen",
    "abschliessbare-tueren": "Abschließbar",
    "mit-tuere-rechts": "Mit Türen (rechts)",
    "mit-tuere-links": "Mit Türen (links)",
    "abschliessbar-rechts": "Abschließbar (rechts)",
    "abschliessbar-links": "Abschließbar (links)",
    klapptuer: "Klapptür",
    "mit-einzelschublade": "Mit Einzelschublade",
  }
  return labels[tool] ?? getModuleShortLabel(tool)
}
