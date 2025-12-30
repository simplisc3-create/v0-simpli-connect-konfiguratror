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
  "ohne-rueckwand": "8", // Changed from "3" to "8" to use the new ohne-rueckwand GLB
  "mit-rueckwand": "4",
  "mit-tueren": "3",
  "mit-klapptuer": "4",
  "mit-doppelschublade": "4",
  schubladen: "4",
  "abschliessbare-tueren": "3",
  "mit-seitenwaenden": "4",
  // 40cm module types
  leer: "",
  "mit-tuer-links": "6",
  "mit-tuer-rechts": "6",
  "mit-abschliessbarer-tuer-links": "6",
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
  // 80x40x40-1-3 models (mit-tueren style)
  "80x40x40-1-3-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-3-white-opt.glb",
  "80x40x40-1-3-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-3-yellow-opt.glb",
  "80x40x40-1-3-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-3-red-opt.glb",
  "80x40x40-1-3-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-3-blue-opt.glb",
  "80x40x40-1-3-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-3-green-opt.glb",
  "80x40x40-1-3-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-3-orange-opt.glb",
  "80x40x40-1-3-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-3-gray-opt.glb",
  // 80x40x40-1-4 models (mit-klapptuer style)
  "80x40x40-1-4-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-4-white-opt.glb",
  "80x40x40-1-4-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-4-yellow-opt.glb",
  "80x40x40-1-4-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-4-red-opt.glb",
  "80x40x40-1-4-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-4-blue-opt.glb",
  "80x40x40-1-4-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-4-green-opt.glb",
  "80x40x40-1-4-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-4-orange-opt.glb",
  "80x40x40-1-4-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-4-gray-opt.glb",
  // 80x40x40-1-8 models (ohne-rueckwand style)
  "80x40x40-1-8-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-white-opt.glb",
  "80x40x40-1-8-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-yellow.glb",
  "80x40x40-1-8-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-red-opt.glb",
  "80x40x40-1-8-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-blue-opt.glb",
  "80x40x40-1-8-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-green-opt.glb",
  "80x40x40-1-8-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-orange-opt.glb",
  "80x40x40-1-8-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-gray-opt.glb",
  // 40x40x40-2-1 models (basic modules)
  "40x40x40-2-1-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-1-white-opt.glb",
  "40x40x40-2-1-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-1-yellow-opt.glb",
  "40x40x40-2-1-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-1-red-opt.glb",
  "40x40x40-2-1-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-1-blue-opt.glb",
  "40x40x40-2-1-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-1-green-opt.glb",
  "40x40x40-2-1-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-1-orange-opt.glb",
  "40x40x40-2-1-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-1-gray-opt.glb",
  // 40x40x40-2-4 models (mit-rueckwand/mit-klapptuer style)
  "40x40x40-2-4-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-4-white-opt.glb",
  "40x40x40-2-4-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-4-yellow-opt.glb",
  "40x40x40-2-4-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-4-red-opt.glb",
  "40x40x40-2-4-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-4-blue-opt.glb",
  "40x40x40-2-4-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-4-green-opt.glb",
  "40x40x40-2-4-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-4-orange-opt.glb",
  "40x40x40-2-4-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-4-gray-opt.glb",
  // 40x40x40-2-6 models (mit-tuer variant)
  "40x40x40-2-6-white": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-6-white-opt.glb",
  "40x40x40-2-6-yellow": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-6-yellow-opt.glb",
  "40x40x40-2-6-red": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-6-red-opt.glb",
  "40x40x40-2-6-blue": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-6-blue-opt.glb",
  "40x40x40-2-6-green": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-6-green-opt.glb",
  "40x40x40-2-6-orange": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-6-orange-opt.glb",
  "40x40x40-2-6-gray": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/40x40x40-2-6-gray-opt.glb",
}

function getGLBUrl(cellType: GridCell["type"], widthCm: number, color: string): string | null {
  if (cellType === "empty" || cellType === "leer") return null

  const moduleCode = MODULE_TYPE_TO_CODE[cellType]
  if (!moduleCode) return null

  const colorCode = COLOR_TO_FILE_CODE[color] || "white"

  // For 80cm modules (widthCm > 60 typically means 75cm cells)
  if (widthCm > 60) {
    const key = `80x40x40-1-${moduleCode}-${colorCode}`
    if (GLB_URLS[key]) {
      return GLB_URLS[key]
    }
    // Fallback: try white if color not found
    const fallbackKey = `80x40x40-1-${moduleCode}-white`
    if (GLB_URLS[fallbackKey]) {
      return GLB_URLS[fallbackKey]
    }
  } else {
    // For 40cm modules (38cm cells)
    // First try specific module variant
    const specialKey = `40x40x40-2-${moduleCode}-${colorCode}`
    if (GLB_URLS[specialKey]) {
      return GLB_URLS[specialKey]
    }

    // Try 2-1 basic variant
    const key = `40x40x40-2-1-${colorCode}`
    if (GLB_URLS[key]) {
      return GLB_URLS[key]
    }

    // Fallback: try white if color not found
    const fallbackKey = `40x40x40-2-1-white`
    if (GLB_URLS[fallbackKey]) {
      return GLB_URLS[fallbackKey]
    }
  }

  return null
}

export function GLBModule({ position, cellType, width, height, depth, color }: GLBModuleProps) {
  const modelUrl = getGLBUrl(cellType, width, color)

  if (!modelUrl || cellType === "empty" || cellType === "leer") {
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

      console.log("[v0] Loading GLB model:", url)
      let textureCount = 0
      let materialCount = 0

      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          materialCount++

          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                console.log("[v0] Material:", mat.name, {
                  hasMap: !!mat.map,
                  hasNormalMap: !!mat.normalMap,
                  hasRoughnessMap: !!mat.roughnessMap,
                  hasMetalnessMap: !!mat.metalnessMap,
                  color: mat.color.getHexString(),
                })
                if (mat.map) textureCount++
                if (mat.normalMap) textureCount++
                if (mat.roughnessMap) textureCount++
                if (mat.metalnessMap) textureCount++
              }
            })
          } else if (
            mesh.material instanceof THREE.MeshStandardMaterial ||
            mesh.material instanceof THREE.MeshPhysicalMaterial
          ) {
            const mat = mesh.material
            console.log("[v0] Material:", mat.name, {
              hasMap: !!mat.map,
              hasNormalMap: !!mat.normalMap,
              hasRoughnessMap: !!mat.roughnessMap,
              hasMetalnessMap: !!mat.metalnessMap,
              color: mat.color.getHexString(),
            })
            if (mat.map) textureCount++
            if (mat.normalMap) textureCount++
            if (mat.roughnessMap) textureCount++
            if (mat.metalnessMap) textureCount++
          }

          // Enable shadows for better visual quality
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })

      console.log("[v0] Model loaded with", materialCount, "materials and", textureCount, "textures")

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
  }, [gltf, widthCm, loadError, url])

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
