"use client"

import { useMemo, useState, memo, useCallback, useRef } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import { useFrame } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import { ContactShadows, Html } from "@react-three/drei"
import * as THREE from "three"

type PlacementGhost = {
  id: string
  row: number
  col: number
  type: GridCell["type"]
  color: GridCell["color"]
  createdAt: number
}

type Props = {
  config: ShelfConfig
  selectedTool?: GridCell["type"] | null
  selectedColor?: GridCell["color"]
  hoveredCell?: { row: number; col: number } | null
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (cell: { row: number; col: number } | null) => void
  placementGhosts?: PlacementGhost[]
  selectedCell?: { row: number; col: number } | null
  onApplyCellColor?: (row: number, col: number, color: GridCell["color"]) => void
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

// Ghost Module Preview - shows a transparent 3D preview of the selected module
const GhostModulePreview = memo(function GhostModulePreview({
  position,
  moduleType,
  color,
  width,
  height,
  config,
  isHovered,
}: {
  position: [number, number, number]
  moduleType: GridCell["type"]
  color: GridCell["color"]
  width: number
  height: number
  config: ShelfConfig
  isHovered: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Animate opacity pulsing
  useFrame((state) => {
    if (groupRef.current) {
      const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.15
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial
          if (mat.transparent !== undefined) {
            mat.opacity = isHovered ? 0.85 : pulse
          }
        }
      })
    }
  })

  if (!moduleType || moduleType === "empty" || moduleType === "ghost") {
    return null
  }

  return (
    <group ref={groupRef} position={position}>
      <GLBModule
        position={[0, 0, 0]}
        cellType={moduleType}
        width={width}
        height={height}
        depth={0.38}
        color={color || "weiss"}
        row={0}
        col={0}
        gridConfig={config}
        isBottomModule={false}
      />
      {/* Glow effect underneath */}
      <mesh position={[0, -height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 1.1, 0.4]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={isHovered ? 0.4 : 0.2} 
        />
      </mesh>
    </group>
  )
})

