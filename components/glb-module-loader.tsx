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
  const [blobModels, setBlobModels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const modelUrl = blobModels[cellType]
  const gltf = useGLTF(modelUrl, undefined, undefined, (xhr: ProgressEvent) => {
    console.log("[v0] GLB loading progress:", (xhr.loaded / xhr.total) * 100 + "%")
  })

  useEffect(() => {
    const fetchBlobModels = async () => {
      try {
        const response = await fetch("/api/blob-models")
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`)
        }
        const models = await response.json()
        console.log("[v0] Blob models fetched successfully:", models)
        setBlobModels(models)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        console.error("[v0] Error fetching Blob models:", errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchBlobModels()
  }, [])

  // Only render when we have models and it's not an empty cell
  if (cellType === "empty" || loading || !blobModels[cellType]) {
    return null
  }

  return (
    <LoadedGLBModel
      gltf={gltf}
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
  gltf,
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
  gltf: any
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
