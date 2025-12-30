"use client"

import { Html, useTexture, useGLTF } from "@react-three/drei"
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

function FrameFromGLB({
  start,
  end,
  frameUrl = "/images/80x40x40-1-5-orange-optimized-20-281-29-opt.glb",
}: {
  start: [number, number, number]
  end: [number, number, number]
  frameUrl?: string
}) {
  const { scene } = useGLTF(frameUrl)

  const frameSegment = useMemo(() => {
    if (!scene) return null

    try {
      // Calculate direction and length
      const startVec = new THREE.Vector3(...start)
      const endVec = new THREE.Vector3(...end)
      const direction = new THREE.Vector3().subVectors(endVec, startVec)
      const length = direction.length()

      // Get midpoint for positioning
      const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)

      // Clone the scene
      const clone = scene.clone(true)

      // Get bounding box to understand model size
      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      // Find aluminum/frame meshes and extract them
      const frameMeshes: THREE.Mesh[] = []
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Check if this looks like aluminum/metal frame by material or name
          const mat = child.material as THREE.MeshStandardMaterial
          if (
            mat &&
            (mat.metalness > 0.3 ||
              child.name.toLowerCase().includes("alu") ||
              child.name.toLowerCase().includes("frame") ||
              child.name.toLowerCase().includes("metal"))
          ) {
            frameMeshes.push(child.clone())
          }
        }
      })

      // If we found frame meshes, use them; otherwise create procedural aluminum
      if (frameMeshes.length > 0) {
        const group = new THREE.Group()
        frameMeshes.forEach((mesh) => {
          // Apply aluminum material
          mesh.material = new THREE.MeshStandardMaterial({
            color: "#d4d4d8",
            metalness: 0.85,
            roughness: 0.2,
          })
          group.add(mesh)
        })

        // Scale and orient
        const frameBox = new THREE.Box3().setFromObject(group)
        const frameSize = frameBox.getSize(new THREE.Vector3())
        const maxDim = Math.max(frameSize.x, frameSize.y, frameSize.z)
        const scale = (length / maxDim) * 0.08 // Scale to create thin profile

        group.scale.set(scale, scale, scale)

        // Orient along direction
        direction.normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
        group.setRotationFromQuaternion(quaternion)

        group.position.copy(midpoint)

        return group
      }

      return null
    } catch (error) {
      console.error("[v0] Error processing frame GLB:", error)
      return null
    }
  }, [scene, start, end])

  // Fallback to procedural aluminum if GLB extraction fails
  if (!frameSegment) {
    return <AluminumExtrusion start={start} end={end} profileSize={0.025} />
  }

  return <primitive object={frameSegment} castShadow receiveShadow />
}

