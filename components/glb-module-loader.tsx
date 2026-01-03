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
  modelUrl?: string // Accept explicit model URL from parent
}

export function GLBModule({
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
        const response = await fetch("/api/blob-models")
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("[v0] API Response received")

        let selectedUrl: string | null = null

        if (cellType === "abschliessbare-tueren" && width > 0.6) {
          selectedUrl = data.specificModels?.["abschliessbare-tueren-75"]
          if (selectedUrl) console.log("[v0] Using lockable doors 75cm module:", selectedUrl)
        } else if (cellType === "ohne-rueckwand" && width > 0.6 && color.includes("blue")) {
          selectedUrl = data.specificModels?.["ohne-rueckwand-blue-75"]
          if (selectedUrl) console.log("[v0] Using specific blue 75cm module:", selectedUrl)
        } else if (cellType === "doors40") {
          selectedUrl = data.specificModels?.["doors40"]
          if (selectedUrl) console.log("[v0] Using doors40 module:", selectedUrl)
        } else if (cellType === "lockableDoors40") {
          selectedUrl = data.specificModels?.["lockableDoors40"]
          if (selectedUrl) console.log("[v0] Using lockableDoors40 module:", selectedUrl)
        } else if (cellType === "flapDoors") {
          selectedUrl = data.specificModels?.["flapDoors"]
          if (selectedUrl) console.log("[v0] Using flapDoors module:", selectedUrl)
        } else if (cellType === "doubleDrawers80") {
          selectedUrl = data.specificModels?.["doubleDrawers80"]
          if (selectedUrl) console.log("[v0] Using doubleDrawers80 module:", selectedUrl)
        } else if (cellType === "jalousie80") {
          selectedUrl = data.specificModels?.["jalousie80"]
          if (selectedUrl) console.log("[v0] Using jalousie80 module:", selectedUrl)
        } else if (cellType === "functionalWall1") {
          selectedUrl = data.specificModels?.["functionalWall1"]
          if (selectedUrl) console.log("[v0] Using functionalWall1 module:", selectedUrl)
        } else if (cellType === "functionalWall2") {
          selectedUrl = data.specificModels?.["functionalWall2"]
          if (selectedUrl) console.log("[v0] Using functionalWall2 module:", selectedUrl)
        }

        if (!selectedUrl) {
          console.warn("[v0] No specific model URL found for:", { cellType, width, color })
          setError("No model URL specified for this configuration")
          setLoading(false)
          return
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
  }, [width, cellType, color, explicitModelUrl])

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
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0])

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

      if (cellType === "abschliessbare-tueren") {
        setRotation([0, Math.PI, 0])
      }

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
  }, [gltf?.scene, color, width, height, depth, loadError, row, col, gridConfig, cellType])

  if (loadError || !clonedScene) {
    return null
  }

  const adjustedPosition: [number, number, number] = [position[0] + xOffset, position[1] + yOffset, position[2]]

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
