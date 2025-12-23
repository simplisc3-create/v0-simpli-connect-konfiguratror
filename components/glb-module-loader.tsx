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

// For 80cm columns, we'll use fallback boxes instead until proper files are uploaded
const CELL_TYPE_TO_CONFIG_80: Record<GridCell["type"], string | null> = {
  empty: null,
  "ohne-seitenwaende": null, // Would be "1-1" but files not available
  "ohne-rueckwand": null,
  "mit-rueckwand": null,
  "mit-tueren": null,
  "mit-klapptuer": null,
  "mit-doppelschublade": null,
  "abschliessbare-tueren": null,
}

const AVAILABLE_COLORS_40: Record<string, string[]> = {
  "2-1": ["white", "gray", "orange", "green", "blue"],
  "2-2": ["white", "gray", "orange", "green", "blue"],
  "2-3": ["white", "gray", "orange", "green", "blue"],
  "2-4": ["white", "gray", "orange", "green", "blue"],
  "2-5": ["white", "gray", "orange", "green", "blue"],
  "2-6": ["white", "orange", "green", "blue"],
  "2-7": ["white", "gray", "orange", "green", "blue"],
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
  // 40x40x40 2-5 models (all colors now uploaded)
  "/models/40x40x40-2-5-white.glb",
  "/models/40x40x40-2-5-gray.glb",
  "/models/40x40x40-2-5-orange.glb",
  "/models/40x40x40-2-5-green.glb",
  "/models/40x40x40-2-5-blue.glb",
  // 40x40x40 2-6 models (mit-doppelschublade) - white, orange, green, blue
  "/models/40x40x40-2-6-white.glb",
  "/models/40x40x40-2-6-orange.glb",
  "/models/40x40x40-2-6-green.glb",
  "/models/40x40x40-2-6-blue.glb",
  // NOTE: 80x40x40 models NOT included - files were not properly uploaded from GitHub
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
      <meshStandardMaterial color={colorMap[color] || "#f5f5f5"} roughness={0.3} metalness={0.1} />
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

  const baseModelWidth = 0.4
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

  if (is80cm) {
    return null
  }

  const configMap = CELL_TYPE_TO_CONFIG_40
  const colorMap = AVAILABLE_COLORS_40
  const modelPrefix = "40x40x40"

  const config = configMap[cellType]
  if (!config) return null

  let colorName = COLOR_TO_MODEL_NAME[cellColor] || "white"

  const availableColors = colorMap[config] || ["white"]
  if (!availableColors.includes(colorName)) {
    colorName = "white" // Fallback to white if color not available
  }

  const path = `/models/${modelPrefix}-${config}-${colorName}.glb`

  if (!VALID_MODELS.has(path)) {
    return null // Will show fallback box instead
  }

  return path
}
