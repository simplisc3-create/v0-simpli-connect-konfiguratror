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

const GLB_MODEL_PATHS: Record<GridCell["type"], string> = {
  empty: "",
  "ohne-seitenwaende": "",
  "ohne-rueckwand": "",
  "mit-rueckwand": "",
  "mit-tueren": "",
  "mit-klapptuer": "",
  "mit-doppelschublade": "",
  "abschliessbare-tueren": "",
}

export function GLBModule({ position, cellType, width, height, depth, color, row, col, gridConfig }: GLBModuleProps) {
  const [blobModels, setBlobModels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlobModels = async () => {
      try {
        const response = await fetch("/api/blob-models")
        if (response.ok) {
          const models = await response.json()
          setBlobModels(models)
        }
      } catch (error) {
        console.error("[v0] Error fetching Blob models:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlobModels()
  }, [])

  const modelPath = blobModels[cellType] || GLB_MODEL_PATHS[cellType]

  if (!modelPath || cellType === "empty" || loading) {
    return null
  }

  return (
    <GLBModelWithErrorBoundary
      path={modelPath}
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

function GLBModelWithErrorBoundary({
  path,
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
  path: string
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
  const [hasError, setHasError] = useState(false)
  const gltf = useGLTF(path)

  useEffect(() => {
    fetch(path, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          console.error(`[v0] GLB file not found: ${path}`)
          setHasError(true)
        }
      })
      .catch((error) => {
        console.error(`[v0] Error fetching GLB: ${path}`, error)
        setHasError(true)
      })
  }, [path])

  if (hasError) {
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

          // Check if mesh is a board/shelf surface by name pattern
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
          // All other meshes (frame, rods, sides) keep their original chrome/material
        }
      })

      setClonedScene(clone)
    } catch (error) {
      console.log("[v0] Error processing GLB model:", error)
      setLoadError(true)
    }
  }, [gltf?.scene, color, width, height, depth, loadError, row, col, gridConfig])

  if (loadError || !clonedScene) {
    return null
  }

  const adjustedPosition: [number, number, number] = [position[0] + xOffset, position[1] + yOffset, position[2]]

  return <primitive object={clonedScene} position={adjustedPosition} scale={scaleFactor} castShadow receiveShadow />
}
