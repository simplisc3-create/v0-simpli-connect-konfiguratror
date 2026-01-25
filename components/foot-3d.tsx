"use client"

import { memo, useMemo } from "react"
import * as THREE from "three"
import type { FootType } from "./shelf-configurator"

type FootProps = {
  position: [number, number, number]
  footType: FootType
}

// Shared materials for performance
const BLACK_PLASTIC_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#1a1a1a"),
  roughness: 0.8,
  metalness: 0.1,
})

const CHROME_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.92, 0.92, 0.94),
  metalness: 0.95,
  roughness: 0.08,
  envMapIntensity: 1.5,
})

const DARK_CHROME_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.3, 0.3, 0.32),
  metalness: 0.9,
  roughness: 0.15,
})

const RUBBER_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#222222"),
  roughness: 0.95,
  metalness: 0.0,
})

// Black plastic foot - simple cap design
const BlackPlasticFoot = memo(function BlackPlasticFoot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main cap body */}
      <mesh position={[0, 0.005, 0]} material={BLACK_PLASTIC_MATERIAL}>
        <cylinderGeometry args={[0.012, 0.014, 0.01, 16]} />
      </mesh>
      {/* Rounded top */}
      <mesh position={[0, 0.012, 0]} material={BLACK_PLASTIC_MATERIAL}>
        <sphereGeometry args={[0.012, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  )
})

// Caster wheel - swivel caster with wheel
const CasterFoot = memo(function CasterFoot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Mounting plate/stem */}
      <mesh position={[0, 0.035, 0]} material={CHROME_MATERIAL}>
        <cylinderGeometry args={[0.006, 0.006, 0.02, 12]} />
      </mesh>
      {/* Swivel housing */}
      <mesh position={[0, 0.022, 0]} material={CHROME_MATERIAL}>
        <cylinderGeometry args={[0.012, 0.01, 0.008, 16]} />
      </mesh>
      {/* Fork arms */}
      <mesh position={[0.008, 0.012, 0]} material={CHROME_MATERIAL}>
        <boxGeometry args={[0.003, 0.02, 0.006]} />
      </mesh>
      <mesh position={[-0.008, 0.012, 0]} material={CHROME_MATERIAL}>
        <boxGeometry args={[0.003, 0.02, 0.006]} />
      </mesh>
      {/* Wheel */}
      <mesh position={[0, 0.01, 0]} rotation={[0, 0, Math.PI / 2]} material={DARK_CHROME_MATERIAL}>
        <cylinderGeometry args={[0.01, 0.01, 0.008, 24]} />
      </mesh>
      {/* Wheel center cap */}
      <mesh position={[0.005, 0.01, 0]} rotation={[0, 0, Math.PI / 2]} material={BLACK_PLASTIC_MATERIAL}>
        <cylinderGeometry args={[0.006, 0.006, 0.002, 16]} />
      </mesh>
      <mesh position={[-0.005, 0.01, 0]} rotation={[0, 0, Math.PI / 2]} material={BLACK_PLASTIC_MATERIAL}>
        <cylinderGeometry args={[0.006, 0.006, 0.002, 16]} />
      </mesh>
    </group>
  )
})

// Chrome adjustable foot - leveling foot with threaded stem
const ChromeAdjustableFoot = memo(function ChromeAdjustableFoot({ position }: { position: [number, number, number] }) {
  // Create threaded appearance with rings
  const threadRings = useMemo(() => {
    const rings = []
    for (let i = 0; i < 8; i++) {
      rings.push(
        <mesh key={i} position={[0, 0.025 + i * 0.003, 0]} material={CHROME_MATERIAL}>
          <torusGeometry args={[0.004, 0.0008, 8, 16]} />
        </mesh>
      )
    }
    return rings
  }, [])

  return (
    <group position={position}>
      {/* Base plate - domed chrome */}
      <mesh position={[0, 0.003, 0]} material={CHROME_MATERIAL}>
        <cylinderGeometry args={[0.015, 0.016, 0.006, 24]} />
      </mesh>
      {/* Dome top */}
      <mesh position={[0, 0.007, 0]} material={CHROME_MATERIAL}>
        <sphereGeometry args={[0.015, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3]} />
      </mesh>
      {/* Hex nut */}
      <mesh position={[0, 0.015, 0]} rotation={[0, Math.PI / 6, 0]} material={CHROME_MATERIAL}>
        <cylinderGeometry args={[0.007, 0.007, 0.006, 6]} />
      </mesh>
      {/* Threaded stem */}
      <mesh position={[0, 0.035, 0]} material={CHROME_MATERIAL}>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 12]} />
      </mesh>
      {/* Thread rings for detail */}
      {threadRings}
    </group>
  )
})

// Main foot component that renders the correct type
export const Foot3D = memo(function Foot3D({ position, footType }: FootProps) {
  switch (footType) {
    case "casters":
      return <CasterFoot position={position} />
    case "chrome-adjustable":
      return <ChromeAdjustableFoot position={position} />
    case "black-plastic":
    default:
      return <BlackPlasticFoot position={position} />
  }
})

// Component to render all feet for a module
type ModuleFeetProps = {
  modulePosition: [number, number, number]
  moduleWidth: number
  moduleDepth: number
  footType: FootType
}

export const ModuleFeet = memo(function ModuleFeet({
  modulePosition,
  moduleWidth,
  moduleDepth,
  footType,
}: ModuleFeetProps) {
  // Calculate foot positions at the four corners of the module frame tubes
  // The GLB models are rotated 270deg (3*PI/2), so we need to account for that
  const footPositions = useMemo(() => {
    // Inset from frame tube edges
    const insetX = 0.015 // Inset from width edges
    const insetZ = 0.015 // Inset from depth edges
    
    const halfWidth = moduleWidth / 2 - insetX
    const halfDepth = moduleDepth / 2 - insetZ
    
    // Base Y is at ground level (y=0) since the module extends upward
    // The GLB model positions place the module center at the position
    // The bottom of the module frame is at modulePosition[1] - (moduleHeight/2)
    // For a 38/40cm row height, that's about 0.19m down from center
    const baseY = 0 // Ground level

    return [
      [modulePosition[0] - halfWidth, baseY, modulePosition[2] + halfDepth] as [number, number, number], // Front left
      [modulePosition[0] + halfWidth, baseY, modulePosition[2] + halfDepth] as [number, number, number], // Front right
      [modulePosition[0] - halfWidth, baseY, modulePosition[2] - halfDepth] as [number, number, number], // Back left
      [modulePosition[0] + halfWidth, baseY, modulePosition[2] - halfDepth] as [number, number, number], // Back right
    ]
  }, [modulePosition, moduleWidth, moduleDepth])

  return (
    <group>
      {footPositions.map((pos, index) => (
        <Foot3D key={`foot-${index}`} position={pos} footType={footType} />
      ))}
    </group>
  )
})

export default Foot3D
