"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import type { ShelfConfig } from "@/lib/use-configurator"

interface UseConfigHistoryReturn {
  history: ShelfConfig[]
  historyIndex: number
  saveToHistory: (newConfig: ShelfConfig) => void
  undo: () => ShelfConfig | null
  redo: () => ShelfConfig | null
  canUndo: boolean
  canRedo: boolean
  resetHistory: (initialConfig?: ShelfConfig) => void
  setHistory: React.Dispatch<React.SetStateAction<ShelfConfig[]>>
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
  isUndoRedo: React.MutableRefObject<boolean>
}

export function useConfigHistory(initialConfig: ShelfConfig): UseConfigHistoryReturn {
  const [history, setHistory] = useState<ShelfConfig[]>([initialConfig])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedo = useRef(false)

  const saveToHistory = useCallback(
    (newConfig: ShelfConfig) => {
      if (isUndoRedo.current) {
        isUndoRedo.current = false
        return
      }
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        return [...newHistory, newConfig].slice(-50)
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 49))
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true
      const newIndex = historyIndex - 1
      const historyItem = history[newIndex]
      if (historyItem && historyItem.grid) {
        setHistoryIndex(newIndex)
        return historyItem
      } else {
        isUndoRedo.current = false
      }
    }
    return null
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true
      const newIndex = historyIndex + 1
      const historyItem = history[newIndex]
      if (historyItem && historyItem.grid) {
        setHistoryIndex(newIndex)
        return historyItem
      } else {
        isUndoRedo.current = false
      }
    }
    return null
  }, [historyIndex, history])

  const resetHistory = useCallback((newInitialConfig?: ShelfConfig) => {
    if (newInitialConfig) {
      setHistory([newInitialConfig])
    }
    setHistoryIndex(0)
  }, [])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return {
    history,
    historyIndex,
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    setHistory,
    setHistoryIndex,
    isUndoRedo,
  }
}
