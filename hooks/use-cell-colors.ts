"use client"

import type React from "react"

import { useCallback } from "react"
import type { ShelfConfig, ColorKey, CellStyles } from "@/lib/use-configurator"
import { getCellId } from "@/lib/grid-utils"

interface UseCellColorsReturn {
  applyCellColor: (row: number, col: number, color: ColorKey) => void
  applyColorToRow: (row: number, color: ColorKey) => void
  applyColorToColumn: (col: number, color: ColorKey) => void
  applyColorToAll: (color: ColorKey) => void
  clearCellColor: (row: number, col: number) => void
}

export function useCellColors(
  setConfig: React.Dispatch<React.SetStateAction<ShelfConfig>>,
  saveToHistory: (config: ShelfConfig) => void,
): UseCellColorsReturn {
  const applyCellColor = useCallback(
    (row: number, col: number, color: ColorKey) => {
      setConfig((prev) => {
        const cellId = getCellId(row, col)
        const newCellStyles = { ...(prev.cellStyles || {}), [cellId]: { color } }

        // Also update the grid cell's color for BOM calculation
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [setConfig, saveToHistory],
  )

  const applyColorToRow = useCallback(
    (row: number, color: ColorKey) => {
      setConfig((prev) => {
        const newCellStyles = { ...(prev.cellStyles || {}) }
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && cell.type !== "empty" && cell.type !== "ghost") {
              const cellId = getCellId(ri, ci)
              newCellStyles[cellId] = { color }
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [setConfig, saveToHistory],
  )

  const applyColorToColumn = useCallback(
    (col: number, color: ColorKey) => {
      setConfig((prev) => {
        const newCellStyles = { ...(prev.cellStyles || {}) }
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ci === col && cell.type !== "empty" && cell.type !== "ghost") {
              const cellId = getCellId(ri, ci)
              newCellStyles[cellId] = { color }
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [setConfig, saveToHistory],
  )

  const applyColorToAll = useCallback(
    (color: ColorKey) => {
      setConfig((prev) => {
        const newCellStyles: CellStyles = {}
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (cell.type !== "empty" && cell.type !== "ghost") {
              const cellId = getCellId(ri, ci)
              newCellStyles[cellId] = { color }
              return { ...cell, color }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [setConfig, saveToHistory],
  )

  const clearCellColor = useCallback(
    (row: number, col: number) => {
      setConfig((prev) => {
        const cellId = getCellId(row, col)
        const newCellStyles = { ...(prev.cellStyles || {}) }
        delete newCellStyles[cellId]

        // Revert to default color (weiss)
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return { ...cell, color: "weiss" as ColorKey }
            }
            return cell
          }),
        )

        const newConfig = { ...prev, cellStyles: newCellStyles, grid: newGrid }
        setTimeout(() => saveToHistory(newConfig), 0)
        return newConfig
      })
    },
    [setConfig, saveToHistory],
  )

  return {
    applyCellColor,
    applyColorToRow,
    applyColorToColumn,
    applyColorToAll,
    clearCellColor,
  }
}
