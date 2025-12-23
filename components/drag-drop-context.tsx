"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { GridCell } from "./shelf-configurator"

type DragItem = {
  type: GridCell["type"]
  color?: GridCell["color"]
  sourceCell?: { row: number; col: number }
}

type DragDropContextType = {
  dragItem: DragItem | null
  isDragging: boolean
  dragOverCell: { row: number; col: number } | null
  startDrag: (item: DragItem) => void
  endDrag: () => void
  setDragOverCell: (cell: { row: number; col: number } | null) => void
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [dragItem, setDragItem] = useState<DragItem | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ row: number; col: number } | null>(null)

  const startDrag = useCallback((item: DragItem) => {
    setDragItem(item)
  }, [])

  const endDrag = useCallback(() => {
    setDragItem(null)
    setDragOverCell(null)
  }, [])

  return (
    <DragDropContext.Provider
      value={{
        dragItem,
        isDragging: dragItem !== null,
        dragOverCell,
        startDrag,
        endDrag,
        setDragOverCell,
      }}
    >
      {children}
    </DragDropContext.Provider>
  )
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error("useDragDrop must be used within DragDropProvider")
  }
  return context
}