function AluminumExtrusion({
  start,
  end,
  profileSize = 0.03,
}: {
  start: [number, number, number]
  end: [number, number, number]
  profileSize?: number
}) {
  const geometry = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const direction = new THREE.Vector3().subVectors(endVec, startVec)
    const length = direction.length()

    const shape = new THREE.Shape()
    const w = profileSize / 2
    const slot = profileSize * 0.15
    const wall = profileSize * 0.08

    shape.moveTo(-w, -w)
    shape.lineTo(w, -w)
    shape.lineTo(w, w)
    shape.lineTo(-w, w)
    shape.lineTo(-w, -w)

    const hole1 = new THREE.Path()
    const innerSize = w - wall
    hole1.moveTo(-innerSize, -innerSize)
    hole1.lineTo(innerSize, -innerSize)
    hole1.lineTo(innerSize, innerSize)
    hole1.lineTo(-innerSize, innerSize)
    hole1.lineTo(-innerSize, -innerSize)
    shape.holes.push(hole1)

    const slotDepth = wall * 0.5
    const slotWidth = slot

    const topSlot = new THREE.Path()
    topSlot.moveTo(-slotWidth / 2, w - slotDepth)
    topSlot.lineTo(slotWidth / 2, w - slotDepth)
    topSlot.lineTo(slotWidth / 2, w)
    topSlot.lineTo(-slotWidth / 2, w)
    topSlot.lineTo(-slotWidth / 2, w - slotDepth)
    shape.holes.push(topSlot)

    const bottomSlot = new THREE.Path()
    bottomSlot.moveTo(-slotWidth / 2, -w + slotDepth)
    bottomSlot.lineTo(slotWidth / 2, -w + slotDepth)
    bottomSlot.lineTo(slotWidth / 2, -w)
    bottomSlot.lineTo(-slotWidth / 2, -w)
    bottomSlot.lineTo(-slotWidth / 2, -w + slotDepth)
    shape.holes.push(bottomSlot)

    const leftSlot = new THREE.Path()
    leftSlot.moveTo(-w + slotDepth, -slotWidth / 2)
    leftSlot.lineTo(-w, -slotWidth / 2)
    leftSlot.lineTo(-w, slotWidth / 2)
    leftSlot.lineTo(-w + slotDepth, slotWidth / 2)
    leftSlot.lineTo(-w + slotDepth, -slotWidth / 2)
    shape.holes.push(leftSlot)

    const rightSlot = new THREE.Path()
    rightSlot.moveTo(w - slotDepth, -slotWidth / 2)
    rightSlot.lineTo(w, -slotWidth / 2)
    rightSlot.lineTo(w, slotWidth / 2)
    rightSlot.lineTo(w - slotDepth, slotWidth / 2)
    rightSlot.lineTo(w - slotDepth, -slotWidth / 2)
    shape.holes.push(rightSlot)

    const extrudeSettings = {
      steps: 1,
      depth: length,
      bevelEnabled: false,
    }

    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

    direction.normalize()
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)

    extrudeGeometry.applyQuaternion(quaternion)
    extrudeGeometry.translate(startVec.x, startVec.y, startVec.z)

    return extrudeGeometry
  }, [start, end, profileSize])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.3} envMapIntensity={0.5} />
    </mesh>
  )
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
        <FrameFromGLB
          key={`vpost-fl-${colIndex}`}
          start={[leftX, offsetY, offsetZ + depth]}
          end={[leftX, columnTopY, offsetZ + depth]}
        />,
      )
      els.push(
        <FrameFromGLB
          key={`vpost-fr-${colIndex}`}
          start={[rightX, offsetY, offsetZ + depth]}
          end={[rightX, columnTopY, offsetZ + depth]}
        />,
      )
      els.push(
        <FrameFromGLB
          key={`vpost-bl-${colIndex}`}
          start={[leftX, offsetY, offsetZ]}
          end={[leftX, columnTopY, offsetZ]}
        />,
      )
      els.push(
        <FrameFromGLB
          key={`vpost-br-${colIndex}`}
          start={[rightX, offsetY, offsetZ]}
          end={[rightX, columnTopY, offsetZ]}
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
          <FrameFromGLB
            key={`hrail-fb-${colIndex}-${stackIndex}`}
            start={[leftX, bottomY, offsetZ + depth]}
            end={[rightX, bottomY, offsetZ + depth]}
          />,
        )
        els.push(
          <FrameFromGLB
            key={`hrail-bb-${colIndex}-${stackIndex}`}
            start={[leftX, bottomY, offsetZ]}
            end={[rightX, bottomY, offsetZ]}
          />,
        )

        els.push(
          <FrameFromGLB
            key={`drail-lb-${colIndex}-${stackIndex}`}
            start={[leftX, bottomY, offsetZ]}
            end={[leftX, bottomY, offsetZ + depth]}
          />,
        )
        els.push(
          <FrameFromGLB
            key={`drail-rb-${colIndex}-${stackIndex}`}
            start={[rightX, bottomY, offsetZ]}
            end={[rightX, bottomY, offsetZ + depth]}
          />,
        )

        if (stackIndex === columnHeight - 1) {
          els.push(
            <FrameFromGLB
              key={`hrail-ft-${colIndex}-${stackIndex}`}
              start={[leftX, topY, offsetZ + depth]}
              end={[rightX, topY, offsetZ + depth]}
            />,
          )
          els.push(
            <FrameFromGLB
              key={`hrail-bt-${colIndex}-${stackIndex}`}
              start={[leftX, topY, offsetZ]}
              end={[rightX, topY, offsetZ]}
            />,
          )
          els.push(
            <FrameFromGLB
              key={`drail-lt-${colIndex}-${stackIndex}`}
              start={[leftX, topY, offsetZ]}
              end={[leftX, topY, offsetZ + depth]}
            />,
          )
          els.push(
            <FrameFromGLB
              key={`drail-rt-${colIndex}-${stackIndex}`}
              start={[rightX, topY, offsetZ]}
              end={[rightX, topY, offsetZ + depth]}
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

        const topPanelColor = colorMap[cell?.color || config.accentColor || "weiss"] || colorMap.weiss
        els.push(
          <mesh
            key={`toppanel-always-${colIndex}-${stackIndex}`}
            position={[cellCenterX, topY - 0.005, offsetZ + depth / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[cellWidth - 0.024, depth - 0.024]} />
            <meshStandardMaterial color={topPanelColor} side={THREE.DoubleSide} />
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

          if (cell.type === "mit-rueckwand") {
            // Back panel (beige/tan color as shown in reference)
            els.push(
              <mesh
                key={`backpanel-rw-${colIndex}-${stackIndex}`}
                position={[cellCenterX, cellCenterY, offsetZ + 0.005]}
              >
                <planeGeometry args={[cellWidth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            // Left side panel
            els.push(
              <mesh
                key={`sidewall-left-rw-${colIndex}-${stackIndex}`}
                position={[leftX + 0.005, cellCenterY, offsetZ + depth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[depth - 0.024, cellHeight - 0.024]} />
                <meshStandardMaterial color={panelColor} side={THREE.DoubleSide} />
              </mesh>,
            )
            // Right side panel
            els.push(
              <mesh
                key={`sidewall-right-rw-${colIndex}-${stackIndex}`}
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
                key={`toppanel-rw-${colIndex}-${stackIndex}`}
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

// Preload the frame GLB
useGLTF.preload("/images/80x40x40-1-5-orange-optimized-20-281-29-opt.glb")
