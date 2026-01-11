"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState, memo, useMemo, useRef } from "react"
import * as THREE from "three"
import type { GridCell } from "./shelf-configurator"
import type { ShelfConfig } from "./shelf-configurator"

type GLBModuleProps = {
  position: [number, number, number]
  cellType: GridCell["type"]
  width: number
  height: number
  depth: number
  color: string
  row: number
  col: number
  gridConfig: ShelfConfig
  modelUrl?: string
  isBottomModule?: boolean // Added prop to indicate if this module is at the bottom of its column
}

const urlCache = new Map<string, string>()

const HEX_TO_COLOR_NAME: Record<string, string> = {
  "#ffffff": "white",
  "#f5f5f5": "white",
  "#fafafa": "white",
  "#1f2937": "black",
  "#000000": "black",
  "#111827": "black",
  "#1a1a1a": "black",
  "#3b82f6": "blue",
  "#2563eb": "blue",
  "#1d4ed8": "blue",
  "#00b4d8": "blue",
  "#10b981": "green",
  "#059669": "green",
  "#047857": "green",
  "#228b22": "green",
  "#eab308": "yellow",
  "#facc15": "yellow",
  "#fbbf24": "yellow",
  "#f59e0b": "orange",
  "#ea580c": "orange",
  "#f97316": "orange",
  "#ef4444": "red",
  "#dc2626": "red",
  "#b91c1c": "red",
  "#9ca3af": "gray",
  "#6b7280": "gray",
  "#4b5563": "anthrazit",
  "#374151": "anthrazit",
  "#f5f5dc": "beige",
  "#d2b48c": "beige",
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
  envMapIntensity: 1.56,
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
  "feet",
]

const PANEL_KEYWORDS = [
  "panel",
  "shelf",
  "boden",
  "platte",
  "wand",
  "back",
  "side",
  "rueckwand",
  "seitenwand",
  "tuer",
  "door",
  "schublade",
  "drawer",
  "klappe",
  "flap",
  "front",
  "deckel",
  "cover",
  "floor",
  "ceiling",
  "bodenplatte",
  "deckenplatte",
  "top",
  "bottom",
]

const HANDLE_KEYWORDS = ["handle", "griff", "knob", "knauf", "handgriff", "pull", "zieh"]

const FEET_KEYWORDS = ["feet", "foot", "fuss", "fuß", "fuse", "bein", "leg", "standfuß", "standfuss"]

function isHandlePart(meshName: string): boolean {
  const nameLower = meshName.toLowerCase()
  for (const keyword of HANDLE_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return true
    }
  }
  return false
}

function isFramePart(
  meshName: string,
  geometry: THREE.BufferGeometry,
  originalMaterial?: THREE.Material | THREE.Material[],
): boolean {
  const nameLower = meshName.toLowerCase()

  // Check panel keywords first - panels should NEVER be chrome
  for (const keyword of PANEL_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      console.log(`[v0] PANEL by keyword "${keyword}": ${meshName}`)
      return false
    }
  }

  // Check frame keywords
  for (const keyword of FRAME_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      console.log(`[v0] FRAME by keyword "${keyword}": ${meshName}`)
      return true
    }
  }

  if (originalMaterial) {
    const mat = Array.isArray(originalMaterial) ? originalMaterial[0] : originalMaterial
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
      // Only very high metalness = frame part (0.7+ is definitely metal)
      if (mat.metalness > 0.7) {
        console.log(`[v0] FRAME by material metalness (${mat.metalness.toFixed(2)}): ${meshName}`)
        return true
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

      console.log(
        `[v0] Geometry "${meshName}": dims=[${dims.map((d) => d.toFixed(3)).join(",")}], aspect=${aspectRatio.toFixed(2)}, minDim=${minDim.toFixed(4)}`,
      )

      // This prevents flat panels from being detected as frames
      const isTubeLike = minDim < 0.02 && aspectRatio > 5
      if (isTubeLike) {
        console.log(`[v0] FRAME by geometry (tube-like): ${meshName}`)
        return true
      }
    }
  }

  console.log(`[v0] PANEL by default: ${meshName}`)
  return false
}

