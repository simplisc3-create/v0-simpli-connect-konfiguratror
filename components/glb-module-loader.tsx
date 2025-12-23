"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState } from "react"
import type { GridCell } from "./shelf-configurator"

type GLBModuleProps = {
  position: [number, number, number]
  cellType: GridCell["type"]
  width: number
  height: number
  depth: number
  color: string
}

const GLB_MODEL_PATHS: Record<GridCell["type"], string> = {
  empty: "", // No model for empty cells
  "ohne-seitenwaende": "/images/40x40x40-2-1-red.glb",
  "ohne-rueckwand": "/images/40x40x40-2-2-red.glb",
  "mit-rueckwand": "/images/40x40x40-2-3-red.glb",
  "mit-tueren": "/images/40x40x40-2-4-red.glb",
  "mit-klapptuer": "/images/40x40x40-2-5-red.glb",
  "mit-doppelschublade": "/images/40x40x40-2-6-red.glb",
  "abschliessbare-tueren": "/images/40x40x40-2-7-red.glb",
}

export function GLBModule({ position, cellType, width, height, depth, color }: GLBModuleProps) {
  const modelPath = GLB_MODEL_PATHS[cellType]

  if (!modelPath || cellType === "empty") {
    return null
  }

  return <GLBModelWithErrorBoundary path={modelPath} position={position} scale={[width, height, depth]} color={color} />
}

function GLBModelWithErrorBoundary({
  path,
  position,
  scale,
  color,
}: {
  path: string
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}) {
  const [hasError, setHasError] = useState(false)
  const gltf = useGLTF(path)

  useEffect(() => {
    fetch(path, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          setHasError(true)
        }
      })
      .catch(() => {
        setHasError(true)
      })
  }, [path])

  if (hasError) {
    return null
  }

  return <LoadedGLBModel gltf={gltf} position={position} scale={scale} color={color} />
}

function LoadedGLBModel({
  gltf,
  position,
  scale,
  color,
}: {
  gltf: any
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}) {
  const [clonedScene, setClonedScene] = useState<any>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!gltf?.scene || loadError) return

    try {
      const clone = gltf.scene.clone()

      clone.traverse((child) => {
        if ((child as any).isMesh) {
          const mesh = child as any
          if (mesh.material) {
            mesh.material = mesh.material.clone()
            mesh.material.color.set(color)
          }
        }
      })

      setClonedScene(clone)
    } catch (error) {
      console.log("[v0] Error processing GLB model:", error)
      setLoadError(true)
    }
  }, [gltf?.scene, color, loadError])

  if (loadError || !clonedScene) {
    return null
  }

  return <primitive object={clonedScene} position={position} scale={scale} castShadow receiveShadow />
}
