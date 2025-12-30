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
  "mit-tueren": "6",
  "mit-klapptuer": "6",
  "abschliessbare-tueren": "6",
  "mit-doppelschublade": "5",
  schubladen: "5",
  "mit-seitenwaenden": "4",
}

const COLOR_TO_FILE_CODE: Record<string, string> = {
  weiss: "white",
  schwarz: "gray",
  blau: "blue",
  gruen: "green",
  orange: "orange",
  rot: "red",
  gelb: "yellow",
  grau: "gray",
}

const GLB_URLS: Record<string, string> = {
  // 80x40x40-1-3 models (basic open style)
  "80x40x40-1-3-white": "/images/80x40x40-1-3-white-opt.glb",
  "80x40x40-1-3-yellow": "/images/80x40x40-1-3-yellow-opt.glb",
  "80x40x40-1-3-red": "/images/80x40x40-1-3-red-opt.glb",
  // 80x40x40-1-4 models (with back panel style)
  "80x40x40-1-4-orange": "/images/80x40x40-1-4-orange-opt.glb",
  "80x40x40-1-4-green": "/images/80x40x40-1-4-green-opt.glb",
  "80x40x40-1-4-blue": "/images/80x40x40-1-4-blue-opt.glb",
  "80x40x40-1-4-white": "/images/80x40x40-1-3-white-opt.glb",
  "80x40x40-1-4-yellow": "/images/80x40x40-1-3-yellow-opt.glb",
  "80x40x40-1-4-red": "/images/80x40x40-1-3-red-opt.glb",
  // 80x40x40-1-5 models (drawer style) - using blob storage
  "80x40x40-1-5-gray": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",
  "80x40x40-1-5-white": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",
  "80x40x40-1-5-blue": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",
  "80x40x40-1-5-green": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",
  "80x40x40-1-5-orange": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",
  "80x40x40-1-5-red": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",
  "80x40x40-1-5-yellow": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",
  // 80x40x40-1-6 models (door style) - using blob storage
  "80x40x40-1-6-green": "/images/80x40x40-1-6-green-opt-20-281-29.glb",
  "80x40x40-1-6-white": "/images/80x40x40-1-6-green-opt-20-281-29.glb",
  "80x40x40-1-6-blue": "/images/80x40x40-1-6-green-opt-20-281-29.glb",
  "80x40x40-1-6-gray": "/images/80x40x40-1-6-green-opt-20-281-29.glb",
  "80x40x40-1-6-orange": "/images/80x40x40-1-6-green-opt-20-281-29.glb",
  "80x40x40-1-6-red": "/images/80x40x40-1-6-green-opt-20-281-29.glb",
  "80x40x40-1-6-yellow": "/images/80x40x40-1-6-green-opt-20-281-29.glb",

  // 40x40x40-2-1 models (basic modules)
  "40x40x40-2-1-white": "/images/40x40x40-2-1-white-opt.glb",
  "40x40x40-2-1-orange": "/images/40x40x40-2-1-orange-opt.glb",
  "40x40x40-2-1-green": "/images/40x40x40-2-1-green-opt.glb",
  "40x40x40-2-1-gray": "/images/40x40x40-2-1-gray-opt.glb",
  // 40x40x40-2-6 models (mit-tueren variant)
  "40x40x40-2-6-red": "/images/40x40x40-2-6-red-opt.glb",
}

function getGLBUrl(cellType: GridCell["type"], widthCm: number, color: string): string | null {
  if (cellType === "empty") return null

  const moduleCode = MODULE_TYPE_TO_CODE[cellType]
  if (!moduleCode) return null

  const colorCode = COLOR_TO_FILE_CODE[color] || "white"

  // For 80cm modules (widthCm > 60 typically means 75cm cells)
  if (widthCm > 60) {
    const key = `80x40x40-1-${moduleCode}-${colorCode}`
    if (GLB_URLS[key]) {
      return GLB_URLS[key]
    }
    // Fallback: try gray for drawers, green for doors, white for others
    if (moduleCode === "5") {
      return GLB_URLS["80x40x40-1-5-gray"]
    }
    if (moduleCode === "6") {
      return GLB_URLS["80x40x40-1-6-green"]
    }
    const fallbackKey = `80x40x40-1-${moduleCode}-white`
    if (GLB_URLS[fallbackKey]) {
      return GLB_URLS[fallbackKey]
    }
  } else {
    // For 40cm modules (38cm cells)
    if (moduleCode === "3" && colorCode === "red") {
      const specialKey = `40x40x40-2-6-${colorCode}`
      if (GLB_URLS[specialKey]) {
        return GLB_URLS[specialKey]
      }
    }

    const key = `40x40x40-2-1-${colorCode}`
    if (GLB_URLS[key]) {
      return GLB_URLS[key]
    }

    const fallbackKey = `40x40x40-2-1-white`
    if (GLB_URLS[fallbackKey]) {
      return GLB_URLS[fallbackKey]
    }
  }

  return null
}

export function GLBModule({ position, cellType, width, height, depth, color }: GLBModuleProps) {
  const modelUrl = getGLBUrl(cellType, width, color)

  if (!modelUrl || cellType === "empty") {
    return null
  }

  return <GLBModelWithErrorBoundary url={modelUrl} position={position} widthCm={width} color={color} />
}

function GLBModelWithErrorBoundary({
  url,
  position,
  widthCm,
  color,
}: {
  url: string
  position: [number, number, number]
  widthCm: number
  color: string
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const gltf = useGLTF(url)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    // For blob URLs, we trust they exist - just try to load
    if (url.includes("blob.vercel-storage.com") || url.includes("blob.v0.app")) {
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

      // Calculate bounding box to determine original size
      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())

      // Target width based on cell width
      const targetWidth = widthCm / 100 // Convert cell width to meters
      const scaleRatio = targetWidth / size.x

      clone.scale.set(scaleRatio, scaleRatio, scaleRatio)

      // Center the model
      const newBox = new THREE.Box3().setFromObject(clone)
      const center = newBox.getCenter(new THREE.Vector3())
      clone.position.sub(center)

      return clone
    } catch (error) {
      console.error("[v0] Error processing GLB model:", error)
      return null
    }
  }, [gltf, widthCm, loadError])

  if (hasError || isLoading || !clonedScene) {
    return null
  }

  return <primitive object={clonedScene} position={position} castShadow receiveShadow />
}

export function preloadGLBModels() {
  Object.values(GLB_URLS).forEach((url) => {
    try {
      useGLTF.preload(url)
    } catch (error) {
      // Silently fail - models will load on demand
    }
  })
}
