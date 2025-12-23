"use client"

import type React from "react"
import { useCallback } from "react"
import type { ShelfElement, ColorOption } from "@/lib/types"

interface ElementsSidebarProps {
  selectedColor: ColorOption
  onAddElement: (element: ShelfElement) => void
  hasFeet: boolean
  onToggleFeet: (hasFeet: boolean) => void
}

const SHELF_ELEMENTS: Omit<ShelfElement, "id" | "x" | "y" | "color">[] = [
  { type: "ladder", name: "Regalleiter 160 cm", price: 44.0, width: 20, height: 160 },
  { type: "ladder", name: "Regalleiter 120 cm", price: 36.0, width: 20, height: 120 },
  { type: "ladder", name: "Regalleiter 80 cm", price: 28.0, width: 20, height: 80 },
  { type: "shelf", name: "Flächenset 40 cm", price: 33.0, width: 120, height: 12 },
  { type: "shelf", name: "Flächenset 60 cm", price: 42.0, width: 180, height: 12 },
  { type: "surface", name: "Glasfläche 40 cm", price: 45.0, width: 120, height: 12 },
  { type: "surface", name: "Glasfläche 60 cm", price: 55.0, width: 180, height: 12 },
  { type: "box", name: "Schubkasten", price: 65.0, width: 100, height: 60 },
  { type: "box", name: "Tür klein", price: 55.0, width: 100, height: 60 },
  { type: "box", name: "Tür groß", price: 75.0, width: 100, height: 80 },
]

export function ElementsSidebar({ selectedColor, onAddElement, hasFeet, onToggleFeet }: ElementsSidebarProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent, element: Omit<ShelfElement, "id" | "x" | "y" | "color">) => {
      const newElement: ShelfElement = {
        ...element,
        id: "",
        x: 0,
        y: 0,
        color: selectedColor,
      }
      e.dataTransfer.setData("application/json", JSON.stringify(newElement))
      e.dataTransfer.effectAllowed = "copy"
    },
    [selectedColor],
  )

  const handleClick = useCallback(
    (element: Omit<ShelfElement, "id" | "x" | "y" | "color">) => {
      const newElement: ShelfElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        x: 100,
        y: 50,
        color: selectedColor,
      }
      onAddElement(newElement)
    },
    [selectedColor, onAddElement],
  )

  return (
    <div className="w-[200px] bg-[#2d2d2d] text-white flex flex-col overflow-hidden border-l border-[#1a1a1a]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#3d3d3d] border-b border-[#1a1a1a]">
        <h2 className="text-sm font-semibold">Simpli-Elemente</h2>
      </div>

      {/* Feet toggle */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#333]">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <span className="text-[#999]">Regalfüße:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onToggleFeet(true)}
              className={`px-2 py-0.5 rounded text-xs ${hasFeet ? "bg-[#0066b3] text-white" : "bg-[#555] text-[#999]"}`}
            >
              ||
            </button>
            <button
              onClick={() => onToggleFeet(false)}
              className={`px-2 py-0.5 rounded text-xs ${!hasFeet ? "bg-[#0066b3] text-white" : "bg-[#555] text-[#999]"}`}
            >
              -
            </button>
          </div>
        </label>
      </div>

      {/* Elements list */}
      <div className="flex-1 overflow-y-auto">
        {SHELF_ELEMENTS.map((element, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, element)}
            onClick={() => handleClick(element)}
            className="flex items-center gap-3 px-3 py-2 border-b border-[#1a1a1a] cursor-grab active:cursor-grabbing hover:bg-[#3d3d3d] transition-colors"
          >
            {/* Element preview icon */}
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              {element.type === "ladder" && (
                <div
                  className="rounded-sm"
                  style={{
                    width: "8px",
                    height: `${Math.min(element.height! / 5, 32)}px`,
                    backgroundColor: selectedColor.hex,
                    border: `1px solid ${selectedColor.border}`,
                  }}
                />
              )}
              {(element.type === "shelf" || element.type === "surface") && (
                <div
                  className="rounded-sm"
                  style={{
                    width: "32px",
                    height: "4px",
                    backgroundColor: element.type === "surface" ? "rgba(200,220,255,0.6)" : selectedColor.hex,
                    border: `1px solid ${element.type === "surface" ? "#8899bb" : selectedColor.border}`,
                  }}
                />
              )}
              {element.type === "box" && (
                <div
                  className="rounded-sm"
                  style={{
                    width: "24px",
                    height: "16px",
                    backgroundColor: selectedColor.hex,
                    border: `1px solid ${selectedColor.border}`,
                  }}
                />
              )}
            </div>

            {/* Element info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{element.name}</p>
              <p className="text-xs text-[#888]">{element.price.toFixed(2)} €</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