function isFeetPart(
  meshName: string,
  geometry?: THREE.BufferGeometry,
  parentBoundingBox?: THREE.Box3,
  material?: THREE.Material | THREE.Material[],
): boolean {
  const nameLower = meshName.toLowerCase()

  // Check by keyword first
  for (const keyword of FEET_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return true
    }
  }

  // The feet are small black plastic caps at the bottom corners
  if (material) {
    const mat = Array.isArray(material) ? material[0] : material
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
      const color = mat.color
      // Black/dark is when all RGB values are low (< 0.15)
      const isBlackMaterial = color.r < 0.15 && color.g < 0.15 && color.b < 0.15

      if (isBlackMaterial && geometry && parentBoundingBox) {
        geometry.computeBoundingBox()
        const meshBox = geometry.boundingBox
        if (meshBox) {
          const meshSize = new THREE.Vector3()
          meshBox.getSize(meshSize)

          const parentSize = new THREE.Vector3()
          parentBoundingBox.getSize(parentSize)

          // Small black parts are likely feet (less than 20% of parent size)
          const isSmall =
            meshSize.x < parentSize.x * 0.2 && meshSize.y < parentSize.y * 0.2 && meshSize.z < parentSize.z * 0.2

          if (isSmall) {
            console.log(`[v0] FEET detected by small black material: ${meshName}`)
            return true
          }
        }
      }
    }
  }

  return false
}

function getColorName(hex: string): string {
  return HEX_TO_COLOR_NAME[hex.toLowerCase()] || "white"
}

function getStandardWidth(width: number): 40 | 80 {
  return Math.round(width * 100) <= 50 ? 40 : 80
}

export const GLBModule = memo(
  function GLBModule({
    position,
    cellType,
    width,
    height,
    depth,
    color,
    row,
    col,
    gridConfig,
    modelUrl: explicitModelUrl,
    isBottomModule = false, // Default to false
  }: GLBModuleProps) {
    const colorName = useMemo(() => getColorName(color), [color])
    const standardWidth = useMemo(() => getStandardWidth(width), [width])

    const cacheKey = useMemo(() => `${cellType}-${standardWidth}-white`, [cellType, standardWidth])

    const [modelUrl, setModelUrl] = useState<string | null>(() => {
      if (explicitModelUrl) return explicitModelUrl
      return urlCache.get(cacheKey) || null
    })
    const [error, setError] = useState<string | null>(null)
    const fetchedRef = useRef(false)

    useEffect(() => {
      if (explicitModelUrl) {
        setModelUrl(explicitModelUrl)
        return
      }

      const cachedUrl = urlCache.get(cacheKey)
      if (cachedUrl) {
        setModelUrl(cachedUrl)
        return
      }

      if (cellType === "empty" || cellType === "ghost") return
      if (fetchedRef.current) return
      fetchedRef.current = true

      const fetchUrl = async () => {
        try {
          const params = new URLSearchParams({
            moduleType: cellType,
            width: standardWidth.toString(),
            height: "40",
            color: "white",
          })

          console.log(`[v0] Fetching GLB: ${cellType}, ${standardWidth}cm, white (will apply ${colorName})`)

          const response = await fetch(`/api/blob-models?${params}`)
          const data = await response.json()

          if (!data.ok || !data.url) {
            throw new Error(data.error || "Failed to resolve model")
          }

          if (!data.url.startsWith("https://") && !data.url.startsWith("/")) {
            throw new Error(`Invalid URL: ${data.url}`)
          }

          console.log(`[v0] GLB URL resolved: ${data.url}`)
          urlCache.set(cacheKey, data.url)
          setModelUrl(data.url)
        } catch (err) {
          console.error(`[v0] GLB fetch error:`, err)
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      }

      fetchUrl()
    }, [cacheKey, explicitModelUrl, cellType, standardWidth, colorName])

    useEffect(() => {
      fetchedRef.current = false
    }, [cacheKey])

    if (cellType === "empty" || cellType === "ghost") return null

    if (error) {
      return (
        <mesh position={position}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial color="#ff0000" opacity={0.3} transparent />
        </mesh>
      )
    }

    if (!modelUrl) return null

    return (
      <LoadedGLBModel
        modelUrl={modelUrl}
        position={position}
        moduleKey={`${row}-${col}`}
        targetColor={colorName}
        isKlapptuerOben={cellType === "mit-klapptuer-oben"}
        row={row}
        isBottomModule={isBottomModule}
      />
    )
  },
  (prev, next) =>
    prev.cellType === next.cellType &&
    prev.width === next.width &&
    prev.color === next.color &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2] &&
    prev.row === next.row &&
    prev.col === next.col &&
    prev.isBottomModule === next.isBottomModule, // Added to memo comparison
)

