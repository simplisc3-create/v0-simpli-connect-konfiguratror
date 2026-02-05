"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, useCallback, Suspense, useRef, memo } from "react"
import { ArrowLeft, ShoppingCart, Package, Check, Truck, RotateCcw, Award, ChevronRight, Grid3X3, Layers, Sparkles, Box, ChevronLeft, ChevronRight as ChevronRightIcon, Pause, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SimpliRegal3DPreview } from "@/components/simpli-regal-3d-preview"
import { useCartStore } from "@/lib/cart-store"
import { productsSimpliRegale } from "@/lib/simpli-products"
import { calculatePresetPrice } from "@/lib/price-calculator"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { GLBModule } from "@/components/glb-module-loader"
import * as THREE from "three"

const regal = productsSimpliRegale.find(r => r.id === "das-lowboard-klassik")!
const calculatedPrice = regal.preset ? calculatePresetPrice(regal.preset) : regal.price

// Environment presets for slideshow
const environments = [
  { name: "studio", label: "Studio" },
  { name: "apartment", label: "Apartment" },
  { name: "city", label: "City" },
  { name: "sunset", label: "Sunset" },
  { name: "dawn", label: "Dawn" },
  { name: "lobby", label: "Lobby" },
] as const

// Hero 3D Scene Component
const HeroRegalScene = memo(function HeroRegalScene({ 
  isHovered 
}: { 
  isHovered: boolean 
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Slow continuous rotation
      groupRef.current.rotation.y += delta * (isHovered ? 0.5 : 0.15)
    }
  })

  const preset = regal.preset
  if (!preset) return null

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
  for (let row = 0; row < rows; row++) {
    const rowHeight = rowHeights[row] / 100
    let yPos = 0
    for (let r = 0; r < row; r++) {
      yPos += rowHeights[r] / 100 - rowTubeOverlap
    }
    rowCenters.push(yPos + rowHeight / 2)
  }

  const offsetX = -totalWidth / 2

  const modules: Array<{
    key: string
    position: [number, number, number]
    cellType: string
    width: number
    height: number
    color: string
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
        if (gridRowCells[gridCol] && gridRowCells[gridCol].type !== "empty" && gridRowCells[gridCol].type !== "ghost") {
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
        color: "weiss",
        row: gridRow,
        col: gridCol,
        isBottomModule,
      })
    })
  })

  const mockGridConfig = {
    width: 75 as const,
    height: 40 as const,
    sections: columns,
    levels: rows,
    material: "metal" as const,
    finish: "white" as const,
    grid: grid,
    columns,
    rows,
    columnWidths: columnWidths as (75 | 38)[],
    rowHeights: rowHeights as (40 | 80 | 120 | 160 | 200)[],
  }

  return (
    <group ref={groupRef}>
      {modules.map(({ key, position, cellType, width, height, color, row, col, isBottomModule }) => (
        <GLBModule
          key={key}
          position={position}
          cellType={cellType as any}
          width={width}
          height={height}
          depth={depth}
          color={color as any}
          row={row}
          col={col}
          gridConfig={mockGridConfig}
          isBottomModule={isBottomModule}
        />
      ))}
    </group>
  )
})

