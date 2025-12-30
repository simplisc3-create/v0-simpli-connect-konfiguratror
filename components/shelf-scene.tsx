"use client"

import { Html, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useState, useRef } from "react"
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
  grau: colorHexMap.grau,
}

const PANEL_METALNESS = 0.05
const PANEL_ROUGHNESS = 0.5

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
  const sphereRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Floating animation
  useFrame((state) => {
    if (sphereRef.current) {
      // Gentle floating motion
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.02
      sphereRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.8 + position[1]) * 0.01
    }
  })

  // Sphere radius is 20% bigger than the plus sign
  const sphereRadius = 0.06
  const clickAreaRadius = 0.15

  return (
    <group position={position} ref={groupRef}>
      {/* Invisible larger click area */}
      <mesh
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
        <sphereGeometry args={[clickAreaRadius, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* Visible floating sphere */}
      <mesh ref={sphereRef} scale={hovered ? 1.3 : 1}>
        <sphereGeometry args={[sphereRadius, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#4ade80" : "#22c55e"}
          transparent
          opacity={hovered ? 0.9 : 0.5}
          emissive={hovered ? "#22c55e" : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      <Html center>
        <div
          className={`${hovered ? "scale-125 text-white" : "text-white/90"} text-xl font-bold transition-all duration-200 pointer-events-none select-none`}
          style={{ textShadow: hovered ? "0 0 10px rgba(34, 197, 94, 0.8)" : "none" }}
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
  const sphereRef = useRef<THREE.Mesh>(null)

  // Floating animation
  useFrame((state) => {
    if (sphereRef.current) {
      // Gentle floating motion
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.03
      sphereRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.015
    }
  })

  // Larger sphere for starting placeholder
  const sphereRadius = 0.1
  const clickAreaRadius = 0.25

  return (
    <group position={position}>
      {/* Invisible larger click area */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
      >
        <sphereGeometry args={[clickAreaRadius, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* Visible floating sphere */}
      <mesh ref={sphereRef} scale={hovered ? 1.3 : 1}>
        <sphereGeometry args={[sphereRadius, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#4ade80" : "#22c55e"}
          transparent
          opacity={hovered ? 0.9 : 0.5}
          emissive={hovered ? "#22c55e" : "#000000"}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>
      <Html center>
        <div
          className={`${hovered ? "scale-125" : ""} text-white font-bold text-2xl transition-all duration-200 pointer-events-none select-none`}
          style={{ textShadow: hovered ? "0 0 12px rgba(34, 197, 94, 0.9)" : "0 0 4px rgba(0,0,0,0.5)" }}
        >
          +
        </div>
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

        // All surfaces within a module get the same color from the cell's color setting
        const cellColor = cell?.color || config.accentColor || "weiss"
        const panelColor = colorMap[cellColor] || colorMap.weiss

        els.push(
          <mesh
            key={`bottompanel-${colIndex}-${stackIndex}`}
            position={[cellCenterX, bottomY + 0.005, offsetZ + depth / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
            <meshStandardMaterial
              color={panelColor}
              side={THREE.DoubleSide}
              metalness={PANEL_METALNESS}
              roughness={PANEL_ROUGHNESS}
            />
          </mesh>,
        )

        els.push(
          <mesh
            key={`toppanel-${colIndex}-${stackIndex}`}
            position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
            <meshStandardMaterial
              color={panelColor}
              side={THREE.DoubleSide}
              metalness={PANEL_METALNESS}
              roughness={PANEL_ROUGHNESS}
            />
          </mesh>,
        )

        if (cell && cell.type !== "empty") {
          const isSmallCell = column.width === 38

          if (cell.type === "mit-tueren" || cell.type === "abschliessbare-tueren") {
            els.push(
              <mesh
                key={`backpanel-doors-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )

            els.push(
              <mesh
                key={`sidewall-left-doors-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-right-doors-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )

            els.push(
              <mesh
                key={`toppanel-doors-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )

            if (isSmallCell) {
              els.push(
                <mesh
                  key={`door-single-${colIndex}-${stackIndex}`}
                  position={[cellCenterX, cellCenterY, offsetZ + depth + 0.005]}
                >
                  <boxGeometry args={[cellWidth - 0.03, cellHeight - 0.03, 0.01]} />
                  <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
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
                // Lock cylinder at top center
                els.push(
                  <mesh
                    key={`lock-single-${colIndex}-${stackIndex}`}
                    position={[cellCenterX, topY - 0.05, offsetZ + depth + 0.02]}
                  >
                    <sphereGeometry args={[0.012, 16, 16]} />
                    <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} />
                  </mesh>,
                )
                // Keyhole indicator (small triangle)
                els.push(
                  <mesh
                    key={`keyhole-single-${colIndex}-${stackIndex}`}
                    position={[cellCenterX, topY - 0.07, offsetZ + depth + 0.016]}
                    rotation={[0, 0, Math.PI]}
                  >
                    <coneGeometry args={[0.006, 0.012, 3]} />
                    <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.3} />
                  </mesh>,
                )
              }
            } else {
              const doorWidth = (cellWidth - 0.03) / 2 - 0.005
              els.push(
                <mesh
                  key={`door-left-${colIndex}-${stackIndex}`}
                  position={[cellCenterX - doorWidth / 2 - 0.0025, cellCenterY, offsetZ + depth + 0.005]}
                >
                  <boxGeometry args={[doorWidth, cellHeight - 0.03, 0.01]} />
                  <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
                </mesh>,
              )
              els.push(
                <mesh
                  key={`door-right-${colIndex}-${stackIndex}`}
                  position={[cellCenterX + doorWidth / 2 + 0.0025, cellCenterY, offsetZ + depth + 0.005]}
                >
                  <boxGeometry args={[doorWidth, cellHeight - 0.03, 0.01]} />
                  <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
                </mesh>,
              )

              // Handles for double doors (vertical bars near center)
              els.push(
                <mesh
                  key={`handle-left-${colIndex}-${stackIndex}`}
                  position={[cellCenterX - 0.02, cellCenterY, offsetZ + depth + 0.015]}
                >
                  <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.5, 8]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>,
              )
              els.push(
                <mesh
                  key={`handle-right-${colIndex}-${stackIndex}`}
                  position={[cellCenterX + 0.02, cellCenterY, offsetZ + depth + 0.015]}
                >
                  <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.5, 8]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>,
              )

              if (cell.type === "abschliessbare-tueren") {
                // Lock cylinder at top center between doors
                els.push(
                  <mesh
                    key={`lock-center-${colIndex}-${stackIndex}`}
                    position={[cellCenterX, topY - 0.05, offsetZ + depth + 0.02]}
                  >
                    <sphereGeometry args={[0.012, 16, 16]} />
                    <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} />
                  </mesh>,
                )
                // Keyhole indicator (small triangle pointing down)
                els.push(
                  <mesh
                    key={`keyhole-center-${colIndex}-${stackIndex}`}
                    position={[cellCenterX, topY - 0.07, offsetZ + depth + 0.016]}
                    rotation={[0, 0, Math.PI]}
                  >
                    <coneGeometry args={[0.006, 0.012, 3]} />
                    <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.3} />
                  </mesh>,
                )
              }
            }
          }

          if (cell.type === "mit-klapptuer") {
            els.push(
              <mesh
                key={`backpanel-klapp-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-left-klapp-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-right-klapp-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`toppanel-klapp-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`klapptuer-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + depth + 0.005]}
              >
                <boxGeometry args={[cellWidth - 0.03, cellHeight - 0.03, 0.01]} />
                <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
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
          }

          if (cell.type === "schubladen" || cell.type === "mit-doppelschublade") {
            els.push(
              <mesh
                key={`backpanel-drawer-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-left-drawer-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`sidewall-right-drawer-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            els.push(
              <mesh
                key={`toppanel-drawer-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )

            const drawerHeight = (cellHeight - 0.06) / 2
            els.push(
              <mesh
                key={`drawer-top-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY + drawerHeight / 2 + 0.015, offsetZ + depth + 0.01]}
              >
                <boxGeometry args={[cellWidth - 0.04, drawerHeight, 0.02]} />
                <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`drawer-bottom-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY - drawerHeight / 2 - 0.015, offsetZ + depth + 0.01]}
              >
                <boxGeometry args={[cellWidth - 0.04, drawerHeight, 0.02]} />
                <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
              </mesh>,
            )

            // Original drawer handles for single drawer (removed as they are now part of double drawer logic)
            // Original drawer handles for double drawer (kept for consistency)
            els.push(
              <mesh
                key={`drawer-handle-top-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY + drawerHeight / 2 + 0.015, offsetZ + depth + 0.02]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
                <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
              </mesh>,
            )
            els.push(
              <mesh
                key={`drawer-handle-bottom-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY - drawerHeight / 2 - 0.015, offsetZ + depth + 0.02]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
                <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
              </mesh>,
            )
          }

          if (cell.type === "mit-seitenwaende") {
            // Left side panel - same color
            els.push(
              <mesh
                key={`sidewall-left-ms-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Right side panel - same color
            els.push(
              <mesh
                key={`sidewall-right-ms-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // NOTE: Top/bottom panels already rendered with same panelColor, no back panel
          }

          if (cell.type === "ohne-rueckwand") {
            // Left side panel - same color
            els.push(
              <mesh
                key={`sidewall-left-or-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Right side panel - same color
            els.push(
              <mesh
                key={`sidewall-right-or-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // NOTE: Top panel (decke) and bottom panel (boden) already rendered with same panelColor
          }

          if (cell.type === "mit-seitenwaende") {
            // Left side panel - same color
            els.push(
              <mesh
                key={`sidewall-left-ms-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Right side panel - same color
            els.push(
              <mesh
                key={`sidewall-right-ms-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // NOTE: Top/bottom panels already rendered with same panelColor, no back panel
          }

          if (cell.type === "ohne-seitenwaende") {
            // Back panel only - same color
            els.push(
              <mesh
                key={`backpanel-os-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // NOTE: Top/bottom panels already rendered with same panelColor, no side panels
          }

          if (cell.type === "mit-rueckwand") {
            // Back panel (rückwand) - same color as all other panels
            els.push(
              <mesh
                key={`backpanel-rw-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Left side panel (seitenwand links) - same color
            els.push(
              <mesh
                key={`sidewall-left-rw-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Right side panel (seitenwand rechts) - same color
            els.push(
              <mesh
                key={`sidewall-right-rw-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // NOTE: Top panel (decke) is already rendered above with same panelColor
          }

          if (cell.type === "mit-tuer-links") {
            // Back panel
            els.push(
              <mesh
                key={`backpanel-tl-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Left side wall
            els.push(
              <mesh
                key={`sidewall-left-tl-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Right side wall
            els.push(
              <mesh
                key={`sidewall-right-tl-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Top panel
            els.push(
              <mesh
                key={`toppanel-tl-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Door (full width, hinged on left)
            els.push(
              <mesh
                key={`door-tl-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + depth + 0.005]}
              >
                <boxGeometry args={[cellWidth - 0.03, cellHeight - 0.03, 0.01]} />
                <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
              </mesh>,
            )
            // Handle on right side of door
            els.push(
              <mesh
                key={`handle-tl-${colIndex}-${stackIndex}`}
                position={[rightX - 0.04, cellCenterY, offsetZ + depth + 0.015]}
              >
                <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.4, 8]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
              </mesh>,
            )
          }

          if (cell.type === "mit-tuer-rechts") {
            // Back panel
            els.push(
              <mesh
                key={`backpanel-tr-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Left side wall
            els.push(
              <mesh
                key={`sidewall-left-tr-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Right side wall
            els.push(
              <mesh
                key={`sidewall-right-tr-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Top panel
            els.push(
              <mesh
                key={`toppanel-tr-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Door (full width, hinged on right)
            els.push(
              <mesh
                key={`door-tr-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + depth + 0.005]}
              >
                <boxGeometry args={[cellWidth - 0.03, cellHeight - 0.03, 0.01]} />
                <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
              </mesh>,
            )
            // Handle on left side of door
            els.push(
              <mesh
                key={`handle-tr-${colIndex}-${stackIndex}`}
                position={[leftX + 0.04, cellCenterY, offsetZ + depth + 0.015]}
              >
                <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.4, 8]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
              </mesh>,
            )
          }

          if (cell.type === "mit-abschliessbarer-tuer-links") {
            // Back panel
            els.push(
              <mesh
                key={`backpanel-atl-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Left side wall
            els.push(
              <mesh
                key={`sidewall-left-atl-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Right side wall
            els.push(
              <mesh
                key={`sidewall-right-atl-${colIndex}-${stackIndex}`}
                position={[rightX - 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Top panel
            els.push(
              <mesh
                key={`toppanel-atl-${colIndex}-${stackIndex}`}
                position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
                <meshStandardMaterial
                  color={panelColor}
                  side={THREE.DoubleSide}
                  metalness={PANEL_METALNESS}
                  roughness={PANEL_ROUGHNESS}
                />
              </mesh>,
            )
            // Door (full width, hinged on left)
            els.push(
              <mesh
                key={`door-atl-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + depth + 0.005]}
              >
                <boxGeometry args={[cellWidth - 0.03, cellHeight - 0.03, 0.01]} />
                <meshStandardMaterial color={panelColor} metalness={PANEL_METALNESS} roughness={PANEL_ROUGHNESS} />
              </mesh>,
            )
            // Handle on right side of door
            els.push(
              <mesh
                key={`handle-atl-${colIndex}-${stackIndex}`}
                position={[rightX - 0.04, cellCenterY, offsetZ + depth + 0.015]}
              >
                <cylinderGeometry args={[0.005, 0.005, cellHeight * 0.4, 8]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
              </mesh>,
            )
            // Lock cylinder
            els.push(
              <mesh
                key={`lock-atl-${colIndex}-${stackIndex}`}
                position={[rightX - 0.04, cellCenterY + cellHeight * 0.25, offsetZ + depth + 0.02]}
              >
                <sphereGeometry args={[0.01, 16, 16]} />
                <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} />
              </mesh>,
            )
          }

          // Removed the "leer" specific logic as it's now handled by the generic panel drawing below.
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

    config.columns.forEach((column, colIndex) => {
      const hasFilledCell = column.cells.some((c) => c.type !== "empty")
      if (!hasFilledCell) return

      const columnHeight = column.cells.length
      const colWidth = column.width / 100
      const cellCenterX = getColumnStartX(colIndex, config.columns, offsetX) + colWidth / 2
      const topY = columnHeight * cellHeight + offsetY

      expansionCells.push(
        <ExpansionCell
          key={`expand-up-${colIndex}`}
          position={[cellCenterX, topY + cellHeight / 2, offsetZ + depth / 2]}
          width={colWidth}
          height={cellHeight}
          depth={depth}
          onClick={() => onExpandUp?.(colIndex)}
        />,
      )
    })

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
