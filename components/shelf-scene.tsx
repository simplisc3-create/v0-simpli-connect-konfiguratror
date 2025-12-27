"use client"
import { Html } from "@react-three/drei"
import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ShelfConfig } from "@/components/shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
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
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, height * 0.15, 0.013]} castShadow>
        <boxGeometry args={[width * 0.9, 0.003, 0.005]} />
        <meshStandardMaterial color="#999" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, -height * 0.15, 0.013]} castShadow>
        <boxGeometry args={[width * 0.9, 0.003, 0.005]} />
        <meshStandardMaterial color="#999" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.03]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, handleWidth, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[-handleWidth / 2, 0, 0.03]} castShadow>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
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
  onDragStart,
  onDragOver,
  onHover,
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
  onDragStart?: (row: number, col: number) => void
  onDragOver?: (row: number, col: number) => void
  onHover?: (cell: { row: number; col: number } | null) => void
  isDragging?: boolean
  hasModuleBelow?: boolean
  totalRows: number
}) {
  const [localHover, setLocalHover] = useState(false)

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
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

  const showStartHint = isEmpty && isGroundLevel && localHover
  const showStackHint = isEmpty && hasModuleBelow && localHover
  const showHover = localHover

  let color = "#666666"
  let opacity = 0.02

  if (showStartHint || showStackHint) {
    color = "#22c55e"
    opacity = 0.5
  } else if (showHover && selectedTool === "empty") {
    color = "#ef4444"
    opacity = 0.4
  } else if (showHover && !isEmpty) {
    color = "#3b82f6"
    opacity = 0.4
  } else if (showHover && canInteract) {
    color = "#22c55e"
    opacity = 0.4
  } else if (isSelected) {
    color = "#f59e0b"
    opacity = 0.3
  } else if (isEmpty && isGroundLevel) {
    color = "#22c55e"
    opacity = 0.15
  } else if (isEmpty && hasModuleBelow) {
    color = "#22c55e"
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

function ExpansionCell({
  position,
  width,
  height,
  depth,
  direction,
  onClick,
  columnWidth,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  direction: "left" | "right" | "up"
  onClick: (direction: "left" | "right" | "up", width?: number) => void
  columnWidth?: number
}) {
  const [hovered, setHovered] = useState(false)

  const handleClick = (e: any) => {
    e.stopPropagation()
    onClick(direction, columnWidth)
  }

  const color = "#22c55e"
  const opacity = hovered ? 0.6 : 0.2

  return (
    <group>
      <mesh
        position={position}
        onPointerDown={handleClick}
        onPointerEnter={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
      >
        <boxGeometry args={[width * 0.95, height * 0.95, depth * 0.95]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <Html position={position} center>
        <div
          className={`
          ${hovered ? "bg-green-500 scale-110" : "bg-green-500/70"}
          text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg
          transition-all duration-150
        `}
        >
          +
        </div>
      </Html>
    </group>
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
      <mesh position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshBasicMaterial color={hovered ? "#16a34a" : "#92400e"} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, height / 2 + 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.03, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, height / 2 + 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 0.03]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

function getColumnStartX(col: number, colWidths: (75 | 38)[], offsetX: number): number {
  let x = offsetX
  for (let i = 0; i < col; i++) {
    x += (colWidths[i] || 75) / 100
  }
  return x
}

function getTotalWidth(colWidths: (75 | 38)[]): number {
  return colWidths.reduce((sum, w) => sum + (w || 75) / 100, 0)
}

function getTotalHeight(rowHeights: 38[], rows: number): number {
  let total = 0
  for (let i = 0; i < rows; i++) {
    total += (rowHeights[i] || 38) / 100
  }
  return total
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
  const depth = 0.38
  const tubeRadius = 0.012

  const { elements, interactiveCells, expansionCells } = useMemo(() => {
    const els: JSX.Element[] = []
    const cells: JSX.Element[] = []
    const expansionCells: JSX.Element[] = []

    const offsetX = -getTotalWidth(config.colWidths) / 2
    const offsetY = 0.025
    const offsetZ = -depth / 2

    const filledCells = new Set<string>()

    // Find all filled cells
    for (let row = 0; row < config.rows; row++) {
      for (let gridCol = 0; gridCol < config.columns; gridCol++) {
        if (config.grid[row]?.[gridCol]?.type && config.grid[row][gridCol].type !== "empty") {
          filledCells.add(`${row}-${gridCol}`)
        }
      }
    }

    const hasModuleAt = (row: number, col: number): boolean => {
      return filledCells.has(`${row}-${col}`)
    }

    const canPlaceAt = (gridRow: number, gridCol: number): boolean => {
      if (gridRow === config.rows - 1) return true
      const cellBelow = config.grid[gridRow + 1]?.[gridCol]
      return cellBelow?.type !== undefined && cellBelow?.type !== "empty"
    }

    const drawnVerticals = new Set<string>()
    const drawnHorizontals = new Set<string>()
    const drawnDepths = new Set<string>()
    const drawnFeet = new Set<string>()

    // Draw frame and modules
    if (showFrame && filledCells.size > 0) {
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

          // Find the topmost module in this column to cap vertical posts properly
          let topmostModuleRow = config.rows
          for (let r = 0; r < config.rows; r++) {
            if (hasModuleAt(r, gridCol)) {
              topmostModuleRow = Math.min(topmostModuleRow, r)
            }
          }

          // Calculate the actual top Y based on the topmost module
          const topmostInvertedRow = config.rows - 1 - topmostModuleRow
          const cappedTopY = topmostModuleRow < config.rows ? (topmostInvertedRow + 1) * cellHeight + offsetY : topY

          let lowestY = offsetY
          if (hasModuleAt(gridRow, gridCol)) {
            let foundModuleBelow = false
            for (let r = gridRow + 1; r < config.rows; r++) {
              if (hasModuleAt(r, gridCol)) {
                foundModuleBelow = true
                const belowInverted = config.rows - 1 - r
                lowestY = belowInverted * cellHeight + offsetY
                break
              }
            }
            if (!foundModuleBelow) {
              lowestY = offsetY
            }
          }

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

            const dKeyTop = `d-${key}-${cappedTopY.toFixed(3)}`
            if (!drawnDepths.has(dKeyTop)) {
              drawnDepths.add(dKeyTop)
              els.push(
                <ChromeTube
                  key={`depth-${dKeyTop}`}
                  start={[x, cappedTopY, offsetZ]}
                  end={[x, cappedTopY, offsetZ + depth]}
                  radius={tubeRadius}
                />,
              )
            }

            if (gridRow === config.rows - 1) {
              const fKey = `f-${key}`
              if (!drawnFeet.has(fKey)) {
                drawnFeet.add(fKey)
                els.push(<Foot key={`foot-front-${fKey}`} position={[x, 0.012, offsetZ + depth]} />)
                els.push(<Foot key={`foot-back-${fKey}`} position={[x, 0.012, offsetZ]} />)
              }
            }
          })

          const hKeyBottom = `h-${leftX.toFixed(3)}-${rightX.toFixed(3)}-${bottomY.toFixed(3)}`
          if (!drawnHorizontals.has(hKeyBottom)) {
            drawnHorizontals.add(hKeyBottom)
            els.push(
              <ChromeTube
                key={`hrail-front-${hKeyBottom}`}
                start={[leftX, bottomY, offsetZ + depth]}
                end={[rightX, bottomY, offsetZ + depth]}
                radius={tubeRadius}
              />,
            )
            els.push(
              <ChromeTube
                key={`hrail-back-${hKeyBottom}`}
                start={[leftX, bottomY, offsetZ]}
                end={[rightX, bottomY, offsetZ]}
                radius={tubeRadius}
              />,
            )
          }

          const hKeyTop = `h-${leftX.toFixed(3)}-${rightX.toFixed(3)}-${cappedTopY.toFixed(3)}`
          if (!drawnHorizontals.has(hKeyTop)) {
            drawnHorizontals.add(hKeyTop)
            els.push(
              <ChromeTube
                key={`hrail-front-${hKeyTop}`}
                start={[leftX, cappedTopY, offsetZ + depth]}
                end={[rightX, cappedTopY, offsetZ + depth]}
                radius={tubeRadius}
              />,
            )
            els.push(
              <ChromeTube
                key={`hrail-back-${hKeyTop}`}
                start={[leftX, cappedTopY, offsetZ]}
                end={[rightX, cappedTopY, offsetZ]}
                radius={tubeRadius}
              />,
            )
          }
        }
      }
    }

    // Draw interactive cells and modules
    config.grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        const cellWidth = (config.colWidths?.[gridCol] || 75) / 100
        const cellHeight = (config.rowHeights?.[gridRow] || 38) / 100

        const invertedRow = config.rows - 1 - gridRow
        const cellX = getColumnStartX(gridCol, config.colWidths, offsetX) + cellWidth / 2
        const cellY = invertedRow * cellHeight + cellHeight / 2 + offsetY
        const cellZ = offsetZ + depth / 2

        const isEmpty = !cell.type || cell.type === "empty"
        const canPlace = canPlaceAt(gridRow, gridCol)

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
            selectedTool={selectedTool || null}
            onHover={onCellHover}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            isDragging={isDragging}
            hasModuleBelow={canPlace}
            totalRows={config.rows}
          />,
        )

        if (isEmpty) return

        const cellColor = cell.color || config.accentColor || "weiss"
        const panelColorForCell = colorMap[cellColor] || colorMap.weiss

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
                key={`side-l-door-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, cellZ]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColorForCell}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-door-${gridRow}-${gridCol}`}
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

    // Add expansion cells if there are any modules
    const hasAnyModule = filledCells.size > 0

    if (hasAnyModule) {
      const groundLevelRow = config.rows - 1

      // Find boundaries
      let maxFilledCol = -1
      let minFilledCol = config.columns
      let minFilledRow = config.rows

      for (let gridCol = 0; gridCol < config.columns; gridCol++) {
        for (let gridRow = 0; gridRow < config.rows; gridRow++) {
          if (hasModuleAt(gridRow, gridCol)) {
            maxFilledCol = Math.max(maxFilledCol, gridCol)
            minFilledCol = Math.min(minFilledCol, gridCol)
            minFilledRow = Math.min(minFilledRow, gridRow)
          }
        }
      }

      // Expansion cell to the RIGHT
      if (maxFilledCol === config.columns - 1) {
        const rightColWidth = (config.colWidths?.[maxFilledCol] || 75) / 100
        const rightCellHeight = (config.rowHeights?.[groundLevelRow] || 38) / 100
        const rightEdgeX = getColumnStartX(config.columns, config.colWidths, offsetX)
        const rightCellY = rightCellHeight / 2 + offsetY

        expansionCells.push(
          <ExpansionCell
            key="expand-right-ghost"
            position={[rightEdgeX + rightColWidth / 2, rightCellY, offsetZ + depth / 2]}
            width={rightColWidth}
            height={rightCellHeight}
            depth={depth}
            direction="right"
            onClick={(dir, w) => onExpandRight?.(0, 0, w)}
            columnWidth={config.colWidths?.[maxFilledCol] || 75}
          />,
        )
      }

      // Expansion cell to the LEFT
      if (minFilledCol === 0) {
        const leftColWidth = (config.colWidths?.[0] || 75) / 100
        const leftCellHeight = (config.rowHeights?.[groundLevelRow] || 38) / 100
        const leftEdgeX = getColumnStartX(0, config.colWidths, offsetX)
        const leftCellY = leftCellHeight / 2 + offsetY

        expansionCells.push(
          <ExpansionCell
            key="expand-left-ghost"
            position={[leftEdgeX - leftColWidth / 2, leftCellY, offsetZ + depth / 2]}
            width={leftColWidth}
            height={leftCellHeight}
            depth={depth}
            direction="left"
            onClick={(dir, w) => onExpandLeft?.(0, 0, w)}
            columnWidth={config.colWidths?.[0] || 75}
          />,
        )
      }

      // Expansion cells ABOVE topmost modules
      if (minFilledRow === 0) {
        config.grid[0]?.forEach((cell, gridCol) => {
          if (cell.type && cell.type !== "empty") {
            const colWidth = (config.colWidths?.[gridCol] || 75) / 100
            const topCellHeight = (config.rowHeights?.[0] || 38) / 100
            const cellX = getColumnStartX(gridCol, config.colWidths, offsetX) + colWidth / 2
            const topY = config.rows * topCellHeight + topCellHeight / 2 + offsetY

            expansionCells.push(
              <ExpansionCell
                key={`expand-up-ghost-${gridCol}`}
                position={[cellX, topY, offsetZ + depth / 2]}
                width={colWidth}
                height={topCellHeight}
                depth={depth}
                direction="up"
                onClick={() => onExpandUp?.(0, gridCol)}
                columnWidth={config.colWidths?.[gridCol] || 75}
              />,
            )
          }
        })
      }
    }

    return { elements: els, interactiveCells: cells, expansionCells }
  }, [
    config,
    depth,
    tubeRadius,
    showFrame,
    selectedTool,
    selectedCell,
    onCellHover,
    onDragStart,
    onDragOver,
    isDragging,
    onExpandLeft,
    onExpandRight,
    onExpandUp,
  ])

  const hasAnyFilledCells = useMemo(() => {
    return config.grid.some((row) => row.some((cell) => cell.type && cell.type !== "empty"))
  }, [config.grid])

  const cellWidth = useMemo(() => {
    return getTotalWidth(config.colWidths) / config.columns
  }, [config.colWidths, config.columns])

  const cellHeight = useMemo(() => {
    return getTotalHeight(config.rowHeights, config.rows) / config.rows
  }, [config.rowHeights, config.rows])

  return (
    <group>
      {elements}
      {interactiveCells}
      {expansionCells}
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
