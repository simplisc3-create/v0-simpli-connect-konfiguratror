"use client"

import type { ShelfElement } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

interface CompartmentEditorProps {
  element: ShelfElement | null
  onAddMiddleShelf: () => void
  onRemoveElement: () => void
}

export function CompartmentEditor({ element, onAddMiddleShelf, onRemoveElement }: CompartmentEditorProps) {
  return (
    <div className="bg-[#4a4a4a] text-white border-t border-[#2d2d2d] flex-1">
      <div className="p-4">
        <h4 className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3">Fach anpassen</h4>

        <div className="space-y-2">
          {/* Add middle shelf - only for shelf/surface types */}
          <button
            onClick={onAddMiddleShelf}
            disabled={!element || (element.type !== "shelf" && element.type !== "surface") || element.hasMiddleShelf}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              element && (element.type === "shelf" || element.type === "surface") && !element.hasMiddleShelf
                ? "bg-[#3d3d3d] hover:bg-[#555] text-white"
                : "bg-[#3d3d3d] text-[#666] cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            Zwischenboden hinzufügen
          </button>

          {/* Delete element */}
          <button
            onClick={onRemoveElement}
            disabled={!element}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              element
                ? "bg-[#3d3d3d] hover:bg-[#c0392b] text-[#e74c3c] hover:text-white"
                : "bg-[#3d3d3d] text-[#666] cursor-not-allowed"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Element löschen
          </button>
        </div>
      </div>
    </div>
  )
}
