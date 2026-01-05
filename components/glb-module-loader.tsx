"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect, useState, memo, useMemo, useRef } from "react"
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

const urlCache = new Map<string, string>()

const preloadingUrls = new Set<string>()

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
    const [modelUrl, setModelUrl] = useState<string | null>(() => {
      if (explicitModelUrl) return explicitModelUrl
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
        "#f59e0b": "orange",
        "#ef4444": "red",
      }
      const colorName = colorMap[color.toLowerCase()] || "white"
      const standardWidth = Math.round(width * 100) <= 50 ? 40 : 80
      const cacheKey = `${cellType}-${standardWidth}-${colorName}`
      return urlCache.get(cacheKey) || null
    })
    const [error, setError] = useState<string | null>(null)
    const mountedRef = useRef(true)

    const cacheKey = useMemo(() => {
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
        "#f59e0b": "orange",
        "#ef4444": "red",
      }
      const colorName = colorMap[color.toLowerCase()] || "white"
      const standardWidth = Math.round(width * 100) <= 50 ? 40 : 80
      return `${cellType}-${standardWidth}-${colorName}`
    }, [cellType, width, color])

    useEffect(() => {
      mountedRef.current = true
      return () => {
        mountedRef.current = false
      }
    }, [])

    useEffect(() => {
      if (explicitModelUrl) {
        if (explicitModelUrl.includes("/images/") || explicitModelUrl.startsWith("/")) {
          setError(`CRITICAL: Received local path URL: ${explicitModelUrl}`)
          return
        }
        setModelUrl(explicitModelUrl)
        return
      }

      const cachedUrl = urlCache.get(cacheKey)
      if (cachedUrl) {
        if (modelUrl !== cachedUrl) {
          setModelUrl(cachedUrl)
        }
        return
      }

      if (cellType === "empty" || cellType === "ghost") {
        return
      }

      const fetchBlobModels = async () => {
        try {
          setError(null)

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
            "#f59e0b": "orange",
            "#ef4444": "red",
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

          if (!mountedRef.current) return

          if (!data.ok) {
            throw new Error(data.details || data.error || "Failed to resolve model")
          }

          if (!data.url) {
            throw new Error(`No model URL returned for ${cellType}`)
          }

          if (data.url.includes("/images/") || data.url.startsWith("/")) {
            throw new Error(`CRITICAL: API returned local path URL: ${data.url}`)
          }

          if (!data.url.startsWith("https://")) {
            throw new Error(`CRITICAL: Received non-https URL: ${data.url}`)
          }

          urlCache.set(cacheKey, data.url)

          if (!preloadingUrls.has(data.url)) {
            preloadingUrls.add(data.url)
            useGLTF.preload(data.url)
          }

          if (mountedRef.current) {
            setModelUrl(data.url)
          }
        } catch (err) {
          if (!mountedRef.current) return
          const errorMsg = err instanceof Error ? err.message : "Unknown error"
          console.error("[v0] Error fetching GLB model:", errorMsg)
          setError(errorMsg)
        }
      }

      fetchBlobModels()
    }, [cacheKey, explicitModelUrl, cellType, width, color, modelUrl])

    if (cellType === "empty" || cellType === "ghost") {
      return null
    }

    if (error) {
      return (
        <group position={position}>
          <mesh>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="red" opacity={0.5} transparent />
          </mesh>
        </group>
      )
    }

    if (!modelUrl) {
      return (
        <group position={position}>
          <mesh>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#444" opacity={0.3} transparent />
          </mesh>
        </group>
      )
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.cellType === nextProps.cellType &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.color === nextProps.color &&
      prevProps.position[0] === nextProps.position[0] &&
      prevProps.position[1] === nextProps.position[1] &&
      prevProps.position[2] === nextProps.position[2] &&
      prevProps.row === nextProps.row &&
      prevProps.col === nextProps.col &&
      prevProps.modelUrl === nextProps.modelUrl
    )
  },
)

const LoadedGLBModel = memo(
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
    const { scene } = useGLTF(modelUrl)
    const clonedScene = useMemo(() => scene.clone(), [scene])

    const rotation: [number, number, number] = [0, (3 * Math.PI) / 2, 0]

    return <primitive object={clonedScene} position={position} scale={1} rotation={rotation} castShadow receiveShadow />
  },
  (prevProps, nextProps) => {
    return (
      prevProps.modelUrl === nextProps.modelUrl &&
      prevProps.position[0] === nextProps.position[0] &&
      prevProps.position[1] === nextProps.position[1] &&
      prevProps.position[2] === nextProps.position[2]
    )
  },
)
