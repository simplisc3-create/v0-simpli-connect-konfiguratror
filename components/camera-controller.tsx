"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsType } from "three-stdlib"
import type { ShelfConfig } from "./shelf-configurator"

type CameraControllerProps = {
  selectedCell: { row: number; col: number } | null
  config: ShelfConfig
  controlsRef: React.RefObject<OrbitControlsType | null>
}

export function CameraController({ selectedCell, config, controlsRef }: CameraControllerProps) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 1.2, 2.5))
  const targetLookAt = useRef(new THREE.Vector3(0, 0.4, 0))
  const isAnimating = useRef(false)
  const animationProgress = useRef(1)

  // Default camera position
  const defaultCameraPos = new THREE.Vector3(0, 1.2, 2.5)
  const defaultLookAt = new THREE.Vector3(0, 0.4, 0)

  useEffect(() => {
    if (selectedCell) {
      // Calculate cell position in 3D space
      const columnTubeOverlap = 0.003
      const rowTubeOverlap = 0.003

      // Calculate total width for centering
      let totalWidth = 0
      for (let col = 0; col < config.columns; col++) {
        totalWidth += config.columnWidths[col] / 100
        if (col > 0) totalWidth -= columnTubeOverlap
      }

      // Calculate X position of selected cell
      let xPos = 0
      for (let c = 0; c < selectedCell.col; c++) {
        xPos += config.columnWidths[c] / 100 - columnTubeOverlap
      }
      const colWidth = config.columnWidths[selectedCell.col] / 100
      const cellX = xPos + colWidth / 2 - totalWidth / 2

      // Calculate Y position of selected cell
      let yPos = 0
      for (let r = 0; r < selectedCell.row; r++) {
        yPos += config.rowHeights[r] / 100 - rowTubeOverlap
      }
      const rowHeight = config.rowHeights[selectedCell.row] / 100
      const cellY = yPos + rowHeight / 2

      // Set target camera position - closer and focused on the cell
      const zoomDistance = 1.2
      targetPosition.current.set(cellX + 0.3, cellY + 0.2, zoomDistance)
      targetLookAt.current.set(cellX, cellY, 0)

      isAnimating.current = true
      animationProgress.current = 0
    } else {
      // Return to default position when deselected
      targetPosition.current.copy(defaultCameraPos)
      targetLookAt.current.copy(defaultLookAt)
      isAnimating.current = true
      animationProgress.current = 0
    }
  }, [selectedCell, config.columns, config.columnWidths, config.rowHeights])

  useFrame((_, delta) => {
    if (!isAnimating.current) return

    // Smooth animation using lerp
    const speed = 3
    animationProgress.current = Math.min(animationProgress.current + delta * speed, 1)

    // Ease out cubic for smooth deceleration
    const t = 1 - Math.pow(1 - animationProgress.current, 3)

    // Interpolate camera position
    camera.position.lerp(targetPosition.current, t * 0.1)

    // Update orbit controls target for smooth look-at
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, t * 0.1)
      controlsRef.current.update()
    }

    // Check if animation is complete
    if (animationProgress.current >= 1) {
      const positionDiff = camera.position.distanceTo(targetPosition.current)
      if (positionDiff < 0.01) {
        isAnimating.current = false
      }
    }
  })

  return null
}

export default CameraController
