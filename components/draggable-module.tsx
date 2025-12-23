"use client"

import { useCallback, type DragEvent, type ReactNode } from "react"
import { useDragDrop } from "./drag-drop-context"
import type { GridCell } from "./shelf-configurator"
import { cn } from "@/lib/utils"

type DraggableModuleProps = {
  moduleType: GridCell["type"]
  color?: GridCell["color"]
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function DraggableModule({ moduleType, color, children, className, disabled = false }: DraggableModuleProps) {
  const { startDrag, endDrag, isDragging } = useDragDrop()

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) {
        e.preventDefault()
        return
      }

      e.dataTransfer.effectAllowed = "copy"
      e.dataTransfer.setData("text/plain", JSON.stringify({ type: moduleType, color }))

      startDrag({ type: moduleType, color })

      // Add visual feedback
      const target = e.currentTarget
      setTimeout(() => {
        target.classList.add("dragging")
      }, 0)
    },
    [moduleType, color, startDrag, disabled],
  )

  const handleDragEnd = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove("dragging")
      endDrag()
    },
    [endDrag],
  )

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "draggable transition-all",
        disabled && "opacity-50 cursor-not-allowed",
        isDragging && "scale-95",
        className,
      )}
    >
      {children}
    </div>
  )
}
