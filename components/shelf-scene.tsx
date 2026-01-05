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
  white: colorHexMap.weiss,
  black: colorHexMap.schwarz,
  blue: colorHexMap.blau,
  green: colorHexMap.gruen,
  yellow: colorHexMap.gelb,
  red: colorHexMap.rot,
  purple: colorHexMap.lila,
}

function InteractiveCell({
  position,
  width,
  height,
  depth,
  row,
  col,
  isEmpty,
  isGhost,
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
  isGhost: boolean
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

  const showClickArea = isGhost || selectedTool !== null

  if (!showClickArea) return null

  const cellColor = isGhost ? "#10b981" : showHover ? (selectedTool === "empty" ? "#ff4444" : "#4488ff") : "#666666"
  const cellOpacity = isGhost ? (showHover ? 0.5 : 0.3) : showHover ? 0.4 : isEmpty ? 0.15 : 0.05

  return (
    <mesh position={position} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <boxGeometry args={[width - 0.01, height - 0.01, depth - 0.01]} />
      <meshStandardMaterial color={cellColor} transparent opacity={cellOpacity} depthWrite={false} />
    </mesh>
  )
}

export function ShelfScene({ config, selectedTool, hoveredCell, onCellClick, onCellHover }: Props) {
  const gridKey = useMemo(() => JSON.stringify(config.grid), [config.grid])

  const { glbModules, interactiveCells } = useMemo(() => {
    const glbs: JSX.Element[] = []
    const cells: JSX.Element[] = []

    const fallbackColor = config.accentColor !== "none" ? config.accentColor : config.baseColor

    const depth = 0.38

    const columnTubeOverlap = 0.003
    const rowTubeOverlap = 0.013

    const columnCenters: number[] = []
    for (let col = 0; col < config.columns; col++) {
      const colWidth = config.columnWidths[col] / 100
      let xPos = 0
      for (let c = 0; c < col; c++) {
        xPos += config.columnWidths[c] / 100 - columnTubeOverlap
      }
      columnCenters.push(xPos + colWidth / 2)
    }

    let totalWidth = 0
    for (let col = 0; col < config.columns; col++) {
      totalWidth += config.columnWidths[col] / 100
      if (col > 0) totalWidth -= columnTubeOverlap
    }

    const rowCenters: number[] = []
    for (let row = 0; row < config.rows; row++) {
      const rowHeight = config.rowHeights[row] / 100
      let yPos = 0
      for (let r = 0; r < row; r++) {
        yPos += config.rowHeights[r] / 100 - rowTubeOverlap
      }
      rowCenters.push(yPos + rowHeight / 2)
    }

    const offsetX = -totalWidth / 2
    const offsetY = 0
    const offsetZ = -depth / 2

    config.grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        const cellWidth = config.columnWidths[gridCol] / 100
        const cellHeight = config.rowHeights[gridRow] / 100

        const cellX = columnCenters[gridCol] + offsetX
        const cellY = rowCenters[gridRow] + offsetY
        const cellZ = offsetZ + depth / 2

        const isGhost = cell.type === "ghost"
        const isEmpty = cell.type === "empty"
        const isHovered = hoveredCell?.row === gridRow && hoveredCell?.col === gridCol

        if (isGhost) {
          cells.push(
            <InteractiveCell
              key={`interactive-${gridRow}-${gridCol}`}
              position={[cellX, cellY, cellZ]}
              width={cellWidth}
              height={cellHeight}
              depth={depth}
              row={gridRow}
              col={gridCol}
              isEmpty={false}
              isGhost={true}
              isHovered={isHovered}
              selectedTool={selectedTool}
              onClick={onCellClick}
              onHover={onCellHover}
            />,
          )
        } else if (isEmpty && (isHovered || selectedTool)) {
          cells.push(
            <InteractiveCell
              key={`interactive-${gridRow}-${gridCol}`}
              position={[cellX, cellY, cellZ]}
              width={cellWidth}
              height={cellHeight}
              depth={depth}
              row={gridRow}
              col={gridCol}
              isEmpty={true}
              isGhost={false}
              isHovered={isHovered}
              selectedTool={selectedTool}
              onClick={onCellClick}
              onHover={onCellHover}
            />,
          )
        }

        if (isEmpty || isGhost) return

        const cellColor = cell.color || fallbackColor
        const panelColor = colorMap[cellColor] || colorMap.weiss

        glbs.push(
          <GLBModule
            key={`glb-${gridRow}-${gridCol}`}
            position={[cellX, cellY, cellZ]}
            cellType={cell.type}
            width={cellWidth}
            height={cellHeight}
            depth={depth}
            color={panelColor}
            row={gridRow}
            col={gridCol}
            gridConfig={config}
          />,
        )
      })
    })

    return { glbModules: glbs, interactiveCells: cells }
  }, [gridKey, selectedTool, hoveredCell, onCellClick, onCellHover, config])

  return (
    <group>
      {glbModules}
      {interactiveCells}
    </group>
  )
}
