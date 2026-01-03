"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState } from "react"
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
}

export function GLBModule({ position, cellType, width, height, depth, color, row, col, gridConfig }: GLBModuleProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlobModels = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/blob-models")
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] API Response received")

        let selectedUrl: string | null = null

        if (cellType === "ohne-rueckwand" && width > 0.6 && color.includes("blue")) {
          if (data.specificModels && data.specificModels["ohne-rueckwand-blue-75"]) {
            selectedUrl = data.specificModels["ohne-rueckwand-blue-75"]
            console.log("[v0] Using specific blue 75cm module:", selectedUrl)
          }
        }

        // If no specific model, use dimension-based selection
        if (!selectedUrl) {
          const cellDim = width > 0.6 ? "80x40x40" : "40x40x40"

          console.log("[v0] Selecting model for:", {
            cellType,
            width,
            cellDim,
            availableModels: data.modelMap?.[cellDim]?.length || 0,
          })

          if (data.modelMap && data.modelMap[cellDim] && data.modelMap[cellDim].length > 0) {
            // Select a model from the matching dimension set
            const models = data.modelMap[cellDim]

            const colorMatch = models.find((url: string) => url.toLowerCase().includes(color.toLowerCase()))

            selectedUrl = colorMatch || models[Math.floor(Math.random() * models.length)]
            console.log("[v0] Selected model:", selectedUrl)
          } else if (data.models && data.models.length > 0) {
            // Fallback to first available model
            selectedUrl = data.models[0]
            console.log("[v0] Fallback to first model:", selectedUrl)
          } else {
            throw new Error("No GLB files found in Blob storage")
          }
        }

        setModelUrl(selectedUrl)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        console.error("[v0] Error fetching Blob models:", errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchBlobModels()
  }, [width, cellType, color])

  // Only render when we have a model URL and it's not an empty cell
  if (cellType === "empty" || loading || !modelUrl) {
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
}

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
  const gltf = useGLTF(modelUrl, undefined, undefined, (xhr: ProgressEvent) => {
    console.log("[v0] GLB loading progress:", ((xhr.loaded / xhr.total) * 100).toFixed(2) + "%")
  })

  const [clonedScene, setClonedScene] = useState<any>(null)
  const [loadError, setLoadError] = useState(false)
  const [scaleFactor, setScaleFactor] = useState<[number, number, number]>([1, 1, 1])
  const [yOffset, setYOffset] = useState(0)
  const [xOffset, setXOffset] = useState(0)

  useEffect(() => {
    if (!gltf?.scene || loadError) return

    try {
      const clone = gltf.scene.clone()

      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())

      const scaleX = size.x > 0 ? width / size.x : 1
      const scaleY = size.y > 0 ? height / size.y : 1
      const scaleZ = size.z > 0 ? depth / size.z : 1

      setScaleFactor([scaleX, scaleY, scaleZ])

      const offset = row === 0 ? -height / 2 : 0
      setYOffset(offset)

      const rodThickness = 0.04
      let xAdjustment = 0

      const middleCol = Math.floor(gridConfig.columns / 2)
      if (col < middleCol) {
        xAdjustment = rodThickness
      } else if (col > middleCol) {
        xAdjustment = -rodThickness
      }

      setXOffset(xAdjustment)

      clone.traverse((child) => {
        if ((child as any).isMesh) {
          const mesh = child as any
          const meshName = mesh.name.toLowerCase()

          if (
            meshName.includes("board") ||
            meshName.includes("shelf") ||
            meshName.includes("surface") ||
            meshName.includes("plate")
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
  }, [gltf?.scene, color, width, height, depth, loadError, row, col, gridConfig])

  if (loadError || !clonedScene) {
    return null
  }

  const adjustedPosition: [number, number, number] = [position[0] + xOffset, position[1] + yOffset, position[2]]

  return <primitive object={clonedScene} position={adjustedPosition} scale={scaleFactor} castShadow receiveShadow />
}
