"use client"

import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ThreeEvent } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import type { JSX } from "react/jsx-runtime"

type Props = {
  config: ShelfConfig
  selectedTool?: GridCell["type"] | null
  hoveredCell?: { row: number; col: number } | null
  selectedCell?: { row: number; col: number } | null
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (cell: { row: number; col: number } | null) => void
  onAddCellToColumn?: (col: number) => void
  onRemoveCellFromColumn?: (col: number) => void
  onAddColumnLeft?: () => void
  onAddColumnRight?: () => void
  onRemoveColumn?: (col: number) => void
  hoveredExpansionZone?: { type: "top" | "left" | "right"; col?: number } | null
  onHoverExpansionZone?: (zone: { type: "top" | "left" | "right"; col?: number } | null) => void
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
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.025]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, handleWidth, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[-handleWidth / 2, 0, 0.025]} castShadow>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[handleWidth / 2, 0, 0.025]} castShadow>
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
  isHovered,
  isSelected,
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
  isSelected: boolean
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
        color={showHover ? (selectedTool === "empty" ? "#ff4444" : "#4488ff") : isSelected ? "#ffcc00" : "#666666"}
        transparent
        opacity={showHover ? 0.4 : isSelected ? 0.3 : isEmpty ? 0.15 : 0.05}
        depthWrite={false}
      />
    </mesh>
  )
}

function ColumnExpansionZone({
  position,
  width,
  depth,
  colIndex,
  isHovered,
  canExpand,
  onClick,
  onHover,
}: {
  position: [number, number, number]
  width: number
  depth: number
  colIndex: number
  isHovered: boolean
  canExpand: boolean
  onClick: () => void
  onHover: (hovered: boolean) => void
}) {
  if (!canExpand) return null

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          onHover(false)
          document.body.style.cursor = "auto"
        }}
      >
        <boxGeometry args={[width - 0.02, 0.06, depth - 0.02]} />
        <meshStandardMaterial
          color={isHovered ? "#22c55e" : "#3b82f6"}
          transparent
          opacity={isHovered ? 0.7 : 0.25}
          depthWrite={false}
        />
      </mesh>
      {/* Plus icon */}
      {isHovered && (
        <>
          <mesh position={[0, 0.001, 0]}>
            <boxGeometry args={[0.06, 0.012, 0.012]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.001, 0]}>
            <boxGeometry args={[0.012, 0.012, 0.06]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </>
      )}
    </group>
  )
}

function SideExpansionZone({
  position,
  height,
  depth,
  side,
  isHovered,
  canExpand,
  onClick,
  onHover,
}: {
  position: [number, number, number]
  height: number
  depth: number
  side: "left" | "right"
  isHovered: boolean
  canExpand: boolean
  onClick: () => void
  onHover: (hovered: boolean) => void
}) {
  if (!canExpand) return null

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          onHover(false)
          document.body.style.cursor = "auto"
        }}
      >
        <boxGeometry args={[0.06, height, depth - 0.02]} />
        <meshStandardMaterial
          color={isHovered ? "#22c55e" : "#8b5cf6"}
          transparent
          opacity={isHovered ? 0.7 : 0.25}
          depthWrite={false}
        />
      </mesh>
      {/* Plus icon */}
      {isHovered && (
        <>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.012, 0.06, 0.012]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.012, 0.012, 0.06]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </>
      )}
    </group>
  )
}

