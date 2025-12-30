"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState, useMemo } from "react"
import * as THREE from "three"
import type { GridCell } from "./shelf-configurator"

type GLBModuleProps = {
  position: [number, number, number]
  cellType: GridCell["type"]
  width: number // in cm (38 or 75)
  height: number
  depth: number
  color: string // German color name
}

const MODULE_TYPE_TO_CODE: Record<GridCell["type"], string> = {
  empty: "",
  "ohne-seitenwaende": "3",
  "ohne-rueckwand": "3",
  "mit-rueckwand": "4",
  "mit-tueren": "3",
  "mit-klapptuer": "4",
  "mit-doppelschublade": "4",
  schubladen: "4",
  "abschliessbare-tueren": "3",
  "mit-seitenwaenden": "4",
  "mit-tuer-links": "3",
  "mit-tuer-rechts": "3",
}

const COLOR_TO_FILE_CODE: Record<string, string> = {
  weiss: "white",
  schwarz: "black",
  blau: "blue",
  gruen: "green",
  orange: "orange",
  rot: "red",
  gelb: "yellow",
  grau: "gray",
}

let blobGLBUrls: Record<string, string> = {}
let blobUrlsLoaded = false

// Function to load GLB URLs from Blob storage
async function loadBlobGLBUrls(): Promise<Record<string, string>> {
  if (blobUrlsLoaded) return blobGLBUrls

  try {
    const response = await fetch("/api/glb-models")
    if (!response.ok) throw new Error("Failed to fetch GLB models")

    const data = await response.json()
    const urls: Record<string, string> = {}

    for (const file of data.files) {
      // Parse filename to create key (e.g., "80x40x40-1-3-white-opt.glb" -> "80x40x40-1-3-white")
      const filename = file.filename.replace("-opt.glb", "").replace(".glb", "")
      urls[filename] = file.url
    }

    blobGLBUrls = urls
    blobUrlsLoaded = true
    return urls
  } catch (error) {
    console.error("Error loading GLB URLs from Blob:", error)
    return {}
  }
}

// Fallback local URLs (used if Blob storage is empty or unavailable)
const FALLBACK_GLB_URLS: Record<string, string> = {
  "80x40x40-1-3-white": "/images/80x40x40-1-3-white-opt.glb",
  "80x40x40-1-3-yellow": "/images/80x40x40-1-3-yellow-opt.glb",
  "80x40x40-1-3-red": "/images/80x40x40-1-3-red-opt.glb",
  "80x40x40-1-4-orange": "/images/80x40x40-1-4-orange-opt.glb",
  "80x40x40-1-4-green": "/images/80x40x40-1-4-green-opt.glb",
  "80x40x40-1-4-blue": "/images/80x40x40-1-4-blue-opt.glb",
  "40x40x40-2-1-white": "/images/40x40x40-2-1-white-opt.glb",
  "40x40x40-2-1-orange": "/images/40x40x40-2-1-orange-opt.glb",
  "40x40x40-2-1-green": "/images/40x40x40-2-1-green-opt.glb",
  "40x40x40-2-1-gray": "/images/40x40x40-2-1-gray-opt.glb",
  "40x40x40-2-6-red": "/images/40x40x40-2-6-red-opt.glb",
}

function getGLBUrl(cellType: GridCell["type"], widthCm: number, color: string): string | null {
  if (cellType === "empty") return null

  const moduleCode = MODULE_TYPE_TO_CODE[cellType]
  if (!moduleCode) return null

  const colorCode = COLOR_TO_FILE_CODE[color] || "white"

  // Use Blob URLs if available, otherwise fallback
  const urls = Object.keys(blobGLBUrls).length > 0 ? blobGLBUrls : FALLBACK_GLB_URLS

  // For 80cm modules (widthCm > 60 typically means 75cm cells)
  if (widthCm > 60) {
    // Try exact match
    const key = `80x40x40-1-${moduleCode}-${colorCode}`
    if (urls[key]) return urls[key]

    // Try all possible color variants for this module
    const possibleColors = ["white", "black", "gray", "blue", "green", "orange", "red", "yellow"]
    for (const fallbackColor of possibleColors) {
      const fallbackKey = `80x40x40-1-${moduleCode}-${fallbackColor}`
      if (urls[fallbackKey]) return urls[fallbackKey]
    }
  } else {
    // For 40cm modules (38cm cells)
    if (moduleCode === "3" && colorCode === "red") {
      const specialKey = `40x40x40-2-6-${colorCode}`
      if (urls[specialKey]) return urls[specialKey]
    }

    // Try exact match
    const key = `40x40x40-2-1-${colorCode}`
    if (urls[key]) return urls[key]

    // Try with different panel codes if color exists
    for (const panelCode of ["1", "2", "3", "4", "5", "6"]) {
      const tryKey = `40x40x40-2-${panelCode}-${colorCode}`
      if (urls[tryKey]) return urls[tryKey]
    }

    // Try all possible color variants for this module
    const possibleColors = ["white", "black", "gray", "blue", "green", "orange", "red", "yellow"]
    for (const fallbackColor of possibleColors) {
      for (const panelCode of ["1", "2", "3", "4", "5", "6"]) {
        const fallbackKey = `40x40x40-2-${panelCode}-${fallbackColor}`
        if (urls[fallbackKey]) return urls[fallbackKey]
      }
    }
  }

  return null
}

