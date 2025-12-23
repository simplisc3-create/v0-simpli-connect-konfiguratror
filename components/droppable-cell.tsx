"use client"

import { useCallback, useState, type DragEvent, type ReactNode } from "react"
import { useDragDrop } from "./drag-drop-context"
import type { GridCell } from "./shelf-configurator"
import { cn } from "@/lib/utils"

type DroppableCellProps = {
  row: number
  col: number
  onDrop: (row: number, col: number, type: GridCell["type"], color?: GridCell["color"]) => void
  children: ReactNode
  className?: string
  isEmpty?: boolean
}

export function DroppableCell({ row, col, onDrop, children, className, isEmpty = true }: DroppableCellProps) {
  const { dragItem, setDragOverCell, dragOverCell, endDrag } = useDragDrop()
  const [isOver, setIsOver] = useState(false)

  const isCurrentTarget = dragOverCell?.row === row && dragOverCell?.col === col

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"

      if (!isOver) {
        setIsOver(true)
        setDragOverCell({ row, col })
      }
    },
    [row, col, setDragOverCell, isOver],
  )

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      // Only trigger if we're actually leaving this element
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setIsOver(false)
        setDragOverCell(null)
      }
    },
    [setDragOverCell],
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsOver(false)

      try {
        const data = e.dataTransfer.getData("text/plain")
        if (data) {
          const { type, color } = JSON.parse(data)
          onDrop(row, col, type, color)
        } else if (dragItem) {
          onDrop(row, col, dragItem.type, dragItem.color)
        }
      } catch {
        if (dragItem) {
          onDrop(row, col, dragItem.type, dragItem.color)
        }
      }

      endDrag()
    },
    [row, col, onDrop, dragItem, endDrag],
  )

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn("transition-all duration-150", isCurrentTarget && dragItem && "drag-over", className)}
    >
      {children}
    </div>
  )
}
