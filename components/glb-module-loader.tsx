"use client"

import { useGLTF } from "@react-three/drei"
import { useState, useMemo } from "react"
import * as THREE from "three"
import type { GridCell } from "./shelf-configurator"
import { GLB_BLOB_URLS, SPECIAL_COLOR_HEX, COLOR_TO_FILE_CODE } from "@/lib/glb-urls"

type GLBModuleProps = {
  position: [number, number, number]
  cellType: GridCell["type"]
  width: number
  height: number
  depth: number
  color: string
}

const MODULE_TYPE_TO_CODE: Record<GridCell["type"], string> = {
  empty: "",
  "ohne-seitenwaende": "3",
  "ohne-rueckwand": "3",
  "mit-rueckwand": "4",
  "mit-tueren": "6",
  "mit-klapptuer": "6",
  "abschliessbare-tueren": "6",
  "mit-doppelschublade": "5",
  schubladen: "5",
  "mit-seitenwaenden": "4",
}

// Local GLB URLs for basic modules
const LOCAL_GLB_URLS: Record<string, string> = {
  "80x40x40-1-3-white": "/images/80x40x40-1-3-white-opt.glb",
  "80x40x40-1-3-yellow": "/images/80x40x40-1-3-yellow-opt.glb",
  "80x40x40-1-3-red": "/images/80x40x40-1-3-red-opt.glb",
  "80x40x40-1-4-orange": "/images/80x40x40-1-4-orange-opt.glb",
  "80x40x40-1-4-green": "/images/80x40x40-1-4-green-opt.glb",
  "80x40x40-1-4-blue": "/images/80x40x40-1-4-blue-opt.glb",
  "80x40x40-1-4-white": "/images/80x40x40-1-3-white-opt.glb",
  "80x40x40-1-4-yellow": "/images/80x40x40-1-3-yellow-opt.glb",
  "80x40x40-1-4-red": "/images/80x40x40-1-3-red-opt.glb",
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

  if (moduleCode === "5") {
    return GLB_BLOB_URLS.drawer
  }
  if (moduleCode === "6") {
    return GLB_BLOB_URLS.door
  }

  // For 80cm modules
  if (widthCm > 60) {
    const key = `80x40x40-1-${moduleCode}-${colorCode}`
    if (LOCAL_GLB_URLS[key]) {
      return LOCAL_GLB_URLS[key]
    }
    const fallbackKey = `80x40x40-1-${moduleCode}-white`
    if (LOCAL_GLB_URLS[fallbackKey]) {
      return LOCAL_GLB_URLS[fallbackKey]
    }
  } else {
    // For 40cm modules
    const key = `40x40x40-2-1-${colorCode}`
    if (LOCAL_GLB_URLS[key]) {
      return LOCAL_GLB_URLS[key]
    }
    const fallbackKey = `40x40x40-2-1-white`
    if (LOCAL_GLB_URLS[fallbackKey]) {
      return LOCAL_GLB_URLS[fallbackKey]
    }
  }

  return null
}

export function GLBModule({ position, cellType, width, height, depth, color }: GLBModuleProps) {
  const modelUrl = getGLBUrl(cellType, width, color)

  if (!modelUrl || cellType === "empty") {
    return null
  }

  return (
    <GLBModelWithErrorBoundary url={modelUrl} position={position} widthCm={width} color={color} cellType={cellType} />
  )
}

function GLBModelWithErrorBoundary({
  url,
  position,
  widthCm,
  color,
  cellType,
}: {
  url: string
  position: [number, number, number]
  widthCm: number
  color: string
  cellType: GridCell["type"]
}) {
  const [hasError, setHasError] = useState(false)
  const gltf = useGLTF(url)

  const targetColorHex = SPECIAL_COLOR_HEX[color] || SPECIAL_COLOR_HEX.weiss

  const clonedScene = useMemo(() => {
    if (!gltf?.scene) return null

    try {
      const clone = gltf.scene.clone(true)

      // Calculate bounding box to determine original size
      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())

      // Target width based on cell width
      const targetWidth = widthCm / 100
      const scaleRatio = targetWidth / size.x

      clone.scale.set(scaleRatio, scaleRatio, scaleRatio)

      const moduleCode = MODULE_TYPE_TO_CODE[cellType]
      if (moduleCode === "5" || moduleCode === "6") {
        clone.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                // Check if this is a colored panel (not metal frame)
                const currentColor = mat.color.getHexString()
                // Gray drawer base color or green door base color - recolor these
                if (
                  currentColor !== "c0c0c0" && // Skip chrome/metal
                  currentColor !== "333333" && // Skip black feet
                  currentColor !== "ffffff" // Skip white frame
                ) {
                  mat.color.set(targetColorHex)
                }
              }
            })
          }
        })
      }

      // Center the model
      const newBox = new THREE.Box3().setFromObject(clone)
      const center = newBox.getCenter(new THREE.Vector3())
      clone.position.sub(center)

      return clone
    } catch (error) {
      console.error("[v0] Error processing GLB model:", error)
      setHasError(true)
      return null
    }
  }, [gltf, widthCm, targetColorHex, cellType])

  if (hasError || !clonedScene) {
    return null
  }

  return <primitive object={clonedScene} position={position} castShadow receiveShadow />
}

export function preloadGLBModels() {
  // Preload drawer and door models from Blob storage
  try {
    useGLTF.preload(GLB_BLOB_URLS.drawer)
    useGLTF.preload(GLB_BLOB_URLS.door)
  } catch (e) {
    // Silently fail
  }

  // Preload local models
  Object.values(LOCAL_GLB_URLS).forEach((url) => {
    try {
      useGLTF.preload(url)
    } catch (error) {
      // Silently fail
    }
  })
}
