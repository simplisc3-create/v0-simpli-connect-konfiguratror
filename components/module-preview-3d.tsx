"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Environment, Center } from "@react-three/drei"
import { Suspense, useRef, useMemo, useEffect, useState } from "react"
import * as THREE from "three"
import { resolveGlbUrl, type ColorKey, type ModuleType, type WidthKey } from "@/lib/glb-registry"

// Color mappings
const GERMAN_TO_ENGLISH_COLOR: Record<string, string> = {
  weiss: "white",
  schwarz: "black",
  grau: "gray",
  anthrazit: "anthrazit",
  blau: "blue",
  gruen: "green",
  gelb: "yellow",
  orange: "orange",
  rot: "red",
  beige: "beige",
}

const TARGET_COLORS: Record<string, THREE.Color> = {
  white: new THREE.Color(0.95, 0.95, 0.95),
  black: new THREE.Color(0.05, 0.05, 0.05),
  gray: new THREE.Color(0.45, 0.45, 0.45),
  anthrazit: new THREE.Color(0.18, 0.18, 0.2),
  blue: new THREE.Color(0.1, 0.4, 0.95),
  green: new THREE.Color(0.0, 0.7, 0.2),
  yellow: new THREE.Color(1.0, 0.85, 0.0),
  orange: new THREE.Color(1.0, 0.4, 0.0),
  red: new THREE.Color(0.92, 0.1, 0.1),
  beige: new THREE.Color(0.85, 0.75, 0.58),
}

const CHROME_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.85, 0.85, 0.88),
  metalness: 0.98,
  roughness: 0.08,
  envMapIntensity: 1.5,
  side: THREE.DoubleSide,
})

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

type ModuleModelProps = {
  moduleType: ModuleType
  color: string
  width: WidthKey
  isGhost?: boolean
}

function ModuleModel({ moduleType, color, width, isGhost = false }: ModuleModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)

  // Convert German color to English
  const englishColor = GERMAN_TO_ENGLISH_COLOR[color] || color
  const colorKey = (
    ["white", "green", "yellow", "red", "blue"].includes(englishColor) ? englishColor : "white"
  ) as ColorKey

  useEffect(() => {
    try {
      const { url } = resolveGlbUrl({
        width,
        height: 40,
        moduleType,
        color: colorKey,
      })
      setModelUrl(url)
    } catch (e) {
      // If URL resolution fails, try with default width
      try {
        const altWidth = width === 80 ? 40 : 80
        const { url } = resolveGlbUrl({
          width: altWidth as WidthKey,
          height: 40,
          moduleType,
          color: colorKey,
        })
        setModelUrl(url)
      } catch {
        setModelUrl(null)
      }
    }
  }, [moduleType, colorKey, width])

  if (!modelUrl) {
    return (
      <mesh>
        <boxGeometry args={[0.6, 0.3, 0.3]} />
        <meshStandardMaterial
          color={TARGET_COLORS[englishColor] || TARGET_COLORS.white}
          transparent
          opacity={isGhost ? 0.5 : 1}
        />
      </mesh>
    )
  }

  return <LoadedModel url={modelUrl} color={englishColor} isGhost={isGhost} />
}

function LoadedModel({ url, color, isGhost }: { url: string; color: string; isGhost: boolean }) {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const isFrame = isFramePart(child.name)

        if (isFrame) {
          child.material = CHROME_MATERIAL.clone()
        } else if (child.material) {
          const newMaterial = (child.material as THREE.MeshStandardMaterial).clone()
          const targetColor = TARGET_COLORS[color] || TARGET_COLORS.white
          newMaterial.color = targetColor.clone()

          if (isGhost) {
            newMaterial.transparent = true
            newMaterial.opacity = 0.6
          }

          child.material = newMaterial
        }
      }
    })

    return clone
  }, [scene, color, isGhost])

  // Auto-rotate for thumbnail effect
  useFrame((_, delta) => {
    if (groupRef.current && !isGhost) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={clonedScene} scale={isGhost ? 1 : 0.8} />
      </group>
    </Center>
  )
}

type ModulePreview3DProps = {
  moduleType: ModuleType
  color: string
  width?: WidthKey
  className?: string
  isGhost?: boolean
}

export function ModulePreview3D({
  moduleType,
  color,
  width = 80,
  className = "",
  isGhost = false,
}: ModulePreview3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.3, 1.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1} />
        <Suspense fallback={null}>
          <ModuleModel moduleType={moduleType} color={color} width={width} isGhost={isGhost} />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload common models
export function preloadModuleModels() {
  const commonModules: ModuleType[] = ["mit-tueren", "mit-klapptuer", "offenes-fach", "mit-rueckwand"]
  const colors: ColorKey[] = ["white"]
  const widths: WidthKey[] = [80]

  commonModules.forEach((moduleType) => {
    colors.forEach((color) => {
      widths.forEach((width) => {
        try {
          const { url } = resolveGlbUrl({ width, height: 40, moduleType, color })
          useGLTF.preload(url)
        } catch {
          // Ignore preload errors
        }
      })
    })
  })
}
