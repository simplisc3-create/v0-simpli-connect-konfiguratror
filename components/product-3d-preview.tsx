"use client"

import React from "react"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, useGLTF } from "@react-three/drei"
import { Suspense, useRef, useMemo, useEffect, useState, Component, type ReactNode } from "react"
import * as THREE from "three"
import { resolveGlbUrl, type ColorKey, type ModuleType } from "@/lib/glb-registry"

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
    console.error("[v0] Canvas error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

interface Product3DPreviewProps {
  moduleType: string
  color: string
  width: 40 | 80
  className?: string
  autoRotate?: boolean
}

// Target colors matching navigator UI exactly
const TARGET_COLORS: Record<string, THREE.Color> = {
  white: new THREE.Color(1.0, 1.0, 1.0),
  black: new THREE.Color(0.12, 0.12, 0.12),
  blue: new THREE.Color(0.0, 0.75, 0.95),
  green: new THREE.Color(0.0, 0.6, 0.25),
  yellow: new THREE.Color(0.95, 0.75, 0.0),
  orange: new THREE.Color(1.0, 0.45, 0.0),
  red: new THREE.Color(0.9, 0.1, 0.1),
}

const CHROME_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.78, 0.78, 0.82),
  metalness: 0.95,
  roughness: 0.1,
  envMapIntensity: 1.3,
  side: THREE.DoubleSide,
})

// Keywords for frame detection (same as glb-module-loader)
const FRAME_KEYWORDS = ["frame", "tube", "pipe", "chrome", "metal", "stahl", "rohr", "gestell", "rahmen", "strebe", "stange", "bar"]
const PANEL_KEYWORDS = ["panel", "board", "platte", "shelf", "regal", "seite", "side", "back", "rear", "rueck", "door", "tuer", "drawer", "schublade", "front", "deckel", "cover", "floor", "ceiling", "bodenplatte", "deckenplatte", "top", "bottom"]

function isFramePart(
  meshName: string,
  geometry: THREE.BufferGeometry,
  originalMaterial?: THREE.Material | THREE.Material[],
): boolean {
  const nameLower = meshName.toLowerCase()
  
  // Check panel keywords first - panels should NEVER be chrome
  for (const keyword of PANEL_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return false
    }
  }
  
  // Check frame keywords - must match explicitly
  for (const keyword of FRAME_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return true
    }
  }
  
  // Check material - only high metalness with specific color indicates chrome
  if (originalMaterial) {
    const mat = Array.isArray(originalMaterial) ? originalMaterial[0] : originalMaterial
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
      // Only treat as frame if metalness is very high AND color is grayish (chrome-like)
      if (mat.metalness > 0.85) {
        const color = mat.color
        const isGrayish = Math.abs(color.r - color.g) < 0.1 && Math.abs(color.g - color.b) < 0.1
        if (isGrayish && color.r > 0.5) {
          return true
        }
      }
    }
  }
  
  // Check geometry shape - only very thin tubes are frame parts
  if (geometry && geometry.attributes.position) {
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    if (bbox) {
      const size = new THREE.Vector3()
      bbox.getSize(size)
      const dims = [size.x, size.y, size.z].sort((a, b) => b - a)
      const aspectRatio = dims[0] / Math.max(dims[1], 0.001)
      const minDim = Math.min(size.x, size.y, size.z)
      // Much stricter: only very thin long tubes
      const isTubeLike = minDim < 0.015 && aspectRatio > 8
      if (isTubeLike) {
        return true
      }
    }
  }
  
  return false
}

function RotatingModel({ url, color, isHovered }: { url: string; color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Preload the model
  const { scene } = useGLTF(url)
  
  const clonedScene = useMemo(() => {
    if (!scene) {
      return null
    }
    const clone = scene.clone(true)
    const targetColor = TARGET_COLORS[color] || TARGET_COLORS.white
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name || ""
        const isFrame = isFramePart(meshName, child.geometry, child.material)
        const isBottom = meshName.toLowerCase().includes("bottom") || meshName.toLowerCase().includes("boden")
        
        child.frustumCulled = false
        child.castShadow = true
        child.receiveShadow = true
        
        if (child.geometry) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals()
          }
        }
        
        if (isFrame) {
          child.material = CHROME_MATERIAL.clone()
        } else {
          const finalColor = isBottom ? TARGET_COLORS.black : targetColor
          child.material = new THREE.MeshLambertMaterial({
            color: finalColor,
            side: THREE.DoubleSide,
          })
        }
      }
    })
    
    return clone
  }, [scene, color])

  // Only rotate when hovered, reset to front view when not
  useFrame((_, delta) => {
    if (groupRef.current) {
      if (isHovered) {
        groupRef.current.rotation.y += delta * 0.8
      } else {
        // Normalize rotation to -PI to PI range first
        let currentY = groupRef.current.rotation.y % (Math.PI * 2)
        if (currentY > Math.PI) currentY -= Math.PI * 2
        if (currentY < -Math.PI) currentY += Math.PI * 2
        
        // Smoothly lerp back to front view (0)
        const targetY = 0
        const diff = targetY - currentY
        const speed = 8 // Higher = faster return
        
        if (Math.abs(diff) > 0.01) {
          groupRef.current.rotation.y = currentY + diff * Math.min(delta * speed, 1)
        } else {
          groupRef.current.rotation.y = 0
        }
      }
    }
  })

  // Center and scale the model
  useEffect(() => {
    if (clonedScene) {
      const box = new THREE.Box3().setFromObject(clonedScene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 0.35 / maxDim
      
      clonedScene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
      clonedScene.scale.setScalar(scale)
    }
  }, [clonedScene])

  return (
    <group ref={groupRef}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  )
}

