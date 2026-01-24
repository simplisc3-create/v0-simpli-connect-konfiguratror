"use client"

import React, { Suspense, useState, useEffect, memo, useCallback, useRef, Component, type ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import type { SimpliRegalProduct } from "@/lib/simpli-products"
import { GLBModule } from "./glb-module-loader"
import * as THREE from "three"

// Error Boundary for Canvas crashes
class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[SimpliRegal3D] Canvas error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Available colors for cycling
const AVAILABLE_COLORS = ["weiss", "gruen", "gelb", "rot", "blau"] as const

// Color display values for indicator dots
const COLOR_HEX_MAP: Record<string, string> = {
  weiss: "#FFFFFF",
  gruen: "#2FAE5D",
  gelb: "#FFD400",
  rot: "#E53935",
  blau: "#1E5EFF",
}

// Fallback box while loading
function FallbackBox() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  )
}

// The actual 3D shelf scene - uses same grid rules as ShelfScene configurator
const RegalScene = memo(function RegalScene({ 
  preset,
  isHovered,
  activeColor
}: { 
  preset: SimpliRegalProduct["preset"]
  isHovered: boolean 
  activeColor: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      if (isHovered) {
        // Rotate when hovered
        groupRef.current.rotation.y += delta * 0.8
      } else {
        // Smoothly return to front view when not hovered
        let currentY = groupRef.current.rotation.y % (Math.PI * 2)
        if (currentY > Math.PI) currentY -= Math.PI * 2
        if (currentY < -Math.PI) currentY += Math.PI * 2
        
        const targetY = 0
        const diff = targetY - currentY
        const speed = 8
        
        if (Math.abs(diff) > 0.01) {
          groupRef.current.rotation.y = currentY + diff * Math.min(delta * speed, 1)
        } else {
          groupRef.current.rotation.y = 0
        }
      }
    }
  })

  if (!preset) return <FallbackBox />

  const { columns, rows, columnWidths, rowHeights, grid } = preset
  
  // Same grid calculation as ShelfScene configurator
  const depth = 0.38
  const columnTubeOverlap = 0.003
  const rowTubeOverlap = 0.003

  // Calculate column centers (identical to ShelfScene)
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

  // Calculate row centers (identical to ShelfScene)
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

  // Build module list with same z-offset logic as ShelfScene
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

      // Same z-offset logic as ShelfScene for front alignment
      let zOffset = 0
      if (cell.type === "mit-doppelschublade" || cell.type === "abschliessbare-tueren") {
        zOffset = 0.01 // 1cm closer to viewer
      } else if (cell.type === "mit-rueckwand") {
        zOffset = -0.01 // 1cm away from viewer
      }

      const position: [number, number, number] = [
        columnCenters[gridCol] + offsetX,
        rowCenters[gridRow],
        -depth / 2 + zOffset, // Front of module at z=0, module extends backwards
      ]

      // Check if this is the bottom module in its column (same logic as ShelfScene)
      const maxRowInColumn = grid.reduce((max, gridRowCells, rowIndex) => {
        if (gridRowCells[gridCol] && gridRowCells[gridCol].type !== "empty" && gridRowCells[gridCol].type !== "ghost") {
          return Math.max(max, rowIndex)
        }
        return max
      }, -1)
      const isBottomModule = gridRow === maxRowInColumn

      modules.push({
        key: `module-${gridRow}-${gridCol}`,
        position,
        cellType: cell.type,
        width: cellWidth,
        height: cellHeight,
        color: activeColor, // Use active color from cycling
        row: gridRow,
        col: gridCol,
        isBottomModule,
      })
    })
  })

  // Create grid config for GLBModule (same structure as ShelfScene)
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

