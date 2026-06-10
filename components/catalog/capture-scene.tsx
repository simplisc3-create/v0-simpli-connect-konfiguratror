"use client"

import { Suspense, useMemo, useRef, useEffect } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import * as THREE from "three"
import { GLBModule } from "@/components/glb-module-loader"
import type { CatalogPreset, ViewKey } from "@/lib/catalog-data"

// -----------------------------------------------------------------------------
// Grid-Aufbau – identisch zur SimpliRegal3DPreview-Logik, damit Renderings
// exakt dem Konfigurator entsprechen.
// -----------------------------------------------------------------------------
function useModules(preset: CatalogPreset, color: string) {
  return useMemo(() => {
    const { columns, rows, columnWidths, rowHeights, grid } = preset
    const depth = 0.38
    const columnTubeOverlap = 0.003
    const rowTubeOverlap = 0.003

    const columnCenters: number[] = []
    let totalWidth = 0
    for (let col = 0; col < columns; col++) {
      const colWidth = columnWidths[col] / 100
      let xPos = 0
      for (let c = 0; c < col; c++) {
        xPos += columnWidths[c] / 100 - columnTubeOverlap
      }
      columnCenters.push(xPos + colWidth / 2)
      totalWidth += colWidth
      if (col > 0) totalWidth -= columnTubeOverlap
    }

    const rowCenters: number[] = []
    let totalHeight = 0
    for (let row = 0; row < rows; row++) {
      const rowHeight = rowHeights[row] / 100
      let yPos = 0
      for (let r = 0; r < row; r++) {
        yPos += rowHeights[r] / 100 - rowTubeOverlap
      }
      rowCenters.push(yPos + rowHeight / 2)
      totalHeight += rowHeight
      if (row > 0) totalHeight -= rowTubeOverlap
    }

    const offsetX = -totalWidth / 2

    const modules: Array<{
      key: string
      position: [number, number, number]
      cellType: string
      width: number
      height: number
      row: number
      col: number
      isBottomModule: boolean
    }> = []

    grid.forEach((rowCells, gridRow) => {
      rowCells.forEach((cell, gridCol) => {
        if (cell.type === "empty" || cell.type === "ghost") return

        const cellWidth = columnWidths[gridCol] / 100
        const cellHeight = rowHeights[gridRow] / 100

        let zOffset = 0
        if (cell.type === "mit-doppelschublade" || cell.type === "abschliessbare-tueren") {
          zOffset = 0.01
        } else if (cell.type === "mit-rueckwand") {
          zOffset = -0.01
        }

        const position: [number, number, number] = [
          columnCenters[gridCol] + offsetX,
          rowCenters[gridRow],
          -depth / 2 + zOffset,
        ]

        const maxRowInColumn = grid.reduce((max, gridRowCells, rowIndex) => {
          if (
            gridRowCells[gridCol] &&
            gridRowCells[gridCol].type !== "empty" &&
            gridRowCells[gridCol].type !== "ghost"
          ) {
            return Math.max(max, rowIndex)
          }
          return max
        }, -1)
        const isBottomModule = gridRow === maxRowInColumn

        modules.push({
          key: `module-${gridRow}-${gridCol}`,
          position,
          cellType: cell.type,
          width: cellWidth,
          height: cellHeight,
          row: gridRow,
          col: gridCol,
          isBottomModule,
        })
      })
    })

    return { modules, totalWidth, totalHeight, depth }
  }, [preset, color])
}

// -----------------------------------------------------------------------------
// Kamera-Positionierung für 4 Ansichten
// -----------------------------------------------------------------------------
function computeCamera(
  view: ViewKey,
  totalWidth: number,
  totalHeight: number,
  depth: number,
): { position: [number, number, number]; target: [number, number, number] } {
  const targetY = totalHeight / 2
  const target: [number, number, number] = [0, targetY, 0]

  const maxDim = Math.max(totalWidth, totalHeight, depth)
  const dist = Math.max(1.6, maxDim * 1.55)

  switch (view) {
    case "front":
      return { position: [0, targetY, dist], target }
    case "back":
      return { position: [0, targetY, -dist], target }
    case "side":
      return { position: [dist, targetY, 0.0001], target }
    case "perspective":
    default:
      return { position: [dist * 0.72, targetY + totalHeight * 0.32 + 0.3, dist * 0.72], target }
  }
}

