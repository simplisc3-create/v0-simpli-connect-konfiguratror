"use client"

import { useState, useCallback } from "react"
import { ConfiguratorCanvas } from "./configurator/configurator-canvas"
import { ElementsSidebar } from "./configurator/elements-sidebar"
import { InfoPanel } from "./configurator/info-panel"
import { HelpModal } from "./configurator/help-modal"
import { ColorSelector } from "./configurator/color-selector"
import { CompartmentEditor } from "./configurator/compartment-editor"
import { LoadingOverlay } from "./configurator/loading-overlay"
import { MobileWarning } from "./configurator/mobile-warning"
import type { ShelfElement, ShelfConfig, ColorOption } from "@/lib/types"

const COLORS: ColorOption[] = [
  { id: "white", name: "Weiß", hex: "#FFFFFF", border: "#cccccc" },
  { id: "black", name: "Schwarz", hex: "#1a1a1a", border: "#1a1a1a" },
  { id: "yellow", name: "Gelb", hex: "#f5c400", border: "#f5c400" },
  { id: "red", name: "Rot", hex: "#c41e3a", border: "#c41e3a" },
  { id: "blue", name: "Blau", hex: "#0066b3", border: "#0066b3" },
  { id: "green", name: "Grün", hex: "#2e8b57", border: "#2e8b57" },
]

const SPECIAL_COLORS: ColorOption[] = [
  { id: "rose", name: "Rosé", hex: "#e8b4b8", border: "#e8b4b8" },
  { id: "coral", name: "Koralle", hex: "#ff6f61", border: "#ff6f61" },
  { id: "turquoise", name: "Türkis", hex: "#40e0d0", border: "#40e0d0" },
  { id: "purple", name: "Violett", hex: "#7b68ee", border: "#7b68ee" },
  { id: "bronze", name: "Bronze", hex: "#cd7f32", border: "#cd7f32" },
  { id: "silver", name: "Silber", hex: "#c0c0c0", border: "#a0a0a0" },
  { id: "gold", name: "Gold", hex: "#d4af37", border: "#d4af37" },
  { id: "anthracite", name: "Anthrazit", hex: "#383838", border: "#383838" },
]

export function SimpliKonfigurator() {
  const [showHelp, setShowHelp] = useState(true)
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLORS[0])
  const [selectedElement, setSelectedElement] = useState<ShelfElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")

  const [shelfConfig, setShelfConfig] = useState<ShelfConfig>({
    elements: [],
    totalPrice: 0,
    hasFeet: false,
  })

  const [errors, setErrors] = useState<string[]>([])
  const [hints, setHints] = useState<string[]>([])

  const handleAddElement = useCallback((element: ShelfElement) => {
    setShelfConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, { ...element, id: `${element.type}-${Date.now()}` }],
      totalPrice: prev.totalPrice + element.price,
    }))
    setErrors([])
  }, [])

  const handleRemoveElement = useCallback((elementId: string) => {
    setShelfConfig((prev) => {
      const element = prev.elements.find((e) => e.id === elementId)
      return {
        ...prev,
        elements: prev.elements.filter((e) => e.id !== elementId),
        totalPrice: prev.totalPrice - (element?.price || 0),
      }
    })
    setSelectedElement(null)
  }, [])

  const handleSelectElement = useCallback((element: ShelfElement | null) => {
    setSelectedElement(element)
  }, [])

  const handleUpdateElement = useCallback((elementId: string, updates: Partial<ShelfElement>) => {
    setShelfConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((e) => (e.id === elementId ? { ...e, ...updates } : e)),
    }))
  }, [])

  const handleAddToCart = useCallback(() => {
    if (shelfConfig.elements.length === 0) {
      setErrors(["Bitte fügen Sie mindestens ein Element hinzu"])
      return
    }
    setLoadingMessage("Regal wird in den Warenkorb gelegt")
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert("Regal wurde in den Warenkorb gelegt!")
    }, 2000)
  }, [shelfConfig.elements.length])

  const handleToggleFeet = useCallback((hasFeet: boolean) => {
    setShelfConfig((prev) => ({
      ...prev,
      hasFeet,
      totalPrice: hasFeet ? prev.totalPrice + 24 : prev.totalPrice - 24,
    }))
  }, [])

  return (
    <>
      <MobileWarning />
      <div className="hidden md:flex h-screen overflow-hidden font-sans">
        {/* Left: Canvas area */}
        <div className="flex-1 bg-[#f0f0f0] relative">
          <ConfiguratorCanvas
            config={shelfConfig}
            selectedElement={selectedElement}
            selectedColor={selectedColor}
            onSelectElement={handleSelectElement}
            onRemoveElement={handleRemoveElement}
            onUpdateElement={handleUpdateElement}
            onAddElement={handleAddElement}
          />
        </div>

        {/* Right: Control panels */}
        <div className="w-[280px] bg-[#3d3d3d] flex flex-col border-l border-[#2d2d2d]">
          {/* Info Panel */}
          <InfoPanel
            selectedElement={selectedElement}
            errors={errors}
            hints={hints}
            totalPrice={shelfConfig.totalPrice}
            onAddToCart={handleAddToCart}
            onShowHelp={() => setShowHelp(true)}
          />

          {/* Color Selector */}
          <ColorSelector
            colors={COLORS}
            specialColors={SPECIAL_COLORS}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />

          {/* Compartment Editor - only when element selected */}
          <CompartmentEditor
            element={selectedElement}
            onAddMiddleShelf={() => {
              if (selectedElement) {
                handleUpdateElement(selectedElement.id, {
                  hasMiddleShelf: true,
                })
              }
            }}
            onRemoveElement={() => {
              if (selectedElement) {
                handleRemoveElement(selectedElement.id)
              }
            }}
          />
        </div>

        {/* Far right: Elements sidebar */}
        <ElementsSidebar
          selectedColor={selectedColor}
          onAddElement={handleAddElement}
          hasFeet={shelfConfig.hasFeet}
          onToggleFeet={handleToggleFeet}
        />
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </>
  )
}
