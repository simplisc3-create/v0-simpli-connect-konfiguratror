"use client"

import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ThreeEvent } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "./shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import type { JSX } from "react/jsx-runtime"

type Props = {
  config: ShelfConfig
  selectedTool?: GridCell["type"] | null
  hoveredCell?: { row: number; col: number } | null
  selectedCell?: { row: number; col: number } | null
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (cell: { row: number; col: number } | null) => void
  showFrame?: boolean
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
      {/* Handle */}
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
      {/* Drawer front */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Horizontal bar handle */}
      <mesh position={[0, 0, 0.025]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, handleWidth, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Handle end caps */}
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

  // Show clickable area for empty cells or all cells when a tool is selected
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

export function ShelfScene({
  config,
  selectedTool,
  hoveredCell,
  selectedCell,
  onCellClick,
  onCellHover,
  showFrame = true,
}: Props) {
  const [useGLBModels, setUseGLBModules] = useState(false)

  const { elements, interactiveCells, glbModules } = useMemo(() => {
    const els: JSX.Element[] = []
    const cells: JSX.Element[] = []
    const glbs: JSX.Element[] = []
    const effectiveColor = config.accentColor !== "none" ? config.accentColor : config.baseColor
    const panelColor = colorMap[effectiveColor] || colorMap.weiss

    const depth = 0.38
    const tubeRadius = 0.012

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

    if (showFrame) {
      // Draw vertical posts
      for (let col = 0; col <= config.columns; col++) {
        const x = columnPositions[col] + offsetX

        els.push(
          <ChromeTube
            key={`vpost-front-${col}`}
            start={[x, offsetY, offsetZ + depth]}
            end={[x, offsetY + totalHeight, offsetZ + depth]}
            radius={tubeRadius}
          />,
        )
        els.push(
          <ChromeTube
            key={`vpost-back-${col}`}
            start={[x, offsetY, offsetZ]}
            end={[x, offsetY + totalHeight, offsetZ]}
            radius={tubeRadius}
          />,
        )

        els.push(<Foot key={`foot-front-${col}`} position={[x, 0.012, offsetZ + depth]} />)
        els.push(<Foot key={`foot-back-${col}`} position={[x, 0.012, offsetZ]} />)

        for (let row = 0; row <= config.rows; row++) {
          const y = rowPositions[row] + offsetY
          els.push(
            <ChromeTube
              key={`hconn-${col}-${row}`}
              start={[x, y, offsetZ]}
              end={[x, y, offsetZ + depth]}
              radius={tubeRadius * 0.8}
            />,
          )
        }
      }

      // Draw horizontal rails
      for (let row = 0; row <= config.rows; row++) {
        const y = rowPositions[row] + offsetY

        for (let col = 0; col < config.columns; col++) {
          const x1 = columnPositions[col] + offsetX
          const x2 = columnPositions[col + 1] + offsetX

          els.push(
            <ChromeTube
              key={`hrail-front-${col}-${row}`}
              start={[x1, y, offsetZ + depth]}
              end={[x2, y, offsetZ + depth]}
              radius={tubeRadius * 0.8}
            />,
          )
          els.push(
            <ChromeTube
              key={`hrail-back-${col}-${row}`}
              start={[x1, y, offsetZ]}
              end={[x2, y, offsetZ]}
              radius={tubeRadius * 0.8}
            />,
          )
        }
      }
    }

    // Draw cells (still needed for interaction even without frame)
    config.grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        const cellWidth = config.columnWidths[gridCol] / 100
        const cellHeight = config.rowHeights[gridRow] / 100

        const invertedRow = config.rows - 1 - gridRow
        const cellX = columnPositions[gridCol] + cellWidth / 2 + offsetX
        const cellY = rowPositions[invertedRow] + cellHeight / 2 + offsetY
        const bottomY = rowPositions[invertedRow] + offsetY

        const isEmpty = cell.type === "empty"
        const isHovered = hoveredCell?.row === gridRow && hoveredCell?.col === gridCol
        const isSelected = selectedCell?.row === gridRow && selectedCell?.col === gridCol

        cells.push(
          <InteractiveCell
            key={`interactive-${gridRow}-${gridCol}`}
            position={[cellX, cellY, offsetZ + depth / 2]}
            width={cellWidth}
            height={cellHeight}
            depth={depth}
            row={gridRow}
            col={gridCol}
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

        if (useGLBModels) {
          glbs.push(
            <GLBModule
              key={`glb-${gridRow}-${gridCol}`}
              position={[cellX, cellY, offsetZ + depth / 2]}
              cellType={cell.type}
              width={cellWidth}
              height={cellHeight}
              depth={depth}
              color={panelColor}
            />,
          )
        }

        els.push(
          <ShelfPanel
            key={`shelf-${gridRow}-${gridCol}`}
            position={[cellX, bottomY + 0.009, offsetZ + depth / 2]}
            width={cellWidth - 0.02}
            depth={depth - 0.02}
            color={panelColor}
          />,
        )

        if (gridRow === 0) {
          const topY = rowPositions[invertedRow + 1] + offsetY
          els.push(
            <ShelfPanel
              key={`shelf-top-${gridCol}`}
              position={[cellX, topY + 0.009, offsetZ + depth / 2]}
              width={cellWidth - 0.02}
              depth={depth - 0.02}
              color={panelColor}
            />,
          )
        }

        switch (cell.type) {
          case "mit-rueckwand":
            els.push(
              <BackPanel
                key={`back-${gridRow}-${gridCol}`}
                position={[cellX, cellY, offsetZ + 0.006]}
                width={cellWidth - 0.02}
                height={cellHeight - 0.02}
                color={panelColor}
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
                color={panelColor}
              />,
            )
            els.push(
              <DoorPanel
                key={`door-r-${gridRow}-${gridCol}`}
                position={[cellX + doorWidth / 2 + 0.005, cellY, offsetZ + depth + 0.01]}
                width={doorWidth}
                height={cellHeight - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, offsetZ + depth / 2]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-${gridRow}-${gridCol}`}
                position={[cellX + cellWidth / 2 - 0.015, cellY, offsetZ + depth / 2]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
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
                color={panelColor}
                hasLock
              />,
            )
            els.push(
              <DoorPanel
                key={`lock-door-r-${gridRow}-${gridCol}`}
                position={[cellX + lockDoorWidth / 2 + 0.005, cellY, offsetZ + depth + 0.01]}
                width={lockDoorWidth}
                height={cellHeight - 0.02}
                color={panelColor}
                hasLock
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-lock-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, offsetZ + depth / 2]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-lock-${gridRow}-${gridCol}`}
                position={[cellX + cellWidth / 2 - 0.015, cellY, offsetZ + depth / 2]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
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
                color={panelColor}
              />,
            )
            break

          case "mit-doppelschublade":
            const drawerHeight = (cellHeight - 0.03) / 2
            els.push(
              <DrawerPanel
                key={`drawer-top-${gridRow}-${gridCol}`}
                position={[cellX, cellY + drawerHeight / 2 + 0.005, offsetZ + depth + 0.01]}
                width={cellWidth - 0.02}
                height={drawerHeight}
                color={panelColor}
              />,
            )
            els.push(
              <DrawerPanel
                key={`drawer-bottom-${gridRow}-${gridCol}`}
                position={[cellX, cellY - drawerHeight / 2 - 0.005, offsetZ + depth + 0.01]}
                width={cellWidth - 0.02}
                height={drawerHeight}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-l-drawer-${gridRow}-${gridCol}`}
                position={[cellX - cellWidth / 2 + 0.015, cellY, offsetZ + depth / 2]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            els.push(
              <SidePanel
                key={`side-r-drawer-${gridRow}-${gridCol}`}
                position={[cellX + cellWidth / 2 - 0.015, cellY, offsetZ + depth / 2]}
                height={cellHeight - 0.02}
                depth={depth - 0.02}
                color={panelColor}
              />,
            )
            break
        }
      })
    })

    return { elements: els, interactiveCells: cells, glbModules: glbs }
  }, [config, selectedTool, hoveredCell, selectedCell, onCellClick, onCellHover, useGLBModels])

  return (
    <group>
      {elements}
      {glbModules}
      {interactiveCells}
    </group>
  )
}
