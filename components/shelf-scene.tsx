"use client"

import { useMemo, useState, memo, useCallback, useRef } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import { useFrame } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import { ContactShadows, Html } from "@react-three/drei"
import type * as THREE from "three"
import { ModuleFeet } from "./foot-3d"

type Props = {
  config: ShelfConfig
  selectedTool?: GridCell["type"] | null
  hoveredCell?: { row: number; col: number } | null
  selectedCell?: { row: number; col: number } | null
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (cell: { row: number; col: number } | null) => void
  onApplyCellColor?: (row: number, col: number, color: string) => void
  onClearCellColor?: (row: number, col: number) => void
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
  isInitial = false,
}: {
  position: [number, number, number]
  row: number
  col: number
  isHovered: boolean
  onClick: (row: number, col: number) => void
  onHover: (cell: { row: number; col: number } | null) => void
  isVertical?: boolean
  isInitial?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [localHover, setLocalHover] = useState(false)
  const showHover = isHovered || localHover

  // Scale factors for initial ghost sphere (larger and more visible)
  const scaleFactor = isInitial ? 2.5 : 1

  // Animate the glow effect
  useFrame((state) => {
    if (glowRef.current) {
      const baseScale = isInitial ? 1.2 : 1
      const scale = baseScale + Math.sin(state.clock.elapsedTime * 2) * 0.15
      glowRef.current.scale.setScalar(showHover ? scale * 1.5 : scale)
    }
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = showHover ? 2.5 : (isInitial ? 1.5 : 0.8) + Math.sin(state.clock.elapsedTime * 3) * 0.3
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
        <torusGeometry args={[0.06 * scaleFactor, 0.008 * scaleFactor, 8, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={showHover ? 0.8 : (isInitial ? 0.6 : 0.4)}
          emissive={glowColor}
          emissiveIntensity={showHover ? 1.5 : (isInitial ? 1 : 0.5)}
        />
      </mesh>

      {/* Central dot */}
      <mesh ref={meshRef} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[0.04 * scaleFactor, 16, 16]} />
        <meshStandardMaterial
          color={showHover ? hoverColor : baseColor}
          emissive={showHover ? hoverColor : baseColor}
          emissiveIntensity={showHover ? 2 : (isInitial ? 1.5 : 1)}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Plus icon - always show for initial, show on hover otherwise */}
      {(showHover || isInitial) && (
        <Html center distanceFactor={isInitial ? 2 : 3} style={{ pointerEvents: "none" }}>
          <div className={`flex items-center justify-center rounded-full bg-emerald-500/90 text-white font-bold shadow-lg shadow-emerald-500/50 ${isInitial ? 'w-12 h-12 text-2xl animate-bounce' : 'w-8 h-8 text-lg animate-pulse'}`}>
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

export const ShelfScene = memo(function ShelfScene({ 
  config, 
  hoveredCell, 
  selectedCell, 
  onCellClick, 
  onCellHover 
}: Props) {
  // Early return if config is invalid
  if (!config || !config.grid || !Array.isArray(config.grid)) {
    console.error("[v0] ShelfScene: Invalid config received", config)
    return null
  }
  
  const gridHash = useMemo(() => {
    if (!config.grid || !Array.isArray(config.grid)) return ""
    return JSON.stringify({
      grid: config.grid.map((row) => row?.map((cell) => ({ type: cell?.type, color: cell?.color })) || []),
      columns: config.columns,
      rows: config.rows,
      columnWidths: config.columnWidths,
      rowHeights: config.rowHeights,
    })
  }, [config.grid, config.columns, config.rows, config.columnWidths, config.rowHeights])

  const { glbModules, snapPoints, hasRealModules } = useMemo(() => {
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
      isInitial: boolean
    }[] = []

    const depth = 0.38
    const columnTubeOverlap = 0.003
    const rowTubeOverlap = 0.003

    // Check if there are any real modules (not ghost or empty)
    let foundRealModule = false
    for (let r = 0; r < config.rows && !foundRealModule; r++) {
      for (let c = 0; c < config.columns && !foundRealModule; c++) {
        const cell = config.grid[r]?.[c]
        if (cell && cell.type !== "ghost" && cell.type !== "empty") {
          foundRealModule = true
        }
      }
    }

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

    // Safely iterate over grid
    if (!config.grid || !Array.isArray(config.grid)) {
      return { glbModules: glbs, snapPoints: snaps, hasRealModules: false }
    }

    config.grid.forEach((rowCells, gridRow) => {
      if (!rowCells || !Array.isArray(rowCells)) return
      rowCells.forEach((cell, gridCol) => {
        if (!cell) return
        const cellWidth = config.columnWidths[gridCol] / 100
        const cellHeight = config.rowHeights[gridRow] / 100

        let zOffset = 0
        if (cell.type === "mit-doppelschublade" || cell.type === "abschliessbare-tueren") {
          zOffset = 0.01 // 1cm closer to viewer
        } else if (cell.type === "mit-rueckwand") {
          zOffset = -0.01 // 1cm away from viewer
        }

        const position: [number, number, number] = [
          columnCenters[gridCol] + offsetX,
          rowCenters[gridRow],
          -depth / 2 + zOffset, // Front of module at z=0, module extends backwards
        ]

        if (cell.type === "ghost") {
          const isAboveModule =
            gridRow > 0 &&
            config.grid[gridRow - 1]?.[gridCol]?.type !== "empty" &&
            config.grid[gridRow - 1]?.[gridCol]?.type !== "ghost"

          // For the initial ghost (no real modules yet), position at center, closer to camera
          const snapPosition: [number, number, number] = !foundRealModule
            ? [0, 0.2, 0.15] // Center position, slightly raised, in front for visibility
            : isAboveModule
            ? [position[0], position[1] - cellHeight / 2 + 0.05, position[2] + depth / 2]
            : [position[0], position[1], 0.05] // Front snap point at z=0.05

          snaps.push({
            key: `snap-${gridRow}-${gridCol}`,
            position: snapPosition,
            row: gridRow,
            col: gridCol,
            isVertical: isAboveModule,
            isInitial: !foundRealModule,
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

    return { glbModules: glbs, snapPoints: snaps, hasRealModules: foundRealModule }
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
      {/* White floor - matches background for seamless look */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.25}
        scale={8}
        blur={2}
        far={2}
        resolution={256}
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
        const isSelected = selectedCell?.row === row && selectedCell?.col === col

        const colorToUse = cell.color || "weiss"

        // Determine if we should hide the built-in feet (only when custom foot type is selected)
        const shouldHideBuiltInFeet = isBottomModule && config.footType && config.footType !== "black-plastic"
        // Only show custom feet for non-standard foot types
        const shouldShowCustomFeet = isBottomModule && config.footType && config.footType !== "black-plastic"

        return (
          <group key={key}>
            <GLBModule
              position={position}
              cellType={cell.type}
              width={width}
              height={height}
              depth={0.38}
              color={colorToUse}
              row={row}
              col={col}
              gridConfig={config}
              isBottomModule={isBottomModule}
              isSelected={isSelected}
              onClick={handleClick}
              hideBuiltInFeet={shouldHideBuiltInFeet}
            />
            {/* Render custom feet on bottom modules when non-standard foot type selected */}
            {shouldShowCustomFeet && (
              <ModuleFeet
                modulePosition={position}
                moduleWidth={width}
                moduleDepth={0.38}
                footType={config.footType}
                color={colorToUse}
              />
            )}
          </group>
        )
      })}

      {snapPoints.map(({ key, position, row, col, isVertical, isInitial }) => (
        <SnapPoint
          key={key}
          position={position}
          row={row}
          col={col}
          isHovered={hoveredCell?.row === row && hoveredCell?.col === col}
          onClick={handleClick}
          onHover={handleHover}
          isVertical={isVertical}
          isInitial={isInitial}
        />
      ))}
    </group>
  )
})