export function ShelfScene({
  config,
  selectedTool,
  hoveredCell,
  selectedCell,
  onCellClick,
  onCellHover,
  onAddCellToColumn,
  onRemoveCellFromColumn,
  onAddColumnLeft,
  onAddColumnRight,
  onRemoveColumn,
  hoveredExpansionZone,
  onHoverExpansionZone,
}: Props) {
  const { elements, interactiveCells, expansionZones, totalWidth, maxHeight, offsetX, offsetY, depth } = useMemo(() => {
    const els: JSX.Element[] = []
    const cells: JSX.Element[] = []
    const zones: JSX.Element[] = []

    const depth = 0.38
    const tubeRadius = 0.012
    const rowHeight = config.rowHeight / 100

    // Calculate column positions
    const columnPositions: number[] = [0]
    let currentX = 0
    for (const col of config.columns) {
      const width = col.width / 100
      currentX += width
      columnPositions.push(currentX)
    }
    const totalWidth = currentX

    // Find max height across all columns
    const maxCells = Math.max(...config.columns.map((c) => c.cells.length))
    const maxHeight = maxCells * rowHeight

    const offsetX = -totalWidth / 2
    const offsetY = 0.025
    const offsetZ = -depth / 2

    // Draw each column independently
    config.columns.forEach((column, colIdx) => {
      const colX1 = columnPositions[colIdx] + offsetX
      const colX2 = columnPositions[colIdx + 1] + offsetX
      const colWidth = column.width / 100
      const colCenterX = colX1 + colWidth / 2
      const colHeight = column.cells.length * rowHeight

      // Vertical posts for this column
      els.push(
        <ChromeTube
          key={`vpost-front-${colIdx}-left`}
          start={[colX1, offsetY, offsetZ + depth]}
          end={[colX1, offsetY + colHeight, offsetZ + depth]}
          radius={tubeRadius}
        />,
      )
      els.push(
        <ChromeTube
          key={`vpost-back-${colIdx}-left`}
          start={[colX1, offsetY, offsetZ]}
          end={[colX1, offsetY + colHeight, offsetZ]}
          radius={tubeRadius}
        />,
      )

      // Right posts (only for last column or where height differs)
      if (colIdx === config.columns.length - 1) {
        els.push(
          <ChromeTube
            key={`vpost-front-${colIdx}-right`}
            start={[colX2, offsetY, offsetZ + depth]}
            end={[colX2, offsetY + colHeight, offsetZ + depth]}
            radius={tubeRadius}
          />,
        )
        els.push(
          <ChromeTube
            key={`vpost-back-${colIdx}-right`}
            start={[colX2, offsetY, offsetZ]}
            end={[colX2, offsetY + colHeight, offsetZ]}
            radius={tubeRadius}
          />,
        )
      }

      // Feet
      els.push(<Foot key={`foot-front-${colIdx}-left`} position={[colX1, 0.012, offsetZ + depth]} />)
      els.push(<Foot key={`foot-back-${colIdx}-left`} position={[colX1, 0.012, offsetZ]} />)
      if (colIdx === config.columns.length - 1) {
        els.push(<Foot key={`foot-front-${colIdx}-right`} position={[colX2, 0.012, offsetZ + depth]} />)
        els.push(<Foot key={`foot-back-${colIdx}-right`} position={[colX2, 0.012, offsetZ]} />)
      }

      // Horizontal rails and depth connectors for each level in this column
      for (let level = 0; level <= column.cells.length; level++) {
        const y = level * rowHeight + offsetY

        // Front and back rails
        els.push(
          <ChromeTube
            key={`hrail-front-${colIdx}-${level}`}
            start={[colX1, y, offsetZ + depth]}
            end={[colX2, y, offsetZ + depth]}
            radius={tubeRadius * 0.8}
          />,
        )
        els.push(
          <ChromeTube
            key={`hrail-back-${colIdx}-${level}`}
            start={[colX1, y, offsetZ]}
            end={[colX2, y, offsetZ]}
            radius={tubeRadius * 0.8}
          />,
        )

        // Depth connectors
        els.push(
          <ChromeTube
            key={`hconn-left-${colIdx}-${level}`}
            start={[colX1, y, offsetZ]}
            end={[colX1, y, offsetZ + depth]}
            radius={tubeRadius * 0.8}
          />,
        )
        if (colIdx === config.columns.length - 1) {
          els.push(
            <ChromeTube
              key={`hconn-right-${colIdx}-${level}`}
              start={[colX2, y, offsetZ]}
              end={[colX2, y, offsetZ + depth]}
              radius={tubeRadius * 0.8}
            />,
          )
        }
      }

      // Draw cells for this column
      column.cells.forEach((cell) => {
        const cellY = cell.row * rowHeight + rowHeight / 2 + offsetY
        const bottomY = cell.row * rowHeight + offsetY

        const isEmpty = cell.type === "empty"
        const isHovered = hoveredCell?.row === cell.row && hoveredCell?.col === colIdx
        const isSelected = selectedCell?.row === cell.row && selectedCell?.col === colIdx

        cells.push(
          <InteractiveCell
            key={`interactive-${colIdx}-${cell.row}`}
            position={[colCenterX, cellY, offsetZ + depth / 2]}
            width={colWidth}
            height={rowHeight}
            depth={depth}
            row={cell.row}
            col={colIdx}
            isEmpty={isEmpty}
            isHovered={isHovered}
            isSelected={isSelected}
            selectedTool={selectedTool}
            onClick={onCellClick}
            onHover={onCellHover}
          />,
        )

        if (isEmpty) return

        const cellColor = cell.color || (config.accentColor !== "none" ? config.accentColor : config.baseColor)
        const panelColor = colorMap[cellColor] || colorMap.weiss

        // Bottom shelf
        els.push(
          <ShelfPanel
            key={`shelf-${colIdx}-${cell.row}`}
            position={[colCenterX, bottomY + 0.009, offsetZ + depth / 2]}
            width={colWidth - 0.02}
            depth={depth - 0.02}
            color={panelColor}
          />,
        )

        // Top shelf for topmost cell
        if (cell.row === column.cells.length - 1) {
          const topY = (cell.row + 1) * rowHeight + offsetY
          els.push(
            <ShelfPanel
              key={`shelf-top-${colIdx}`}
              position={[colCenterX, topY + 0.009, offsetZ + depth / 2]}
              width={colWidth - 0.02}
              depth={depth - 0.02}
              color={panelColor}
            />,
          )
        }

        // Cell type specific elements
        switch (cell.type) {
          case "mit-rueckwand":
            els.push(
              <BackPanel
                key={`back-${colIdx}-${cell.row}`}
                position={[colCenterX, cellY, offsetZ + 0.006]}
                width={colWidth - 0.02}
                height={rowHeight - 0.02}
                color={panelColor}
              />,
            )
            break

          case "mit-tueren":
            const doorWidth = (colWidth - 0.03) / 2
            els.push(
              <DoorPanel
                key={`door-l-${colIdx}-${cell.row}`}
                position={[colCenterX - doorWidth / 2 - 0.005, cellY, offsetZ + depth + 0.01]}
                width={doorWidth}
                height={rowHeight - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <DoorPanel
                key={`door-r-${colIdx}-${cell.row}`}
                position={[colCenterX + doorWidth / 2 + 0.005, cellY, offsetZ + depth + 0.01]}
                width={doorWidth}
                height={rowHeight - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-${colIdx}-${cell.row}`}
                position={[colCenterX - colWidth / 2 + 0.015, cellY, offsetZ + depth / 2]}
                height={rowHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-${colIdx}-${cell.row}`}
                position={[colCenterX + colWidth / 2 - 0.015, cellY, offsetZ + depth / 2]}
                height={rowHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            break

          case "abschliessbare-tueren":
            const lockDoorWidth = (colWidth - 0.03) / 2
            els.push(
              <DoorPanel
                key={`lock-door-l-${colIdx}-${cell.row}`}
                position={[colCenterX - lockDoorWidth / 2 - 0.005, cellY, offsetZ + depth + 0.01]}
                width={lockDoorWidth}
                height={rowHeight - 0.02}
                color={panelColor}
                hasLock
              />,
            )
            els.push(
              <DoorPanel
                key={`lock-door-r-${colIdx}-${cell.row}`}
                position={[colCenterX + lockDoorWidth / 2 + 0.005, cellY, offsetZ + depth + 0.01]}
                width={lockDoorWidth}
                height={rowHeight - 0.02}
                color={panelColor}
                hasLock
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-lock-${colIdx}-${cell.row}`}
                position={[colCenterX - colWidth / 2 + 0.015, cellY, offsetZ + depth / 2]}
                height={rowHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-lock-${colIdx}-${cell.row}`}
                position={[colCenterX + colWidth / 2 - 0.015, cellY, offsetZ + depth / 2]}
                height={rowHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            break

          case "mit-klapptuer":
            els.push(
              <DoorPanel
                key={`flip-${colIdx}-${cell.row}`}
                position={[colCenterX, cellY, offsetZ + depth + 0.01]}
                width={colWidth - 0.02}
                height={rowHeight - 0.02}
                color={panelColor}
              />,
            )
            break

          case "mit-doppelschublade":
            const drawerHeight = (rowHeight - 0.03) / 2
            els.push(
              <DrawerPanel
                key={`drawer-top-${colIdx}-${cell.row}`}
                position={[colCenterX, cellY + drawerHeight / 2 + 0.005, offsetZ + depth + 0.01]}
                width={colWidth - 0.02}
                height={drawerHeight}
                color={panelColor}
              />,
            )
            els.push(
              <DrawerPanel
                key={`drawer-bottom-${colIdx}-${cell.row}`}
                position={[colCenterX, cellY - drawerHeight / 2 - 0.005, offsetZ + depth + 0.01]}
                width={colWidth - 0.02}
                height={drawerHeight}
                color={panelColor}
              />,
            )
            break

          case "ohne-rueckwand":
          case "ohne-seitenwaende":
          default:
            break
        }
      })

      const canExpandColumn = column.cells.length < 6
      const expansionY = colHeight + offsetY + 0.04
      const isThisColumnHovered = hoveredExpansionZone?.type === "top" && hoveredExpansionZone?.col === colIdx

      zones.push(
        <ColumnExpansionZone
          key={`expand-top-${colIdx}`}
          position={[colCenterX, expansionY, offsetZ + depth / 2]}
          width={colWidth}
          depth={depth}
          colIndex={colIdx}
          isHovered={isThisColumnHovered}
          canExpand={canExpandColumn}
          onClick={() => onAddCellToColumn?.(colIdx)}
          onHover={(hovered) => onHoverExpansionZone?.(hovered ? { type: "top", col: colIdx } : null)}
        />,
      )
    })

    const canAddColumns = config.columns.length < 6
    const baseHeight = Math.min(...config.columns.map((c) => c.cells.length)) * rowHeight

    // Left side
    zones.push(
      <SideExpansionZone
        key="expand-left"
        position={[offsetX - 0.04, offsetY + baseHeight / 2, offsetZ + depth / 2]}
        height={baseHeight}
        depth={depth}
        side="left"
        isHovered={hoveredExpansionZone?.type === "left"}
        canExpand={canAddColumns}
        onClick={() => onAddColumnLeft?.()}
        onHover={(hovered) => onHoverExpansionZone?.(hovered ? { type: "left" } : null)}
      />,
    )

    // Right side
    zones.push(
      <SideExpansionZone
        key="expand-right"
        position={[offsetX + totalWidth + 0.04, offsetY + baseHeight / 2, offsetZ + depth / 2]}
        height={baseHeight}
        depth={depth}
        side="right"
        isHovered={hoveredExpansionZone?.type === "right"}
        canExpand={canAddColumns}
        onClick={() => onAddColumnRight?.()}
        onHover={(hovered) => onHoverExpansionZone?.(hovered ? { type: "right" } : null)}
      />,
    )

    return {
      elements: els,
      interactiveCells: cells,
      expansionZones: zones,
      totalWidth,
      maxHeight,
      offsetX,
      offsetY,
      depth,
    }
  }, [
    config,
    selectedTool,
    hoveredCell,
    selectedCell,
    onCellClick,
    onCellHover,
    onAddCellToColumn,
    onAddColumnLeft,
    onAddColumnRight,
    hoveredExpansionZone,
    onHoverExpansionZone,
  ])

  return (
    <group>
      {elements}
      {interactiveCells}
      {expansionZones}
    </group>
  )
}
