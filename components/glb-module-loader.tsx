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

const urlCache = new Map<string, string>()

const HEX_TO_COLOR_NAME: Record<string, string> = {
  "#ffffff": "white",
  "#f5f5f5": "white",
  "#fafafa": "white",
  "#1f2937": "black",
  "#000000": "black",
  "#111827": "black",
  "#1a1a1a": "black",
  "#3b82f6": "blue",
  "#2563eb": "blue",
  "#1d4ed8": "blue",
  "#00b4d8": "blue",
  "#10b981": "green",
  "#059669": "green",
  "#047857": "green",
  "#228b22": "green",
  "#eab308": "yellow",
  "#facc15": "yellow",
  "#fbbf24": "yellow",
  "#f59e0b": "orange",
  "#ea580c": "orange",
  "#f97316": "orange",
  "#ef4444": "red",
  "#dc2626": "red",
  "#b91c1c": "red",
  "#9ca3af": "gray",
  "#6b7280": "gray",
  "#4b5563": "anthrazit",
  "#374151": "anthrazit",
  "#f5f5dc": "beige",
  "#d2b48c": "beige",
}

const TARGET_COLORS: Record<string, THREE.Color> = {
  white: new THREE.Color(0.95, 0.95, 0.95),
  black: new THREE.Color(0.1, 0.1, 0.1),
  gray: new THREE.Color(0.6, 0.6, 0.6),
  anthrazit: new THREE.Color(0.25, 0.25, 0.28),
  blue: new THREE.Color(0.2, 0.5, 0.9),
  green: new THREE.Color(0.1, 0.7, 0.3),
  yellow: new THREE.Color(0.95, 0.85, 0.2),
  orange: new THREE.Color(0.95, 0.5, 0.1),
  red: new THREE.Color(0.9, 0.2, 0.2),
  beige: new THREE.Color(0.85, 0.75, 0.6),
}

function getColorName(hex: string): string {
  return HEX_TO_COLOR_NAME[hex.toLowerCase()] || "white"
}

function getStandardWidth(width: number): 40 | 80 {
  return Math.round(width * 100) <= 50 ? 40 : 80
}

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
    const colorName = useMemo(() => getColorName(color), [color])
    const standardWidth = useMemo(() => getStandardWidth(width), [width])
    const cacheKey = useMemo(() => `${cellType}-${standardWidth}-white`, [cellType, standardWidth])

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
          const params = new URLSearchParams({
            moduleType: cellType,
            width: standardWidth.toString(),
            height: "40",
            color: "white",
          })

          console.log(`[v0] Fetching GLB: ${cellType}, ${standardWidth}cm, white (will apply ${colorName})`)

          const response = await fetch(`/api/blob-models?${params}`)
          const data = await response.json()

          if (!data.ok || !data.url) {
            throw new Error(data.error || "Failed to resolve model")
          }

          if (!data.url.startsWith("https://")) {
            throw new Error(`Invalid URL: ${data.url}`)
          }

          console.log(`[v0] GLB URL resolved: ${data.url}`)
          urlCache.set(cacheKey, data.url)
          setModelUrl(data.url)
        } catch (err) {
          console.error(`[v0] GLB fetch error:`, err)
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      }

      fetchUrl()
    }, [cacheKey, explicitModelUrl, cellType, standardWidth, colorName])

    useEffect(() => {
      fetchedRef.current = false
    }, [cacheKey])

    if (cellType === "empty" || cellType === "ghost") return null

    if (error) {
      return (
        <mesh position={position}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial color="#ff0000" opacity={0.3} transparent />
        </mesh>
      )
    }

    if (!modelUrl) return null

    return (
      <LoadedGLBModel modelUrl={modelUrl} position={position} moduleKey={`${row}-${col}`} targetColor={colorName} />
    )
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
    targetColor,
  }: {
    modelUrl: string
    position: [number, number, number]
    moduleKey: string
    targetColor: string
  }) {
    const { scene } = useGLTF(modelUrl)

    const clonedScene = useMemo(() => {
      const clone = scene.clone(true)
      const targetColorValue = TARGET_COLORS[targetColor] || TARGET_COLORS.white

      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.frustumCulled = false

          // Fix geometry
          if (child.geometry) {
            if (!child.geometry.attributes.normal) {
              child.geometry.computeVertexNormals()
            }
            // Remove vertex colors to prevent interference
            if (child.geometry.attributes.color) {
              child.geometry.deleteAttribute("color")
            }
          }

          if (child.material) {
            const oldMat = child.material as THREE.MeshStandardMaterial
            const texture = oldMat.map || null

            // Wenn es eine Textur gibt, behalte sie und töne sie
            // Wenn nicht, verwende die Zielfarbe direkt
            let finalColor = targetColorValue.clone()

            // Für weiß: etwas heller machen
            if (targetColor === "white") {
              finalColor = new THREE.Color(0.98, 0.98, 0.98)
            }

            child.material = new THREE.MeshBasicMaterial({
              map: texture,
              color: finalColor,
              side: THREE.DoubleSide,
              toneMapped: false,
              depthWrite: true,
              depthTest: true,
              polygonOffset: true,
              polygonOffsetFactor: -1,
              polygonOffsetUnits: -1,
            })
          }
        }
      })

      return clone
    }, [scene, targetColor])

    return <primitive object={clonedScene} position={position} rotation={[0, (3 * Math.PI) / 2, 0]} scale={1} />
  },
  (prev, next) =>
    prev.modelUrl === next.modelUrl &&
    prev.moduleKey === next.moduleKey &&
    prev.targetColor === next.targetColor &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2],
)