export default function DasLowboardKlassikProductPage() {
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<"features" | "specs">("features")
  const { addItem } = useCartStore()
  const [currentEnv, setCurrentEnv] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  const nextEnv = useCallback(() => {
    setCurrentEnv((prev) => (prev + 1) % environments.length)
  }, [])

  const prevEnv = useCallback(() => {
    setCurrentEnv((prev) => (prev - 1 + environments.length) % environments.length)
  }, [])

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
    // Delay canvas ready to ensure smooth mount
    const timer = setTimeout(() => setCanvasReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Auto-cycle environments
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(nextEnv, 6000)
    return () => clearInterval(interval)
  }, [isPlaying, nextEnv])

  const handleAddToCart = () => {
    addItem({ id: regal.id, name: regal.name, artNr: regal.artNr, price: calculatedPrice })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const specs = [
    { label: "Breite gesamt", value: `${regal.cols * regal.width} cm` },
    { label: "Höhe gesamt", value: `${regal.rows * 40} cm` },
    { label: "Tiefe", value: "40 cm" },
    { label: "Spalten", value: `${regal.cols}` },
    { label: "Ebenen", value: `${regal.rows}` },
    { label: "Modulbreite", value: `${regal.width} cm` },
    { label: "Material Rahmen", value: "Verchromter Stahl" },
  ]

  const features = [
    { icon: Grid3X3, title: `${regal.rows}x${regal.cols} Raster`, description: `${regal.rows} Ebene, ${regal.cols} Spalten` },
    { icon: Layers, title: "Komplett-Set", description: "Inkl. Leiter & Stangen" },
    { icon: Sparkles, title: "Premium Qualität", description: "Hochwertige Verarbeitung" },
    { icon: Box, title: "Modular", description: "Erweiterbar & anpassbar" },
  ]

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Zurück zum Shop</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center"><span className="text-white font-bold text-sm">S</span></div>
              <span className="text-xl font-bold text-gray-900">Simpli Connect</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Fullscreen Hero with 3D Model */}
      <section 
        className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 3D Canvas with Real GLB Model */}
        {canvasReady && (
          <Canvas
            dpr={[1, 2]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
              alpha: true,
              powerPreference: "high-performance",
            }}
            camera={{ position: [0, 0.25, 2.2], fov: 35 }}
            className="absolute inset-0"
          >
            <color attach="background" args={["#f8f9fa"]} />
            
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-3, 4, 2]} intensity={0.3} />
            <spotLight position={[0, 10, 0]} intensity={0.4} angle={0.5} penumbra={1} />
            
            <Environment preset={environments[currentEnv].name} background={false} />

            <Suspense fallback={null}>
              <HeroRegalScene isHovered={isHovered} />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
              target={[0, 0.2, 0]}
              autoRotate={false}
            />
          </Canvas>
        )}

        {/* Loading State */}
        {!canvasReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-gray-600 font-medium">3D Modell wird geladen...</span>
            </div>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
            <Badge className="bg-gray-900/80 backdrop-blur-sm text-white border-gray-700 px-4 py-1.5 text-sm font-medium mb-4">
              SIMPLI REGAL KOLLEKTION
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-gray-900 leading-tight mb-4">
              {regal.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mb-8">
              {regal.subtitle} - Zeitlose Eleganz in ihrer pursten Form.
            </p>
            <div className="flex flex-wrap gap-4 pointer-events-auto">
              <Button 
                size="lg" 
                className="bg-gray-900 text-white hover:bg-gray-800 gap-2 text-base px-8 py-6 font-semibold shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                {calculatedPrice.toFixed(2)} EUR - Kaufen
              </Button>
              <Link href="/konfigurator?preset=das-lowboard-klassik">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-100 bg-white/80 backdrop-blur-sm gap-2 text-base px-8 py-6 font-semibold"
                >
                  <Package className="w-5 h-5" />
                  Anpassen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Environment Label */}
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 shadow-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Umgebung</span>
          <p className="text-sm font-semibold text-gray-900">{environments[currentEnv].label}</p>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 right-4 sm:right-8 flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm flex items-center justify-center transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-gray-700" /> : <Play className="w-4 h-4 text-gray-700" />}
          </button>
          <button
            onClick={prevEnv}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm flex items-center justify-center transition-colors"
            aria-label="Vorherige Umgebung"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={nextEnv}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm flex items-center justify-center transition-colors"
            aria-label="Nächste Umgebung"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Environment Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {environments.map((env, index) => (
            <button
              key={env.name}
              onClick={() => setCurrentEnv(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentEnv ? "bg-gray-900 w-8" : "bg-gray-400 hover:bg-gray-600"
              }`}
              aria-label={`Umgebung: ${env.label}`}
            />
          ))}
        </div>

        {/* Interaction Hint */}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm text-xs text-gray-600">
          Ziehen zum Drehen
        </div>
      </section>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-teal-600 transition-colors">Home</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link href="/shop" className="hover:text-teal-600 transition-colors">Shop</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link href="/shop#simpli-regale" className="hover:text-teal-600 transition-colors">Simpli Regale</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-gray-900 font-medium">{regal.name}</li>
        </ol>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="relative">
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-teal-600 text-white border-0 px-3 py-1.5 text-xs font-semibold tracking-wide">SIMPLI REGAL</Badge>
            </div>
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
              <SimpliRegal3DPreview regal={regal} className="w-full h-full" />
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-gray-500 font-mono">{regal.artNr}</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mt-2 text-balance">{regal.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{regal.subtitle}</p>
            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-5xl font-bold text-gray-900">{calculatedPrice.toFixed(2)}</span>
              <span className="text-2xl text-gray-500">EUR</span>
            </div>
            <p className="text-sm text-gray-500">inkl. MwSt. zzgl. Versand</p>
            <p className="text-gray-600 leading-relaxed mt-6 text-lg">{regal.description}</p>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Enthaltene Module</h3>
              <div className="flex flex-wrap gap-2">
                {regal.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium">{feature}</span>
                ))}
              </div>
            </div>

            <Separator className="my-8 bg-gray-200" />

            <div className="space-y-4">
              <Button size="lg" className={`w-full gap-3 text-lg py-7 font-semibold transition-all ${added ? "bg-green-600 hover:bg-green-600" : "bg-gray-900 hover:bg-gray-800"}`} onClick={handleAddToCart}>
                {added ? (<><Check className="w-6 h-6" />Hinzugefügt!</>) : (<><ShoppingCart className="w-6 h-6" />In den Warenkorb - {calculatedPrice.toFixed(2)} EUR</>)}
              </Button>
              <Link href="/konfigurator?preset=das-lowboard-klassik" className="block">
                <Button variant="outline" size="lg" className="w-full gap-2 py-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent">
                  <Package className="w-5 h-5" />Im Konfigurator anpassen
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50"><Truck className="w-6 h-6 text-gray-700 mb-2" /><span className="text-xs font-medium text-gray-700">Kostenloser Versand</span><span className="text-xs text-gray-500">ab 100 EUR</span></div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50"><RotateCcw className="w-6 h-6 text-gray-700 mb-2" /><span className="text-xs font-medium text-gray-700">30 Tage</span><span className="text-xs text-gray-500">Rückgaberecht</span></div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50"><Award className="w-6 h-6 text-gray-700 mb-2" /><span className="text-xs font-medium text-gray-700">Premium</span><span className="text-xs text-gray-500">Qualität</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 mb-12">
            <button onClick={() => setActiveTab("features")} className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transition-all ${activeTab === "features" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>Eigenschaften</button>
            <button onClick={() => setActiveTab("specs")} className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transition-all ${activeTab === "specs" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>Technische Daten</button>
          </div>
          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-gray-900 flex items-center justify-center mb-6"><feature.icon className="w-7 h-7 text-white" /></div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "specs" && (
            <div className="max-w-2xl mx-auto bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {specs.map((spec, index) => (<div key={index} className="flex items-center justify-between px-6 py-5"><span className="text-gray-600">{spec.label}</span><span className="font-semibold text-gray-900">{spec.value}</span></div>))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">2026 Simpli Connect. Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Home</Link>
              <Link href="/shop" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Shop</Link>
              <Link href="/konfigurator" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Konfigurator</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
