"use client"

import type React from "react"
import { Html } from "@react-three/drei"
import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ShelfConfig } from "@/components/shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import type { JSX } from "react/jsx-runtime"
import { floorTexture } from "@/lib/textures"

interface ShelfSceneProps {
  config: ShelfConfig
  selectedTool: string | "empty" | null
  hoveredCell: { row: number; col: number } | null
  selectedCell: { row: number; col: number } | null
  onCellClick: (row: number, col: number) => void
  onCellHover: (cell: { row: number; col: number } | null) => void
  onDragStart?: (row: number, col: number) => void
  onDragOver?: (row: number, col: number) => void
  onDragEnd?: () => void
  isDragging?: boolean
  showFrame?: boolean
  onExpandLeft?: (row: number, col: number, width?: 38 | 75) => void
  onExpandRight?: (row: number, col: number, width?: 38 | 75) => void
  onExpandUp?: (row: number, col: number) => void
  onExpandDown?: (row: number, col: number) => void
}

type Props = {
  config: ShelfConfig
  selectedTool?: string | "empty" | null
  hoveredCell?: { row: number; col: number } | null
  selectedCell?: { row: number; col: number } | null
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (cell: { row: number; col: number } | null) => void
  onDragStart?: (row: number, col: number) => void
  onDragOver?: (row: number, col: number) => void
  onDragEnd?: () => void
  isDragging?: boolean
  showFrame?: boolean
  onExpandLeft?: (row: number, col: number, width?: 38 | 75) => void
  onExpandRight?: (row: number, col: number, width?: 38 | 75) => void
  onExpandUp?: (row: number, col: number) => void
  onExpandDown?: (row: number, col: number) => void
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

function ChromeTube({
  start,
  end,
  radius = 0.012,
}: {
  start: [number, number, number]
  end: [number, number, number]
  radius?: number
}) {
  const { position, length, rotation } = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    const direction = new THREE.Vector3().subVectors(endVec, startVec)
    const len = direction.length()
    direction.normalize()

    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    const euler = new THREE.Euler().setFromQuaternion(quaternion)

    return {
      position: [midpoint.x, midpoint.y, midpoint.z] as [number, number, number],
      length: len,
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
    }
  }, [start, end])

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 16]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
    </mesh>
  )
}

