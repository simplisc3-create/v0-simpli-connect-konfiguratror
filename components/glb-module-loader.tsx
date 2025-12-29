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

function getGLBUrl(cellType: GridCell["type"], widthCm: number, color: string): string | null {
  if (cellType === "empty") return null

  const moduleCode = MODULE_TYPE_TO_CODE[cellType]
  if (!moduleCode) return null

  const colorCode = COLOR_TO_FILE_CODE[color] || "white"

  // Drawer types (code 5) - use drawer GLB
  if (moduleCode === "5") {
    return GLB_BLOB_URLS["drawer-gray"]
  }

  // Door types (code 6) - use door GLB
  if (moduleCode === "6") {
    return GLB_BLOB_URLS["door-green"]
  }

  // For 80cm modules (code 3 or 4)
  if (widthCm > 60) {
    const key = `80x40x40-1-${moduleCode}-${colorCode}`
    if (GLB_BLOB_URLS[key]) {
      return GLB_BLOB_URLS[key]
    }
    // Fallback to white
    const fallbackKey = `80x40x40-1-${moduleCode}-white`
    if (GLB_BLOB_URLS[fallbackKey]) {
      return GLB_BLOB_URLS[fallbackKey]
    }
    // Last resort - try code 3 white
    return GLB_BLOB_URLS["80x40x40-1-3-white"]
  } else {
    // For 40cm modules
    const key = `40x40x40-2-1-${colorCode}`
    if (GLB_BLOB_URLS[key]) {
      return GLB_BLOB_URLS[key]
    }
    return GLB_BLOB_URLS["40x40x40-2-1-white"]
  }
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
                const currentColor = mat.color.getHexString().toLowerCase()
                // Skip chrome/metal (silver), black feet, and white frame
                if (
                  currentColor !== "c0c0c0" &&
                  currentColor !== "333333" &&
                  currentColor !== "ffffff" &&
                  currentColor !== "808080" // Skip gray metal
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
  Object.values(GLB_BLOB_URLS).forEach((url) => {
    try {
      useGLTF.preload(url)
    } catch (error) {
      // Silently fail preload
    }
  })
}
