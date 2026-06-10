"use client"

import { Suspense, useMemo, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
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
// Bei jedem Wechsel von `captureKey` wird die Kamera gesetzt und nach einer
// kurzen Settle-Zeit (timer-basiert, damit Hintergrund-Tabs den RAF-Loop nicht
// drosseln) das Canvas ausgelesen. So entsteht kein WebGL-Kontext-Verlust.
// -----------------------------------------------------------------------------
function CaptureRig({
  captureKey,
  position,
  target,
  settleMs,
  expectedModules,
  onReady,
}: {
  captureKey: string
  position: [number, number, number]
  target: [number, number, number]
  settleMs: number
  expectedModules: number
  onReady: (key: string, dataUrl: string) => void
}) {
  const { camera, gl, scene } = useThree()

  useEffect(() => {
    let cancelled = false
    let pollId: ReturnType<typeof setTimeout> | null = null
    let settleId: ReturnType<typeof setTimeout> | null = null
    const startedAt = Date.now()

    const positionCamera = () => {
      camera.position.set(position[0], position[1], position[2])
      camera.lookAt(target[0], target[1], target[2])
      camera.updateProjectionMatrix()
    }

    const grab = () => {
      if (cancelled) return
      positionCamera()
      // Mehrere Render-Durchläufe für stabile Beleuchtung/Environment.
      gl.render(scene, camera)
      gl.render(scene, camera)
      try {
        const url = gl.domElement.toDataURL("image/png")
        onReady(captureKey, url)
      } catch (e) {
        console.log("[v0] capture toDataURL failed", e)
      }
    }

    // Warten bis die erwarteten GLB-Meshes geladen sind, dann kurz settlen.
    const waitForMeshes = () => {
      if (cancelled) return
      let meshCount = 0
      scene.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) meshCount++
      })
      const ready = meshCount >= Math.max(1, expectedModules)
      const timedOut = Date.now() - startedAt > 9000
      if (ready || timedOut) {
        settleId = setTimeout(grab, settleMs)
      } else {
        pollId = setTimeout(waitForMeshes, 120)
      }
    }

    positionCamera()
    waitForMeshes()

    return () => {
      cancelled = true
      if (pollId) clearTimeout(pollId)
      if (settleId) clearTimeout(settleId)
    }
  }, [captureKey, camera, gl, scene, position, target, settleMs, expectedModules, onReady])

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
  settleMs?: number
  onCapture: (jobId: string, dataUrl: string) => void
}

// Dauerhafter Canvas – nur Inhalt (Modell/Farbe/Kamera) wechselt pro Job.
export function CaptureStudioCanvas({ job, size = 900, settleMs = 150, onCapture }: CaptureStudioCanvasProps) {
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
        {/* Reines Licht-Setup ohne cross-origin HDR, damit das Canvas nicht
            "tainted" wird und toDataURL() zuverlässig funktioniert. */}
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffffff", "#d8d8dc", 0.7]} />
        <directionalLight position={[4, 8, 5]} intensity={1.1} />
        <directionalLight position={[-4, 5, -3]} intensity={0.5} />
        <directionalLight position={[0, 3, 6]} intensity={0.35} />

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
            settleMs={settleMs}
            expectedModules={modules.length}
            onReady={onCapture}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
