"use client"

import { useState } from "react"
import type { ColorOption } from "@/lib/types"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ColorSelectorProps {
  colors: ColorOption[]
  specialColors: ColorOption[]
  selectedColor: ColorOption
  onSelectColor: (color: ColorOption) => void
}

export function ColorSelector({ colors, specialColors, selectedColor, onSelectColor }: ColorSelectorProps) {
  const [showSpecialColors, setShowSpecialColors] = useState(false)

  return (
    <div className="bg-[#4a4a4a] text-white border-t border-[#2d2d2d]">
      {/* Standard colors */}
      <div className="p-4 border-b border-[#555]">
        <h4 className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3">Farbe</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => onSelectColor(color)}
              className={`w-7 h-7 rounded transition-all ${
                selectedColor.id === color.id
                  ? "ring-2 ring-offset-2 ring-offset-[#4a4a4a] ring-white scale-110"
                  : "hover:scale-105"
              }`}
              style={{
                backgroundColor: color.hex,
                border: `2px solid ${color.border}`,
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Special colors */}
      <div className="p-4">
        <button
          onClick={() => setShowSpecialColors(!showSpecialColors)}
          className="flex items-center justify-between w-full text-xs font-semibold text-[#999] uppercase tracking-wide mb-3 hover:text-white transition-colors"
        >
          <span>Sonderfarbe</span>
          {showSpecialColors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSpecialColors && (
          <div className="flex flex-wrap gap-2">
            {specialColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onSelectColor(color)}
                className={`w-7 h-7 rounded transition-all ${
                  selectedColor.id === color.id
                    ? "ring-2 ring-offset-2 ring-offset-[#4a4a4a] ring-white scale-110"
                    : "hover:scale-105"
                }`}
                style={{
                  backgroundColor: color.hex,
                  border: `2px solid ${color.border}`,
                }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
