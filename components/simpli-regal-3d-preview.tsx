"use client"

import { Suspense, useState, useEffect, memo, useCallback, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import type { SimpliRegalProduct } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import * as THREE from "three"

// Fallback box while loading
function FallbackBox() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  )
}

// Auto-rotation component
function AutoRotate({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state, delta) => {
    if (groupRef.current && !isHovered) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })
  
  return <group ref={groupRef} />
}

// The actual 3D shelf scene
const RegalScene = memo(function RegalScene({ 
  preset,
  isHovered 
}: { 
  preset: SimpliRegalProduct["preset"]
  isHovered: boolean 
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state, delta) => {
    if (groupRef.current && !isHovered) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  if (!preset) return <FallbackBox />

  const { columns, rows, columnWidths, rowHeights, grid } = preset
  
  // Calculate dimensions
  const depth = 0.38
  const columnTubeOverlap = 0.003
  const rowTubeOverlap = 0.003

  // Calculate column centers
  const columnCenters: number[] = []
  let totalWidth = 0
  for (let col = 0; col < columns; col++) {
    const colWidth = columnWidths[col] / 100
    let xPos = 0
    for (let c = 0; c < col; c++) {
      xPos += columnWidths[c] / 100 - columnTubeOverlap
    }
    columnCenters.push(xPos + colWidth / 2)
    totalWidth += colWidth
    if (col > 0) totalWidth -= columnTubeOverlap
  }

  // Calculate row centers
  const rowCenters: number[] = []
  for (let row = 0; row < rows; row++) {
    const rowHeight = rowHeights[row] / 100
    let yPos = 0
    for (let r = 0; r < row; r++) {
      yPos += rowHeights[r] / 100 - rowTubeOverlap
    }
    rowCenters.push(yPos + rowHeight / 2)
  }

  const offsetX = -totalWidth / 2

  // Build module list
  const modules: Array<{
    key: string
    position: [number, number, number]
    cellType: string
    width: number
    height: number
    color: string
    row: number
    col: number
    isBottomModule: boolean
  }> = []

  grid.forEach((rowCells, gridRow) => {
    rowCells.forEach((cell, gridCol) => {
      if (cell.type === "empty" || cell.type === "ghost") return

      const cellWidth = columnWidths[gridCol] / 100
      const cellHeight = rowHeights[gridRow] / 100

      const position: [number, number, number] = [
        columnCenters[gridCol] + offsetX,
        rowCenters[gridRow],
        -depth / 2,
      ]

      // Check if this is the bottom module in its column
      const isBottomModule = gridRow === 0

      modules.push({
        key: `module-${gridRow}-${gridCol}`,
        position,
        cellType: cell.type,
        width: cellWidth,
        height: cellHeight,
        color: cell.color || "weiss",
        row: gridRow,
        col: gridCol,
        isBottomModule,
      })
    })
  })

  // Create a mock grid config for GLBModule
  const mockGridConfig = {
    width: 75 as const,
    height: 40 as const,
    sections: columns,
    levels: rows,
    material: "metal" as const,
    finish: "white" as const,
    grid: grid,
    columns,
    rows,
    columnWidths: columnWidths as (75 | 38)[],
    rowHeights: rowHeights as (40 | 80 | 120 | 160 | 200)[],
  }

  return (
    <group ref={groupRef}>
      {/* Floor shadow */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.3}
        scale={4}
        blur={2}
        far={2}
        resolution={256}
        color="#000000"
      />

      {/* Modules */}
      {modules.map(({ key, position, cellType, width, height, color, row, col, isBottomModule }) => (
        <GLBModule
          key={key}
          position={position}
          cellType={cellType as any}
          width={width}
          height={height}
          depth={depth}
          color={color as any}
          row={row}
          col={col}
          gridConfig={mockGridConfig}
          isBottomModule={isBottomModule}
        />
      ))}
    </group>
  )
})

interface SimpliRegal3DPreviewProps {
  regal: SimpliRegalProduct
  className?: string
}

export function SimpliRegal3DPreview({ regal, className = "" }: SimpliRegal3DPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only mount on client side and after DOM is ready
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setIsMounted(true)
      })
    }
    return () => {
      setIsMounted(false)
      setCanvasReady(false)
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return
    // Longer delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      if (containerRef.current) {
        setCanvasReady(true)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [isMounted])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  // Show fallback if no preset
  if (!regal.preset) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">Keine Vorschau verfügbar</div>
      </div>
    )
  }

  // Show loading state until ready
  if (!isMounted || !canvasReady) {
    return (
      <div 
        ref={containerRef}
        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center ${className}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">3D Vorschau lädt...</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [2.5, 1.5, 2.5], fov: 35 }}
        onCreated={(state) => {
          try {
            if (state && state.gl && state.gl.domElement && typeof state.gl.domElement.style !== "undefined") {
              state.gl.domElement.style.touchAction = "none"
            }
          } catch (e) {
            // Silently ignore canvas initialization errors
          }
        }}
        frameloop="demand"
      >
        <color attach="background" args={["#f9fafb"]} />
        
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={0.4} castShadow />
        <directionalLight position={[-2, 3, 1]} intensity={0.2} />
        
        <Environment preset="studio" background={false} />

        <Suspense fallback={<FallbackBox />}>
          <RegalScene preset={regal.preset} isHovered={isHovered} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.4, 0]}
        />
      </Canvas>

      {/* Interaction hint */}
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        Ziehen zum Drehen
      </div>
    </div>
  )
}
