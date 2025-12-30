"use client"

import { Html, useTexture } from "@react-three/drei"
import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ShelfConfig, ColumnData } from "@/components/shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import type { JSX } from "react/jsx-runtime"

interface ShelfSceneProps {
  config: ShelfConfig
  selectedTool: string | "empty" | null
  hoveredCell: { col: number; stackIndex: number } | null
  selectedCell: { col: number; stackIndex: number } | null
  onCellClick: (col: number, stackIndex: number) => void
  onCellHover: (cell: { col: number; stackIndex: number } | null) => void
  onCellSelect?: (col: number, stackIndex: number) => void
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
  isSelected,
  onClick,
  onRightClick,
  onPointerOver,
  onPointerOut,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  isHovered: boolean
  isSelected?: boolean
  onClick?: () => void
  onRightClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}) {
  const [localHover, setLocalHover] = useState(false)

  return (
    <mesh
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation()
        if (e.button === 2 || e.ctrlKey || e.metaKey) {
          onRightClick?.()
        } else {
          onClick?.()
        }
      }}
      onContextMenu={(e) => {
        e.stopPropagation()
        onRightClick?.()
      }}
      onPointerEnter={() => {
        setLocalHover(true)
        onPointerOver?.()
        document.body.style.cursor = "pointer"
      }}
      onPointerLeave={() => {
        setLocalHover(false)
        onPointerOut?.()
        document.body.style.cursor = "auto"
      }}
    >
      <boxGeometry args={[width - 0.01, height - 0.01, depth - 0.01]} />
      <meshStandardMaterial
        color={isSelected ? "#00b4d8" : isHovered || localHover ? "#00b4d8" : "#ffffff"}
        transparent
        opacity={isSelected ? 0.3 : isHovered || localHover ? 0.15 : 0}
        depthWrite={false}
      />
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width - 0.01, height - 0.01, depth - 0.01)]} />
          <lineBasicMaterial color="#00b4d8" linewidth={2} />
        </lineSegments>
      )}
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
  onCellSelect,
  onExpandLeft,
  onExpandRight,
  onExpandUp,
}: ShelfSceneProps) {
  const depth = 0.38
  const tubeRadius = 0.012
  const cellHeight = 0.38
  const offsetY = 0.025

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

    config.columns.forEach((column, colIndex) => {
      const cellWidth = column.width / 100
      const leftX = getColumnStartX(colIndex, config.columns, offsetX)
      const rightX = leftX + cellWidth
      const cellCenterX = leftX + cellWidth / 2

      const filledCells = column.cells
        .map((cell, idx) => ({ cell, stackIndex: idx }))
        .filter(({ cell }) => cell.type !== "empty")

      if (filledCells.length > 0) {
        hasAnyFilledCells = true
      }

      let columnHeight = 0
      for (let i = column.cells.length - 1; i >= 0; i--) {
        if (column.cells[i].type !== "empty") {
          columnHeight = i + 1
          break
        }
      }

      if (columnHeight === 0) return

      const columnTopY = columnHeight * cellHeight + offsetY

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

      for (let stackIndex = 0; stackIndex < columnHeight; stackIndex++) {
        const cell = column.cells[stackIndex]
        const bottomY = stackIndex * cellHeight + offsetY
        const topY = (stackIndex + 1) * cellHeight + offsetY
        const cellCenterY = bottomY + cellHeight / 2

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

        if (cell && cell.type !== "empty") {
          const cellColor = cell.color || config.accentColor || "weiss"
          const panelColor = colorMap[cellColor] || colorMap.weiss

          const isSmallCell = column.width === 38

          if (cell.type === "mit-tueren" || cell.type === "abschliessbare-tueren") {
            // Back panel
            els.push(
              <mesh
                key={`backpanel-doors-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )

            // Side walls
            els.push(
              <mesh
                key={`sidewall-left-doors-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-right-doors-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )

            // Top panel
            els.push(
              <mesh
                key={`toppanel-doors-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )

            if (isSmallCell) {
              els.push(
                <mesh
                  key={`door-single-${colIndex}-${stackIndex}`}
                  position={[cellCenterX, cellCenterY, offsetZ + depth + 0.005]}
                >
                  <boxGeometry args={[cellWidth - 0.03, cellHeight - 0.03, 0.01]} />
                  <meshStandardMaterial color={panelColor} />
                </mesh>,
              )

              // Single door handle (vertical chrome bar on right side)
              els.push(
                <mesh
                  key={`handle-single-${colIndex}-${stackIndex}`}
                  position={[cellCenterX + cellWidth / 2 - 0.05, cellCenterY, offsetZ + depth + 0.015]}
                >
                  <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.5, 8]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>,
              )

              if (cell.type === "abschliessbare-tueren") {
                // Lock indicator for single door
                els.push(
                  <mesh
                    key={`lock-single-${colIndex}-${stackIndex}`}
                    position={[cellCenterX + cellWidth / 2 - 0.05, cellCenterY - 0.05, offsetZ + depth + 0.02]}
                  >
                    <sphereGeometry args={[0.01, 16, 16]} />
                    <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
                  </mesh>,
                )
              }
            } else {
              const doorWidth = (cellWidth - 0.03) / 2

              // Left door
              els.push(
                <mesh
                  key={`door-left-${colIndex}-${stackIndex}`}
                  position={[leftX + doorWidth / 2 + 0.012, cellCenterY, offsetZ + depth + 0.005]}
                >
                  <boxGeometry args={[doorWidth, cellHeight - 0.03, 0.01]} />
                  <meshStandardMaterial color={panelColor} />
                </mesh>,
              )

              // Right door
              els.push(
                <mesh
                  key={`door-right-${colIndex}-${stackIndex}`}
                  position={[rightX - doorWidth / 2 - 0.012, cellCenterY, offsetZ + depth + 0.005]}
                >
                  <boxGeometry args={[doorWidth, cellHeight - 0.03, 0.01]} />
                  <meshStandardMaterial color={panelColor} />
                </mesh>,
              )

              // Handles for double doors
              els.push(
                <mesh
                  key={`handle-left-${colIndex}-${stackIndex}`}
                  position={[leftX + doorWidth - 0.03, cellCenterY, offsetZ + depth + 0.015]}
                >
                  <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.5, 8]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>,
              )
              els.push(
                <mesh
                  key={`handle-right-${colIndex}-${stackIndex}`}
                  position={[rightX - doorWidth + 0.03, cellCenterY, offsetZ + depth + 0.015]}
                >
                  <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.5, 8]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>,
              )

              if (cell.type === "abschliessbare-tueren") {
                // Lock indicators for double doors
                els.push(
                  <mesh
                    key={`lock-left-${colIndex}-${stackIndex}`}
                    position={[leftX + doorWidth - 0.03, cellCenterY - 0.05, offsetZ + depth + 0.02]}
                  >
                    <sphereGeometry args={[0.01, 16, 16]} />
                    <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
                  </mesh>,
                )
                els.push(
                  <mesh
                    key={`lock-right-${colIndex}-${stackIndex}`}
                    position={[rightX - doorWidth + 0.03, cellCenterY - 0.05, offsetZ + depth + 0.02]}
                  >
                    <sphereGeometry args={[0.01, 16, 16]} />
                    <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
                  </mesh>,
                )
              }
            }
          }

          if (cell.type === "mit-klapptuer") {
            els.push(
              <mesh
                key={`backpanel-flap-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-left-flap-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-right-flap-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`flap-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + depth + 0.005]}
              >
                <boxGeometry args={[cellWidth - 0.03, cellHeight - 0.03, 0.01]} />
                <meshStandardMaterial color={panelColor} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`flap-handle-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY + (cellHeight - 0.03) / 2 - 0.03, offsetZ + depth + 0.02]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
                <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`toppanel-flap-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
          }

          if (cell.type === "schubladen" || cell.type === "mit-doppelschublade") {
            const drawerHeight = cell.type === "mit-doppelschublade" ? (cellHeight - 0.04) / 2 : cellHeight - 0.03
            const drawerCount = cell.type === "mit-doppelschublade" ? 2 : 1

            els.push(
              <mesh
                key={`backpanel-drawer-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-left-drawer-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-right-drawer-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )

            for (let d = 0; d < drawerCount; d++) {
              const drawerY =
                cell.type === "mit-doppelschublade"
                  ? bottomY + 0.02 + d * (drawerHeight + 0.01) + drawerHeight / 2
                  : cellCenterY
              els.push(
                <mesh
                  key={`drawer-${d}-${colIndex}-${stackIndex}`}
                  position={[cellCenterX, drawerY, offsetZ + depth + 0.005]}
                >
                  <boxGeometry args={[cellWidth - 0.03, drawerHeight, 0.01]} />
                  <meshStandardMaterial color={panelColor} />
                </mesh>,
              )
              els.push(
                <mesh
                  key={`drawer-handle-${d}-${colIndex}-${stackIndex}`}
                  position={[cellCenterX, drawerY, offsetZ + depth + 0.015]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
                  <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
                </mesh>,
              )
            }
            els.push(
              <mesh
                key={`toppanel-drawer-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
          }

          if (cell.type === "mit-seitenwaenden") {
            els.push(
              <mesh
                key={`backpanel-sw-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
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
            els.push(
              <mesh
                key={`toppanel-sw-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
          }
        }

        const isHoveredCell = hoveredCell?.col === colIndex && hoveredCell?.stackIndex === stackIndex

        cells.push(
          <InteractiveCell
            key={`cell-${colIndex}-${stackIndex}`}
            position={[cellCenterX, cellCenterY, offsetZ + depth / 2]}
            width={cellWidth}
            height={cellHeight}
            depth={depth}
            isHovered={isHoveredCell}
            isSelected={selectedCell?.col === colIndex && selectedCell?.stackIndex === stackIndex}
            onClick={() => {
              onCellClick(colIndex, stackIndex)
              onCellSelect?.(colIndex, stackIndex)
            }}
            onRightClick={() => {
              console.log("[v0] Right-click detected, selecting cell", colIndex, stackIndex)
              onCellSelect?.(colIndex, stackIndex)
            }}
            onPointerOver={() => onCellHover({ col: colIndex, stackIndex })}
            onPointerOut={() => onCellHover(null)}
          />,
        )
      }
    })

    const firstColWidth = config.columns[0]?.width / 100 || 0.75
    const expandLeftX = getColumnStartX(0, config.columns, offsetX)

    expansionCells.push(
      <ExpansionCell
        key="expand-left"
        position={[expandLeftX - firstColWidth / 2, cellHeight / 2 + offsetY, offsetZ + depth / 2]}
        width={firstColWidth}
        height={cellHeight}
        depth={depth}
        onClick={() => onExpandLeft?.(75)}
      />,
    )

    const lastColWidth = config.columns[config.columns.length - 1]?.width / 100 || 0.75
    const expandRightX = getColumnStartX(config.columns.length - 1, config.columns, offsetX) + lastColWidth

    expansionCells.push(
      <ExpansionCell
        key="expand-right"
        position={[expandRightX + lastColWidth / 2, cellHeight / 2 + offsetY, offsetZ + depth / 2]}
        width={lastColWidth}
        height={cellHeight}
        depth={depth}
        onClick={() => onExpandRight?.(75)}
      />,
    )

    return { elements: els, interactiveCells: cells, expansionCells, hasAnyFilledCells }
  }, [
    config,
    selectedCell,
    depth,
    tubeRadius,
    cellHeight,
    hoveredCell,
    onCellClick,
    onCellHover,
    onCellSelect,
    onExpandLeft,
    onExpandRight,
    onExpandUp,
  ])

  const defaultCellWidth = config.columns[0]?.width / 100 || 0.75

  return (
    <group>
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