// -----------------------------------------------------------------------------
// Capture-Rig: läuft innerhalb EINES dauerhaften Canvas/WebGL-Kontexts.
// Bei jedem Wechsel von `captureKey` wird die Kamera neu gesetzt, einige Frames
// gerendert und anschließend das Canvas ausgelesen. So entsteht kein
// WebGL-Kontext-Verlust durch wiederholtes Mounten.
// -----------------------------------------------------------------------------
function CaptureRig({
  captureKey,
  position,
  target,
  settleFrames,
  onReady,
}: {
  captureKey: string
  position: [number, number, number]
  target: [number, number, number]
  settleFrames: number
  onReady: (key: string, dataUrl: string) => void
}) {
  const { camera, gl, scene } = useThree()
  const framesRef = useRef(0)
  const firedKeyRef = useRef<string | null>(null)

  // Bei neuem Job: Frame-Zähler zurücksetzen und Kamera positionieren.
  useEffect(() => {
    framesRef.current = 0
    camera.position.set(position[0], position[1], position[2])
    camera.lookAt(target[0], target[1], target[2])
    camera.updateProjectionMatrix()
  }, [captureKey, camera, position, target])

  useFrame(() => {
    if (firedKeyRef.current === captureKey) return
    camera.position.set(position[0], position[1], position[2])
    camera.lookAt(target[0], target[1], target[2])
    framesRef.current++
    if (framesRef.current >= settleFrames) {
      gl.render(scene, camera)
      try {
        const url = gl.domElement.toDataURL("image/png")
        firedKeyRef.current = captureKey
        onReady(captureKey, url)
      } catch (e) {
        console.log("[v0] capture toDataURL failed", e)
      }
    }
  })

  return null
}

export interface CaptureJobInput {
  jobId: string
  itemId: string
  preset: CatalogPreset
  colorGerman: string
  view: ViewKey
}

interface CaptureStudioCanvasProps {
  job: CaptureJobInput
  size?: number
  settleFrames?: number
  onCapture: (jobId: string, dataUrl: string) => void
}

// Dauerhafter Canvas – nur Inhalt (Modell/Farbe/Kamera) wechselt pro Job.
export function CaptureStudioCanvas({ job, size = 900, settleFrames = 14, onCapture }: CaptureStudioCanvasProps) {
  const { modules, totalWidth, totalHeight, depth } = useModules(job.preset, job.colorGerman)
  const cam = useMemo(
    () => computeCamera(job.view, totalWidth, totalHeight, depth),
    [job.view, totalWidth, totalHeight, depth],
  )

  const mockGridConfig = useMemo(
    () => ({
      width: 75 as const,
      height: 40 as const,
      sections: job.preset.columns,
      levels: job.preset.rows,
      material: "metal" as const,
      finish: "white" as const,
      grid: job.preset.grid,
      columns: job.preset.columns,
      rows: job.preset.rows,
      columnWidths: job.preset.columnWidths,
      rowHeights: job.preset.rowHeights,
    }),
    [job.preset],
  )

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        dpr={2}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          preserveDrawingBuffer: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: cam.position, fov: 32 }}
        frameloop="always"
      >
        <color attach="background" args={["#f4f4f5"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 6, 4]} intensity={0.5} />
        <directionalLight position={[-3, 4, -2]} intensity={0.25} />
        <Environment preset="studio" background={false} />

        <Suspense fallback={null}>
          {/* group keyed per Job, damit Modelle sauber neu aufgebaut werden */}
          <group key={`${job.itemId}-${job.colorGerman}`}>
            {modules.map(({ key, position, cellType, width, height, row, col, isBottomModule }) => (
              <GLBModule
                key={`${key}-${job.colorGerman}`}
                position={position}
                cellType={cellType as never}
                width={width}
                height={height}
                depth={depth}
                color={job.colorGerman as never}
                row={row}
                col={col}
                gridConfig={mockGridConfig as never}
                isBottomModule={isBottomModule}
              />
            ))}
          </group>
          <CaptureRig
            captureKey={job.jobId}
            position={cam.position}
            target={cam.target}
            settleFrames={settleFrames}
            onReady={onCapture}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