const LoadedGLBModel = memo(
  function LoadedGLBModel({
    modelUrl,
    position,
    moduleKey,
    targetColor,
    isKlapptuerOben = false,
    row = 0,
    isBottomModule = false, // Added prop
  }: {
    modelUrl: string
    position: [number, number, number]
    moduleKey: string
    targetColor: string
    isKlapptuerOben?: boolean
    row?: number
    isBottomModule?: boolean // Added to type
  }) {
    const { scene } = useGLTF(modelUrl)

    const { xOffset, yOffset } = useMemo(() => {
      if (!isKlapptuerOben) return { xOffset: 0, yOffset: 0 }

      const boundingBox = new THREE.Box3().setFromObject(scene)
      const center = boundingBox.getCenter(new THREE.Vector3())

      console.log(`[v0] Klapptür offset calculation: center.x=${center.x.toFixed(4)}, center.y=${center.y.toFixed(4)}`)

      // The model has its origin offset from center, so we need to compensate
      return {
        xOffset: -center.x,
        yOffset: -center.y,
      }
    }, [scene, isKlapptuerOben])

    const clonedScene = useMemo(() => {
      const clone = scene.clone(true)
      const targetColorValue = TARGET_COLORS[targetColor] || TARGET_COLORS.white

      console.log(
        `[v0] ===== Processing GLB: ${moduleKey}, color: ${targetColor}, isKlapptuerOben: ${isKlapptuerOben}, row: ${row} =====`,
      )

      const parentBoundingBox = new THREE.Box3().setFromObject(clone)
      const size = parentBoundingBox.getSize(new THREE.Vector3())
      const center = parentBoundingBox.getCenter(new THREE.Vector3())
      console.log(
        `[v0] Model bounding box - size: x=${size.x.toFixed(4)}, y=${size.y.toFixed(4)}, z=${size.z.toFixed(4)}`,
      )
      console.log(
        `[v0] Model bounding box - center: x=${center.x.toFixed(4)}, y=${center.y.toFixed(4)}, z=${center.z.toFixed(4)}`,
      )

      let handleMesh: THREE.Mesh | null = null

      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name || ""
          const isFrame = isFramePart(meshName, child.geometry, child.material)
          const isBottom = meshName.toLowerCase().includes("bottom") || meshName.toLowerCase().includes("boden")
          const isHandle = isHandlePart(meshName)
          const isFeet = isFeetPart(meshName, child.geometry, parentBoundingBox, child.material)

          if (isHandle && isKlapptuerOben) {
            handleMesh = child
          }

          if (isFeet && !isBottomModule) {
            child.visible = false
            console.log(`[v0] Hiding feet mesh: ${meshName} (row ${row}, isBottomModule=${isBottomModule})`)
            return
          }

          child.frustumCulled = false
          child.castShadow = true
          child.receiveShadow = true

          if (child.geometry) {
            if (!child.geometry.attributes.normal) {
              child.geometry.computeVertexNormals()
            }
            if (child.geometry.attributes.color) {
              child.geometry.deleteAttribute("color")
            }
          }

          if (child.material) {
            if (isFrame) {
              child.material = CHROME_MATERIAL.clone()
            } else {
              const oldMat = child.material as THREE.MeshStandardMaterial
              const texture = oldMat.map || null
              const finalColor = isBottom ? TARGET_COLORS.black : targetColorValue
              child.material = new THREE.MeshStandardMaterial({
                map: texture,
                color: finalColor,
                metalness: 0.08,
                roughness: 0.5,
                side: THREE.DoubleSide,
                shadowSide: THREE.DoubleSide,
                emissive: new THREE.Color(0, 0, 0),
                emissiveIntensity: 0,
              })
            }
          }
        }
      })

      return clone
    }, [scene, targetColor, moduleKey, isKlapptuerOben, row, isBottomModule])

    const adjustedPosition: [number, number, number] = useMemo(() => {
      const zOffset = isKlapptuerOben ? 0.01 : 0
      return [position[0] + xOffset, position[1] + yOffset, position[2] + zOffset]
    }, [position, xOffset, yOffset, isKlapptuerOben])

    return <primitive object={clonedScene} position={adjustedPosition} rotation={[0, (3 * Math.PI) / 2, 0]} scale={1} />
  },
  (prev, next) =>
    prev.modelUrl === next.modelUrl &&
    prev.moduleKey === next.moduleKey &&
    prev.targetColor === next.targetColor &&
    prev.isKlapptuerOben === next.isKlapptuerOben &&
    prev.row === next.row &&
    prev.isBottomModule === next.isBottomModule && // Added to memo comparison
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2],
)
