"use client"

import React, { Suspense, useMemo, useRef, Component, type ReactNode } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, useGLTF, OrbitControls } from "@react-three/drei"
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

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Target colors matching the main configurator
const TARGET_COLORS: Record<string, THREE.Color> = {
  white: new THREE.Color("#FFFFFF"),
  grey: new THREE.Color("#9E9E9E"),
  black: new THREE.Color("#111111"),
  blue: new THREE.Color("#1E5EFF"),
  green: new THREE.Color("#2FAE5D"),
  yellow: new THREE.Color("#FFEA00"),
  orange: new THREE.Color("#FF8A00"),
  red: new THREE.Color("#E53935"),
}

const CHROME_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.78, 0.78, 0.82),
  metalness: 0.95,
  roughness: 0.1,
  envMapIntensity: 1.3,
  side: THREE.DoubleSide,
})

// Material cache
const materialCache = new Map<string, THREE.Material>()

function getCachedMaterial<T extends THREE.Material>(key: string, createMaterial: () => T): T {
  if (!materialCache.has(key)) {
    materialCache.set(key, createMaterial())
  }
  return materialCache.get(key) as T
}

// Frame detection keywords
const FRAME_KEYWORDS = ["frame", "tube", "pipe", "chrome", "metal", "stahl", "rohr", "gestell", "rahmen", "strebe", "stange", "bar"]
const PANEL_KEYWORDS = ["panel", "board", "platte", "shelf", "regal", "seite", "side", "back", "rear", "rueck", "door", "tuer", "drawer", "schublade", "front", "deckel", "cover", "floor", "ceiling", "bodenplatte", "deckenplatte", "top", "bottom"]

function isFramePart(
  meshName: string,
  geometry: THREE.BufferGeometry,
  originalMaterial?: THREE.Material | THREE.Material[],
): boolean {
  const nameLower = meshName.toLowerCase()
  
  for (const keyword of PANEL_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return false
    }
  }
  
  for (const keyword of FRAME_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return true
    }
  }
  
  if (originalMaterial) {
    const mat = Array.isArray(originalMaterial) ? originalMaterial[0] : originalMaterial
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
      if (mat.metalness > 0.85) {
        const color = mat.color
        const isGrayish = Math.abs(color.r - color.g) < 0.1 && Math.abs(color.g - color.b) < 0.1
        if (isGrayish && color.r > 0.5) {
          return true
        }
      }
    }
  }
  
  if (geometry && geometry.attributes.position) {
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    if (bbox) {
      const size = new THREE.Vector3()
      bbox.getSize(size)
      const dims = [size.x, size.y, size.z].sort((a, b) => b - a)
      const aspectRatio = dims[0] / Math.max(dims[1], 0.001)
      const minDim = Math.min(size.x, size.y, size.z)
      const isTubeLike = minDim < 0.015 && aspectRatio > 8
      if (isTubeLike) {
        return true
      }
    }
  }
  
  return false
}

function StaticModel({ url, color }: { url: string; color: string }) {
  const groupRef = useRef<THREE.Group>(null)
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
        child.castShadow = false
        child.receiveShadow = false
        
        if (child.geometry) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals()
          }
        }
        
        if (isFrame) {
          child.material = getCachedMaterial("chrome-thumb", () => CHROME_MATERIAL.clone())
        } else {
          const finalColor = isBottom ? TARGET_COLORS.black : targetColor
          const colorKey = isBottom ? "black" : color
          child.material = getCachedMaterial(`panel-thumb-${colorKey}`, () => 
            new THREE.MeshLambertMaterial({
              color: finalColor,
              side: THREE.DoubleSide,
            })
          )
        }
      }
    })
    
    // Center and scale
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 0.4 / maxDim
    
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    clone.scale.setScalar(scale)
    
    return clone
  }, [scene, color])

  return (
    <group ref={groupRef} rotation={[0, Math.PI, 0]}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  )
}

function FallbackBox() {
  return (
    <mesh>
      <boxGeometry args={[0.15, 0.1, 0.15]} />
      <meshStandardMaterial color="#e5e5e5" />
    </mesh>
  )
}

interface ModuleThumbnail3DProps {
  moduleType: ModuleType
  width: 40 | 80
  color?: string
  className?: string
}

export function ModuleThumbnail3D({ 
  moduleType, 
  width,
  color = "white",
  className = "",
}: ModuleThumbnail3DProps) {
  const glbUrl = useMemo(() => {
    try {
      const { url } = resolveGlbUrl({
        width: width,
        height: 40,
        moduleType: moduleType,
        color: "white" as ColorKey, // Always use white GLB, recolor via material
      })
      return url
    } catch (e) {
      console.error("[v0] ModuleThumbnail3D GLB URL error:", e)
      return null
    }
  }, [moduleType, width])

  const fallbackUI = (
    <div className={`w-full h-full flex items-center justify-center bg-gray-100 rounded ${className}`}>
      <span className="text-[8px] text-gray-400">3D</span>
    </div>
  )

  if (!glbUrl) {
    return fallbackUI
  }

  // Front view camera position - rotated 90 degrees to show frontal view
  const cameraPosition: [number, number, number] = [0.6, 0.05, 0]

  return (
    <div className={`w-full h-full ${className}`}>
      <CanvasErrorBoundary fallback={fallbackUI}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
            alpha: true,
            powerPreference: "low-power",
          }}
          camera={{ position: cameraPosition, fov: 30 }}
          frameloop="demand"
          style={{ background: "transparent" }}
        >
          <color attach="background" args={["#f5f5f5"]} />
          
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 3, 4]} intensity={0.4} />
          <directionalLight position={[-1, 2, 2]} intensity={0.2} />
          
          <Environment preset="studio" background={false} />

          <Suspense fallback={<FallbackBox />}>
            <StaticModel url={glbUrl} color={color} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  )
}
