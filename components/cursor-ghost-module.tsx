"use client"

import { useEffect, useState, useRef, memo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { GLBModule } from "./glb-module-loader"
import type { GridCell, ShelfConfig } from "./shelf-configurator"
import { getModuleShortLabel } from "@/lib/module-utils"
import * as THREE from "three"

type CursorGhostModuleProps = {
  selectedTool: GridCell["type"] | null
  selectedColor: GridCell["color"]
  columnWidth: 75 | 38
  isVisible: boolean
}

// Create a minimal config for the GLBModule
const createMinimalConfig = (width: 75 | 38): ShelfConfig => ({
  width: width === 75 ? 75 : 38,
  height: 40,
  sections: 1,
  levels: 1,
  material: "metal",
  finish: "white",
  grid: [[{ id: "c-0-0", type: "offenes-fach", row: 0, col: 0 }]],
  columns: 1,
  rows: 1,
  columnWidths: [width],
  rowHeights: [40],
})

// Animated rotating module scene
const RotatingModule = memo(function RotatingModule({
  selectedTool,
  selectedColor,
  widthInMeters,
  minimalConfig,
}: {
  selectedTool: GridCell["type"]
  selectedColor: GridCell["color"]
  widthInMeters: number
  minimalConfig: ShelfConfig
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.18, 0]}>
      <GLBModule
        position={[0, 0, 0]}
        cellType={selectedTool}
        width={widthInMeters}
        height={0.4}
        depth={0.38}
        color={selectedColor || "weiss"}
        row={0}
        col={0}
        gridConfig={minimalConfig}
        isBottomModule={true}
      />
    </group>
  )
})

export function CursorGhostModule({ 
  selectedTool, 
  selectedColor, 
  columnWidth,
  isVisible 
}: CursorGhostModuleProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Smooth follow animation
  useEffect(() => {
    if (!isVisible) return

    const animate = () => {
      setSmoothPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.15,
        y: prev.y + (mousePosition.y - prev.y) * 0.15,
      }))
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible, mousePosition])

  useEffect(() => {
    if (!isVisible) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isVisible])

  if (!mounted || !isVisible || !selectedTool || selectedTool === "empty" || selectedTool === "ghost") {
    return null
  }

  const widthInMeters = columnWidth === 75 ? 0.8 : 0.4
  const minimalConfig = createMinimalConfig(columnWidth)
  const label = getModuleShortLabel(selectedTool)

  return (
    <div
      className="pointer-events-none fixed z-50 transition-opacity duration-200"
      style={{
        left: smoothPosition.x + 24,
        top: smoothPosition.y - 50,
        width: "100px",
        height: "80px",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-xl animate-pulse" />
      
      {/* Main container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900/90 backdrop-blur-md border border-emerald-500/40 shadow-2xl shadow-emerald-500/30">
        <Canvas
          camera={{ position: [0.6, 0.35, 0.6], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 4, 3]} intensity={1} />
          <pointLight position={[-2, 2, 2]} intensity={0.3} color="#10b981" />
          <Environment preset="studio" />
          
          <RotatingModule
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            widthInMeters={widthInMeters}
            minimalConfig={minimalConfig}
          />
        </Canvas>
        
        {/* Label badge */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500/90 text-white text-[9px] font-semibold rounded-full shadow-lg whitespace-nowrap">
          {label}
        </div>
      </div>
      
      {/* Connection line to cursor */}
      <div 
        className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center"
        style={{ width: "24px" }}
      >
        <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500" />
        <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-400" />
      </div>
    </div>
  )
}
