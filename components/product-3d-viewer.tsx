"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, Lightformer } from "@react-three/drei"
import { Suspense } from "react"
import { GLBModule } from "./glb-module-loader"
import type { Product } from "@/lib/simpli-products"
import type { GridCell } from "./shelf-configurator"
import * as THREE from "three"

interface Product3DViewerProps {
  product: Product
  className?: string
}

// Map product category to cell type for the GLB loader
function getCellTypeFromProduct(product: Product): GridCell["type"] {
  const category = product.category
  
  // Direct mappings
  const categoryToCellType: Record<string, GridCell["type"]> = {
    "schublade": "mit-doppelschublade",
    "einzelschublade": "mit-einzelschublade",
    "tuer": "mit-tueren",
    "klapptuer": "mit-klapptuer",
    "flaechenset": "mit-rueckwand",
    "flaechenset-glas": "mit-rueckwand",
  }

  if (categoryToCellType[category]) {
    return categoryToCellType[category]
  }

  // Check product name for hints
  const name = product.name.toLowerCase()
  if (name.includes("schublade")) return "mit-doppelschublade"
  if (name.includes("tür") || name.includes("tueren")) return "mit-tueren"
  if (name.includes("klappe") || name.includes("klapptuer")) return "mit-klapptuer"
  if (name.includes("rückwand") || name.includes("rueckwand")) return "mit-rueckwand"

  // Default fallback
  return "mit-rueckwand"
}

function getColorFromProduct(product: Product): string {
  if (product.color) {
    return product.color
  }

  // Extract color from product name
  const name = product.name.toLowerCase()
  if (name.includes("weiss") || name.includes("weiß")) return "weiss"
  if (name.includes("schwarz")) return "schwarz"
  if (name.includes("grau") || name.includes("grey")) return "grau"
  if (name.includes("blau") || name.includes("blue")) return "blau"
  if (name.includes("grün") || name.includes("gruen")) return "gruen"
  if (name.includes("gelb") || name.includes("yellow")) return "gelb"
  if (name.includes("orange")) return "orange"
  if (name.includes("rot") || name.includes("red")) return "rot"

  return "weiss" // Default
}

function getWidthFromProduct(product: Product): number {
  const size = product.size
  if (size === 40) return 0.4
  if (size === 80) return 0.8
  // Default to 80cm
  return 0.8
}

function Scene({ product }: { product: Product }) {
  const cellType = getCellTypeFromProduct(product)
  const color = getColorFromProduct(product)
  const width = getWidthFromProduct(product)
  const height = 0.4 // Standard 40cm height
  const depth = 0.38 // Standard depth

  // Create a minimal grid config for the GLB loader
  const gridConfig = {
    rows: 1,
    columns: 1,
    rowHeights: [40],
    columnWidths: [product.size || 80],
    grid: [[{ type: cellType, color } as GridCell]],
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[0.7, 0.35, 0.9]} fov={40} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={0.4}
        maxDistance={2.5}
        target={[0, 0.18, 0]}
      />

      {/* High-key studio lighting - very bright and even like professional product photography */}
      <ambientLight intensity={0.6} />
      
      {/* Main key light - soft and diffuse from top-front */}
      <directionalLight 
        position={[2, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color="#ffffff"
      />
      
      {/* Fill lights for even illumination */}
      <directionalLight position={[-4, 6, 3]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[4, 6, -2]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[0, 8, 0]} intensity={0.7} color="#ffffff" />

      {/* Professional HDRI Studio Environment - optimized for bright chrome */}
      <Environment resolution={256} background={false}>
        {/* Very large overhead softbox - creates bright, even illumination */}
        <Lightformer
          form="rect"
          intensity={4}
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[15, 15, 1]}
          color="#ffffff"
        />
        {/* Front fill - large and soft */}
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[0, 3, 6]}
          rotation={[0, Math.PI, 0]}
          scale={[12, 6, 1]}
          color="#ffffff"
        />
        {/* Left strip light - defines chrome edges */}
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[-6, 3, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 4, 1]}
          color="#ffffff"
        />
        {/* Right strip light */}
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[6, 3, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[10, 4, 1]}
          color="#ffffff"
        />
        {/* Back light for rim highlights */}
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[0, 2, -6]}
          rotation={[0, 0, 0]}
          scale={[12, 4, 1]}
          color="#f8f8f8"
        />
        {/* Floor bounce - brightens shadows */}
        <Lightformer
          form="rect"
          intensity={0.8}
          position={[0, -0.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[15, 15, 1]}
          color="#fafafa"
        />
      </Environment>

      <Suspense fallback={null}>
        <GLBModule
          position={[0, height / 2, 0]}
          cellType={cellType}
          width={width}
          height={height}
          depth={depth}
          color={color}
          row={0}
          col={0}
          gridConfig={gridConfig}
          isBottomModule={true}
        />
      </Suspense>

      {/* Clean studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#fafafa" roughness={0.95} metalness={0} />
      </mesh>

      {/* Soft contact shadows for photorealistic grounding */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.5}
        scale={2}
        blur={2.5}
        far={1.5}
        resolution={512}
        color="#1a1a1a"
      />
    </>
  )
}

export function Product3DViewer({ product, className }: Product3DViewerProps) {
  return (
    <div className={className}>
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ 
          antialias: true, 
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.3,
        }}
      >
        <color attach="background" args={["#f8f8f8"]} />
        <fog attach="fog" args={["#f8f8f8", 5, 15]} />
        <Scene product={product} />
      </Canvas>
    </div>
  )
}
