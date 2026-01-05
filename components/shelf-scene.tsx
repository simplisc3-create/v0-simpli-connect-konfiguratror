"use client"

import { useMemo, useState, memo, useCallback } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"

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
  gelb: colorHexMap.gelb,
}

const InteractiveCell = memo(function InteractiveCell({
  position,
  width,
  height,
  depth,
  row,
  col,
  isHovered,
  onClick,
  onHover,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  row: number
  col: number
  isHovered: boolean
  onClick: (row: number, col: number) => void
  onHover: (cell: { row: number; col: number } | null) => void
}) {
  const [localHover, setLocalHover] = useState(false)
  const showHover = isHovered || localHover

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      onClick(row, col)
    },
    [onClick, row, col],
  )

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setLocalHover(true)
      onHover({ row, col })
    },
    [onHover, row, col],
  )

  const handlePointerOut = useCallback(() => {
    setLocalHover(false)
    onHover(null)
  }, [onHover])

  return (
    <mesh position={position} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <boxGeometry args={[width - 0.01, height - 0.01, depth - 0.01]} />
      <meshStandardMaterial
        color={showHover ? "#22c55e" : "#10b981"}
        transparent
        opacity={showHover ? 0.6 : 0.4}
        depthWrite={false}
      />
    </mesh>
  )
})

export const ShelfScene = memo(function ShelfScene({ config, hoveredCell, onCellClick, onCellHover }: Props) {
  const gridHash = useMemo(() => {
    return JSON.stringify({
      grid: config.grid.map((row) => row.map((cell) => ({ type: cell.type, color: cell.color }))),
      columns: config.columns,
      rows: config.rows,
      columnWidths: config.columnWidths,
      rowHeights: config.rowHeights,
    })
  }, [config.grid, config.columns, config.rows, config.columnWidths, config.rowHeights])

  const { glbModules, ghostCells } = useMemo(() => {
    const glbs: {
      key: string
      position: [number, number, number]
      cell: GridCell
      row: number
      col: number
      width: number
      height: number
    }[] = []
    const ghosts: {
      key: string
      position: [number, number, number]
      row: number
      col: number
      width: number
      height: number
    }[] = []

    const depth = 0.38
    const columnTubeOverlap = 0.003
    const rowTubeOverlap = 0.008

    // Calculate column centers
    const columnCenters: number[] = []
    let totalWidth = 0
    for (let col = 0; col < config.columns; col++) {
      const colWidth = config.columnWidths[col] / 100
      let xPos = 0
      for (let c = 0; c < col; c++) {
        xPos += config.columnWidths[c] / 100 - columnTubeOverlap
      }
      columnCenters.push(xPos + colWidth / 2)
      totalWidth += colWidth
      if (col > 0) totalWidth -= columnTubeOverlap
    }

    // Calculate row centers
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
    const offsetZ = depth / 2

    config.grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        const cellWidth = config.columnWidths[gridCol] / 100
        const cellHeight = config.rowHeights[gridRow] / 100
        const position: [number, number, number] = [columnCenters[gridCol] + offsetX, rowCenters[gridRow], offsetZ]

        if (cell.type === "ghost") {
          ghosts.push({
            key: `ghost-${gridRow}-${gridCol}`,
            position,
            row: gridRow,
            col: gridCol,
            width: cellWidth,
            height: cellHeight,
          })
        } else if (cell.type !== "empty") {
          glbs.push({
            key: `glb-${gridRow}-${gridCol}-${cell.type}`,
            position,
            cell,
            row: gridRow,
            col: gridCol,
            width: cellWidth,
            height: cellHeight,
          })
        }
      })
    })

    return { glbModules: glbs, ghostCells: ghosts }
  }, [gridHash, config.grid, config.columns, config.rows, config.columnWidths, config.rowHeights])

  const handleClick = useCallback(
    (row: number, col: number) => {
      onCellClick?.(row, col)
    },
    [onCellClick],
  )

  const handleHover = useCallback(
    (cell: { row: number; col: number } | null) => {
      onCellHover?.(cell)
    },
    [onCellHover],
  )

  return (
    <group>
      {glbModules.map(({ key, position, cell, row, col, width, height }) => (
        <GLBModule
          key={key}
          position={position}
          cellType={cell.type}
          width={width}
          height={height}
          depth={0.38}
          color={cell.color ? colorMap[cell.color] || colorMap.weiss : colorMap.weiss}
          row={row}
          col={col}
          gridConfig={config}
        />
      ))}
      {ghostCells.map(({ key, position, row, col, width, height }) => (
        <InteractiveCell
          key={key}
          position={position}
          width={width}
          height={height}
          depth={0.38}
          row={row}
          col={col}
          isHovered={hoveredCell?.row === row && hoveredCell?.col === col}
          onClick={handleClick}
          onHover={handleHover}
        />
      ))}
    </group>
  )
})