function FallbackBox() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.2, 0.1, 0.2]} />
      <meshStandardMaterial color="#e5e5e5" />
    </mesh>
  )
}

// Available colors for cycling
const AVAILABLE_COLORS = ["white", "green", "yellow", "red", "blue"] as const

export function Product3DPreview({ 
  moduleType, 
  color, 
  width, 
  className = "",
}: Product3DPreviewProps) {
  const [mounted, setMounted] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasBeenHovered, setHasBeenHovered] = useState(false)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)
  
  // Callback ref to capture the container element
  const containerRef = (node: HTMLDivElement | null) => {
    if (node !== null) {
      setContainerElement(node)
    }
  }
  
  // First effect: mark as mounted after initial render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Second effect: delay canvas creation to ensure DOM is ready
  useEffect(() => {
    if (!mounted || !containerElement) return
    
    // Use requestAnimationFrame to ensure the DOM has fully painted
    const rafId = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setCanvasReady(true)
      }, 150)
      return () => clearTimeout(timer)
    })
    
    return () => cancelAnimationFrame(rafId)
  }, [mounted, containerElement])

  // Auto cycle colors when not hovered and has been hovered before
  useEffect(() => {
    if (hasBeenHovered && !isHovered) {
      const interval = setInterval(() => {
        setSelectedColorIndex((prev) => (prev + 1) % AVAILABLE_COLORS.length)
      }, 1500) // Change color every 1.5 seconds
      return () => clearInterval(interval)
    }
  }, [hasBeenHovered, isHovered])

  // Track first hover
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (!hasBeenHovered) {
      setHasBeenHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Determine the active color - use selected color if has been hovered, otherwise use prop
  const activeColor = hasBeenHovered && !isHovered 
    ? AVAILABLE_COLORS[selectedColorIndex] 
    : color

  // Map color names - ALWAYS use "white" for the GLB file to avoid 404 errors
  // The actual color is applied via material recoloring, not different GLB files
  const mappedColor = useMemo(() => {
    // Always use white GLB and recolor - this ensures we never hit a 404
    // because white GLBs are available for all module types
    return "white" as ColorKey
  }, [])

  const displayColor = useMemo(() => {
    const map: Record<string, string> = {
      white: "white", weiss: "white",
      black: "black", schwarz: "black",
      blue: "blue", blau: "blue",
      green: "green", gruen: "green",
      yellow: "yellow", gelb: "yellow",
      orange: "orange",
      red: "red", rot: "red",
    }
    return map[activeColor] || "white"
  }, [activeColor])

  const glbUrl = useMemo(() => {
    try {
      const { url } = resolveGlbUrl({
        width: width as 40 | 80,
        height: 40,
        moduleType: moduleType as ModuleType,
        color: mappedColor,
      })
      return url
    } catch (e) {
      console.error("[v0] GLB URL error:", e)
      return null
    }
  }, [moduleType, mappedColor, width])

  const fallbackUI = (
    <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-gray-400 text-sm">3D Vorschau</div>
    </div>
  )

  // Always render container first, then Canvas inside after mount and canvas is ready
  if (!mounted || !canvasReady || !containerElement || !glbUrl) {
    return (
      <div 
        ref={containerRef} 
        className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}
      >
        <div className="text-gray-400 text-sm">
          {!glbUrl && mounted && canvasReady && containerElement ? "3D nicht verfuegbar" : "Laden..."}
        </div>
      </div>
    )
  }

  // Camera position based on module width - 40cm modules need more zoom out
  const cameraPosition: [number, number, number] = width === 40 
    ? [0.55, 0.34, 0.55]  // 40cm modules - 20% further total
    : [0.45, 0.28, 0.45]  // 80cm modules

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative ${className}`}
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
          }}
          camera={{ position: cameraPosition, fov: 35 }}
        >
          <color attach="background" args={["#f9fafb"]} />
          
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 4, 3]} intensity={0.35} />
          <directionalLight position={[-2, 3, 1]} intensity={0.15} />
          
          <Environment preset="studio" background={false} />

          <Suspense fallback={<FallbackBox />}>
            <RotatingModel url={glbUrl} color={displayColor} isHovered={isHovered} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
      
      {/* Color indicator - show current color when cycling */}
      {hasBeenHovered && !isHovered && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          {AVAILABLE_COLORS.map((c, index) => (
            <div
              key={c}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                selectedColorIndex === index 
                  ? "scale-125 ring-1 ring-gray-400" 
                  : "opacity-50"
              }`}
              style={{
                backgroundColor: c === "white" ? "#e5e5e5" 
                  : c === "green" ? "#00994D" 
                  : c === "yellow" ? "#F2BF00" 
                  : c === "red" ? "#E61919" 
                  : c === "blue" ? "#00BFF2" 
                  : "#ffffff"
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
