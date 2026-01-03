"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState } from "react"

type ShelfFrameProps = {
  position: [number, number, number]
  scale: [number, number, number]
  color?: string
}

const FRAME_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/80x40x40-1-8-blue_optimized.glb"

export function ShelfFrame({ position, scale, color = "#5B9BD5" }: ShelfFrameProps) {
  const [clonedScene, setClonedScene] = useState<any>(null)
  const [loadError, setLoadError] = useState(false)

  const gltf = useGLTF(FRAME_URL, undefined, undefined, (xhr: ProgressEvent) => {
    console.log("[v0] Frame loading progress:", ((xhr.loaded / xhr.total) * 100).toFixed(2) + "%")
  })

  useEffect(() => {
    if (!gltf?.scene || loadError) return

    try {
      const clone = gltf.scene.clone()

      // Color the frame structure
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
      console.error("[v0] Error processing frame model:", error)
      setLoadError(true)
    }
  }, [gltf?.scene, color, loadError])

  if (loadError || !clonedScene) {
    return null
  }

  return <primitive object={clonedScene} position={position} scale={scale} castShadow receiveShadow />
}
