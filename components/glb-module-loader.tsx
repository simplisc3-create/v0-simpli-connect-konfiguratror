"use client"

import { useGLTF } from "@react-three/drei"

import { useEffect, useState, memo, useMemo, useRef, useCallback } from "react"
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
  isSelected?: boolean
  onClick?: (row: number, col: number) => void
  hideBuiltInFeet?: boolean
}

const urlCache = new Map<string, string>()

const materialCache = new Map<string, THREE.Material>()

// Get or create a cached material - returns the cached instance directly for better performance
// Materials are shared across instances since we don't modify them per-instance
function getCachedMaterial<T extends THREE.Material>(key: string, createMaterial: () => T): T {
  if (!materialCache.has(key)) {
    materialCache.set(key, createMaterial())
  }
  return materialCache.get(key) as T
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
  "#FFFFFF": "white",
  "#9e9e9e": "grey",
  "#9E9E9E": "grey",
  "#111111": "black",
  "#1e5eff": "blue",
  "#1E5EFF": "blue",
  "#2fae5d": "green",
  "#2FAE5D": "green",
  "#ffd400": "yellow",
  "#FFD400": "yellow",
  "#ffea00": "yellow",
  "#FFEA00": "yellow",
  "#ff8a00": "orange",
  "#FF8A00": "orange",
  "#e53935": "red",
  "#E53935": "red",
}

// Exact Simpli Connect panel colors - matching navigator UI exactly
const TARGET_COLORS: Record<string, THREE.Color> = {
  white: new THREE.Color("#FFFFFF"),
  grey: new THREE.Color("#9E9E9E"),
  gray: new THREE.Color("#9E9E9E"),
  black: new THREE.Color("#111111"),
  blue: new THREE.Color("#1E5EFF"),
  green: new THREE.Color("#2FAE5D"),
  yellow: new THREE.Color("#FFEA00"), // Brighter, more saturated yellow
  orange: new THREE.Color("#FF8A00"),
  red: new THREE.Color("#E53935"),
}

// Chrome material - slightly toned down
const CHROME_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.92, 0.92, 0.94),
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