// Placement Ghost Effect - fading confirmation when module is placed
const PlacementGhostEffect = memo(function PlacementGhostEffect({
  position,
  moduleType,
  color,
  width,
  height,
  config,
  createdAt,
}: {
  position: [number, number, number]
  moduleType: GridCell["type"]
  color: GridCell["color"]
  width: number
  height: number
  config: ShelfConfig
  createdAt: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [opacity, setOpacity] = useState(1)
  
  // Fade out animation
  useFrame(() => {
    const elapsed = Date.now() - createdAt
    const duration = 800 // ms
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease out animation
    const newOpacity = 1 - progress * progress
    setOpacity(newOpacity)
    
    if (groupRef.current) {
      // Scale up slightly as it fades
      const scale = 1 + progress * 0.15
      groupRef.current.scale.setScalar(scale)
      
      // Move up slightly
      groupRef.current.position.y = position[1] + progress * 0.05
      
      // Apply opacity to all meshes
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial
          if (mat.opacity !== undefined) {
            mat.transparent = true
            mat.opacity = newOpacity * 0.7
          }
        }
      })
    }
  })

  if (!moduleType || moduleType === "empty" || moduleType === "ghost") {
    return null
  }

  return (
    <group ref={groupRef} position={position}>
      <GLBModule
        position={[0, 0, 0]}
        cellType={moduleType}
        width={width}
        height={height}
        depth={0.38}
        color={color || "weiss"}
        row={0}
        col={0}
        gridConfig={config}
        isBottomModule={false}
      />
      {/* Expanding ring effect */}
      <mesh position={[0, -height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[width * 0.4 * (1 + (1 - opacity) * 2), width * 0.5 * (1 + (1 - opacity) * 2), 32]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={opacity * 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
})

const SnapPoint = memo(function SnapPoint({
  position,
  row,
  col,
  isHovered,
  onClick,
  onHover,
  isVertical = false,
  selectedTool,
  selectedColor,
  cellWidth,
  cellHeight,
  config,
}: {
  position: [number, number, number]
  row: number
  col: number
  isHovered: boolean
  onClick: (row: number, col: number) => void
  onHover: (cell: { row: number; col: number } | null) => void
  isVertical?: boolean
  selectedTool?: GridCell["type"] | null
  selectedColor?: GridCell["color"]
  cellWidth: number
  cellHeight: number
  config: ShelfConfig
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [localHover, setLocalHover] = useState(false)
  const showHover = isHovered || localHover
  
  // Check if we have a valid tool selected to show preview
  const hasValidTool = selectedTool && selectedTool !== "empty" && selectedTool !== "ghost"

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

  // Calculate the center position for the ghost module preview
  const modulePreviewPosition: [number, number, number] = isVertical
    ? [0, cellHeight / 2, -0.19] // Center of the cell above
    : [0, 0, -0.24] // Center of the cell

  return (
    <group position={position}>
      {/* Show 3D module preview when tool is selected */}
      {hasValidTool && (
        <GhostModulePreview
          position={modulePreviewPosition}
          moduleType={selectedTool}
          color={selectedColor}
          width={cellWidth}
          height={cellHeight}
          config={config}
          isHovered={showHover}
        />
      )}
      
      {/* Outer glow ring - always visible as snap indicator */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[hasValidTool ? 0.08 : 0.06, 0.008, 8, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={showHover ? 0.8 : 0.4}
          emissive={glowColor}
          emissiveIntensity={showHover ? 1.5 : 0.5}
        />
      </mesh>

      {/* Central dot - clickable area */}
      <mesh ref={meshRef} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[hasValidTool ? 0.06 : 0.04, 16, 16]} />
        <meshStandardMaterial
          color={showHover ? hoverColor : baseColor}
          emissive={showHover ? hoverColor : baseColor}
          emissiveIntensity={showHover ? 2 : 1}
          metalness={0.3}
          roughness={0.2}
          transparent={hasValidTool}
          opacity={hasValidTool ? 0.6 : 1}
        />
      </mesh>

      {/* Plus icon on hover - only when no tool selected */}
      {showHover && !hasValidTool && (
        <Html center distanceFactor={3} style={{ pointerEvents: "none" }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/90 text-white font-bold text-lg shadow-lg shadow-emerald-500/50 animate-pulse">
            +
          </div>
        </Html>
      )}

      {/* Direction indicator for vertical stacking */}
      {isVertical && !hasValidTool && (
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

export const ShelfScene = memo(function ShelfScene({ config, selectedTool, selectedColor, hoveredCell, onCellClick, onCellHover, placementGhosts = [] }: Props) {
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
      cellWidth: number
      cellHeight: number
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

          const snapPosition: [number, number, number] = isAboveModule
            ? [position[0], position[1] - cellHeight / 2 + 0.05, position[2] + depth / 2]
            : [position[0], position[1], 0.05] // Front snap point at z=0.05

          snaps.push({
            key: `snap-${gridRow}-${gridCol}`,
            position: snapPosition,
            row: gridRow,
            col: gridCol,
            isVertical: isAboveModule,
            cellWidth,
            cellHeight,
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

        const colorToUse = cell.color || "weiss"

        return (
          <GLBModule
            key={key}
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
          />
        )
      })}

      {snapPoints.map(({ key, position, row, col, isVertical, cellWidth, cellHeight }) => (
        <SnapPoint
          key={key}
          position={position}
          row={row}
          col={col}
          isHovered={hoveredCell?.row === row && hoveredCell?.col === col}
          onClick={handleClick}
          onHover={handleHover}
          isVertical={isVertical}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          config={config}
        />
      ))}

      {/* Placement Ghost Effects - fading confirmation animation */}
      {placementGhosts.map((ghost) => {
        // Calculate position for the ghost
        const columnTubeOverlap = 0.003
        const rowTubeOverlap = 0.003
        
        let xPos = 0
        for (let c = 0; c < ghost.col; c++) {
          xPos += (config.columnWidths[c] || 75) / 100 - columnTubeOverlap
        }
        const cellWidth = (config.columnWidths[ghost.col] || 75) / 100
        xPos += cellWidth / 2
        
        let totalWidth = 0
        for (let c = 0; c < config.columns; c++) {
          totalWidth += (config.columnWidths[c] || 75) / 100
          if (c > 0) totalWidth -= columnTubeOverlap
        }
        const offsetX = -totalWidth / 2
        
        let yPos = 0
        for (let r = 0; r < ghost.row; r++) {
          yPos += (config.rowHeights[r] || 40) / 100 - rowTubeOverlap
        }
        const cellHeight = (config.rowHeights[ghost.row] || 40) / 100
        yPos += cellHeight / 2

        const position: [number, number, number] = [xPos + offsetX, yPos, -0.38 / 2]

        return (
          <PlacementGhostEffect
            key={ghost.id}
            position={position}
            moduleType={ghost.type}
            color={ghost.color}
            width={cellWidth}
            height={cellHeight}
            config={config}
            createdAt={ghost.createdAt}
          />
        )
      })}
    </group>
  )
})