function ShelfPanel({
  position,
  width,
  depth,
  color,
}: {
  position: [number, number, number]
  width: number
  depth: number
  color: string
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[width, 0.018, depth]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function SidePanel({
  position,
  height,
  depth,
  color,
}: {
  position: [number, number, number]
  height: number
  depth: number
  color: string
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[0.018, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function BackPanel({
  position,
  width,
  height,
  color,
}: {
  position: [number, number, number]
  width: number
  height: number
  color: string
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[width, height, 0.012]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function DoorPanel({
  position,
  width,
  height,
  color,
  hasLock = false,
}: {
  position: [number, number, number]
  width: number
  height: number
  color: string
  hasLock?: boolean
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[width * 0.35, 0, 0.015]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.03, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      {hasLock && (
        <mesh position={[width * 0.35, -0.03, 0.015]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.015, 8]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
        </mesh>
      )}
    </group>
  )
}

function DrawerPanel({
  position,
  width,
  height,
  color,
}: {
  position: [number, number, number]
  width: number
  height: number
  color: string
}) {
  const handleWidth = width * 0.7
  return (
    <group position={position}>
      {/* Main drawer front panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Drawer line groove - top */}
      <mesh position={[0, height * 0.15, 0.013]} castShadow>
        <boxGeometry args={[width * 0.9, 0.003, 0.005]} />
        <meshStandardMaterial color="#999" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Drawer line groove - bottom */}
      <mesh position={[0, -height * 0.15, 0.013]} castShadow>
        <boxGeometry args={[width * 0.9, 0.003, 0.005]} />
        <meshStandardMaterial color="#999" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Handle bar */}
      <mesh position={[0, 0, 0.03]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, handleWidth, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Handle end cap left */}
      <mesh position={[-handleWidth / 2, 0, 0.03]} castShadow>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Handle end cap right */}
      <mesh position={[handleWidth / 2, 0, 0.03]} castShadow>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Foot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.015, 0.018, 0.025, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
    </group>
  )
}

function InteractiveCell({
  position,
  width,
  height,
  depth,
  row,
  col,
  isEmpty,
  isSelected,
  selectedTool,
  onClick,
  onHover,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  hasModuleBelow,
  totalRows,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  row: number
  col: number
  isEmpty: boolean
  isSelected: boolean
  selectedTool: string | null
  onClick?: (row: number, col: number) => void
  onHover?: (cell: { row: number; col: number } | null) => void
  onDragStart?: (row: number, col: number) => void
  onDragOver?: (row: number, col: number) => void
  onDragEnd?: () => void
  isDragging?: boolean
  hasModuleBelow?: boolean
  totalRows: number
}) {
  const [localHover, setLocalHover] = useState(false)

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    console.log("[v0] InteractiveCell clicked:", { row, col, isEmpty, hasModuleBelow, totalRows })
    onDragStart?.(row, col)
  }

  const handlePointerEnter = () => {
    setLocalHover(true)
    onHover?.({ row, col })
    document.body.style.cursor = "pointer"

    if (isDragging) {
      onDragOver?.(row, col)
    }
  }

  const handlePointerOut = () => {
    setLocalHover(false)
    onHover?.(null)
    document.body.style.cursor = "auto"
  }

  const isGroundLevel = row === totalRows - 1
  const canInteract = !isEmpty || isGroundLevel || hasModuleBelow

  // This allows clicking on cells that should be stackable

  const showStartHint = isEmpty && isGroundLevel && localHover
  const showStackHint = isEmpty && hasModuleBelow && localHover
  const showHover = localHover

  let color = "#666666"
  let opacity = 0.02

  if (showStartHint || showStackHint) {
    color = "#22c55e" // Green for "add here"
    opacity = 0.5
  } else if (showHover && selectedTool === "empty") {
    color = "#ef4444" // Red for remove
    opacity = 0.4
  } else if (showHover && !isEmpty) {
    color = "#3b82f6" // Blue for hover on filled
    opacity = 0.4
  } else if (showHover && canInteract) {
    color = "#22c55e" // Green for stackable position
    opacity = 0.4
  } else if (isSelected) {
    color = "#f59e0b" // Amber for selected
    opacity = 0.3
  } else if (isEmpty && isGroundLevel) {
    color = "#22c55e" // Subtle green for ground level empty
    opacity = 0.15
  } else if (isEmpty && hasModuleBelow) {
    color = "#22c55e" // Subtle green for stackable empty
    opacity = 0.1
  }

  if (!canInteract) {
    opacity = 0
  }

  return (
    <mesh
      position={position}
      onPointerDown={canInteract ? handlePointerDown : undefined}
      onPointerEnter={canInteract ? handlePointerEnter : undefined}
      onPointerOut={canInteract ? handlePointerOut : undefined}
    >
      <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

function ExpandButton({
  position,
  direction,
  onClick,
  row,
  col,
}: {
  position: [number, number, number]
  direction: "left" | "right" | "up" | "down"
  onClick?: (row: number, col: number, width?: 38 | 75) => void
  row: number
  col: number
}) {
  const [hovered, setHovered] = useState(false)
  const [showSizeSelector, setShowSizeSelector] = useState(false)

  const isHorizontal = direction === "left" || direction === "right"
  const label = isHorizontal ? "SPALTE" : "REIHE"

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isHorizontal) {
      setShowSizeSelector(!showSizeSelector)
    } else {
      onClick?.(row, col)
    }
  }

  const handleSizeSelect = (width: 38 | 75) => {
    onClick?.(row, col, width)
    setShowSizeSelector(false)
  }

  return (
    <Html position={position} center>
      <div className="relative">
        <button
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => !showSizeSelector && setHovered(false)}
          className={`
            group flex items-center gap-1.5
            px-3 py-1.5 rounded-full
            font-semibold text-[11px] uppercase tracking-wider
            transition-all duration-200 ease-out
            border shadow-lg whitespace-nowrap
            ${
              hovered || showSizeSelector
                ? "bg-amber-500 text-white border-amber-400 scale-110 shadow-amber-500/30"
                : "bg-zinc-900/90 text-white/90 border-white/20 backdrop-blur-md hover:bg-zinc-800"
            }
          `}
        >
          <span className={`transition-transform duration-200 ${hovered || showSizeSelector ? "rotate-90" : ""}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <span>{label}</span>
        </button>

        {/* Size selector dropdown for horizontal expansion */}
        {showSizeSelector && isHorizontal && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex gap-1.5 bg-zinc-900/95 backdrop-blur-md rounded-lg p-2 border border-white/20 shadow-2xl z-50"
            onMouseLeave={() => {
              setShowSizeSelector(false)
              setHovered(false)
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSizeSelect(38)
              }}
              className="px-4 py-2 text-sm font-bold text-white bg-zinc-700 hover:bg-amber-500 rounded-md transition-all hover:scale-105 whitespace-nowrap"
            >
              38cm
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSizeSelect(75)
              }}
              className="px-4 py-2 text-sm font-bold text-white bg-zinc-700 hover:bg-amber-500 rounded-md transition-all hover:scale-105 whitespace-nowrap"
            >
              75cm
            </button>
          </div>
        )}
      </div>
    </Html>
  )
}

function StartingPlaceholder({
  position,
  width,
  height,
  depth,
  onClick,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      {/* Pulsing base indicator */}
      <mesh
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={hovered ? "#22c55e" : "#d4a574"} transparent opacity={hovered ? 0.7 : 0.4} />
      </mesh>

      {/* Plus icon indicator */}
      <mesh position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshBasicMaterial color={hovered ? "#16a34a" : "#92400e"} transparent opacity={0.9} />
      </mesh>

      {/* Vertical bar of plus */}
      <mesh position={[0, height / 2 + 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.03, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Horizontal bar of plus */}
      <mesh position={[0, height / 2 + 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 0.03]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// Helper function to calculate cumulative X position for variable column widths
function getColumnStartX(col: number, colWidths: (75 | 38)[], offsetX: number): number {
  let x = offsetX
  for (let i = 0; i < col; i++) {
    x += (colWidths[i] || 75) / 100
  }
  return x
}

// Helper function to calculate total width
function getTotalWidth(colWidths: (75 | 38)[]): number {
  return colWidths.reduce((sum, w) => sum + (w || 75) / 100, 0)
}

// Helper function to calculate total height
function getTotalHeight(rowHeights: 38[], rows: number): number {
  let total = 0
  for (let i = 0; i < rows; i++) {
    total += (rowHeights[i] || 38) / 100
  }
  return total
}

function ChromeFrameElements({
  config,
  showFrame,
  offsetX,
  offsetY,
  offsetZ,
  depth,
  tubeRadius,
}: {
  config: ShelfConfig
  showFrame: boolean
  offsetX: number
  offsetY: number
  offsetZ: number
  depth: number
  tubeRadius: number
}) {
  const els: JSX.Element[] = []

  // Helper to check if a cell has a module
  const hasModuleAt = (row: number, col: number) => {
    const cell = config.grid[row]?.[col]
    return cell && cell.type !== "empty"
  }

  const getTopmostModuleRow = (col: number): number | null => {
    for (let row = 0; row < config.rows; row++) {
      if (hasModuleAt(row, col)) {
        return row
      }
    }
    return null
  }

  // Set to track already-drawn elements
  const drawnVerticals = new Set<string>()
  const drawnHorizontals = new Set<string>()
  const drawnDepths = new Set<string>()
  const drawnFeet = new Set<string>()

  const filledCells = new Set<string>()
  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.columns; c++) {
      if (hasModuleAt(r, c)) {
        filledCells.add(`${r}-${c}`)
      }
    }
  }

  if (showFrame && filledCells.size > 0) {
    // For each filled cell, draw its frame
    for (let gridRow = 0; gridRow < config.rows; gridRow++) {
      for (let gridCol = 0; gridCol < config.columns; gridCol++) {
        if (!hasModuleAt(gridRow, gridCol)) continue

        const invertedRow = config.rows - 1 - gridRow
        const cellWidth = (config.colWidths?.[gridCol] || 75) / 100
        const cellHeight = (config.rowHeights?.[gridRow] || 38) / 100

        const leftX = getColumnStartX(gridCol, config.colWidths, offsetX)
        const rightX = leftX + cellWidth
        const bottomY = invertedRow * cellHeight + offsetY
        const topY = (invertedRow + 1) * cellHeight + offsetY

        let lowestY = bottomY

        // Check if there's an empty gap below this module
        if (gridRow < config.rows - 1 && !hasModuleAt(gridRow + 1, gridCol)) {
          // Find the next module below or ground
          let foundModuleBelow = false
          for (let checkRow = gridRow + 1; checkRow < config.rows; checkRow++) {
            if (hasModuleAt(checkRow, gridCol)) {
              // Found a module below - extend posts to the top of that module
              const belowInvertedRow = config.rows - 1 - checkRow
              const belowCellHeight = (config.rowHeights?.[checkRow] || 38) / 100
              lowestY = (belowInvertedRow + 1) * belowCellHeight + offsetY
              foundModuleBelow = true
              break
            }
          }
          // If no module below, extend to ground
          if (!foundModuleBelow) {
            lowestY = offsetY
          }
        }

        // Don't draw posts higher than the topmost module
        const topmostRow = getTopmostModuleRow(gridCol)
        let maxTopY = topY
        if (topmostRow !== null) {
          const topmostInvertedRow = config.rows - 1 - topmostRow
          const topmostCellHeight = (config.rowHeights?.[topmostRow] || 38) / 100
          maxTopY = (topmostInvertedRow + 1) * topmostCellHeight + offsetY
        }
        // Cap topY to not exceed the topmost module's top
        const cappedTopY = Math.min(topY, maxTopY)

        // Draw vertical posts at corners
        const corners = [
          { x: leftX, key: `${leftX.toFixed(3)}` },
          { x: rightX, key: `${rightX.toFixed(3)}` },
        ]

        corners.forEach(({ x, key }) => {
          const vKey = `v-${key}-${lowestY.toFixed(3)}-${cappedTopY.toFixed(3)}`
          if (!drawnVerticals.has(vKey)) {
            drawnVerticals.add(vKey)
            els.push(
              <ChromeTube
                key={`vpost-front-${vKey}`}
                start={[x, lowestY, offsetZ + depth]}
                end={[x, cappedTopY, offsetZ + depth]}
                radius={tubeRadius}
              />,
            )
            els.push(
              <ChromeTube
                key={`vpost-back-${vKey}`}
                start={[x, lowestY, offsetZ]}
                end={[x, cappedTopY, offsetZ]}
                radius={tubeRadius}
              />,
            )
          }

          // Depth rails at top and bottom of the cell (not lowestY)
          const dKeyBottom = `d-${key}-${bottomY.toFixed(3)}`
          if (!drawnDepths.has(dKeyBottom)) {
            drawnDepths.add(dKeyBottom)
            els.push(
              <ChromeTube
                key={`depth-${dKeyBottom}`}
                start={[x, bottomY, offsetZ]}
                end={[x, bottomY, offsetZ + depth]}
                radius={tubeRadius}
              />,
            )
          }

          const dKeyTop = `d-${key}-${topY.toFixed(3)}`
          if (!drawnDepths.has(dKeyTop)) {
            drawnDepths.add(dKeyTop)
            els.push(
              <ChromeTube
                key={`depth-${dKeyTop}`}
                start={[x, topY, offsetZ]}
                end={[x, topY, offsetZ + depth]}
                radius={tubeRadius}
              />,
            )
          }

          if (Math.abs(lowestY - offsetY) < 0.001) {
            const fKey = `f-${key}`
            if (!drawnFeet.has(fKey)) {
              drawnFeet.add(fKey)
              els.push(<Foot key={`foot-front-${fKey}`} position={[x, 0.012, offsetZ + depth]} />)
              els.push(<Foot key={`foot-back-${fKey}`} position={[x, 0.012, offsetZ]} />)
            }
          }
        })

        // Horizontal rails
        const hKeyBottom = `h-${getColumnStartX(gridCol, config.colWidths, offsetX).toFixed(3)}-${getColumnStartX(
          gridCol + 1,
          config.colWidths,
          offsetX,
        ).toFixed(3)}-${bottomY.toFixed(3)}`
        if (!drawnHorizontals.has(hKeyBottom)) {
          drawnHorizontals.add(hKeyBottom)
          els.push(
            <ChromeTube
              key={`hrail-front-${hKeyBottom}`}
              start={[getColumnStartX(gridCol, config.colWidths, offsetX), bottomY, offsetZ + depth]}
              end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), bottomY, offsetZ + depth]}
              radius={tubeRadius}
            />,
          )
          els.push(
            <ChromeTube
              key={`hrail-back-${hKeyBottom}`}
              start={[getColumnStartX(gridCol, config.colWidths, offsetX), bottomY, offsetZ]}
              end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), bottomY, offsetZ]}
              radius={tubeRadius}
            />,
          )
        }

        const hKeyTop = `h-${getColumnStartX(gridCol, config.colWidths, offsetX).toFixed(3)}-${getColumnStartX(
          gridCol + 1,
          config.colWidths,
          offsetX,
        ).toFixed(3)}-${topY.toFixed(3)}`
        if (!drawnHorizontals.has(hKeyTop)) {
          drawnHorizontals.add(hKeyTop)
          els.push(
            <ChromeTube
              key={`hrail-front-${hKeyTop}`}
              start={[getColumnStartX(gridCol, config.colWidths, offsetX), topY, offsetZ + depth]}
              end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), topY, offsetZ + depth]}
              radius={tubeRadius}
            />,
          )
          els.push(
            <ChromeTube
              key={`hrail-back-${hKeyTop}`}
              start={[getColumnStartX(gridCol, config.colWidths, offsetX), topY, offsetZ]}
              end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), topY, offsetZ]}
              radius={tubeRadius}
            />,
          )
        }
      }
    }
  }

  return els
}

export function ShelfScene({
  config,
  selectedTool,
  hoveredCell,
  selectedCell,
  onCellClick,
  onCellHover,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  showFrame = true,
  onExpandLeft,
  onExpandRight,
  onExpandUp,
  onExpandDown,
}: Props) {
  const [useGLBModels, setUseGLBModules] = useState(false)

  const depth = 0.38
  const tubeRadius = 0.012

  const cellPositions = useMemo(() => {
    const positions: {
      row: number
      col: number
      x: number
      y: number
      z: number
      width: number
      height: number
      hasModule: boolean
    }[] = []

    let yOffset = 0
    for (let row = config.rows - 1; row >= 0; row--) {
      const rowHeight = (config.rowHeights[row] || 38) / 100
      let xOffset = 0

      for (let col = 0; col < config.columns; col++) {
        const colWidth = (config.colWidths[col] || 75) / 100
        const cell = config.grid[row]?.[col]
        const hasModule = cell && cell.type !== "empty"

        positions.push({
          row,
          col,
          x: xOffset + colWidth / 2,
          y: yOffset + rowHeight / 2,
          z: depth / 2,
          width: colWidth,
          height: rowHeight,
          hasModule,
        })

        xOffset += colWidth
      }
      yOffset += rowHeight
    }

    // Center the positions
    const centerX =
      positions.length > 0
        ? (Math.max(...positions.map((p) => p.x + p.width / 2)) +
            Math.min(...positions.map((p) => p.x - p.width / 2))) /
          2
        : 0
    return positions.map((p) => ({ ...p, x: p.x - centerX }))
  }, [config, depth])

  const moduleBoundaryInfo = useMemo(() => {
    const filledCells = cellPositions.filter((c) => c.hasModule)
    if (filledCells.length === 0) return []

    // Find the actual boundaries of the filled structure
    const minCol = Math.min(...filledCells.map((c) => c.col))
    const maxCol = Math.max(...filledCells.map((c) => c.col))

    // For each column, find the topmost filled cell (lowest row number)
    const topCellByCol = new Map<number, (typeof cellPositions)[0]>()
    filledCells.forEach((cell) => {
      const existing = topCellByCol.get(cell.col)
      if (!existing || cell.row < existing.row) {
        topCellByCol.set(cell.col, cell)
      }
    })

    // Find ground-level (row === rows-1) cells at edges
    const groundCells = filledCells.filter((c) => c.row === config.rows - 1)
    const leftmostGroundCell = groundCells.length > 0 ? groundCells.reduce((a, b) => (a.col < b.col ? a : b)) : null
    const rightmostGroundCell = groundCells.length > 0 ? groundCells.reduce((a, b) => (a.col > b.col ? a : b)) : null

    const boundaries: {
      row: number
      col: number
      x: number
      y: number
      z: number
      width: number
      height: number
      showUp: boolean
      showLeft: boolean
      showRight: boolean
    }[] = []

    filledCells.forEach((cell) => {
      const isTopInColumn = topCellByCol.get(cell.col) === cell
      const isLeftEdge = leftmostGroundCell && cell.row === config.rows - 1 && cell.col === minCol
      const isRightEdge = rightmostGroundCell && cell.row === config.rows - 1 && cell.col === maxCol

      // Only add if this cell has at least one button to show
      if (isTopInColumn || isLeftEdge || isRightEdge) {
        boundaries.push({
          row: cell.row,
          col: cell.col,
          x: cell.x,
          y: cell.y,
          z: cell.z,
          width: cell.width,
          height: cell.height,
          showUp: isTopInColumn,
          showLeft: isLeftEdge || false,
          showRight: isRightEdge || false,
        })
      }
    })

    return boundaries
  }, [cellPositions, config.rows])

  const { elements, interactiveCells, glbModules, shelfBounds, moduleBounds } = useMemo(() => {
    const els: JSX.Element[] = []
    const cells: JSX.Element[] = []
    const glbs: JSX.Element[] = []
    const effectiveColor = config.accentColor !== "none" ? config.accentColor : "weiss"

    const offsetX = -getTotalWidth(config.colWidths) / 2 // Center based on total width
    const offsetY = 0.025
    const offsetZ = -depth / 2

    const totalWidth = getTotalWidth(config.colWidths)
    const totalHeight = getTotalHeight(config.rowHeights, config.rows)

    const bounds = {
      minX: offsetX,
      maxX: offsetX + totalWidth,
      minY: offsetY,
      maxY: offsetY + totalHeight,
      centerZ: offsetZ + depth / 2,
    }

    const filledCells = new Set<string>()
    let modMinX = Number.POSITIVE_INFINITY,
      modMaxX = Number.NEGATIVE_INFINITY
    let modMinY = Number.POSITIVE_INFINITY,
      modMaxY = Number.NEGATIVE_INFINITY

    for (let row = 0; row < config.rows; row++) {
      for (let gridCol = 0; gridCol < config.columns; gridCol++) {
        if (config.grid[row]?.[gridCol]?.type && config.grid[row][gridCol].type !== "empty") {
          filledCells.add(`${row}-${gridCol}`)
          const invertedRow = config.rows - 1 - row
          const cellWidth = (config.colWidths?.[gridCol] || 75) / 100
          const cellHeight = (config.rowHeights?.[row] || 38) / 100

          const leftX = getColumnStartX(gridCol, config.colWidths, offsetX)
          const rightX = leftX + cellWidth
          const bottomY = invertedRow * cellHeight + offsetY
          const topY = (invertedRow + 1) * cellHeight + offsetY

          modMinX = Math.min(modMinX, leftX)
          modMaxX = Math.max(modMaxX, rightX)
          modMinY = Math.min(modMinY, bottomY)
          modMaxY = Math.max(modMaxY, topY)
        }
      }
    }

    const hasModuleAt = (row: number, col: number): boolean => {
      return filledCells.has(`${row}-${col}`)
    }

    const drawnVerticals = new Set<string>()
    const drawnHorizontals = new Set<string>()
    const drawnDepths = new Set<string>()
    const drawnFeet = new Set<string>()

    if (showFrame && filledCells.size > 0) {
      // For each filled cell, draw its frame
      for (let gridRow = 0; gridRow < config.rows; gridRow++) {
        for (let gridCol = 0; gridCol < config.columns; gridCol++) {
          if (!hasModuleAt(gridRow, gridCol)) continue

          const invertedRow = config.rows - 1 - gridRow
          const cellWidth = (config.colWidths?.[gridCol] || 75) / 100
          const cellHeight = (config.rowHeights?.[gridRow] || 38) / 100

          const leftX = getColumnStartX(gridCol, config.colWidths, offsetX)
          const rightX = leftX + cellWidth
          const bottomY = invertedRow * cellHeight + offsetY
          const topY = (invertedRow + 1) * cellHeight + offsetY

          let lowestY = bottomY

          // Check if there's an empty gap below this module
          if (gridRow < config.rows - 1 && !hasModuleAt(gridRow + 1, gridCol)) {
            // Find the next module below or ground
            let foundModuleBelow = false
            for (let checkRow = gridRow + 1; checkRow < config.rows; checkRow++) {
              if (hasModuleAt(checkRow, gridCol)) {
                // Found a module below - extend posts to the top of that module
                const belowInvertedRow = config.rows - 1 - checkRow
                const belowCellHeight = (config.rowHeights?.[checkRow] || 38) / 100
                lowestY = (belowInvertedRow + 1) * belowCellHeight + offsetY
                foundModuleBelow = true
                break
              }
            }
            // If no module below, extend to ground
            if (!foundModuleBelow) {
              lowestY = offsetY
            }
          }

          // Draw vertical posts at corners
          const corners = [
            { x: leftX, key: `${leftX.toFixed(3)}` },
            { x: rightX, key: `${rightX.toFixed(3)}` },
          ]

          corners.forEach(({ x, key }) => {
            const vKey = `v-${key}-${lowestY.toFixed(3)}-${topY.toFixed(3)}`
            if (!drawnVerticals.has(vKey)) {
              drawnVerticals.add(vKey)
              els.push(
                <ChromeTube
                  key={`vpost-front-${vKey}`}
                  start={[x, lowestY, offsetZ + depth]}
                  end={[x, topY, offsetZ + depth]}
                  radius={tubeRadius}
                />,
              )
              els.push(
                <ChromeTube
                  key={`vpost-back-${vKey}`}
                  start={[x, lowestY, offsetZ]}
                  end={[x, topY, offsetZ]}
                  radius={tubeRadius}
                />,
              )
            }

            // Depth rails at top and bottom of the cell (not lowestY)
            const dKeyBottom = `d-${key}-${bottomY.toFixed(3)}`
            if (!drawnDepths.has(dKeyBottom)) {
              drawnDepths.add(dKeyBottom)
              els.push(
                <ChromeTube
                  key={`depth-${dKeyBottom}`}
                  start={[x, bottomY, offsetZ]}
                  end={[x, bottomY, offsetZ + depth]}
                  radius={tubeRadius}
                />,
              )
            }

            const dKeyTop = `d-${key}-${topY.toFixed(3)}`
            if (!drawnDepths.has(dKeyTop)) {
              drawnDepths.add(dKeyTop)
              els.push(
                <ChromeTube
                  key={`depth-${dKeyTop}`}
                  start={[x, topY, offsetZ]}
                  end={[x, topY, offsetZ + depth]}
                  radius={tubeRadius}
                />,
              )
            }

            if (Math.abs(lowestY - offsetY) < 0.001) {
              const fKey = `f-${key}`
              if (!drawnFeet.has(fKey)) {
                drawnFeet.add(fKey)
                els.push(<Foot key={`foot-front-${fKey}`} position={[x, 0.012, offsetZ + depth]} />)
                els.push(<Foot key={`foot-back-${fKey}`} position={[x, 0.012, offsetZ]} />)
              }
            }
          })

          // Horizontal rails
          const hKeyBottom = `h-${getColumnStartX(gridCol, config.colWidths, offsetX).toFixed(3)}-${getColumnStartX(
            gridCol + 1,
            config.colWidths,
            offsetX,
          ).toFixed(3)}-${bottomY.toFixed(3)}`
          if (!drawnHorizontals.has(hKeyBottom)) {
            drawnHorizontals.add(hKeyBottom)
            els.push(
              <ChromeTube
                key={`hrail-front-${hKeyBottom}`}
                start={[getColumnStartX(gridCol, config.colWidths, offsetX), bottomY, offsetZ + depth]}
                end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), bottomY, offsetZ + depth]}
                radius={tubeRadius}
              />,
            )
            els.push(
              <ChromeTube
                key={`hrail-back-${hKeyBottom}`}
                start={[getColumnStartX(gridCol, config.colWidths, offsetX), bottomY, offsetZ]}
                end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), bottomY, offsetZ]}
                radius={tubeRadius}
              />,
            )
          }

          const hKeyTop = `h-${getColumnStartX(gridCol, config.colWidths, offsetX).toFixed(3)}-${getColumnStartX(
            gridCol + 1,
            config.colWidths,
            offsetX,
          ).toFixed(3)}-${topY.toFixed(3)}`
          if (!drawnHorizontals.has(hKeyTop)) {
            drawnHorizontals.add(hKeyTop)
            els.push(
              <ChromeTube
                key={`hrail-front-${hKeyTop}`}
                start={[getColumnStartX(gridCol, config.colWidths, offsetX), topY, offsetZ + depth]}
                end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), topY, offsetZ + depth]}
                radius={tubeRadius}
              />,
            )
            els.push(
              <ChromeTube
                key={`hrail-back-${hKeyTop}`}
                start={[getColumnStartX(gridCol, config.colWidths, offsetX), topY, offsetZ]}
                end={[getColumnStartX(gridCol + 1, config.colWidths, offsetX), topY, offsetZ]}
                radius={tubeRadius}
              />,
            )
          }
        }
      }
    }

    const canPlaceAt = (gridRow: number, gridCol: number): boolean => {
      // Bottom row can always have modules
      if (gridRow === config.rows - 1) return true
      // Check if ALL rows below have modules
      for (let r = gridRow + 1; r < config.rows; r++) {
        if (!config.grid[r]?.[gridCol]?.type || config.grid[r][gridCol].type === "empty") {
          return false
        }
      }
      return true
    }

    // Draw cells and modules
    config.grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        const cellWidth = (config.colWidths?.[gridCol] || 75) / 100
        const cellHeight = (config.rowHeights?.[gridRow] || 38) / 100

        const invertedRow = config.rows - 1 - gridRow
        const cellX = getColumnStartX(gridCol, config.colWidths, offsetX) + cellWidth / 2
        const cellY = invertedRow * cellHeight + cellHeight / 2 + offsetY
        const cellZ = offsetZ + depth / 2

        const isEmpty = !cell.type || cell.type === "empty"
        const canPlace = canPlaceAt(gridRow, gridCol) // Calculate if placement is valid

        // Interactive cell overlay
        cells.push(
          <InteractiveCell
            key={`interact-${gridRow}-${gridCol}`}
            position={[cellX, cellY, cellZ]}
            width={cellWidth}
            height={cellHeight}
            depth={depth}
            row={gridRow}
            col={gridCol}
            isEmpty={isEmpty}
            isSelected={selectedCell?.row === gridRow && selectedCell?.col === gridCol}
            selectedTool={selectedTool}
            onClick={onCellClick}
            onHover={onCellHover}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            hasModuleBelow={canPlace} // Pass canPlace prop
            totalRows={config.rows}
          />,
        )

        if (isEmpty) return

        const cellColor = cell.color || config.accentColor || "weiss"
        const panelColorForCell = colorMap[cellColor] || colorMap.weiss

        if (useGLBModels) {
          glbs.push(
            <GLBModule
              key={`glb-${gridRow}-${gridCol}`}
              position={[cellX, cellY, cellZ]}
              cellType={cell.type}
              width={cellWidth}
              height={cellHeight}
              depth={depth}
              color={panelColorForCell}
            />,
          )
        }

        // Shelf panel at bottom of cell
        els.push(
          <ShelfPanel
            key={`shelf-${gridRow}-${gridCol}`}
            position={[cellX, cellY - cellHeight / 2 + 0.009, cellZ]}
            width={cellWidth - 0.02}
            depth={depth - 0.02}
            color={panelColorForCell}
          />,
        )

        // Check if there's a module directly above this cell
        const hasModuleAbove =
          gridRow > 0 &&
          config.grid[gridRow - 1]?.[gridCol]?.type &&
          config.grid[gridRow - 1]?.[gridCol]?.type !== "empty"

        if (!hasModuleAbove) {
          const topY = (invertedRow + 1) * cellHeight + offsetY
          els.push(
            <ShelfPanel
              key={`shelf-top-${gridRow}-${gridCol}`}
              position={[cellX, topY + 0.009, cellZ]}
              width={cellWidth - 0.02}
              depth={depth - 0.02}
              color={panelColorForCell}
            />,
          )
        }

        // Module-specific elements
        switch (cell.type) {
          case "mit-seitenwaenden":
            els.push(
              <SidePanel
                key={`side-l-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-${gridRow}-${gridCol}`}
                position={[cellX + cellWidth / 2 - 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            break

          case "mit-rueckwand":
            els.push(
              <BackPanel
                key={`back-${gridRow}-${gridCol}`}
                position={[cellX, cellY, offsetZ + 0.006]}
                width={cellWidth - 0.02}
                height={cellHeight - 0.02}
                color={panelColorForCell}
              />,
            )
            break

          case "mit-tueren":
            const doorWidth = (cellWidth - 0.03) / 2
            els.push(
              <DoorPanel
                key={`door-l-${gridRow}-${gridCol}`}
                position={[cellX - doorWidth / 2 - 0.005, cellY, offsetZ + depth + 0.01]}
                width={doorWidth}
                height={cellHeight - 0.02}
                color={panelColorForCell}
              />,
            )
            els.push(
              <DoorPanel
                key={`door-r-${gridRow}-${gridCol}`}
                position={[cellX + doorWidth / 2 + 0.005, cellY, offsetZ + depth + 0.01]}
                width={doorWidth}
                height={cellHeight - 0.02}
                color={panelColorForCell}
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-${gridRow}-${gridCol}`}
                position={[cellX + cellWidth / 2 - 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            break

          case "abschliessbare-tueren":
            const lockDoorWidth = (cellWidth - 0.03) / 2
            els.push(
              <DoorPanel
                key={`lock-door-l-${gridRow}-${gridCol}`}
                position={[cellX - lockDoorWidth / 2 - 0.005, cellY, offsetZ + depth + 0.01]}
                width={lockDoorWidth}
                height={cellHeight - 0.02}
                color={panelColorForCell}
                hasLock
              />,
            )
            els.push(
              <DoorPanel
                key={`lock-door-r-${gridRow}-${gridCol}`}
                position={[cellX + lockDoorWidth / 2 + 0.005, cellY, offsetZ + depth + 0.01]}
                width={lockDoorWidth}
                height={cellHeight - 0.02}
                color={panelColorForCell}
                hasLock
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-lock-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-lock-${gridRow}-${gridCol}`}
                position={[cellX + cellWidth / 2 - 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            break

          case "mit-klapptuer":
            els.push(
              <DoorPanel
                key={`flip-${gridRow}-${gridCol}`}
                position={[cellX, cellY, offsetZ + depth + 0.01]}
                width={cellWidth - 0.02}
                height={cellHeight - 0.02}
                color={panelColorForCell}
              />,
            )
            break

          case "mit-doppelschublade":
          case "schubladen":
            const drawerHeight = (cellHeight - 0.03) / 2
            els.push(
              <DrawerPanel
                key={`drawer-top-${gridRow}-${gridCol}`}
                position={[cellX, cellY + drawerHeight / 2 + 0.005, offsetZ + depth + 0.01]}
                width={cellWidth - 0.02}
                height={drawerHeight}
                color={panelColorForCell}
              />,
            )
            els.push(
              <DrawerPanel
                key={`drawer-bottom-${gridRow}-${gridCol}`}
                position={[cellX, cellY - drawerHeight / 2 - 0.005, offsetZ + depth + 0.01]}
                width={cellWidth - 0.02}
                height={drawerHeight}
                color={panelColorForCell}
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-drawer-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-drawer-${gridRow}-${gridCol}`}
                position={[cellX + cellWidth / 2 - 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            break
        }
      })
    })

    return {
      elements: els,
      interactiveCells: cells,
      glbModules: glbs,
      shelfBounds: bounds,
      moduleBounds: {
        minX: modMinX,
        maxX: modMaxX,
        minY: modMinY,
        maxY: modMaxY,
      },
    }
  }, [
    config,
    depth,
    selectedTool,
    onCellClick,
    onCellHover,
    useGLBModels,
    onDragStart,
    onDragOver,
    onDragEnd,
    isDragging,
  ])

  const isGridEmpty = useMemo(() => {
    return !config.grid.some((row) => row.some((cell) => cell.type !== "empty"))
  }, [config.grid])

  const hasAnyFilledCells = useMemo(() => {
    return cellPositions.some((cell) => cell.hasModule)
  }, [cellPositions])

  const cellWidth = useMemo(() => {
    return getTotalWidth(config.colWidths) / config.columns
  }, [config.colWidths, config.columns])

  const cellHeight = useMemo(() => {
    return getTotalHeight(config.rowHeights, config.rows) / config.rows
  }, [config.rowHeights, config.rows])

  const frameElements = useMemo(() => {
    return ChromeFrameElements({
      config,
      showFrame,
      offsetX: -getTotalWidth(config.colWidths) / 2,
      offsetY: 0.025,
      offsetZ: -depth / 2,
      depth,
      tubeRadius,
    })
  }, [config, showFrame, depth, tubeRadius])

  return (
    <group>
      {elements}
      {interactiveCells}
      {glbModules}
      {frameElements}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>
      {!hasAnyFilledCells && (
        <StartingPlaceholder
          position={[0, cellHeight / 2 + 0.025, 0]}
          width={cellWidth}
          height={cellHeight}
          depth={depth}
          onClick={() => onCellClick?.(config.rows - 1, Math.floor(config.columns / 2))}
        />
      )}
    </group>
  )
}