// Calculate camera settings based on shelf dimensions
function calculateCameraSettings(preset: SimpliRegalProduct["preset"]) {
  if (!preset) {
    return { position: [0, 0.4, 1.8] as [number, number, number], target: [0, 0.35, 0] as [number, number, number], fov: 35 }
  }

  const { columns, rows, columnWidths, rowHeights } = preset
  const columnTubeOverlap = 0.003
  const rowTubeOverlap = 0.003

  // Calculate total width
  let totalWidth = 0
  for (let col = 0; col < columns; col++) {
    totalWidth += columnWidths[col] / 100
    if (col > 0) totalWidth -= columnTubeOverlap
  }

  // Calculate total height
  let totalHeight = 0
  for (let row = 0; row < rows; row++) {
    totalHeight += rowHeights[row] / 100
    if (row > 0) totalHeight -= rowTubeOverlap
  }

  // Calculate camera distance based on dimensions
  // Use the larger of width or height to determine distance
  const maxDimension = Math.max(totalWidth, totalHeight)
  
  // Base distance for a 2x2 shelf (approx 0.76m x 0.76m)
  const baseDistance = 1.8
  const baseDimension = 0.76
  
  // Scale distance proportionally, with some padding
  const scaleFactor = maxDimension / baseDimension
  const distance = baseDistance * Math.max(1, scaleFactor * 0.85)
  
  // Camera Y position - center vertically on the shelf
  const cameraY = totalHeight / 2 + 0.05
  
  // Target Y - center of the shelf
  const targetY = totalHeight / 2

  return {
    position: [0, cameraY, distance] as [number, number, number],
    target: [0, targetY, 0] as [number, number, number],
    fov: 35
  }
}

interface SimpliRegal3DPreviewProps {
  regal: SimpliRegalProduct
  className?: string
}

export function SimpliRegal3DPreview({ regal, className = "" }: SimpliRegal3DPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hasBeenHovered, setHasBeenHovered] = useState(false)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Calculate camera settings based on shelf dimensions
  const cameraSettings = calculateCameraSettings(regal.preset)

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

  // Auto cycle colors when not hovered and has been hovered before
  useEffect(() => {
    if (!isMounted || !hasBeenHovered || isHovered) return
    
    const interval = setInterval(() => {
      setSelectedColorIndex((prev) => (prev + 1) % AVAILABLE_COLORS.length)
    }, 1500) // Change color every 1.5 seconds
    
    return () => clearInterval(interval)
  }, [isMounted, hasBeenHovered, isHovered])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (!hasBeenHovered) {
      setHasBeenHovered(true)
    }
  }, [hasBeenHovered])

  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  // Determine the active color - use selected color if has been hovered, otherwise use default
  const activeColor = hasBeenHovered && !isHovered 
    ? AVAILABLE_COLORS[selectedColorIndex] 
    : "weiss"

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

  const fallbackUI = (
    <div className={`w-full h-full flex items-center justify-center bg-gray-50 rounded-xl ${className}`}>
      <div className="text-gray-400 text-sm">3D Vorschau</div>
    </div>
  )

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CanvasErrorBoundary fallback={fallbackUI}>
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
            alpha: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: cameraSettings.position, fov: cameraSettings.fov }}
          onCreated={(state) => {
            try {
              if (state && state.gl && state.gl.domElement && typeof state.gl.domElement.style !== "undefined") {
                state.gl.domElement.style.touchAction = "none"
              }
            } catch (e) {
              // Silently ignore canvas initialization errors
            }
          }}
          frameloop="always"
        >
          <color attach="background" args={["#f9fafb"]} />
          
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={0.4} castShadow />
          <directionalLight position={[-2, 3, 1]} intensity={0.2} />
          
          <Environment preset="studio" background={false} />

          <Suspense fallback={<FallbackBox />}>
            <RegalScene preset={regal.preset} isHovered={isHovered} activeColor={activeColor} />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            target={cameraSettings.target}
          />
        </Canvas>
      </CanvasErrorBoundary>

      {/* Color indicator - show current color when cycling */}
      {hasBeenHovered && !isHovered && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm z-10">
          {AVAILABLE_COLORS.map((c, index) => (
            <div
              key={c}
              className={`w-3 h-3 rounded-full transition-all duration-300 border border-gray-200 ${
                selectedColorIndex === index 
                  ? "scale-125 ring-2 ring-gray-400 ring-offset-1" 
                  : "opacity-60"
              }`}
              style={{
                backgroundColor: COLOR_HEX_MAP[c] || "#FFFFFF"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Interaction hint */}
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
        Ziehen zum Drehen
      </div>
    </div>
  )
}
