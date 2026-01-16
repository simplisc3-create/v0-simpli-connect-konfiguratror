"use client"
import { Canvas } from "@react-three/fiber"
import { useGLTF, Environment, Center } from "@react-three/drei"
import { Suspense, useMemo, useState, useEffect } from "react"
import * as THREE from "three"
import { resolveGlbUrl, type ModuleType, type WidthKey } from "@/lib/glb-registry"
import { colorHexMap } from "@/lib/simpli-products"
import type { ColorKey } from "./shelf-configurator"

const FRAME_KEYWORDS = [
  "frame",
  "tube",
  "pipe",
  "chrome",
  "metal",
  "stahl",
  "rohr",
  "gestell",
  "rahmen",
  "leiter",
  "stange",
  "leg",
  "upright",
  "corner",
  "ecke",
  "verbinder",
  "connector",
  "cylinder",
  "rod",
  "bar",
  "strut",
  "support",
  "vertical",
  "horizontal",
  "bein",
  "fuss",
  "fuß",
  "fuse",
]

function isFramePart(name: string): boolean {
  const lowerName = name.toLowerCase()
  return FRAME_KEYWORDS.some((keyword) => lowerName.includes(keyword))
}

function ColoredModel({ url, color }: { url: string; color?: ColorKey }) {
  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    // Get the hex color from colorHexMap, default to white
    const hexColor = color ? colorHexMap[color] || colorHexMap.weiss : colorHexMap.weiss
    const panelColor = new THREE.Color(hexColor)

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const isFrame = isFramePart(child.name)

        if (isFrame) {
          // Chrome frame material
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.85, 0.85, 0.88),
            metalness: 0.98,
            roughness: 0.08,
            envMapIntensity: 1.5,
            side: THREE.DoubleSide,
          })
        } else if (child.material) {
          // Colored panels based on selected color
          const newMaterial = new THREE.MeshStandardMaterial({
            color: panelColor,
            roughness: 0.3,
            metalness: 0.0,
            side: THREE.DoubleSide,
          })
          child.material = newMaterial
        }
      }
    })

    return clone
  }, [scene, color])

  return (
    <Center>
      <primitive object={clonedScene} scale={0.8} rotation={[0.2, -Math.PI * 0.25, 0]} />
    </Center>
  )
}

type ModulePreview3DProps = {
  moduleType: ModuleType
  width?: WidthKey
  className?: string
  color?: ColorKey // Added color prop
}

export function ModulePreview3D({ moduleType, width = 80, className = "", color }: ModulePreview3DProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    setLoadError(false)
    try {
      // Always use white color for GLB lookup (the actual color is applied via material)
      const { url } = resolveGlbUrl({
        width,
        height: 40,
        moduleType,
        color: "white",
      })
      setModelUrl(url)
    } catch {
      // Try alternative width
      try {
        const altWidth = width === 80 ? 40 : 80
        const { url } = resolveGlbUrl({
          width: altWidth as WidthKey,
          height: 40,
          moduleType,
          color: "white",
        })
        setModelUrl(url)
      } catch {
        setModelUrl(null)
        setLoadError(true)
      }
    }
  }, [moduleType, width])

  if (loadError || !modelUrl) {
    // Fallback: simple colored box icon
    const bgColor = color ? colorHexMap[color] : colorHexMap.weiss
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="w-8 h-6 rounded-sm border border-gray-400" style={{ backgroundColor: bgColor }} />
      </div>
    )
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.2, 1.5], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
        frameloop="demand"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1} />
        <Suspense fallback={null}>
          <ColoredModel url={modelUrl} color={color} />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  )
}
