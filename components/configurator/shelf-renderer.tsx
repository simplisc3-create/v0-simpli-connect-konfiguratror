"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import type { ShelfConfig, ShelfElement, ColorOption } from "@/lib/types"
import { Trash2 } from "lucide-react"

interface ShelfRendererProps {
  config: ShelfConfig
  selectedElement: ShelfElement | null
  selectedColor: ColorOption
  onSelectElement: (element: ShelfElement | null) => void
  onUpdateElement: (elementId: string, updates: Partial<ShelfElement>) => void
  onRemoveElement: (elementId: string) => void
}

export function ShelfRenderer({
  config,
  selectedElement,
  selectedColor,
  onSelectElement,
  onUpdateElement,
  onRemoveElement,
}: ShelfRendererProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, element: ShelfElement) => {
      e.preventDefault()
      e.stopPropagation()
      setDraggingId(element.id)
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      onSelectElement(element)
    },
    [onSelectElement],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingId || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y

      onUpdateElement(draggingId, { x: newX, y: newY })
    },
    [draggingId, dragOffset, onUpdateElement],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (draggingId && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const mouseY = e.clientY - containerRect.top

        // If dragged below the shelf area, delete
        if (mouseY > containerRect.height - 50) {
          onRemoveElement(draggingId)
        }
      }
      setDraggingId(null)
    },
    [draggingId, onRemoveElement],
  )

  const renderElement = (element: ShelfElement) => {
    const isSelected = selectedElement?.id === element.id
    const isDragging = draggingId === element.id
    const color = element.color || selectedColor

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x || 0}px`,
      top: `${element.y || 0}px`,
      cursor: isDragging ? "grabbing" : "grab",
      transition: isDragging ? "none" : "box-shadow 0.2s",
      zIndex: isDragging ? 100 : isSelected ? 50 : 1,
    }

    if (element.type === "ladder") {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            width: "24px",
            height: `${element.height || 160}px`,
          }}
          className={`${isSelected ? "ring-2 ring-[#0066b3] ring-offset-2" : ""} ${isDragging ? "opacity-80" : ""}`}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          {/* Ladder frame */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[4px] rounded-sm"
            style={{ backgroundColor: color.hex, border: `1px solid ${color.border}` }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-[4px] rounded-sm"
            style={{ backgroundColor: color.hex, border: `1px solid ${color.border}` }}
          />
          {/* Ladder rungs */}
          {Array.from({ length: Math.floor((element.height || 160) / 20) }).map((_, i) => (
            <div
              key={i}
              className="absolute left-[4px] right-[4px] h-[3px]"
              style={{
                top: `${(i + 1) * 20}px`,
                backgroundColor: color.hex,
                border: `1px solid ${color.border}`,
              }}
            />
          ))}
        </div>
      )
    }

    if (element.type === "shelf") {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            width: `${element.width || 120}px`,
            height: "16px",
            backgroundColor: color.hex,
            border: `2px solid ${color.border}`,
            borderRadius: "2px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          className={`${isSelected ? "ring-2 ring-[#0066b3] ring-offset-2" : ""} ${isDragging ? "opacity-80" : ""}`}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          {element.hasMiddleShelf && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[2px]"
              style={{ backgroundColor: color.border }}
            />
          )}
        </div>
      )
    }

    if (element.type === "surface") {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            width: `${element.width || 120}px`,
            height: "14px",
            backgroundColor: "rgba(200, 220, 255, 0.4)",
            border: "2px solid rgba(100, 140, 180, 0.6)",
            borderRadius: "2px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          className={`${isSelected ? "ring-2 ring-[#0066b3] ring-offset-2" : ""} ${isDragging ? "opacity-80" : ""}`}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        />
      )
    }

    if (element.type === "box") {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            width: `${element.width || 100}px`,
            height: `${element.height || 60}px`,
            backgroundColor: color.hex,
            border: `2px solid ${color.border}`,
            borderRadius: "3px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)",
          }}
          className={`${isSelected ? "ring-2 ring-[#0066b3] ring-offset-2" : ""} ${isDragging ? "opacity-80" : ""}`}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          {/* Drawer handle */}
          {element.name?.includes("Schub") && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[6px] rounded-full"
              style={{ backgroundColor: color.border, opacity: 0.6 }}
            />
          )}
          {/* Door handle */}
          {element.name?.includes("Tür") && (
            <div
              className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[4px] h-[20%] rounded-full"
              style={{ backgroundColor: color.border, opacity: 0.6 }}
            />
          )}
        </div>
      )
    }

    return null
  }

  if (config.elements.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-lg shadow-lg p-8"
      style={{ minWidth: "400px", minHeight: "300px" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Render all elements */}
      {config.elements.map(renderElement)}

      {/* Feet */}
      {config.hasFeet && config.elements.filter((e) => e.type === "ladder").length > 0 && (
        <div className="absolute bottom-4 left-8 right-8 flex gap-4">
          {config.elements
            .filter((e) => e.type === "ladder")
            .map((ladder) => (
              <div
                key={`foot-${ladder.id}`}
                className="w-6 h-4 rounded-b-md"
                style={{
                  backgroundColor: (ladder.color || selectedColor).hex,
                  border: `1px solid ${(ladder.color || selectedColor).border}`,
                  marginLeft: `${ladder.x || 0}px`,
                }}
              />
            ))}
        </div>
      )}

      {/* Delete zone indicator when dragging */}
      {draggingId && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#e74c3c]/10 border-2 border-dashed border-[#e74c3c] rounded flex items-center gap-2 text-[#e74c3c] text-sm">
          <Trash2 className="w-4 h-4" />
          <span>Hier ablegen zum Löschen</span>
        </div>
      )}
    </div>
  )
}
