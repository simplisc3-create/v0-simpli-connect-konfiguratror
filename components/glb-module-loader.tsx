"use client"

import { useGLTF } from "@react-three/drei"
import { useMemo, Suspense } from "react"
import type { GridCell } from "./shelf-configurator"

type GLBModuleProps = {
  position: [number, number, number]
  cellType: GridCell["type"]
  cellColor?: GridCell["color"]
  width: number
  height: number
  depth: number
}

const COLOR_TO_MODEL_NAME: Record<string, string> = {
  weiss: "white",
  schwarz: "gray",
  blau: "blue",
  gruen: "green",
  gelb: "yellow",
  orange: "orange",
  rot: "red",
}

const CELL_TYPE_TO_CONFIG_40: Record<GridCell["type"], string | null> = {
  empty: null,
  "ohne-seitenwaende": "2-1",
  "ohne-rueckwand": "2-2",
  "mit-rueckwand": "2-3",
  "mit-tueren": "2-4",
  "mit-klapptuer": "2-5",
  "mit-doppelschublade": "2-6",
  "abschliessbare-tueren": "2-7",
}

const CELL_TYPE_TO_CONFIG_80: Record<GridCell["type"], string | null> = {
  empty: null,
  "ohne-seitenwaende": "1-1",
  "ohne-rueckwand": "1-2",
  "mit-rueckwand": "1-3",
  "mit-tueren": "1-4",
  "mit-klapptuer": "1-5",
  "mit-doppelschublade": "1-6",
  "abschliessbare-tueren": "1-7",
}

const AVAILABLE_COLORS_40: Record<string, string[]> = {
  "2-1": ["white", "gray", "orange", "green", "blue"],
  "2-2": ["white", "gray", "orange", "green", "blue"],
  "2-3": ["white", "gray", "orange", "green", "blue"],
  "2-4": ["white", "gray", "orange", "green", "blue"],
  "2-5": ["white", "gray", "orange", "green", "blue"],
  "2-6": ["white", "gray", "orange", "green", "blue"],
  "2-7": ["white", "gray", "orange", "green", "blue"],
}

const AVAILABLE_COLORS_80: Record<string, string[]> = {
  "1-1": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
  "1-2": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
  "1-3": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
  "1-4": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
  "1-5": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
  "1-6": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
  "1-7": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
  "1-8": ["white", "gray", "orange", "green", "blue", "red", "yellow"],
}

const VALID_MODELS = new Set([
  // 40x40x40 2-1 models (originally uploaded)
  "/models/40x40x40-2-1-white.glb",
  "/models/40x40x40-2-1-gray.glb",
  "/models/40x40x40-2-1-orange.glb",
  "/models/40x40x40-2-1-green.glb",
  "/models/40x40x40-2-1-blue.glb",
  // 40x40x40 2-2 models
  "/models/40x40x40-2-2-white.glb",
  "/models/40x40x40-2-2-gray.glb",
  "/models/40x40x40-2-2-orange.glb",
  "/models/40x40x40-2-2-green.glb",
  "/models/40x40x40-2-2-blue.glb",
  // 40x40x40 2-3 models
  "/models/40x40x40-2-3-white.glb",
  "/models/40x40x40-2-3-gray.glb",
  "/models/40x40x40-2-3-orange.glb",
  "/models/40x40x40-2-3-green.glb",
  "/models/40x40x40-2-3-blue.glb",
  // 40x40x40 2-4 models
  "/models/40x40x40-2-4-white.glb",
  "/models/40x40x40-2-4-gray.glb",
  "/models/40x40x40-2-4-orange.glb",
  "/models/40x40x40-2-4-green.glb",
  "/models/40x40x40-2-4-blue.glb",
  // 40x40x40 2-6 models (mit-doppelschublade) - uploaded via blob
  "/models/40x40x40-2-6-white.glb",
  "/models/40x40x40-2-6-orange.glb",
  "/models/40x40x40-2-6-green.glb",
  "/models/40x40x40-2-6-blue.glb",
  // 80x40x40 1-1 models (ohne-seitenwaende for 80cm width)
  "/models/80x40x40-1-1-white.glb",
  "/models/80x40x40-1-1-gray.glb",
  "/models/80x40x40-1-1-orange.glb",
  "/models/80x40x40-1-1-green.glb",
  "/models/80x40x40-1-1-blue.glb",
  "/models/80x40x40-1-1-red.glb",
  "/models/80x40x40-1-1-yellow.glb",
])

const FallbackBox = ({
  position,
  width,
  height,
  depth,
  color,
}: {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  color: string
}) => {
  const colorMap: Record<string, string> = {
    weiss: "#f5f5f5",
    schwarz: "#333333",
    blau: "#3b82f6",
    gruen: "#22c55e",
    gelb: "#eab308",
    orange: "#f97316",
    rot: "#ef4444",
  }

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[width * 0.95, height * 0.95, depth * 0.95]} />
      <meshStandardMaterial color={colorMap[color] || "#f5f5f5"} />
    </mesh>
  )
}

export const GLBModule = ({ position, cellType, cellColor = "weiss", width, height, depth }: GLBModuleProps) => {
  const widthCm = width * 100
  const modelPath = useMemo(() => getModelPath(cellType, cellColor, widthCm), [cellType, cellColor, widthCm])

  if (cellType === "empty") {
    return null
  }

  if (!modelPath) {
    return <FallbackBox position={position} width={width} height={height} depth={depth} color={cellColor} />
  }

  const is80cm = widthCm >= 60
  const baseModelWidth = is80cm ? 0.8 : 0.4
  const baseModelHeight = 0.4
  const baseModelDepth = 0.4

  const scaleX = width / baseModelWidth
  const scaleY = height / baseModelHeight
  const scaleZ = depth / baseModelDepth

  return (
    <Suspense
      fallback={<FallbackBox position={position} width={width} height={height} depth={depth} color={cellColor} />}
    >
      <LoadedGLBModel path={modelPath} position={position} scale={[scaleX, scaleY, scaleZ]} />
    </Suspense>
  )
}

const LoadedGLBModel = ({
  path,
  position,
  scale,
}: {
  path: string
  position: [number, number, number]
  scale: [number, number, number]
}) => {
  const { scene } = useGLTF(path)

  const clonedScene = useMemo(() => {
    if (!scene) return null

    const clone = scene.clone()
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  if (!clonedScene) {
    return null
  }

  return <primitive object={clonedScene} position={position} scale={scale} />
}

const getModelPath = (
  cellType: GridCell["type"],
  cellColor: GridCell["color"] = "weiss",
  widthCm: number,
): string | null => {
  const is80cm = widthCm >= 60

  const configMap = is80cm ? CELL_TYPE_TO_CONFIG_80 : CELL_TYPE_TO_CONFIG_40
  const colorMap = is80cm ? AVAILABLE_COLORS_80 : AVAILABLE_COLORS_40
  const modelPrefix = is80cm ? "80x40x40" : "40x40x40"

  const config = configMap[cellType]
  if (!config) return null

  let colorName = COLOR_TO_MODEL_NAME[cellColor] || "white"

  const availableColors = colorMap[config] || ["white"]
  if (!availableColors.includes(colorName)) {
    colorName = "white"
  }

  const path = `/models/${modelPrefix}-${config}-${colorName}.glb`

  if (!VALID_MODELS.has(path)) {
    return null // Will show fallback box instead
  }

  return path
}
