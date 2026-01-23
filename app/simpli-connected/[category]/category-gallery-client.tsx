"use client"

import Link from "next/link"
import { ArrowLeft, Play, ImageIcon, Upload, Plus, Gamepad2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useState } from "react"

const ClassicTetris = dynamic(() => import("@/components/tetris/ClassicTetris").then((m) => m.ClassicTetris), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted rounded-2xl">
      <div className="text-muted-foreground">Spiel wird geladen...</div>
    </div>
  ),
})

// Placeholder media items - these will be replaced with actual uploads
const placeholderMedia = [
  { id: 1, type: "video" as const },
  { id: 2, type: "image" as const },
  { id: 3, type: "image" as const },
  { id: 4, type: "video" as const },
  { id: 5, type: "image" as const },
  { id: 6, type: "image" as const },
]

function VideoPlaceholder({ index }: { index: number }) {
  return (
    <div className="relative aspect-video bg-foreground rounded-xl overflow-hidden group cursor-pointer">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
        <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-3 group-hover:bg-primary-foreground/30 transition-colors">
          <Play className="w-8 h-8 ml-1" />
        </div>
        <span className="text-sm text-primary-foreground/60">Video {index}</span>
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="px-2 py-1 bg-primary-foreground/10 rounded text-xs text-primary-foreground/80">Video-Platzhalter</div>
      </div>
    </div>
  )
}

function ImagePlaceholder({ index }: { index: number }) {
  return (
    <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden group cursor-pointer">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="w-12 h-12 mb-3" />
        <span className="text-sm">Bild {index}</span>
      </div>
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
    </div>
  )
}

function UploadPlaceholder() {
  return (
    <div className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors cursor-pointer group">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium">Medien hinzufuegen</span>
        <span className="text-xs text-gray-400 mt-1">Videos oder Fotos</span>
      </div>
    </div>
  )
}

interface CategoryGalleryClientProps {
  category: string
  title: string
  description: string
}

export function CategoryGalleryClient({ category, title, description }: CategoryGalleryClientProps) {
  const [showTetris, setShowTetris] = useState(false)
  const isKinderzimmer = category === "kinderzimmer"

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/simpli-connected"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurueck zur Uebersicht</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl">{description}</p>
        </div>

        {/* Kinderzimmer Special: Tetris Game */}
        {isKinderzimmer && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Simpli Tetris</h2>
                  <p className="text-sm text-gray-500">Ein Spiel fuer die ganze Familie</p>
                </div>
              </div>
              <button
                onClick={() => setShowTetris(!showTetris)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Gamepad2 className="w-4 h-4" />
                {showTetris ? "Spiel ausblenden" : "Jetzt spielen"}
              </button>
            </div>

            {showTetris ? (
              <div className="bg-gray-50 rounded-2xl p-6">
                <ClassicTetris />
              </div>
            ) : (
              <div
                onClick={() => setShowTetris(true)}
                className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 cursor-pointer group overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded" />
                  <div className="absolute top-4 left-14 w-8 h-8 bg-blue-500 rounded" />
                  <div className="absolute top-14 left-4 w-8 h-8 bg-blue-500 rounded" />
                  <div className="absolute top-14 left-14 w-8 h-8 bg-blue-500 rounded" />
                  <div className="absolute top-24 right-8 w-8 h-8 bg-yellow-500 rounded" />
                  <div className="absolute top-24 right-18 w-8 h-8 bg-yellow-500 rounded" />
                  <div className="absolute top-34 right-8 w-8 h-8 bg-yellow-500 rounded" />
                  <div className="absolute top-34 right-18 w-8 h-8 bg-yellow-500 rounded" />
                  <div className="absolute bottom-8 left-1/3 w-8 h-8 bg-red-500 rounded" />
                  <div className="absolute bottom-8 left-1/3 ml-10 w-8 h-8 bg-red-500 rounded" />
                  <div className="absolute bottom-8 left-1/3 ml-20 w-8 h-8 bg-red-500 rounded" />
                  <div className="absolute bottom-8 left-1/3 ml-30 w-8 h-8 bg-red-500 rounded" />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                    <Gamepad2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Simpli Tetris</h3>
                  <p className="text-white/60 mb-6 max-w-md">
                    Klassisches Tetris im Simpli Connect Design. Stapeln Sie die Module und sammeln Sie Punkte!
                  </p>
                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Klicken zum Spielen</span>
                    <Play className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Featured Video Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Video</h2>
          <div className="max-w-4xl">
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <Play className="w-10 h-10 ml-1" />
                </div>
                <span className="text-white/60">Hauptvideo - Platzhalter</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/80">Video wird hier angezeigt</div>
                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/80 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Video hochladen
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Galerie</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
              <Upload className="w-4 h-4" />
              Medien hochladen
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {placeholderMedia.map((item, index) =>
              item.type === "video" ? (
                <VideoPlaceholder key={item.id} index={index + 1} />
              ) : (
                <ImagePlaceholder key={item.id} index={index + 1} />
              )
            )}
            <UploadPlaceholder />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Medien verwalten</h3>
          <p className="text-gray-600 mb-4">
            Laden Sie hier Videos und Fotos hoch, um Ihre {title}-Galerie zu gestalten. Unterstuetzte Formate: MP4, MOV,
            WebM fuer Videos und JPG, PNG, WebP fuer Bilder.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 border border-gray-200">
              Max. Videogroesse: 100MB
            </div>
            <div className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 border border-gray-200">
              Max. Bildgroesse: 10MB
            </div>
            <div className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 border border-gray-200">
              Empfohlene Aufloesung: 1920x1080
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
