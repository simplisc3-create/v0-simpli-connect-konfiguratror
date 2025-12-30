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
}

const COLOR_TO_FILE_CODE: Record<string, string> = {
  weiss: "white",
  schwarz: "gray", // Map schwarz to gray since we have gray models
  blau: "blue",
  gruen: "green",
  orange: "orange",
  rot: "red",
  gelb: "yellow",
  grau: "gray", // Added gray color
}

const GLB_URLS: Record<string, string> = {
  // 80x40x40-1-8 models (schubladen/drawers)
  "80x40x40-1-8-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-8-yellow.glb",
  "80x40x40-1-8-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-8-white.glb",
  "80x40x40-1-8-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-8-red.glb",
  "80x40x40-1-8-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-8-orange.glb",
  "80x40x40-1-8-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-8-green.glb",
  "80x40x40-1-8-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-8-gray.glb",
  "80x40x40-1-8-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-8-blue.glb",

  // 80x40x40-1-7 models
  "80x40x40-1-7-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-7-yellow.glb",
  "80x40x40-1-7-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-7-white.glb",
  "80x40x40-1-7-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-7-red.glb",
  "80x40x40-1-7-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-7-orange.glb",
  "80x40x40-1-7-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-7-green.glb",
  "80x40x40-1-7-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-7-gray.glb",
  "80x40x40-1-7-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-7-blue.glb",

  // 80x40x40-1-6 models
  "80x40x40-1-6-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-6-yellow.glb",
  "80x40x40-1-6-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-6-white.glb",
  "80x40x40-1-6-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-6-red.glb",
  "80x40x40-1-6-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-6-orange.glb",
  "80x40x40-1-6-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-6-green.glb",
  "80x40x40-1-6-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-6-gray.glb",
  "80x40x40-1-6-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-6-blue.glb",

  // 80x40x40-1-5 models
  "80x40x40-1-5-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-5-yellow.glb",
  "80x40x40-1-5-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-5-white.glb",
  "80x40x40-1-5-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-5-red.glb",
  "80x40x40-1-5-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-5-orange.glb",
  "80x40x40-1-5-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-5-green.glb",
  "80x40x40-1-5-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-5-gray.glb",
  "80x40x40-1-5-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-5-blue.glb",

  // 80x40x40-1-4 models
  "80x40x40-1-4-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-4-yellow.glb",
  "80x40x40-1-4-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-4-white.glb",
  "80x40x40-1-4-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-4-red.glb",
  "80x40x40-1-4-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-4-orange.glb",
  "80x40x40-1-4-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-4-green.glb",
  "80x40x40-1-4-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-4-gray.glb",
  "80x40x40-1-4-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-4-blue.glb",

  // 80x40x40-1-3 models
  "80x40x40-1-3-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-3-yellow.glb",
  "80x40x40-1-3-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-3-white.glb",
  "80x40x40-1-3-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-3-red.glb",
  "80x40x40-1-3-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-3-orange.glb",
  "80x40x40-1-3-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-3-green.glb",
  "80x40x40-1-3-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-3-gray.glb",
  "80x40x40-1-3-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-3-blue.glb",

  // 80x40x40-1-2 models
  "80x40x40-1-2-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-2-yellow.glb",
  "80x40x40-1-2-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-2-white.glb",
  "80x40x40-1-2-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-2-red.glb",
  "80x40x40-1-2-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-2-orange.glb",
  "80x40x40-1-2-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-2-green.glb",
  "80x40x40-1-2-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-2-gray.glb",
  "80x40x40-1-2-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-2-blue.glb",

  // 80x40x40-1-1 models
  "80x40x40-1-1-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-1-yellow.glb",
  "80x40x40-1-1-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-1-white.glb",
  "80x40x40-1-1-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-1-red.glb",
  "80x40x40-1-1-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-1-orange.glb",
  "80x40x40-1-1-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-1-green.glb",
  "80x40x40-1-1-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-1-gray.glb",
  "80x40x40-1-1-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/80x40x40-1-1-blue.glb",

  // 40x40x40-2-7 models
  "40x40x40-2-7-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-7-white.glb",
  "40x40x40-2-7-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-7-orange.glb",
  "40x40x40-2-7-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-7-green.glb",
  "40x40x40-2-7-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-7-gray.glb",
  "40x40x40-2-7-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-7-blue.glb",

  // 40x40x40-2-6 models
  "40x40x40-2-6-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-6-white.glb",
  "40x40x40-2-6-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-6-orange.glb",
  "40x40x40-2-6-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-6-green.glb",
  "40x40x40-2-6-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-6-gray.glb",
  "40x40x40-2-6-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-6-blue.glb",

  // 40x40x40-2-5 models
  "40x40x40-2-5-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-5-white.glb",
  "40x40x40-2-5-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-5-orange.glb",
  "40x40x40-2-5-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-5-green.glb",
  "40x40x40-2-5-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-5-gray.glb",
  "40x40x40-2-5-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-5-blue.glb",

  // 40x40x40-2-4 models
  "40x40x40-2-4-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-4-white.glb",
  "40x40x40-2-4-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-4-orange.glb",
  "40x40x40-2-4-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-4-green.glb",
  "40x40x40-2-4-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-4-gray.glb",
  "40x40x40-2-4-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-4-blue.glb",

  // 40x40x40-2-3 models (optimized versions)
  "40x40x40-2-3-white":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-3-white_optimized.glb",
  "40x40x40-2-3-orange":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-3-Orange_optimized.glb",
  "40x40x40-2-3-green":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-3-green_optimized.glb",
  "40x40x40-2-3-gray":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-3-gray_optimized.glb",
  "40x40x40-2-3-blue":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-3-blue_optimized.glb",

  // 40x40x40-2-2 models (optimized versions)
  "40x40x40-2-2-white":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-2-white_optimized.glb",
  "40x40x40-2-2-orange":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-2-Orange_optimized.glb",
  "40x40x40-2-2-green":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-2-green_optimized.glb",
  "40x40x40-2-2-gray":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-2-gray_optimized.glb",
  "40x40x40-2-2-blue":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-2-blue_optimized.glb",

  // 40x40x40-2-1 models (optimized versions)
  "40x40x40-2-1-white":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-1-white_optimized.glb",
  "40x40x40-2-1-orange":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-1-Orange_optimized.glb",
  "40x40x40-2-1-green":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-1-green_optimized.glb",
  "40x40x40-2-1-gray":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-1-gray_optimized.glb",
  "40x40x40-2-1-blue":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/clonegbl/40x40x40-2-1-blue_optimized.glb",
}

