"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { ConfiguratorPanel } from "./configurator-panel"
import { ShelfScene } from "./shelf-scene"
import { ConfiguratorHeader } from "./configurator-header"
import { Undo2, Redo2, RotateCcw, Plus } from "lucide-react"
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

export type Column = {
  width: 75 | 38
  cells: GridCell[]
}

export type ShelfConfig = {
  columns: Column[]
  rowHeight: 38 | 76
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

const createInitialColumns = (): Column[] => {
  return [
    {
      width: 75,
      cells: [
        { id: "cell-0-0", type: "empty", row: 0, col: 0 },
        { id: "cell-0-1", type: "empty", row: 1, col: 0 },
      ],
    },
    {
      width: 75,
      cells: [
        { id: "cell-1-0", type: "empty", row: 0, col: 1 },
        { id: "cell-1-1", type: "empty", row: 1, col: 1 },
      ],
    },
    {
      width: 75,
      cells: [
        { id: "cell-2-0", type: "empty", row: 0, col: 2 },
        { id: "cell-2-1", type: "empty", row: 1, col: 2 },
      ],
    },
  ]
}

const initialConfig: ShelfConfig = {
  columns: createInitialColumns(),
  rowHeight: 38,
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
  const [hoveredExpansionZone, setHoveredExpansionZone] = useState<{
    type: "top" | "left" | "right"
    col?: number
  } | null>(null)
  const [history, setHistory] = useState<ShelfConfig[]>([initialConfig])
  const [historyIndex, setHistoryIndex] = useState<number>(0)
  const isUndoRedo = useRef<boolean>(false)

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
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx === col) {
            const newCells = column.cells.map((cell) => {
              if (cell.row === row) {
                const cellColor = cell.color || (prev.accentColor !== "none" ? prev.accentColor : prev.baseColor)
                return { ...cell, type, color: type !== "empty" ? cellColor : undefined }
              }
              return cell
            })
            return { ...column, cells: newCells }
          }
          return column
        })
        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const updateCellColor = useCallback(
    (row: number, col: number, color: GridCell["color"]) => {
      setConfig((prev) => {
        const newColumns = prev.columns.map((column, colIdx) => {
          if (colIdx === col) {
            const newCells = column.cells.map((cell) => {
              if (cell.row === row && cell.type !== "empty") {
                return { ...cell, color }
              }
              return cell
            })
            return { ...column, cells: newCells }
          }
          return column
        })
        const newConfig = { ...prev, columns: newColumns }
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
        const currentType = config.columns[col]?.cells.find((c) => c.row === row)?.type
        if (currentType === "empty") {
          placeModule(row, col, "ohne-seitenwaende")
          setSelectedCell({ row, col })
        } else {
          setSelectedCell({ row, col })
        }
      }
    },
    [selectedTool, placeModule, config.columns],
  )

  const clearCell = useCallback(
    (row: number, col: number) => {
      placeModule(row, col, "empty")
    },
    [placeModule],
  )

  const addCellToColumn = useCallback(
    (colIndex: number) => {
      setConfig((prev) => {
        const column = prev.columns[colIndex]
        if (column.cells.length >= 6) return prev

        const newRow = column.cells.length
        const newCell: GridCell = {
          id: `cell-${colIndex}-${newRow}`,
          type: "empty",
          row: newRow,
          col: colIndex,
        }

        const newColumns = prev.columns.map((col, idx) => {
          if (idx === colIndex) {
            return { ...col, cells: [...col.cells, newCell] }
          }
          return col
        })

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [saveToHistory],
  )

  const removeCellFromColumn = useCallback(
    (colIndex: number) => {
      setConfig((prev) => {
        const column = prev.columns[colIndex]
        if (column.cells.length <= 1) return prev

        const newColumns = prev.columns.map((col, idx) => {
          if (idx === colIndex) {
            return { ...col, cells: col.cells.slice(0, -1) }
          }
          return col
        })

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
      setSelectedCell(null)
    },
    [saveToHistory],
  )

  const addColumnLeft = useCallback(() => {
    setConfig((prev) => {
      if (prev.columns.length >= 6) return prev

      const baseHeight = Math.min(...prev.columns.map((c) => c.cells.length))
      const newCells: GridCell[] = Array.from({ length: baseHeight }, (_, row) => ({
        id: `cell-new-${row}`,
        type: "empty" as const,
        row,
        col: 0,
      }))

      const newColumn: Column = { width: 75, cells: newCells }
      const updatedColumns = [newColumn, ...prev.columns].map((col, idx) => ({
        ...col,
        cells: col.cells.map((cell) => ({ ...cell, col: idx, id: `cell-${idx}-${cell.row}` })),
      }))

      const newConfig = { ...prev, columns: updatedColumns }
      setTimeout(() => saveToHistory(newConfig), 0)
      return newConfig
    })
  }, [saveToHistory])

  const addColumnRight = useCallback(() => {
    setConfig((prev) => {
      if (prev.columns.length >= 6) return prev

      const newColIndex = prev.columns.length
      const baseHeight = Math.min(...prev.columns.map((c) => c.cells.length))
      const newCells: GridCell[] = Array.from({ length: baseHeight }, (_, row) => ({
        id: `cell-${newColIndex}-${row}`,
        type: "empty" as const,
        row,
        col: newColIndex,
      }))

      const newColumn: Column = { width: 75, cells: newCells }
      const newConfig = { ...prev, columns: [...prev.columns, newColumn] }
      setTimeout(() => saveToHistory(newConfig), 0)
      return newConfig
    })
  }, [saveToHistory])

  const removeColumn = useCallback(
    (colIndex: number) => {
      setConfig((prev) => {
        if (prev.columns.length <= 1) return prev

        const newColumns = prev.columns
          .filter((_, idx) => idx !== colIndex)
          .map((col, idx) => ({
            ...col,
            cells: col.cells.map((cell) => ({ ...cell, col: idx, id: `cell-${idx}-${cell.row}` })),
          }))

        const newConfig = { ...prev, columns: newColumns }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
      setSelectedCell(null)
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
    const newConfig: ShelfConfig = {
      columns: createInitialColumns(),
      rowHeight: 38,
      footType: "standard",
      baseColor: "weiss",
      accentColor: "none",
      shelfMaterial: "metall",
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

    const allCells = config.columns.flatMap((col) => col.cells)
    const filledCells = allCells.filter((c) => c.type !== "empty")
    if (filledCells.length === 0) {
      return { shoppingList: [], totalPrice: 0 }
    }

    const maxHeight = Math.max(...config.columns.map((c) => c.cells.length))
    const totalHeightCm = maxHeight * config.rowHeight

    let leiterHeight = 40
    if (totalHeightCm > 160) leiterHeight = 200
    else if (totalHeightCm > 120) leiterHeight = 160
    else if (totalHeightCm > 80) leiterHeight = 120
    else if (totalHeightCm > 40) leiterHeight = 80

    const leiterProduct = leitern.find((l) => l.size === leiterHeight)
    if (leiterProduct) {
      addItem(leiterProduct, config.columns.length + 1)
    }

    const levels = maxHeight + 1
    const col80Count = config.columns.filter((c) => c.width === 75).length
    const col40Count = config.columns.filter((c) => c.width === 38).length

    const stange80 = stangensets.find((s) => s.size === 80 && s.variant === "metall")
    const stange40 = stangensets.find((s) => s.size === 40 && s.variant === "metall")

    if (stange80 && col80Count > 0) addItem(stange80, col80Count * levels)
    if (stange40 && col40Count > 0) addItem(stange40, col40Count * levels)

    filledCells.forEach((cell) => {
      const column = config.columns[cell.col]
      const bodenSize = column.width === 75 ? 80 : 40

      let shelfProduct: Product | undefined
      if (config.shelfMaterial === "metall") {
        shelfProduct =
          metallboeden.find((p) => p.size === bodenSize && p.color === cell.color) ||
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
            funktionswaende.find((p) => p.variant === "1-seitig" && p.color === cell.color) ||
            funktionswaende.find((p) => p.variant === "1-seitig")
          if (backPanel) addItem(backPanel, 1)
          break
        }
        case "mit-tueren":
        case "abschliessbare-tueren": {
          const door =
            schubladenTueren.find((p) => p.category === "tuer" && p.color === cell.color) ||
            schubladenTueren.find((p) => p.category === "tuer")
          if (door) addItem(door, 2)
          break
        }
        case "mit-klapptuer": {
          const door =
            schubladenTueren.find((p) => p.category === "tuer" && p.color === cell.color) ||
            schubladenTueren.find((p) => p.category === "tuer")
          if (door) addItem(door, 1)
          break
        }
        case "mit-doppelschublade": {
          const drawer =
            schubladenTueren.find((p) => p.category === "schublade" && p.color === cell.color) ||
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
    <div className="flex h-full w-full flex-col bg-background overflow-hidden">
      <ConfiguratorHeader />

      <div className="relative flex-1">
        <Canvas
          shadows
          camera={isMobile ? { position: [0, 1.2, 3.5], fov: 55 } : { position: [1.5, 1.2, 3], fov: 45 }}
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
            onAddCellToColumn={addCellToColumn}
            onRemoveCellFromColumn={removeCellFromColumn}
            onAddColumnLeft={addColumnLeft}
            onAddColumnRight={addColumnRight}
            onRemoveColumn={removeColumn}
            hoveredExpansionZone={hoveredExpansionZone}
            onHoverExpansionZone={setHoveredExpansionZone}
          />
          <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />
          <Environment preset="apartment" />
          <OrbitControls
            makeDefault
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={isMobile ? 2 : 1.5}
            maxDistance={isMobile ? 6 : 8}
            enableDamping
            dampingFactor={0.05}
            enablePan={false}
            target={[0, 0.5, 0]}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="hsl(var(--ground-color))" roughness={0.9} />
          </mesh>
        </Canvas>

        {/* Hover tooltip for expansion zones */}
        {hoveredExpansionZone && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-green-500/90 px-4 py-2 text-white shadow-lg backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: hoveredExpansionZone.type === "top" ? "80px" : "auto",
              bottom: hoveredExpansionZone.type !== "top" ? "120px" : "auto",
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">
              {hoveredExpansionZone.type === "top"
                ? `Fach auf Spalte ${(hoveredExpansionZone.col ?? 0) + 1} hinzufügen`
                : hoveredExpansionZone.type === "left"
                  ? "Spalte links hinzufügen"
                  : "Spalte rechts hinzufügen"}
            </span>
          </div>
        )}

        {/* Floating control buttons */}
        <div className="absolute right-3 top-3 flex gap-2 md:right-5 md:top-5">
          <Button
            variant="outline"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            className="h-10 w-10 rounded-full bg-card/80 border-border hover:bg-card disabled:opacity-30 backdrop-blur-md shadow-lg"
            title="Rückgängig"
          >
            <Undo2 className="h-4 w-4 text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            className="h-10 w-10 rounded-full bg-card/80 border-border hover:bg-card disabled:opacity-30 backdrop-blur-md shadow-lg"
            title="Wiederholen"
          >
            <Redo2 className="h-4 w-4 text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            className="h-10 w-10 rounded-full bg-card/80 border-border hover:bg-card hover:border-destructive backdrop-blur-md shadow-lg"
            title="Zurücksetzen"
          >
            <RotateCcw className="h-4 w-4 text-foreground" />
          </Button>
        </div>

        {/* Active tool indicator */}
        {selectedTool && selectedTool !== "empty" && (
          <div className="absolute left-3 top-3 rounded-full bg-card/80 border border-border px-4 py-2 backdrop-blur-md shadow-lg md:left-5 md:top-5">
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor:
                    config.accentColor !== "none" ? getColorHex(config.accentColor) : getColorHex(config.baseColor),
                }}
              />
              <span className="text-sm font-medium text-foreground">{getToolLabel(selectedTool)}</span>
            </div>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-3 rounded-full bg-card/90 border border-border px-6 py-3 backdrop-blur-md shadow-lg">
          <span className="text-sm text-muted-foreground">Gesamtpreis</span>
          <span className="text-xl font-bold text-foreground">{priceFormatted} €</span>
        </div>

        {/* Mobile panel toggle */}
        <Button
          variant="default"
          size="lg"
          onClick={() => setShowMobilePanel(true)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:hidden rounded-full px-6 shadow-lg"
        >
          <span className="mr-2">Konfigurieren</span>
          <span className="font-bold">{priceFormatted} €</span>
        </Button>

        {/* Desktop side panel */}
        <div className="absolute right-0 top-0 h-full w-[340px] hidden lg:block">
          <ConfiguratorPanel
            config={config}
            selectedTool={selectedTool}
            selectedCell={selectedCell}
            shoppingList={shoppingList}
            totalPrice={totalPrice}
            showShoppingList={showShoppingList}
            onToolSelect={setSelectedTool}
            onConfigUpdate={updateConfig}
            onCellColorUpdate={updateCellColor}
            onClearCell={clearCell}
            onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
            onAddCellToColumn={addCellToColumn}
            onRemoveCellFromColumn={removeCellFromColumn}
            onAddColumnLeft={addColumnLeft}
            onAddColumnRight={addColumnRight}
            onRemoveColumn={removeColumn}
          />
        </div>

        {/* Mobile panel overlay */}
        {showMobilePanel && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobilePanel(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-auto rounded-t-2xl bg-card animate-in slide-in-from-bottom duration-300">
              <div className="sticky top-0 flex items-center justify-between border-b bg-card px-4 py-3">
                <span className="font-semibold">Konfiguration</span>
                <Button variant="ghost" size="sm" onClick={() => setShowMobilePanel(false)}>
                  Schließen
                </Button>
              </div>
              <ConfiguratorPanel
                config={config}
                selectedTool={selectedTool}
                selectedCell={selectedCell}
                shoppingList={shoppingList}
                totalPrice={totalPrice}
                showShoppingList={showShoppingList}
                onToolSelect={setSelectedTool}
                onConfigUpdate={updateConfig}
                onCellColorUpdate={updateCellColor}
                onClearCell={clearCell}
                onToggleShoppingList={() => setShowShoppingList(!showShoppingList)}
                onAddCellToColumn={addCellToColumn}
                onRemoveCellFromColumn={removeCellFromColumn}
                onAddColumnLeft={addColumnLeft}
                onAddColumnRight={addColumnRight}
                onRemoveColumn={removeColumn}
                isMobile
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    weiss: "#ffffff",
    schwarz: "#1a1a1a",
    blau: "#0066cc",
    gruen: "#228b22",
    gelb: "#ffd700",
    orange: "#ff8c00",
    rot: "#cc0000",
  }
  return colorMap[color] || "#ffffff"
}

function getToolLabel(type: GridCell["type"]): string {
  const labels: Record<GridCell["type"], string> = {
    empty: "Entfernen",
    "ohne-seitenwaende": "Offen",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-doppelschublade": "Mit Schublade",
    "abschliessbare-tueren": "Abschließbar",
  }
  return labels[type] || type
}