const FEET_KEYWORDS = ["feet", "foot", "fuss", "fuß", "fuse", "bein", "leg", "standfuß", "standfuss", "gleiter", "kappe", "cap", "endkappe", "stopfen", "kunststoff"]

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
  mesh?: THREE.Mesh,
): boolean {
  const nameLower = meshName.toLowerCase()

  // Check by keyword first
  for (const keyword of FEET_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return true
    }
  }

  // Check if this is a small part at the bottom of the model - likely feet
  if (geometry && parentBoundingBox) {
    geometry.computeBoundingBox()
    const meshBox = geometry.boundingBox
    if (meshBox) {
      const meshSize = new THREE.Vector3()
      meshBox.getSize(meshSize)

      const parentSize = new THREE.Vector3()
      parentBoundingBox.getSize(parentSize)

      // Small parts are likely feet (less than 15% of parent size in all dimensions)
      const isSmall =
        meshSize.x < parentSize.x * 0.15 && 
        meshSize.y < parentSize.y * 0.15 && 
        meshSize.z < parentSize.z * 0.15

      // Also check if the part is at the bottom of the model (low Y position)
      const parentMin = parentBoundingBox.min
      const meshCenter = new THREE.Vector3()
      meshBox.getCenter(meshCenter)
      
      // Feet should be near the bottom 20% of the model
      const isAtBottom = meshCenter.y < parentMin.y + parentSize.y * 0.2

      // Check if material is black/dark (common for plastic feet)
      let isBlackMaterial = false
      if (material) {
        const mat = Array.isArray(material) ? material[0] : material
        if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
          const color = mat.color
          // Black/dark is when all RGB values are low (< 0.2)
          isBlackMaterial = color.r < 0.2 && color.g < 0.2 && color.b < 0.2
        }
      }

      // If it's small and at the bottom, and either black material or very small, it's likely feet
      if (isSmall && isAtBottom) {
        // If already black, definitely feet
        if (isBlackMaterial) return true
        
        // If extremely small (< 5% of parent), likely feet regardless of color
        const isVerySmall = 
          meshSize.x < parentSize.x * 0.05 && 
          meshSize.y < parentSize.y * 0.1 && 
          meshSize.z < parentSize.z * 0.05
        if (isVerySmall) return true
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
    isSelected = false,
    onClick,
    hideBuiltInFeet = false,
  }: GLBModuleProps) {
    const colorName = useMemo(() => getColorName(color), [color])
    const standardWidth = useMemo(() => getStandardWidth(width), [width])

    const cacheKey = useMemo(() => `${cellType}-${standardWidth}-white`, [cellType, standardWidth])

  const [modelUrl, setModelUrl] = useState<string | null>(() => {
    if (explicitModelUrl) return explicitModelUrl
    return urlCache.get(cacheKey) || null
  })
  const [error, setError] = useState<string | null>(null)
  const lastFetchedCacheKeyRef = useRef<string | null>(null)

  useEffect(() => {
    // Clear error and reset modelUrl when cacheKey changes to allow retry
    setError(null)
    
    if (explicitModelUrl) {
      setModelUrl(explicitModelUrl)
      return
    }

    const cachedUrl = urlCache.get(cacheKey)
    if (cachedUrl) {
      setModelUrl(cachedUrl)
      return
    }
    
    // Reset modelUrl while fetching new one
    setModelUrl(null)

    if (cellType === "empty" || cellType === "ghost") return
    
    // Only skip fetch if we already fetched for this exact cacheKey
    if (lastFetchedCacheKeyRef.current === cacheKey) return
    lastFetchedCacheKeyRef.current = cacheKey

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
        console.error("[v0] Error fetching GLB:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    fetchUrl()
  }, [cacheKey, explicitModelUrl, cellType, standardWidth, colorName])

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
        col={col}
        isBottomModule={isBottomModule}
        isSelected={isSelected}
        onClick={onClick}
        hideBuiltInFeet={hideBuiltInFeet}
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
    prev.isBottomModule === next.isBottomModule &&
    prev.isSelected === next.isSelected &&
    prev.hideBuiltInFeet === next.hideBuiltInFeet,
)

const LoadedGLBModel = memo(
  function LoadedGLBModel({
    modelUrl,
    position,
    moduleKey,
    targetColor,
    cellType = "offen",
    row = 0,
  col = 0,
  isBottomModule = false,
  isSelected = false,
  onClick,
  hideBuiltInFeet = false,
  }: {
  modelUrl: string
    position: [number, number, number]
    moduleKey: string
    targetColor: string
    cellType?: string
    row?: number
  col?: number
  isBottomModule?: boolean
  isSelected?: boolean
  onClick?: (row: number, col: number) => void
  hideBuiltInFeet?: boolean
  }) {
    const { scene } = useGLTF(modelUrl)
    const groupRef = useRef<THREE.Group>(null)

  

    const handleClick = useCallback((e: THREE.Event) => {
      e.stopPropagation()
      if (onClick) {
        onClick(row, col)
      }
    }, [onClick, row, col])

    const handlePointerOver = useCallback((e: THREE.Event) => {
      e.stopPropagation()
    }, [])
    
    const handlePointerOut = useCallback(() => {
      document.body.style.cursor = "auto"
    }, [])

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
      try {
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
          const isFeet = isFeetPart(meshName, child.geometry, parentBoundingBox, child.material, child)

          if (isHandle && isKlapptuerOben) {
            handleMesh = child
          }

          // Handle built-in feet:
          // 1. Not a bottom module - hide feet entirely
          // 2. Custom feet selected (hideBuiltInFeet = true) - make feet chrome to blend with frame
          // 3. Always render feet in black
          if (isFeet) {
            if (!isBottomModule) {
              // Not bottom module - hide feet completely
              child.visible = false
              return
            } else if (hideBuiltInFeet) {
              // Custom feet selected - chrome-plate the built-in feet to blend with frame
              child.material = getCachedMaterial("chrome", () => CHROME_MATERIAL)
              return
            } else {
              // Standard feet are always black
              child.material = getCachedMaterial("feet-black", () =>
                new THREE.MeshStandardMaterial({
                  color: TARGET_COLORS.black,
                  roughness: 0.8,
                  metalness: 0.0,
                  side: THREE.DoubleSide,
                })
              )
              return
            }
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
                child.material = getCachedMaterial("chrome", () => CHROME_MATERIAL)
              } else {
                const oldMat = child.material as THREE.MeshStandardMaterial
                const texture = oldMat.map || null
                const finalColor = isBottom ? TARGET_COLORS.black : targetColorValue
                const isWhitePanel = mappedColor === "white" && !isBottom

                // Create new material for each panel to ensure colors are applied correctly
                // Don't cache panel materials as they need unique colors per module
                if (isWhitePanel) {
                  // White panels use MeshStandardMaterial with emissive for extra brightness
                  child.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    color: finalColor.clone(),
                    emissive: new THREE.Color("#ffffff"),
                    emissiveIntensity: 0.15,
                    roughness: 0.9,
                    metalness: 0.0,
                    side: THREE.DoubleSide,
                  })
                } else {
                  // Other colors use MeshLambertMaterial for flat appearance
                  child.material = new THREE.MeshLambertMaterial({
                    map: texture,
                    color: finalColor.clone(),
                    side: THREE.DoubleSide,
                  })
                }
              }
            }
        }
      })

      return clone
    } catch (err) {
        console.error("[v0] Error cloning/processing scene:", err)
        // Return the original scene as fallback instead of throwing
        return scene.clone()
      }
    }, [scene, targetColor, moduleKey, cellType, row, isBottomModule, hideBuiltInFeet])

    const adjustedPosition: [number, number, number] = useMemo(() => {
      const BAR_THICKNESS = 0.01
      const isSchubladen = cellType === "mit-schubladen" || cellType === "mit-doppelschublade" || cellType === "mit-einzelschublade"
      const zOffset = isClosedModule(cellType) ? (isSchubladen ? BAR_THICKNESS + 0.01 : BAR_THICKNESS) : 0
      return [position[0] + xOffset, position[1] + yOffset, position[2] + zOffset]
    }, [position, xOffset, yOffset, cellType])

    return (
      <group 
        ref={groupRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <primitive object={clonedScene} position={adjustedPosition} rotation={[0, (3 * Math.PI) / 2, 0]} scale={1} />
      </group>
    )
  },
  (prev, next) =>
    prev.modelUrl === next.modelUrl &&
    prev.moduleKey === next.moduleKey &&
    prev.targetColor === next.targetColor &&
    prev.cellType === next.cellType &&
    prev.row === next.row &&
    prev.col === next.col &&
    prev.isBottomModule === next.isBottomModule &&
    prev.isSelected === next.isSelected &&
    prev.hideBuiltInFeet === next.hideBuiltInFeet &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2],
)
