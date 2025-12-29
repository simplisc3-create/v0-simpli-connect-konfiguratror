"use client"

import { Html, useTexture } from "@react-three/drei"
import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ShelfConfig, ColumnData } from "@/components/shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import type { JSX } from "react/jsx-runtime"
import { GLBModule } from "@/components/glb-module" // Import GLBModule component

interface ShelfSceneProps {
  config: ShelfConfig
  selectedTool: string | "empty" | null
  hoveredCell: { col: number; stackIndex: number } | null
  selectedCell: { col: number; stackIndex: number } | null
  onCellClick: (col: number, stackIndex: number) => void
  onCellHover: (cell: { col: number; stackIndex: number } | null) => void
  onExpandLeft?: (width?: 38 | 75) => void
  onExpandRight?: (width?: 38 | 75) => void
  onExpandUp?: (col: number) => void
}

const colorMap: Record<string, string> = {
  weiss: colorHexMap.weiss,
  schwarz: colorHexMap.schwarz,
  blau: colorHexMap.blau,
  gruen: colorHexMap.gruen,
  orange: colorHexMap.orange,
  rot: colorHexMap.rot,
  gelb: colorHexMap.gelb,
  grau: "#808080", // Added grau color
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

function InteractiveCell({
  position,
  width,
  height,
  depth,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  isHovered: boolean
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}) {
  const [localHover, setLocalHover] = useState(false)

  return (
    <mesh
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerEnter={() => {
        setLocalHover(true)
        onPointerOver?.()
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        setLocalHover(false)
        onPointerOut?.()
        document.body.style.cursor = "auto"
      }}
    >
      <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
      <meshBasicMaterial
        color={isHovered || localHover ? "#22c55e" : "#666666"}
        transparent
        opacity={isHovered || localHover ? 0.5 : 0.15}
        depthWrite={false}
      />
    </mesh>
  )
}

function ExpansionCell({
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
    <group>
      <mesh
        position={position}
        onPointerDown={(e) => {
          e.stopPropagation()
          onClick()
        }}
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
        <meshBasicMaterial color="#22c55e" transparent opacity={hovered ? 0.6 : 0.2} depthWrite={false} />
      </mesh>
      <Html position={position} center>
        <div
          className={`${hovered ? "bg-green-500 scale-110" : "bg-green-500/70"} text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-150`}
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
      <Html center>
        <div className="text-white font-bold text-lg">+</div>
      </Html>
    </group>
  )
}

function getTotalWidth(columns: ColumnData[]): number {
  return columns.reduce((sum, col) => sum + col.width / 100, 0)
}

function getColumnStartX(colIndex: number, columns: ColumnData[], offsetX: number): number {
  let x = offsetX
  for (let i = 0; i < colIndex; i++) {
    x += columns[i].width / 100
  }
  return x
}

export function ShelfScene({
  config,
  selectedTool,
  hoveredCell,
  selectedCell,
  onCellClick,
  onCellHover,
  onExpandLeft,
  onExpandRight,
  onExpandUp,
}: ShelfSceneProps) {
  const depth = 0.38
  const tubeRadius = 0.012
  const cellHeight = 0.38
  const offsetY = 0.025
  const panelThickness = 0.01 // Panel thickness for enclosure

  const floorTexture = useTexture("/seamless-light-oak-wood-parquet-floor-texture-top-.jpg")

  useMemo(() => {
    if (floorTexture) {
      floorTexture.wrapS = THREE.RepeatWrapping
      floorTexture.wrapT = THREE.RepeatWrapping
      floorTexture.repeat.set(8, 8)
    }
  }, [floorTexture])

  const { elements, interactiveCells, expansionCells, hasAnyFilledCells } = useMemo(() => {
    const els: JSX.Element[] = []
    const cells: JSX.Element[] = []
    const expansionCells: JSX.Element[] = []

    const totalWidth = getTotalWidth(config.columns)
    const offsetX = -totalWidth / 2
    const offsetZ = -depth / 2

    let hasAnyFilledCells = false

    // Process each column independently
    config.columns.forEach((column, colIndex) => {
      const cellWidth = column.width / 100
      const leftX = getColumnStartX(colIndex, config.columns, offsetX)
      const rightX = leftX + cellWidth
      const cellCenterX = leftX + cellWidth / 2

      // Find filled cells in this column
      const filledCells = column.cells
        .map((cell, idx) => ({ cell, stackIndex: idx }))
        .filter(({ cell }) => cell.type !== "empty")

      if (filledCells.length > 0) {
        hasAnyFilledCells = true
      }

      // Calculate column height based on highest filled cell
      let columnHeight = 0
      for (let i = column.cells.length - 1; i >= 0; i--) {
        if (column.cells[i].type !== "empty") {
          columnHeight = i + 1
          break
        }
      }

      if (columnHeight === 0) return // No filled cells in this column

      const columnTopY = columnHeight * cellHeight + offsetY

      // Vertical posts for this column
      els.push(
        <ChromeTube
          key={`vpost-fl-${colIndex}`}
          start={[leftX, offsetY, offsetZ + depth]}
          end={[leftX, columnTopY, offsetZ + depth]}
          radius={tubeRadius}
        />,
      )
      els.push(
        <ChromeTube
          key={`vpost-fr-${colIndex}`}
          start={[rightX, offsetY, offsetZ + depth]}
          end={[rightX, columnTopY, offsetZ + depth]}
          radius={tubeRadius}
        />,
      )
      els.push(
        <ChromeTube
          key={`vpost-bl-${colIndex}`}
          start={[leftX, offsetY, offsetZ]}
          end={[leftX, columnTopY, offsetZ]}
          radius={tubeRadius}
        />,
      )
      els.push(
        <ChromeTube
          key={`vpost-br-${colIndex}`}
          start={[rightX, offsetY, offsetZ]}
          end={[rightX, columnTopY, offsetZ]}
          radius={tubeRadius}
        />,
      )

      // Feet
      els.push(
        <mesh key={`foot-fl-${colIndex}`} position={[leftX, offsetY - 0.01, offsetZ + depth]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>,
      )
      els.push(
        <mesh key={`foot-fr-${colIndex}`} position={[rightX, offsetY - 0.01, offsetZ + depth]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>,
      )
      els.push(
        <mesh key={`foot-bl-${colIndex}`} position={[leftX, offsetY - 0.01, offsetZ]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>,
      )
      els.push(
        <mesh key={`foot-br-${colIndex}`} position={[rightX, offsetY - 0.01, offsetZ]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>,
      )

      // This prevents the "double height" visual bug where empty cells have no separation
      for (let stackIndex = 0; stackIndex < columnHeight; stackIndex++) {
        const cell = column.cells[stackIndex]
        const bottomY = stackIndex * cellHeight + offsetY
        const topY = (stackIndex + 1) * cellHeight + offsetY
        const cellCenterY = bottomY + cellHeight / 2

        // Horizontal rails at bottom of each cell position
        els.push(
          <ChromeTube
            key={`hrail-fb-${colIndex}-${stackIndex}`}
            start={[leftX, bottomY, offsetZ + depth]}
            end={[rightX, bottomY, offsetZ + depth]}
            radius={tubeRadius}
          />,
        )
        els.push(
          <ChromeTube
            key={`hrail-bb-${colIndex}-${stackIndex}`}
            start={[leftX, bottomY, offsetZ]}
            end={[rightX, bottomY, offsetZ]}
            radius={tubeRadius}
          />,
        )

        // Depth rails at bottom
        els.push(
          <ChromeTube
            key={`drail-lb-${colIndex}-${stackIndex}`}
            start={[leftX, bottomY, offsetZ]}
            end={[leftX, bottomY, offsetZ + depth]}
            radius={tubeRadius}
          />,
        )
        els.push(
          <ChromeTube
            key={`drail-rb-${colIndex}-${stackIndex}`}
            start={[rightX, bottomY, offsetZ]}
            end={[rightX, bottomY, offsetZ + depth]}
            radius={tubeRadius}
          />,
        )

        // Top rails only for the topmost cell
        if (stackIndex === columnHeight - 1) {
          els.push(
            <ChromeTube
              key={`hrail-ft-${colIndex}-${stackIndex}`}
              start={[leftX, topY, offsetZ + depth]}
              end={[rightX, topY, offsetZ + depth]}
              radius={tubeRadius}
            />,
          )
          els.push(
            <ChromeTube
              key={`hrail-bt-${colIndex}-${stackIndex}`}
              start={[leftX, topY, offsetZ]}
              end={[rightX, topY, offsetZ]}
              radius={tubeRadius}
            />,
          )
          els.push(
            <ChromeTube
              key={`drail-lt-${colIndex}-${stackIndex}`}
              start={[leftX, topY, offsetZ]}
              end={[leftX, topY, offsetZ + depth]}
              radius={tubeRadius}
            />,
          )
          els.push(
            <ChromeTube
              key={`drail-rt-${colIndex}-${stackIndex}`}
              start={[rightX, topY, offsetZ]}
              end={[rightX, topY, offsetZ + depth]}
              radius={tubeRadius}
            />,
          )
        }

        // Glass shelf for all cells
        els.push(
          <mesh
            key={`glass-${colIndex}-${stackIndex}`}
            position={[cellCenterX, bottomY + 0.005, offsetZ + depth / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
            <meshPhysicalMaterial
              color="#e8f4f8"
              transparent
              opacity={0.4}
              roughness={0.05}
              metalness={0.1}
              transmission={0.6}
            />
          </mesh>,
        )

        // Only render module-specific elements for filled cells
        if (cell && cell.type !== "empty") {
          const cellColor = cell.color || config.accentColor || "weiss"
          const panelColor = colorMap[cellColor] || colorMap.weiss

          const usesGLBModel = [
            "mit-tueren",
            "abschliessbare-tueren",
            "mit-klapptuer",
            "schubladen",
            "mit-doppelschublade",
          ].includes(cell.type)

          // Render GLB model for drawers and doors
          if (usesGLBModel) {
            els.push(
              <GLBModule
                key={`glb-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + depth / 2]}
                cellType={cell.type}
                width={cell.width}
                height={cell.height}
                depth={cell.depth}
                color={panelColor}
              />,
            )
          }

          const needsManualEnclosure = cell.type === "mit-rueckwand" || cell.type === "mit-seitenwaenden"

          if (needsManualEnclosure) {
            // Back panel
            els.push(
              <mesh
                key={`enclosure-back-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + panelThickness / 2]}
              >
                <boxGeometry args={[cellWidth - 0.024, cellHeight - 0.024, panelThickness]} />
                <meshStandardMaterial color={panelColor} />
              </mesh>,
            )

            // Left side panel
            els.push(
              <mesh
                key={`enclosure-left-${colIndex}-${stackIndex}`}
                position={[leftX + panelThickness / 2 + 0.012, cellCenterY, offsetZ + depth / 2]}
              >
                <boxGeometry args={[panelThickness, cellHeight - 0.024, depth - 0.024]} />
                <meshStandardMaterial color={panelColor} />
              </mesh>,
            )

            // Right side panel
            els.push(
              <mesh
                key={`enclosure-right-${colIndex}-${stackIndex}`}
                position={[rightX - panelThickness / 2 - 0.012, cellCenterY, offsetZ + depth / 2]}
              >
                <boxGeometry args={[panelThickness, cellHeight - 0.024, depth - 0.024]} />
                <meshStandardMaterial color={panelColor} />
              </mesh>,
            )

            // Top panel
            els.push(
              <mesh
                key={`enclosure-top-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - panelThickness / 2 - 0.012, offsetZ + depth / 2]}
              >
                <boxGeometry args={[cellWidth - 0.024, panelThickness, depth - 0.024]} />
                <meshStandardMaterial color={panelColor} />
              </mesh>,
            )

            // Front panel
            els.push(
              <mesh
                key={`enclosure-front-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + depth - panelThickness / 2]}
              >
                <boxGeometry args={[cellWidth - 0.024, cellHeight - 0.024, panelThickness]} />
                <meshStandardMaterial color={panelColor} />
              </mesh>,
            )
          }

          if (cell.type === "mit-rueckwand") {
            els.push(
              <mesh key={`backpanel-${colIndex}-${stackIndex}`} position={[cellCenterX, cellCenterY, offsetZ + 0.005]}>
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
          }

          if (cell.type === "mit-seitenwaenden") {
            els.push(
              <mesh
                key={`sidewall-left-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-right-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
          }
        }

        // Interactive cell for ALL cells (not just filled ones)
        const isHoveredCell = hoveredCell?.col === colIndex && hoveredCell?.stackIndex === stackIndex

        cells.push(
          <InteractiveCell
            key={`cell-${colIndex}-${stackIndex}`}
            position={[cellCenterX, cellCenterY, offsetZ + depth / 2]}
            width={cellWidth}
            height={cellHeight}
            depth={depth}
            isHovered={isHoveredCell}
            onClick={() => onCellClick(colIndex, stackIndex)}
            onPointerOver={() => onCellHover({ col: colIndex, stackIndex })}
            onPointerOut={() => onCellHover(null)}
          />,
        )
      }

      // Expansion cell above this column
      const topStackIndex = columnHeight
      const topCellCenterY = topStackIndex * cellHeight + offsetY + cellHeight / 2

      expansionCells.push(
        <ExpansionCell
          key={`expand-up-${colIndex}`}
          position={[cellCenterX, topCellCenterY, offsetZ + depth / 2]}
          width={cellWidth}
          height={cellHeight}
          depth={depth}
          onClick={() => onExpandUp?.(colIndex)}
        />,
      )
    })

    // Left/Right expansion cells
    if (hasAnyFilledCells) {
      const firstColWidth = config.columns[0]?.width / 100 || 0.75
      const leftX = getColumnStartX(0, config.columns, offsetX)

      expansionCells.push(
        <ExpansionCell
          key="expand-left"
          position={[leftX - firstColWidth / 2, cellHeight / 2 + offsetY, offsetZ + depth / 2]}
          width={firstColWidth}
          height={cellHeight}
          depth={depth}
          onClick={() => onExpandLeft?.(75)}
        />,
      )

      const lastColWidth = config.columns[config.columns.length - 1]?.width / 100 || 0.75
      const rightX = getColumnStartX(config.columns.length - 1, config.columns, offsetX) + lastColWidth

      expansionCells.push(
        <ExpansionCell
          key="expand-right"
          position={[rightX + lastColWidth / 2, cellHeight / 2 + offsetY, offsetZ + depth / 2]}
          width={lastColWidth}
          height={cellHeight}
          depth={depth}
          onClick={() => onExpandRight?.(75)}
        />,
      )
    }

    return { elements: els, interactiveCells: cells, expansionCells, hasAnyFilledCells }
  }, [
    config,
    depth,
    tubeRadius,
    cellHeight,
    hoveredCell,
    onCellClick,
    onCellHover,
    onExpandLeft,
    onExpandRight,
    onExpandUp,
    panelThickness, // Added dependency
  ])

  const defaultCellWidth = config.columns[0]?.width / 100 || 0.75

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>

      {elements}
      {interactiveCells}
      {expansionCells}

      {!hasAnyFilledCells && (
        <StartingPlaceholder
          position={[0, cellHeight / 2 + offsetY, -depth / 2 + depth / 2]}
          width={defaultCellWidth}
          height={cellHeight}
          depth={depth}
          onClick={() => onCellClick(0, 0)}
        />
      )}
    </group>
  )
}
