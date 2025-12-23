"use client"

import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ThreeEvent } from "@react-three/fiber"
import type { ShelfConfig, GridCell } from "@/lib/types"
import { GLBModule } from "./glb-module-loader"
import type { JSX } from "react/jsx-runtime"

type Props = {
  config: ShelfConfig
  selectedTool?: GridCell["type"] | null
  hoveredCell?: { row: number; col: number } | null
  selectedCell?: { row: number; col: number } | null
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (row: number, col: number, isHovering: boolean) => void
  useGLBModels?: boolean
}

const colorMap: Record<string, string> = {
  weiss: "#ffffff",
  schwarz: "#1a1a1a", // Darker black for better contrast
  blau: "#0066cc", // More realistic blue
  gruen: "#228B22", // Forest green, more realistic
  orange: "#ff8c00", // Darker orange
  rot: "#cc0000", // Deeper red
  gelb: "#ffd700", // Golden yellow
}

function ChromeBallConnector({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Top sphere */}
      <mesh position={[0, 0.012, 0]} castShadow>
        <sphereGeometry args={[0.016, 32, 32]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
      </mesh>
      {/* Bottom sphere */}
      <mesh position={[0, -0.012, 0]} castShadow>
        <sphereGeometry args={[0.016, 32, 32]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
      </mesh>
      {/* Connecting neck between spheres */}
      <mesh castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.016, 24]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.05} envMapIntensity={2.0} />
      </mesh>
    </group>
  )
}

