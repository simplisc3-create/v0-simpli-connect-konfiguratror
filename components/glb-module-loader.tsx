"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState, memo } from "react"
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
}

export const GLBModule = memo(function GLBModule({
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
}: GLBModuleProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(explicitModelUrl || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (explicitModelUrl) {
      setModelUrl(explicitModelUrl)
      setLoading(false)
      return
    }

    const fetchBlobModels = async () => {
      try {
        setLoading(true)

        const colorMap: Record<string, string> = {
          "#ffffff": "white",
          "#f5f5f5": "white",
          "#e5e7eb": "gray",
          "#6b7280": "gray",
          "#1f2937": "black",
          "#000000": "black",
          "#3b82f6": "blue",
          "#2563eb": "blue",
          "#10b981": "green",
          "#059669": "green",
          "#eab308": "yellow",
          "#ffeb3b": "yellow",
          "#f59e0b": "orange",
          "#ef4444": "red",
          "#9c27b0": "purple",
          "#a855f7": "purple",
        }

        const colorName = colorMap[color.toLowerCase()] || "white"

        const widthCm = Math.round(width * 100)
        const heightCm = Math.round(height * 100)

        const standardWidth = widthCm <= 50 ? 40 : 80

        const params = new URLSearchParams({
          cellType: cellType,
          width: standardWidth.toString(),
          height: heightCm.toString(),
          color: colorName,
        })

        console.log(
          `[v0] Fetching GLB for: ${cellType}, width=${standardWidth}cm, height=${heightCm}cm, color=${colorName}`,
        )

        const response = await fetch(`/api/blob-models?${params}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.url) {
          console.log(`[v0] Resolved GLB: ${data.filename}`)
          setModelUrl(data.url)
        } else {
          console.warn("[v0] No model URL found for:", { cellType, standardWidth, heightCm, colorName })
          setError(`No model found for ${cellType}`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        console.error("[v0] Error fetching GLB model:", errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchBlobModels()
  }, [width, height, cellType, color, explicitModelUrl])

  if (cellType === "empty" || loading || !modelUrl || error) {
    return null
  }

  return (
    <LoadedGLBModel
      modelUrl={modelUrl}
      cellType={cellType}
      position={position}
      width={width}
      height={height}
      depth={depth}
      color={color}
      row={row}
      col={col}
      gridConfig={gridConfig}
    />
  )
})

function LoadedGLBModel({
  modelUrl,
  cellType,
  position,
  width,
  height,
  depth,
  color,
  row,
  col,
  gridConfig,
}: {
  modelUrl: string
  cellType: GridCell["type"]
  position: [number, number, number]
  width: number
  height: number
  depth: number
  color: string
  row: number
  col: number
  gridConfig: ShelfConfig
}) {
  const gltf = useGLTF(modelUrl)

  const [clonedScene, setClonedScene] = useState<any>(null)
  const [loadError, setLoadError] = useState(false)
  const [scaleFactor, setScaleFactor] = useState<[number, number, number]>([1, 1, 1])
  const [modelOffset, setModelOffset] = useState<[number, number, number]>([0, 0, 0])
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0])

  useEffect(() => {
    if (!gltf?.scene || loadError) return

    try {
      const clone = gltf.scene.clone()

      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      let scaleX = 1
      let scaleY = 1
      let scaleZ = 1

      if (cellType === "ohne-seitenwaende" && modelUrl.includes("frame80")) {
        const frameBaseWidth = 0.8
        const frameBaseHeight = 0.4
        const frameBaseDepth = 0.38

        scaleX = width / frameBaseWidth
        scaleY = height / frameBaseHeight
        scaleZ = depth / frameBaseDepth
      } else {
        scaleX = size.x > 0 ? width / size.x : 1
        scaleY = size.y > 0 ? height / size.y : 1
        scaleZ = size.z > 0 ? depth / size.z : 1
      }

      setScaleFactor([scaleX, scaleY, scaleZ])

      // The overlap is now handled at the grid level in shelf-scene.tsx
      const offsetX = -center.x * scaleX
      const offsetY = -center.y * scaleY
      const offsetZ = -center.z * scaleZ

      setModelOffset([offsetX, offsetY, offsetZ])

      // ... existing code for rotation ...
      if (cellType === "abschliessbare-tueren" || cellType === "mit-tueren" || cellType === "mit-klapptuer") {
        setRotation([0, Math.PI, 0])
      } else if (cellType === "ohne-seitenwaende" && modelUrl.includes("frame80")) {
        setRotation([0, -Math.PI / 2, 0])
      } else {
        setRotation([0, 0, 0])
      }

      clone.traverse((child) => {
        if ((child as any).isMesh) {
          const mesh = child as any
          const meshName = mesh.name.toLowerCase()

          if (
            meshName.includes("board") ||
            meshName.includes("shelf") ||
            meshName.includes("surface") ||
            meshName.includes("plate") ||
            meshName.includes("door") ||
            meshName.includes("panel")
          ) {
            if (mesh.material) {
              mesh.material = mesh.material.clone()
              mesh.material.color.set(color)
            }
          }
        }
      })

      setClonedScene(clone)
    } catch (error) {
      console.error("[v0] Error processing GLB model:", error)
      setLoadError(true)
    }
  }, [gltf?.scene, color, width, height, depth, loadError, row, col, gridConfig, cellType, modelUrl])

  if (loadError || !clonedScene) {
    return null
  }

  const adjustedPosition: [number, number, number] = [
    position[0] + modelOffset[0],
    position[1] + modelOffset[1],
    position[2] + modelOffset[2],
  ]

  return (
    <primitive
      object={clonedScene}
      position={adjustedPosition}
      scale={scaleFactor}
      rotation={rotation}
      castShadow
      receiveShadow
    />
  )
}
