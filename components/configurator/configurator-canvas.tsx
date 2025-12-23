"use client"

import type React from "react"
import { useRef, useState, useCallback } from "react"
import type { ShelfConfig, ShelfElement, ColorOption } from "@/lib/types"
import { ShelfRenderer } from "./shelf-renderer"

interface ConfiguratorCanvasProps {
  config: ShelfConfig
  selectedElement: ShelfElement | null
  selectedColor: ColorOption
  onSelectElement: (element: ShelfElement | null) => void
  onRemoveElement: (elementId: string) => void
  onUpdateElement: (elementId: string, updates: Partial<ShelfElement>) => void
  onAddElement: (element: ShelfElement) => void
}

export function ConfiguratorCanvas({
  config,
  selectedElement,
  selectedColor,
  onSelectElement,
  onRemoveElement,
  onUpdateElement,
  onAddElement,
}: ConfiguratorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      const elementData = e.dataTransfer.getData("application/json")
      if (elementData) {
        try {
          const element = JSON.parse(elementData) as ShelfElement
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) {
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            onAddElement({
              ...element,
              x,
              y,
              color: selectedColor,
            })
          }
        } catch (err) {
          console.error("Failed to parse element data", err)
        }
      }
    },
    [onAddElement, selectedColor],
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onSelectElement(null)
      }
    },
    [onSelectElement],
  )

  return (
    <div
      ref={canvasRef}
      className={`h-full w-full relative overflow-auto transition-colors ${dragOver ? "bg-[#e0e8f0]" : "bg-[#f0f0f0]"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d8d8d8 1px, transparent 1px),
            linear-gradient(to bottom, #d8d8d8 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Shelf renderer centered */}
      <div className="relative z-10 flex items-center justify-center min-h-full p-8">
        <ShelfRenderer
          config={config}
          selectedElement={selectedElement}
          selectedColor={selectedColor}
          onSelectElement={onSelectElement}
          onUpdateElement={onUpdateElement}
          onRemoveElement={onRemoveElement}
        />
      </div>

      {/* Drop zone indicator */}
      {dragOver && (
        <div className="absolute inset-4 border-2 border-dashed border-[#0066b3] rounded pointer-events-none flex items-center justify-center bg-[#0066b3]/5">
          <span className="bg-white text-[#0066b3] px-4 py-2 rounded font-medium shadow">Element hier ablegen</span>
        </div>
      )}

      {/* Empty state */}
      {config.elements.length === 0 && !dragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-[#666]">
            <p className="text-lg mb-2">Ziehen Sie Elemente hierher</p>
            <p className="text-sm">um Ihr Regal zu konfigurieren</p>
          </div>
        </div>
      )}
    </div>
  )
}
