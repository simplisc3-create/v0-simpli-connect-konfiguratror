"use client"

import { useMemo, useState } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import type { JSX } from "react/jsx-runtime"

type Props = {
  config: ShelfConfig
  selectedTool?: GridCell["type"] | null
  hoveredCell?: { row: number; col: number } | null
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (cell: { row: number; col: number } | null) => void
}

const colorMap: Record<string, string> = {
  weiss: colorHexMap.weiss,
  schwarz: colorHexMap.schwarz,
  blau: colorHexMap.blau,
  gruen: colorHexMap.gruen,
  orange: colorHexMap.orange,
  rot: colorHexMap.rot,
  lila: colorHexMap.lila,
  gelb: colorHexMap.gelb,
}

function InteractiveCell({
  position,
  width,
  height,
  depth,
  row,
  col,
  isEmpty,
  isHovered,
  selectedTool,
  onClick,
  onHover,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  row: number
  col: number
  isEmpty: boolean
  isHovered: boolean
  selectedTool?: GridCell["type"] | null
  onClick?: (row: number, col: number) => void
  onHover?: (cell: { row: number; col: number } | null) => void
}) {
  const [localHover, setLocalHover] = useState(false)
  const showHover = isHovered || localHover

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick?.(row, col)
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setLocalHover(true)
    onHover?.({ row, col })
    document.body.style.cursor = "pointer"
  }

  const handlePointerOut = () => {
    setLocalHover(false)
    onHover?.(null)
    document.body.style.cursor = "auto"
  }

  const showClickArea = selectedTool !== null

  if (!showClickArea) return null

  return (
    <mesh position={position} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <boxGeometry args={[width - 0.01, height - 0.01, depth - 0.01]} />
      <meshStandardMaterial
        color={showHover ? (selectedTool === "empty" ? "#ff4444" : "#4488ff") : "#666666"}
        transparent
        opacity={showHover ? 0.4 : isEmpty ? 0.15 : 0.05}
        depthWrite={false}
      />
    </mesh>
  )
}

export function ShelfScene({ config, selectedTool, hoveredCell, onCellClick, onCellHover }: Props) {
  const { glbModules, interactiveCells } = useMemo(() => {
    const glbs: JSX.Element[] = []
    const cells: JSX.Element[] = []
    const effectiveColor = config.accentColor !== "none" ? config.accentColor : config.baseColor
    const panelColor = colorMap[effectiveColor] || colorMap.weiss

    const depth = 0.38

    const columnPositions: number[] = [0]
    let currentX = 0
    for (let col = 0; col < config.columns; col++) {
      const width = config.columnWidths[col] / 100
      currentX += width
      columnPositions.push(currentX)
    }
    const totalWidth = currentX

    const rowPositions: number[] = [0]
    let currentY = 0
    for (let row = config.rows - 1; row >= 0; row--) {
      const height = config.rowHeights[row] / 100
      currentY += height
      rowPositions.push(currentY)
    }
    const totalHeight = currentY

    const offsetX = -totalWidth / 2
    const offsetY = 0.025
    const offsetZ = -depth / 2

    config.grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        const cellWidth = config.columnWidths[gridCol] / 100
        const cellHeight = config.rowHeights[gridRow] / 100

        const invertedRow = config.rows - 1 - gridRow
        const cellX = columnPositions[gridCol] + cellWidth / 2 + offsetX
        const cellY = rowPositions[invertedRow] + cellHeight / 2 + offsetY
        const offsetZ_adjusted = -depth / 2

        const isEmpty = cell.type === "empty"
        const isHovered = hoveredCell?.row === gridRow && hoveredCell?.col === gridCol

        cells.push(
          <InteractiveCell
            key={`interactive-${gridRow}-${gridCol}`}
            position={[cellX, cellY, offsetZ_adjusted + depth / 2]}
            width={cellWidth}
            height={cellHeight}
            depth={depth}
            row={gridRow}
            col={gridCol}
            isEmpty={isEmpty}
            isHovered={isHovered}
            selectedTool={selectedTool}
            onClick={onCellClick}
            onHover={onCellHover}
          />,
        )

        if (isEmpty) return

        glbs.push(
          <GLBModule
            key={`glb-${gridRow}-${gridCol}`}
            position={[cellX, cellY, offsetZ_adjusted + depth / 2]}
            cellType={cell.type}
            width={cellWidth}
            height={cellHeight}
            depth={depth}
            color={panelColor}
            row={gridRow}
            col={gridCol} // Pass column index to GLBModule
            gridConfig={config}
          />,
        )
      })
    })

    return { glbModules: glbs, interactiveCells: cells }
  }, [config, selectedTool, hoveredCell, onCellClick, onCellHover])

  return (
    <group>
      {glbModules}
      {interactiveCells}
    </group>
  )
}