function GlassShelfPanel({
  position,
  width,
  depth,
}: {
  position: [number, number, number]
  width: number
  depth: number
}) {
  const clipSize = 0.018
  const clipOffset = 0.008

  return (
    <group position={position}>
      {/* Glass panel with realistic glass material */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width - 0.02, 0.01, depth - 0.02]} />
        <meshPhysicalMaterial
          color="#f0f8f8"
          transparent
          opacity={0.15}
          roughness={0.0}
          metalness={0}
          transmission={0.95}
          thickness={0.01}
          ior={1.5}
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>

      {/* Corner clips - polished chrome */}
      {[
        [-width / 2 + clipOffset + clipSize / 2, 0, -depth / 2 + clipOffset + clipSize / 2],
        [width / 2 - clipOffset - clipSize / 2, 0, -depth / 2 + clipOffset + clipSize / 2],
        [-width / 2 + clipOffset + clipSize / 2, 0, depth / 2 - clipOffset - clipSize / 2],
        [width / 2 - clipOffset - clipSize / 2, 0, depth / 2 - clipOffset - clipSize / 2],
      ].map((clipPos, i) => (
        <mesh key={`clip-${i}`} position={clipPos as [number, number, number]} castShadow>
          <boxGeometry args={[clipSize, 0.012, clipSize]} />
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function ChromeTube({
  start,
  end,
  radius = 0.0095,
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
      <cylinderGeometry args={[radius, radius, length, 32]} />
      <meshStandardMaterial color="#e0e0e0" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
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
      <meshStandardMaterial color={color} roughness={0.15} metalness={0.7} envMapIntensity={1.2} />
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
      <meshStandardMaterial color={color} roughness={0.15} metalness={0.7} envMapIntensity={1.2} />
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
      <meshStandardMaterial color={color} roughness={0.15} metalness={0.7} envMapIntensity={1.2} />
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
  const handleHeight = height * 0.7
  const handleRadius = 0.008 // Realistic bar handle thickness
  const handleOffset = 0.025 // How far handle protrudes from door

  return (
    <group position={position}>
      {/* Door front panel - smooth metal finish */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.018]} />
        <meshStandardMaterial color={color} roughness={0.12} metalness={0.75} envMapIntensity={1.3} />
      </mesh>

      {/* Vertical chrome bar handle */}
      <group position={[width * 0.35, 0, 0.009 + handleOffset]}>
        {/* Main vertical bar */}
        <mesh castShadow>
          <cylinderGeometry args={[handleRadius, handleRadius, handleHeight, 24]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.98} roughness={0.02} envMapIntensity={3.0} />
        </mesh>

        {/* Top bracket */}
        <group position={[0, handleHeight / 2, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[handleRadius * 0.7, handleRadius * 0.7, handleOffset, 16]} />
            <meshStandardMaterial color="#e8e8e8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[handleRadius * 1.3, 24, 24]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.98} roughness={0.02} envMapIntensity={3.0} />
          </mesh>
        </group>

        {/* Bottom bracket */}
        <group position={[0, -handleHeight / 2, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[handleRadius * 0.7, handleRadius * 0.7, handleOffset, 16]} />
            <meshStandardMaterial color="#e8e8e8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[handleRadius * 1.3, 24, 24]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.98} roughness={0.02} envMapIntensity={3.0} />
          </mesh>
        </group>
      </group>

      {/* Lock indicator */}
      {hasLock && (
        <mesh position={[width * 0.35, -handleHeight * 0.55, 0.015]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.012, 16]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
        </mesh>
      )}

      {/* Subtle gap lines around door edges */}
      <mesh position={[width / 2 - 0.0005, 0, 0.009]} castShadow>
        <boxGeometry args={[0.001, height - 0.002, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[-width / 2 + 0.0005, 0, 0.009]} castShadow>
        <boxGeometry args={[0.001, height - 0.002, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2 - 0.0005, 0.009]} castShadow>
        <boxGeometry args={[width - 0.002, 0.001, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.0005, 0.009]} castShadow>
        <boxGeometry args={[width - 0.002, 0.001, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
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
  const handleWidth = width * 0.75
  const handleRadius = 0.008 // Realistic bar handle thickness
  const handleOffset = 0.025 // How far handle protrudes
  const bracketHeight = handleOffset * 0.9

  return (
    <group position={position}>
      {/* Drawer front panel - smooth metal finish */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.018]} />
        <meshStandardMaterial color={color} roughness={0.12} metalness={0.75} envMapIntensity={1.3} />
      </mesh>

      {/* Chrome horizontal bar handle */}
      <group position={[0, 0, 0.009 + handleOffset]}>
        {/* Main horizontal bar */}
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[handleRadius, handleRadius, handleWidth, 24]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.98} roughness={0.02} envMapIntensity={3.0} />
        </mesh>

        {/* Left bracket */}
        <group position={[-handleWidth / 2, 0, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[handleRadius * 0.7, handleRadius * 0.7, bracketHeight, 16]} />
            <meshStandardMaterial color="#e8e8e8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[handleRadius * 1.3, 24, 24]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.98} roughness={0.02} envMapIntensity={3.0} />
          </mesh>
        </group>

        {/* Right bracket */}
        <group position={[handleWidth / 2, 0, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[handleRadius * 0.7, handleRadius * 0.7, bracketHeight, 16]} />
            <meshStandardMaterial color="#e8e8e8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[handleRadius * 1.3, 24, 24]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.98} roughness={0.02} envMapIntensity={3.0} />
          </mesh>
        </group>
      </group>

      {/* Subtle gap lines around drawer edges */}
      <mesh position={[0, height / 2 - 0.0005, 0.009]} castShadow>
        <boxGeometry args={[width - 0.002, 0.001, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.0005, 0.009]} castShadow>
        <boxGeometry args={[width - 0.002, 0.001, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[width / 2 - 0.0005, 0, 0.009]} castShadow>
        <boxGeometry args={[0.001, height - 0.002, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[-width / 2 + 0.0005, 0, 0.009]} castShadow>
        <boxGeometry args={[0.001, height - 0.002, 0.001]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Foot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main foot body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.014, 0.016, 0.02, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} envMapIntensity={1.0} />
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
  cellType,
  cellColor,
  isHovered,
  isSelected,
  onClick,
  onHover,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  row: number
  col: number
  cellType: GridCell["type"]
  cellColor?: string
  isHovered: boolean
  isSelected: boolean
  onClick?: (row: number, col: number) => void
  onHover?: (cell: { row: number; col: number } | null) => void
}) {
  const [localHover, setLocalHover] = useState(false)
  const showHover = isHovered || localHover
  const isEmpty = cellType === "empty"

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

  // Determine colors for different states
  const getOverlayColor = () => {
    if (isSelected) return "#fbbf24" // Gold for selected
    if (showHover) return isEmpty ? "#60a5fa" : "#60a5fa" // Blue for hover
    return "#3b82f6"
  }

  const getOpacity = () => {
    if (isSelected) return 0.25
    if (showHover) return 0.2
    return 0
  }

  return (
    <group>
      {/* Invisible interaction mesh - always active */}
      <mesh position={position} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <boxGeometry args={[width - 0.005, height - 0.005, depth - 0.005]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Visual overlay for hover/selection */}
      {(showHover || isSelected) && (
        <mesh position={position}>
          <boxGeometry args={[width - 0.008, height - 0.008, depth - 0.008]} />
          <meshStandardMaterial
            color={getOverlayColor()}
            transparent
            opacity={getOpacity()}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Glowing outline for selected cell */}
      {isSelected && (
        <lineSegments position={position}>
          <edgesGeometry args={[new THREE.BoxGeometry(width - 0.005, height - 0.005, depth - 0.005)]} />
          <lineBasicMaterial color="#fbbf24" linewidth={2} />
        </lineSegments>
      )}

      {/* Hover outline */}
      {showHover && !isSelected && (
        <lineSegments position={position}>
          <edgesGeometry args={[new THREE.BoxGeometry(width - 0.005, height - 0.005, depth - 0.005)]} />
          <lineBasicMaterial color="#60a5fa" linewidth={1} />
        </lineSegments>
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
  useGLBModels = false,
}: Props) {
  const [localUseGLBModels, setLocalUseGLBModels] = useState(useGLBModels)

  const { elements, interactiveCells, glbModules, dimensions } = useMemo(() => {
    const els: JSX.Element[] = []
    const cells: JSX.Element[] = []
    const glbs: JSX.Element[] = []
    const effectiveColor = config.accentColor !== "none" ? config.accentColor : config.baseColor
    const panelColor = colorMap[effectiveColor] || colorMap.weiss

    console.log("[v0] Rendering grid with", config.rows, "rows and", config.columns, "columns")
    console.log("[v0] useGLBModels:", localUseGLBModels)

    const depth = 0.38
    const tubeRadius = 0.0095

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

        // Add ball connectors at front and back intersections
        els.push(<ChromeBallConnector key={`ball-front-${col}-${row}`} position={[x, y, offsetZ + depth]} />)
        els.push(<ChromeBallConnector key={`ball-back-${col}-${row}`} position={[x, y, offsetZ]} />)
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

    // Draw cells
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
            cellType={cell.type}
            cellColor={cell.color}
            isHovered={isHovered}
            isSelected={isSelected}
            onClick={onCellClick}
            onHover={onCellHover}
          />,
        )

        if (isEmpty) return

        const cellColor = cell.color || (config.accentColor !== "none" ? config.accentColor : config.baseColor)
        const modulePanelColor = colorMap[cellColor] || colorMap.weiss

        console.log(`[v0] Cell [${gridRow}, ${gridCol}]: type=${cell.type}, color=${cellColor}`)

        if (localUseGLBModels) {
          glbs.push(
            <GLBModule
              key={`glb-${gridRow}-${gridCol}`}
              position={[cellX, cellY, offsetZ + depth / 2]}
              cellType={cell.type}
              cellColor={cellColor as GridCell["color"]}
              width={cellWidth}
              height={cellHeight}
              depth={depth}
            />,
          )
        }

        if (!localUseGLBModels) {
          if (config.bodenmaterial === "glas") {
            els.push(
              <GlassShelfPanel
                key={`glass-shelf-${gridRow}-${gridCol}`}
                position={[cellX, bottomY + 0.009, offsetZ + depth / 2]}
                width={cellWidth}
                depth={depth}
              />,
            )
          } else {
            els.push(
              <ShelfPanel
                key={`shelf-${gridRow}-${gridCol}`}
                position={[cellX, bottomY + 0.009, offsetZ + depth / 2]}
                width={cellWidth - 0.02}
                depth={depth - 0.02}
                color={modulePanelColor}
              />,
            )
          }

          if (gridRow === 0) {
            const topY = rowPositions[invertedRow + 1] + offsetY
            els.push(
              <ShelfPanel
                key={`shelf-top-${gridCol}`}
                position={[cellX, topY + 0.009, offsetZ + depth / 2]}
                width={cellWidth - 0.02}
                depth={depth - 0.02}
                color={modulePanelColor}
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
                  color={modulePanelColor}
                />,
              )
              break

            case "mit-tueren":
              els.push(
                <BackPanel
                  key={`back-doors-${gridRow}-${gridCol}`}
                  position={[cellX, cellY, offsetZ + 0.006]}
                  width={cellWidth - 0.02}
                  height={cellHeight - 0.02}
                  color={modulePanelColor}
                />,
              )
              const doorWidth = (cellWidth - 0.03) / 2
              els.push(
                <DoorPanel
                  key={`door-l-${gridRow}-${gridCol}`}
                  position={[cellX - doorWidth / 2 - 0.007, cellY, offsetZ + depth - 0.02]}
                  width={doorWidth}
                  height={cellHeight - 0.025}
                  color={modulePanelColor}
                  hasLock={cell.hasLocks}
                />,
                <DoorPanel
                  key={`door-r-${gridRow}-${gridCol}`}
                  position={[cellX + doorWidth / 2 + 0.007, cellY, offsetZ + depth - 0.02]}
                  width={doorWidth}
                  height={cellHeight - 0.025}
                  color={modulePanelColor}
                  hasLock={cell.hasLocks}
                />,
              )
              break

            case "mit-doppelschublade":
              els.push(
                <BackPanel
                  key={`back-drawer-${gridRow}-${gridCol}`}
                  position={[cellX, cellY, offsetZ + 0.006]}
                  width={cellWidth - 0.02}
                  height={cellHeight - 0.02}
                  color={modulePanelColor}
                />,
              )
              const drawerHeight = (cellHeight - 0.03) / 2
              els.push(
                <DrawerPanel
                  key={`drawer-top-${gridRow}-${gridCol}`}
                  position={[cellX, cellY + drawerHeight / 2 + 0.007, offsetZ + depth - 0.02]}
                  width={cellWidth - 0.025}
                  height={drawerHeight}
                  color={modulePanelColor}
                />,
                <DrawerPanel
                  key={`drawer-bot-${gridRow}-${gridCol}`}
                  position={[cellX, cellY - drawerHeight / 2 - 0.007, offsetZ + depth - 0.02]}
                  width={cellWidth - 0.025}
                  height={drawerHeight}
                  color={modulePanelColor}
                />,
              )
              break
          }
        }
      })
    })

    return {
      elements: els,
      interactiveCells: cells,
      glbModules: glbs,
      dimensions: {
        totalWidth,
        totalHeight,
        depth,
        offsetX,
        offsetY,
        offsetZ,
      },
    }
  }, [config, selectedTool, hoveredCell, selectedCell, onCellClick, onCellHover, localUseGLBModels])

  return (
    <group>
      {elements}
      {glbModules}
      {interactiveCells}
      {/* DimensionLabels component is removed as per updates */}
    </group>
  )
}
