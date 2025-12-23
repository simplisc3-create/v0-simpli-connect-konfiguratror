"use client"

import { useMemo } from "react"
import * as THREE from "three"

// Studio cyclorama - seamless curved backdrop like professional photo studios
export function StudioBackdrop() {
  const geometry = useMemo(() => {
    // Create a curved surface that goes from floor to back wall
    const shape = new THREE.Shape()

    // Start at floor front
    shape.moveTo(0, 0)
    // Flat floor section
    shape.lineTo(0, 8)
    // Curved transition (cove)
    shape.quadraticCurveTo(0, 12, 4, 12)
    // Straight wall section
    shape.lineTo(15, 12)
    // Top of wall
    shape.lineTo(15, 0)
    // Close shape
    shape.lineTo(0, 0)

    const extrudeSettings = {
      steps: 1,
      depth: 40,
      bevelEnabled: false,
    }

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geo.rotateX(-Math.PI / 2)
    geo.rotateY(Math.PI)
    geo.translate(0, 0, 20)

    return geo
  }, [])

  return (
    <mesh geometry={geometry} position={[0, -0.003, -6]} receiveShadow>
      <meshStandardMaterial color="#f0ebe5" roughness={1} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  )
}
