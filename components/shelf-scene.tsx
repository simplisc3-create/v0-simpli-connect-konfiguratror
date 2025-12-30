"use client"

import { Html, useGLTF } from "@react-three/drei"
import { useMemo, useState } from "react"
import * as THREE from "three"
import type { ShelfConfig, ColumnData } from "@/components/shelf-configurator"
import { colorHexMap } from "@/lib/simpli-products"
import { useEffect } from "react"

interface ShelfSceneProps {
  config: ShelfConfig
  selectedTool: string | "empty" | null
  hoveredCell: { col: number; stackIndex: number } | null
  selectedCell: { col: number; stackIndex: number } | null
  onCellClick: (col: number, stackIndex: number) => void
  onCellHover: (cell: { col: number; stackIndex: number } | null) => void
  onCellSelect?: (col: number, stackIndex: number) => void
  onExpandLeft?: (width?: 37.5 | 38 | 40 | 75) => void
  onExpandRight?: (width?: 37.5 | 38 | 40 | 75) => void
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
  onClick,
}: {
  position: [number, number, number]
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  // Sphere radius is 20% bigger than the plus sign
  const sphereRadius = 0.06
  const clickAreaRadius = 0.15

  return (
    <group position={position}>
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
      {/* Visible sphere - no animation or glow */}
      <mesh>
        <sphereGeometry args={[sphereRadius, 32, 32]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.7} />
      </mesh>
      <Html center>
        <div className="text-white text-xl font-bold pointer-events-none select-none">+</div>
      </Html>
    </group>
  )
}

function StartingPlaceholder({
  position,
  onClick,
}: {
  position: [number, number, number]
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

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
      {/* Visible sphere - no animation or glow */}
      <mesh>
        <sphereGeometry args={[sphereRadius, 32, 32]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.7} />
      </mesh>
      <Html center>
        <div className="text-white font-bold text-2xl pointer-events-none select-none">+</div>
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

function ShelfModule({
  position,
  color,
  moduleType,
  width,
  height,
  depth,
}: {
  position: [number, number, number]
  color: string
  moduleType: string
  width: number
  height: number
  depth: number
}) {
  const { scene } = useGLTF("/images/40x40x40-2-5-blue-opt-20-282-29.glb")

  // Clone the scene so each instance can have different materials
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Apply color to all meshes in the model
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          // Clone material to avoid affecting other instances
          const material = (mesh.material as THREE.MeshStandardMaterial).clone()
          material.color.set(color)
          material.metalness = 0.05
          material.roughness = 0.5
          mesh.material = material
        }
      }
    })
  }, [clonedScene, color])

  // Calculate scale based on cell dimensions
  // GLB model is assumed to have a unit size
  const scale = [width, height, depth]

  return <primitive object={clonedScene} position={position} scale={scale} />
}

function ShelfScene({
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
  const totalWidth = useMemo(() => getTotalWidth(config.columns), [config.columns])
  const offsetX = -totalWidth / 2

  return (
    <group>
      {config.columns.map((column, colIndex) => {
        const startX = getColumnStartX(colIndex, config.columns, offsetX)
        const columnWidth = column.width / 100

        return (
          <group key={colIndex} position={[startX, 0, 0]}>
            {column.cells.map((cell, stackIndex) => {
              const cellPosition = [0, (stackIndex * cell.height) / 100, 0]
              const isHovered = hoveredCell?.col === colIndex && hoveredCell.stackIndex === stackIndex
              const isSelected = selectedCell?.col === colIndex && selectedCell.stackIndex === stackIndex
              const cellCenterX = startX + columnWidth / 2
              const cellCenterY = (stackIndex * cell.height) / 100 + cell.height / 200
              const cellDepth = cell.depth / 100

              if (cell && cell.type !== "empty") {
                const panelColor = cell.color ? colorMap[cell.color] || "#cccccc" : "#cccccc"
                return (
                  <ShelfModule
                    key={`shelf-module-${colIndex}-${stackIndex}`}
                    position={[cellCenterX, cellCenterY, cellDepth / 2]}
                    color={panelColor}
                    moduleType={cell.type}
                    width={columnWidth}
                    height={cell.height / 100}
                    depth={cellDepth}
                  />
                )
              }

              return (
                <InteractiveCell
                  key={stackIndex}
                  position={cellPosition}
                  width={columnWidth}
                  height={cell.height / 100}
                  depth={cellDepth}
                  isHovered={isHovered}
                  isSelected={isSelected}
                  onClick={() => onCellClick(colIndex, stackIndex)}
                  onPointerOver={() => onCellHover({ col: colIndex, stackIndex })}
                  onPointerOut={() => onCellHover(null)}
                />
              )
            })}
            {selectedTool === "expandLeft" && (
              <ExpansionCell position={[-columnWidth / 2, 0, 0]} onClick={() => onExpandLeft?.(column.width)} />
            )}
            {selectedTool === "expandRight" && (
              <ExpansionCell position={[columnWidth / 2, 0, 0]} onClick={() => onExpandRight?.(column.width)} />
            )}
            {selectedTool === "expandUp" && (
              <StartingPlaceholder
                position={[0, (column.cells.length * column.cells[0].height) / 100, 0]}
                onClick={() => onExpandUp?.(colIndex)}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

export default ShelfScene
