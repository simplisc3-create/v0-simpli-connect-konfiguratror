"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, useGLTF } from "@react-three/drei"
import { Suspense, useRef, useMemo, useEffect } from "react"
import * as THREE from "three"
import { resolveGlbUrl, type ColorKey, type ModuleType } from "@/lib/glb-registry"

interface Product3DPreviewProps {
  moduleType: string
  color: string
  width: 40 | 80
  className?: string
  autoRotate?: boolean
}

// Target colors matching navigator UI
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

const FRAME_KEYWORDS = ["frame", "tube", "pipe", "chrome", "metal", "stahl", "rohr", "gestell", "rahmen"]

function isFramePart(name: string): boolean {
  const lowerName = name.toLowerCase()
  return FRAME_KEYWORDS.some(keyword => lowerName.includes(keyword))
}

function RotatingModel({ url, color }: { url: string; color: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(url)
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    const targetColor = TARGET_COLORS[color] || TARGET_COLORS.white
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name || ""
        
        if (isFramePart(name)) {
          child.material = CHROME_MATERIAL.clone()
        } else {
          child.material = new THREE.MeshLambertMaterial({
            color: targetColor,
            side: THREE.DoubleSide,
          })
        }
      }
    })
    
    return clone
  }, [scene, color])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
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
      <primitive object={clonedScene} />
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

export function Product3DPreview({ 
  moduleType, 
  color, 
  width, 
  className = "",
}: Product3DPreviewProps) {
  // Map color names
  const mappedColor = useMemo(() => {
    const colorMap: Record<string, ColorKey> = {
      white: "white", weiss: "white",
      black: "white", schwarz: "white", // Use white GLB, recolor
      blue: "blue", blau: "blue",
      green: "green", gruen: "green",
      yellow: "yellow", gelb: "yellow",
      orange: "red", // Use red GLB, recolor
      red: "red", rot: "red",
    }
    return colorMap[color] || "white"
  }, [color])

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
    return map[color] || "white"
  }, [color])

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

  if (!glbUrl) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-gray-400 text-sm">3D nicht verfuegbar</div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ position: [0.4, 0.25, 0.4], fov: 35 }}
      >
        <color attach="background" args={["#f9fafb"]} />
        
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 3]} intensity={0.35} />
        <directionalLight position={[-2, 3, 1]} intensity={0.15} />
        
        <Environment preset="studio" background={false} />

        <Suspense fallback={<FallbackBox />}>
          <RotatingModel url={glbUrl} color={displayColor} />
        </Suspense>
      </Canvas>
    </div>
  )
}
