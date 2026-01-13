"use client"

import { useMemo, useState, memo, useCallback, useRef } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import { useFrame } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import { ContactShadows, Html } from "@react-three/drei"
import type * as THREE from "three"

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

const SnapPoint = memo(function SnapPoint({
  position,
  row,
  col,
  isHovered,
  onClick,
  onHover,
  isVertical = false,
}: {
  position: [number, number, number]
  row: number
  col: number
  isHovered: boolean
  onClick: (row: number, col: number) => void
  onHover: (cell: { row: number; col: number } | null) => void
  isVertical?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [localHover, setLocalHover] = useState(false)
  const showHover = isHovered || localHover

  // Animate the glow effect
  useFrame((state) => {
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      glowRef.current.scale.setScalar(showHover ? scale * 1.5 : scale)
    }
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = showHover ? 2 : 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

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
      document.body.style.cursor = "pointer"
    },
    [onHover, row, col],
  )

  const handlePointerOut = useCallback(() => {
    setLocalHover(false)
    onHover(null)
    document.body.style.cursor = "auto"
  }, [onHover])

  // Simpli Connect brand colors: white for structure, green for valid
  const baseColor = "#10b981" // emerald green
  const hoverColor = "#22c55e" // lighter green
  const glowColor = showHover ? "#4ade80" : "#34d399"

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.008, 8, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={showHover ? 0.8 : 0.4}
          emissive={glowColor}
          emissiveIntensity={showHover ? 1.5 : 0.5}
        />
      </mesh>

      {/* Central dot */}
      <mesh ref={meshRef} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color={showHover ? hoverColor : baseColor}
          emissive={showHover ? hoverColor : baseColor}
          emissiveIntensity={showHover ? 2 : 1}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Plus icon on hover */}
      {showHover && (
        <Html center distanceFactor={3} style={{ pointerEvents: "none" }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/90 text-white font-bold text-lg shadow-lg shadow-emerald-500/50 animate-pulse">
            +
          </div>
        </Html>
      )}

      {/* Direction indicator for vertical stacking */}
      {isVertical && (
        <mesh position={[0, 0.08, 0]}>
          <coneGeometry args={[0.02, 0.04, 8]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
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

  const { glbModules, snapPoints } = useMemo(() => {
    const glbs: {
      key: string
      position: [number, number, number]
      cell: GridCell
      row: number
      col: number
      width: number
      height: number
    }[] = []
    const snaps: {
      key: string
      position: [number, number, number]
      row: number
      col: number
      isVertical: boolean
    }[] = []

    const depth = 0.38
    const columnTubeOverlap = 0.003
    const rowTubeOverlap = 0.003

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
    const offsetZ = 0

    config.grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        const cellWidth = config.columnWidths[gridCol] / 100
        const cellHeight = config.rowHeights[gridRow] / 100
        const position: [number, number, number] = [
          columnCenters[gridCol] + offsetX,
          rowCenters[gridRow],
          -depth / 2, // Front of module at z=0, module extends backwards
        ]

        if (cell.type === "ghost") {
          const isAboveModule =
            gridRow > 0 &&
            config.grid[gridRow - 1]?.[gridCol]?.type !== "empty" &&
            config.grid[gridRow - 1]?.[gridCol]?.type !== "ghost"

          const snapPosition: [number, number, number] = isAboveModule
            ? [position[0], position[1] - cellHeight / 2 + 0.05, position[2] + depth / 2]
            : [position[0], position[1], 0.05] // Front snap point at z=0.05

          snaps.push({
            key: `snap-${gridRow}-${gridCol}`,
            position: snapPosition,
            row: gridRow,
            col: gridCol,
            isVertical: isAboveModule,
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

    return { glbModules: glbs, snapPoints: snaps }
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.9} metalness={0.05} />
      </mesh>

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={6}
        blur={2.5}
        far={2}
        resolution={512}
        color="#000000"
      />

      {glbModules.map(({ key, position, cell, row, col, width, height }) => {
        const maxRowInColumn = config.grid.reduce((max, gridRow, rowIndex) => {
          if (gridRow[col] && gridRow[col].type !== "empty" && gridRow[col].type !== "ghost") {
            return Math.max(max, rowIndex)
          }
          return max
        }, -1)
        const isBottomModule = row === maxRowInColumn

        return (
          <GLBModule
            key={key}
            position={position}
            cellType={cell.type}
            width={width}
            height={height}
            depth={0.38}
            color={(() => {
              const colorToUse = cell.color || "weiss"
              console.log(
                `[v0] Rendering GLB ${cell.type} at ${row}-${col}, cell.color=${cell.color}, using=${colorToUse}`,
              )
              return colorToUse
            })()}
            row={row}
            col={col}
            gridConfig={config}
            isBottomModule={isBottomModule}
          />
        )
      })}

      {snapPoints.map(({ key, position, row, col, isVertical }) => (
        <SnapPoint
          key={key}
          position={position}
          row={row}
          col={col}
          isHovered={hoveredCell?.row === row && hoveredCell?.col === col}
          onClick={handleClick}
          onHover={handleHover}
          isVertical={isVertical}
        />
      ))}
    </group>
  )
})