function useBlobGLBUrls() {
  const [loaded, setLoaded] = useState(blobUrlsLoaded)

  useEffect(() => {
    if (!blobUrlsLoaded) {
      loadBlobGLBUrls().then(() => setLoaded(true))
    }
  }, [])

  return loaded
}

function ProceduralModule({
  position,
  cellType,
  width,
  height,
  depth,
  color,
}: {
  position: [number, number, number]
  cellType: GridCell["type"]
  width: number
  height: number
  depth: number
  color: string
}) {
  const colorHex = useMemo(() => {
    const colorMap: Record<string, string> = {
      weiss: "#f5f5f5",
      schwarz: "#1a1a1a",
      grau: "#6b7280",
      blau: "#00b4d8",
      gruen: "#228B22",
      orange: "#f97316",
      rot: "#dc2626",
      gelb: "#eab308",
    }
    return colorMap[color] || "#f5f5f5"
  }, [color])

  const widthM = width / 100
  const heightM = height / 100
  const depthM = depth / 100
  const tubeRadius = 0.01

  return (
    <group position={position}>
      {/* Bottom panel */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[widthM, 0.005, depthM]} />
        <meshStandardMaterial color={colorHex} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, heightM, 0]} castShadow receiveShadow>
        <boxGeometry args={[widthM, 0.005, depthM]} />
        <meshStandardMaterial color={colorHex} />
      </mesh>

      {/* Add panels based on cell type */}
      {(cellType === "mit-rueckwand" || cellType === "mit-seitenwaenden" || cellType === "ohne-rueckwand") && (
        <>
          {/* Back panel */}
          {cellType !== "ohne-rueckwand" && (
            <mesh position={[0, heightM / 2, -depthM / 2]} castShadow receiveShadow>
              <boxGeometry args={[widthM, heightM, 0.005]} />
              <meshStandardMaterial color={colorHex} />
            </mesh>
          )}

          {/* Side panels */}
          {(cellType === "mit-seitenwaenden" || cellType === "ohne-rueckwand") && (
            <>
              <mesh position={[-widthM / 2, heightM / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.005, heightM, depthM]} />
                <meshStandardMaterial color={colorHex} />
              </mesh>
              <mesh position={[widthM / 2, heightM / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.005, heightM, depthM]} />
                <meshStandardMaterial color={colorHex} />
              </mesh>
            </>
          )}
        </>
      )}

      {/* Door panels */}
      {(cellType === "mit-tueren" || cellType === "mit-tuer-links" || cellType === "mit-tuer-rechts") && (
        <mesh
          position={[
            cellType === "mit-tuer-rechts" ? widthM / 4 : cellType === "mit-tuer-links" ? -widthM / 4 : 0,
            heightM / 2,
            depthM / 2 + 0.01,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[cellType === "mit-tueren" ? widthM : widthM / 2, heightM - 0.02, 0.01]} />
          <meshStandardMaterial color={colorHex} />
        </mesh>
      )}

      {/* Frame tubes */}
      {[
        // Bottom frame
        [
          [-widthM / 2, 0, -depthM / 2],
          [widthM, 0, 0],
        ],
        [
          [-widthM / 2, 0, depthM / 2],
          [widthM, 0, 0],
        ],
        [
          [-widthM / 2, 0, -depthM / 2],
          [0, 0, depthM],
        ],
        [
          [widthM / 2, 0, -depthM / 2],
          [0, 0, depthM],
        ],
        // Top frame
        [
          [-widthM / 2, heightM, -depthM / 2],
          [widthM, 0, 0],
        ],
        [
          [-widthM / 2, heightM, depthM / 2],
          [widthM, 0, 0],
        ],
        [
          [-widthM / 2, heightM, -depthM / 2],
          [0, 0, depthM],
        ],
        [
          [widthM / 2, heightM, -depthM / 2],
          [0, 0, depthM],
        ],
        // Vertical posts
        [
          [-widthM / 2, 0, -depthM / 2],
          [0, heightM, 0],
        ],
        [
          [widthM / 2, 0, -depthM / 2],
          [0, heightM, 0],
        ],
        [
          [-widthM / 2, 0, depthM / 2],
          [0, heightM, 0],
        ],
        [
          [widthM / 2, 0, depthM / 2],
          [0, heightM, 0],
        ],
      ].map((tube, i) => {
        const [pos, size] = tube as [[number, number, number], [number, number, number]]
        const length = Math.sqrt(size[0] ** 2 + size[1] ** 2 + size[2] ** 2)
        const rotation: [number, number, number] =
          size[0] !== 0 ? [0, 0, Math.PI / 2] : size[2] !== 0 ? [Math.PI / 2, 0, 0] : [0, 0, 0]

        return (
          <mesh
            key={i}
            position={[pos[0] + size[0] / 2, pos[1] + size[1] / 2, pos[2] + size[2] / 2]}
            rotation={rotation}
          >
            <cylinderGeometry args={[tubeRadius, tubeRadius, length, 8]} />
            <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

export function GLBModule({ position, cellType, width, height, depth, color }: GLBModuleProps) {
  useBlobGLBUrls()
  const modelUrl = getGLBUrl(cellType, width, color)

  if (cellType === "empty") {
    return null
  }

  if (!modelUrl) {
    return (
      <ProceduralModule
        position={position}
        cellType={cellType}
        width={width}
        height={height}
        depth={depth}
        color={color}
      />
    )
  }

  return (
    <GLBModelWithErrorBoundary
      url={modelUrl}
      position={position}
      widthCm={width}
      color={color}
      cellType={cellType}
      width={width}
      height={height}
      depth={depth}
    />
  )
}

function GLBModelWithErrorBoundary({
  url,
  position,
  widthCm,
  color,
  cellType,
  width,
  height,
  depth,
}: {
  url: string
  position: [number, number, number]
  widthCm: number
  color: string
  cellType: GridCell["type"]
  width: number
  height: number
  depth: number
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const gltf = useGLTF(url)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    // For blob URLs, we trust they exist - just try to load
    if (url.includes("blob.vercel-storage.com")) {
      setIsLoading(false)
      return
    }

    // For local files, check if they exist
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          setHasError(true)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setHasError(true)
        setIsLoading(false)
      })
  }, [url])

  const clonedScene = useMemo(() => {
    if (!gltf?.scene || loadError) return null

    try {
      const clone = gltf.scene.clone(true)

      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())

      const targetWidth = widthCm / 100
      const scaleRatio = targetWidth / size.x

      clone.scale.set(scaleRatio, scaleRatio, scaleRatio)

      const newBox = new THREE.Box3().setFromObject(clone)
      const center = newBox.getCenter(new THREE.Vector3())
      clone.position.sub(center)

      return clone
    } catch (error) {
      console.error("[v0] Error processing GLB model:", error)
      return null
    }
  }, [gltf, widthCm, loadError])

  if (hasError || loadError || !clonedScene) {
    return (
      <ProceduralModule
        position={position}
        cellType={cellType}
        width={width}
        height={height}
        depth={depth}
        color={color}
      />
    )
  }

  return <primitive object={clonedScene} position={position} castShadow receiveShadow />
}

export function preloadGLBModels() {
  // First load Blob URLs, then preload models
  loadBlobGLBUrls().then((urls) => {
    const allUrls = Object.keys(urls).length > 0 ? urls : FALLBACK_GLB_URLS
    Object.values(allUrls).forEach((url) => {
      try {
        useGLTF.preload(url)
      } catch (error) {
        // Silently fail - models will load on demand
      }
    })
  })
}

// Export function to manually refresh Blob URLs
export async function refreshBlobGLBUrls() {
  blobUrlsLoaded = false
  blobGLBUrls = {}
  return loadBlobGLBUrls()
}
