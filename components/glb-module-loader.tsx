"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState, memo, useMemo, useRef } from "react"
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

// Global URL cache to prevent duplicate fetches
const urlCache = new Map<string, string>()

export const GLBModule = memo(
  function GLBModule({
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
    const cacheKey = useMemo(() => {
      const colorMap: Record<string, string> = {
        "#ffffff": "white",
        "#f5f5f5": "white",
        "#fafafa": "white",
        "#1f2937": "black",
        "#000000": "black",
        "#111827": "black",
        "#3b82f6": "blue",
        "#2563eb": "blue",
        "#1d4ed8": "blue",
        "#10b981": "green",
        "#059669": "green",
        "#047857": "green",
        "#eab308": "yellow",
        "#facc15": "yellow",
        "#f59e0b": "orange",
        "#ea580c": "orange",
        "#ef4444": "red",
        "#dc2626": "red",
        "#9ca3af": "gray",
        "#6b7280": "gray",
        "#4b5563": "anthrazit",
        "#374151": "anthrazit",
        "#f5f5dc": "beige",
        "#d2b48c": "beige",
      }
      const colorName = colorMap[color.toLowerCase()] || "white"
      const standardWidth = Math.round(width * 100) <= 50 ? 40 : 80
      return `${cellType}-${standardWidth}-${colorName}`
    }, [cellType, width, color])

    const [modelUrl, setModelUrl] = useState<string | null>(() => {
      if (explicitModelUrl) return explicitModelUrl
      return urlCache.get(cacheKey) || null
    })
    const [error, setError] = useState<string | null>(null)
    const fetchedRef = useRef(false)

    useEffect(() => {
      if (explicitModelUrl) {
        setModelUrl(explicitModelUrl)
        return
      }

      const cachedUrl = urlCache.get(cacheKey)
      if (cachedUrl) {
        setModelUrl(cachedUrl)
        return
      }

      if (cellType === "empty" || cellType === "ghost") return
      if (fetchedRef.current) return
      fetchedRef.current = true

      const fetchUrl = async () => {
        try {
          const colorMap: Record<string, string> = {
            "#ffffff": "white",
            "#f5f5f5": "white",
            "#fafafa": "white",
            "#1f2937": "black",
            "#000000": "black",
            "#111827": "black",
            "#3b82f6": "blue",
            "#2563eb": "blue",
            "#1d4ed8": "blue",
            "#10b981": "green",
            "#059669": "green",
            "#047857": "green",
            "#eab308": "yellow",
            "#facc15": "yellow",
            "#f59e0b": "orange",
            "#ea580c": "orange",
            "#ef4444": "red",
            "#dc2626": "red",
            "#9ca3af": "gray",
            "#6b7280": "gray",
            "#4b5563": "anthrazit",
            "#374151": "anthrazit",
            "#f5f5dc": "beige",
            "#d2b48c": "beige",
          }
          const colorName = colorMap[color.toLowerCase()] || "white"
          const standardWidth = Math.round(width * 100) <= 50 ? 40 : 80

          const params = new URLSearchParams({
            moduleType: cellType,
            width: standardWidth.toString(),
            height: "40",
            color: colorName,
          })

          const response = await fetch(`/api/blob-models?${params}`)
          const data = await response.json()

          if (!data.ok || !data.url) {
            throw new Error(data.error || "Failed to resolve model")
          }

          if (!data.url.startsWith("https://")) {
            throw new Error(`Invalid URL: ${data.url}`)
          }

          urlCache.set(cacheKey, data.url)
          setModelUrl(data.url)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      }

      fetchUrl()
    }, [cacheKey, explicitModelUrl, cellType, width, color])

    useEffect(() => {
      fetchedRef.current = false
    }, [cacheKey])

    if (cellType === "empty" || cellType === "ghost") return null
    if (error) {
      return (
        <mesh position={position}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial color="red" opacity={0.3} transparent />
        </mesh>
      )
    }
    if (!modelUrl) return null

    return <LoadedGLBModel modelUrl={modelUrl} position={position} moduleKey={`${row}-${col}`} />
  },
  (prev, next) =>
    prev.cellType === next.cellType &&
    prev.width === next.width &&
    prev.color === next.color &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2] &&
    prev.row === next.row &&
    prev.col === next.col,
)

const LoadedGLBModel = memo(
  function LoadedGLBModel({
    modelUrl,
    position,
    moduleKey,
  }: {
    modelUrl: string
    position: [number, number, number]
    moduleKey: string
  }) {
    const { scene } = useGLTF(modelUrl)

    const clonedScene = useMemo(() => {
      const clone = scene.clone()

      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Disable shadows completely
          child.castShadow = false
          child.receiveShadow = false

          // Remove vertex colors that might contain baked shadows
          if (child.geometry?.attributes?.color) {
            child.geometry.deleteAttribute("color")
          }

          if (child.material) {
            const oldMat = child.material as THREE.MeshStandardMaterial

            // Create unlit MeshBasicMaterial - no lighting influence at all
            const newMat = new THREE.MeshBasicMaterial({
              // Keep original texture if exists
              map: oldMat.map || null,
              // Keep original color
              color: oldMat.color ? oldMat.color.clone() : new THREE.Color(0xffffff),
              // Keep transparency settings
              transparent: oldMat.transparent || false,
              opacity: oldMat.opacity ?? 1,
              // Render both sides to avoid missing faces
              side: THREE.DoubleSide,
              // Proper depth handling to prevent z-fighting
              depthWrite: true,
              depthTest: true,
              polygonOffset: true,
              polygonOffsetFactor: 1,
              polygonOffsetUnits: 1,
              // No vertex colors (removes baked shadows)
              vertexColors: false,
            })

            child.material = newMat
          }
        }
      })

      return clone
    }, [scene])

    const rotation: [number, number, number] = [0, (3 * Math.PI) / 2, 0]

    return <primitive key={moduleKey} object={clonedScene} position={position} rotation={rotation} scale={1} />
  },
  (prev, next) =>
    prev.modelUrl === next.modelUrl &&
    prev.moduleKey === next.moduleKey &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2],
)
