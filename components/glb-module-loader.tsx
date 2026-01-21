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
  isBottomModule?: boolean
}

const urlCache = new Map<string, string>()

const materialCache = new Map<string, THREE.MeshStandardMaterial>()

function getCachedMaterial(key: string, createMaterial: () => THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  if (!materialCache.has(key)) {
    materialCache.set(key, createMaterial())
  }
  return materialCache.get(key)!.clone() // Clone to allow per-instance modifications if needed
}

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

const HEX_TO_COLOR_NAME: Record<string, string> = {
  "#ffffff": "white",
  "#1a1a1a": "black",
  "#737373": "gray",
  "#2e2e33": "anthrazit",
  "#1a66ff": "blue",
  "#00b33c": "green",
  "#ffd900": "yellow",
  "#ff6600": "orange",
  "#eb1a1a": "red",
  "#d2b48c": "beige",
}

// Photorealistic target colors matching Simpli Connect product line
const TARGET_COLORS: Record<string, THREE.Color> = {
  white: new THREE.Color(0.98, 0.98, 0.98),
  black: new THREE.Color(0.08, 0.08, 0.08),
  gray: new THREE.Color(0.55, 0.55, 0.55),
  anthrazit: new THREE.Color(0.22, 0.22, 0.24),
  blue: new THREE.Color(0.15, 0.45, 0.9),
  green: new THREE.Color(0.1, 0.65, 0.25),
  yellow: new THREE.Color(0.98, 0.85, 0.1),
  orange: new THREE.Color(0.95, 0.45, 0.1),
  red: new THREE.Color(0.88, 0.15, 0.15),
  beige: new THREE.Color(0.88, 0.78, 0.62),
}

// Bright chrome material - optimized for production builds
const CHROME_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(1.0, 1.0, 1.0),
  metalness: 0.9,
  roughness: 0.12,
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
      return false
    }
  }

  // Check frame keywords
  for (const keyword of FRAME_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return true
    }
  }

  if (originalMaterial) {
    const mat = Array.isArray(originalMaterial) ? originalMaterial[0] : originalMaterial
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
      // Only very high metalness = frame part (0.7+ is definitely metal)
      if (mat.metalness > 0.7) {
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

      // This prevents flat panels from being detected as frames
      const isTubeLike = minDim < 0.02 && aspectRatio > 5
      if (isTubeLike) {
        return true
      }
    }
  }

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
            return true
          }
        }
      }
    }
  }

  return false
}

function getColorName(colorInput: string): string {
  // First check if it's already a German color name
  if (GERMAN_TO_ENGLISH_COLOR[colorInput]) {
    return colorInput // Return German name, will be mapped later in LoadedGLBModel
  }
  // Then check if it's a hex value
  return HEX_TO_COLOR_NAME[colorInput.toLowerCase()] || "white"
}

function getStandardWidth(width: number): 40 | 80 {
  return Math.round(width * 100) <= 50 ? 40 : 80
}

const CLOSED_MODULE_TYPES = [
  "mit-klapptuer",
  "mit-klapptuer-oben",
  "mit-schubladen",
  "mit-einzelschublade",
  "mit-tueren",
  "mit-tuere-links",
  "mit-tuere-rechts",
  "abschliessbar",
  "abschliessbar-links",
  "abschliessbar-rechts",
  "mit-rueckwand",
]

const isClosedModule = (cellType: string): boolean => {
  return CLOSED_MODULE_TYPES.includes(cellType)
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
    isBottomModule = false,
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

          const response = await fetch(`/api/blob-models?${params}`)
          const data = await response.json()

          if (!data.ok || !data.url) {
            throw new Error(data.error || "Failed to resolve model")
          }

          if (!data.url.startsWith("https://") && !data.url.startsWith("/")) {
            throw new Error(`Invalid URL: ${data.url}`)
          }

          urlCache.set(cacheKey, data.url)
          setModelUrl(data.url)
        } catch (err) {
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
        cellType={cellType}
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
    prev.isBottomModule === next.isBottomModule,
)

const LoadedGLBModel = memo(
  function LoadedGLBModel({
    modelUrl,
    position,
    moduleKey,
    targetColor,
    cellType = "offen",
    row = 0,
    isBottomModule = false,
  }: {
    modelUrl: string
    position: [number, number, number]
    moduleKey: string
    targetColor: string
    cellType?: string
    row?: number
    isBottomModule?: boolean
  }) {
    const { scene } = useGLTF(modelUrl)

    const isKlapptuerOben = cellType === "mit-klapptuer-oben"

    const { xOffset, yOffset } = useMemo(() => {
      if (!isKlapptuerOben) return { xOffset: 0, yOffset: 0 }

      const boundingBox = new THREE.Box3().setFromObject(scene)
      const center = boundingBox.getCenter(new THREE.Vector3())

      return {
        xOffset: -center.x,
        yOffset: -center.y,
      }
    }, [scene, isKlapptuerOben])

    const clonedScene = useMemo(() => {
      const clone = scene.clone(true)
      let mappedColor = targetColor
      if (GERMAN_TO_ENGLISH_COLOR[targetColor]) {
        mappedColor = GERMAN_TO_ENGLISH_COLOR[targetColor]
      } else if (HEX_TO_COLOR_NAME[targetColor]) {
        mappedColor = HEX_TO_COLOR_NAME[targetColor]
      }
      const targetColorValue = TARGET_COLORS[mappedColor] || TARGET_COLORS.white

      const parentBoundingBox = new THREE.Box3().setFromObject(clone)

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
              child.material = getCachedMaterial("chrome", () => CHROME_MATERIAL.clone())
            } else {
              const oldMat = child.material as THREE.MeshStandardMaterial
              const texture = oldMat.map || null
              const finalColor = isBottom ? TARGET_COLORS.black : targetColorValue

              // Photorealistic panel materials with proper finish
              const materialKey = `panel-${mappedColor}-${isBottom ? "bottom" : "normal"}-${texture ? "textured" : "plain"}`
              child.material = getCachedMaterial(
                materialKey,
                () =>
                  new THREE.MeshStandardMaterial({
                    map: texture,
                    color: finalColor,
                    metalness: isBottom ? 0.02 : 0.05,
                    roughness: isBottom ? 0.6 : 0.35,
                    side: THREE.DoubleSide,
                    shadowSide: THREE.DoubleSide,
                    emissive: new THREE.Color(0, 0, 0),
                    emissiveIntensity: 0,
                    envMapIntensity: 0.8,
                  }),
              )
            }
          }
        }
      })

      return clone
    }, [scene, targetColor, moduleKey, cellType, row, isBottomModule])

    const adjustedPosition: [number, number, number] = useMemo(() => {
      const BAR_THICKNESS = 0.01
      const isSchubladen = cellType === "mit-schubladen"
      const zOffset = isClosedModule(cellType) ? (isSchubladen ? BAR_THICKNESS + 0.01 : BAR_THICKNESS) : 0
      return [position[0] + xOffset, position[1] + yOffset, position[2] + zOffset]
    }, [position, xOffset, yOffset, cellType])

    return <primitive object={clonedScene} position={adjustedPosition} rotation={[0, (3 * Math.PI) / 2, 0]} scale={1} />
  },
  (prev, next) =>
    prev.modelUrl === next.modelUrl &&
    prev.moduleKey === next.moduleKey &&
    prev.targetColor === next.targetColor &&
    prev.cellType === next.cellType &&
    prev.row === next.row &&
    prev.isBottomModule === next.isBottomModule &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2],
)