export function getGLBUrl(cellType: GridCell["type"], widthCm: number, color: string): string | null {
  if (cellType === "empty") return null

  const moduleCode = MODULE_TYPE_TO_CODE[cellType]
  if (!moduleCode) return null

  const colorCode = COLOR_TO_FILE_CODE[color] || "white"

  // For 80cm modules (widthCm > 60 typically means 75cm cells)
  if (widthCm > 60) {
    // Try all 80x40x40 variants in order of preference
    const variants = ["1-8", "1-7", "1-6", "1-5", "1-4", "1-3", "1-2", "1-1"]

    for (const variant of variants) {
      const key = `80x40x40-${variant}-${colorCode}`
      if (GLB_URLS[key]) {
        return GLB_URLS[key]
      }
    }

    // Fallback: try white if specific color not found
    for (const variant of variants) {
      const fallbackKey = `80x40x40-${variant}-white`
      if (GLB_URLS[fallbackKey]) {
        return GLB_URLS[fallbackKey]
      }
    }
  } else {
    // For 40cm modules (38cm cells)
    // Try all 40x40x40 variants in order: 2-7, 2-6, 2-5, 2-4, 2-3, 2-2, 2-1
    const variants = ["2-7", "2-6", "2-5", "2-4", "2-3", "2-2", "2-1"]

    for (const variant of variants) {
      const key = `40x40x40-${variant}-${colorCode}`
      if (GLB_URLS[key]) {
        return GLB_URLS[key]
      }
    }

    // Fallback: try white if specific color not found
    for (const variant of variants) {
      const fallbackKey = `40x40x40-${variant}-white`
      if (GLB_URLS[fallbackKey]) {
        return GLB_URLS[fallbackKey]
      }
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

      // Determine base model size (40 or 80)
      const baseModelWidth = widthCm <= 60 ? 0.4 : 0.8 // 40cm or 80cm in meters
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
  // Preload all available GLB models from blob storage
  Object.values(GLB_URLS).forEach((url) => {
    try {
      useGLTF.preload(url)
    } catch (error) {
      // Silently fail - models will load on demand
    }
  })
}
