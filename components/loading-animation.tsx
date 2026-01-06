"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const COLORS = [
  "#FFFFFF", // weiss
  "#22C55E", // gruen
  "#3B82F6", // blau
  "#EAB308", // gelb
  "#F97316", // orange
  "#EF4444", // rot
]

const GRID_COLS = 4
const GRID_ROWS = 3
const TOTAL_CELLS = GRID_COLS * GRID_ROWS
const ANIMATION_DURATION = 3000 // 3 seconds total

export function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
  const [filledCells, setFilledCells] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const cellDelay = ANIMATION_DURATION / TOTAL_CELLS
    let currentCell = 0

    intervalRef.current = setInterval(() => {
      if (currentCell < TOTAL_CELLS) {
        setFilledCells((prev) => [...prev, currentCell])
        setProgress(((currentCell + 1) / TOTAL_CELLS) * 100)
        currentCell++
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current)
        // Wait a moment before completing
        setTimeout(onComplete, 500)
      }
    }, cellDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [onComplete])

  const getColorForCell = (index: number) => {
    return COLORS[index % COLORS.length]
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-zinc-950 font-bold text-xl">
            S
          </div>
          <span className="text-2xl font-semibold text-white">Simpli Connect</span>
        </div>
      </motion.div>

      {/* Animated Shelf Grid */}
      <div className="relative mb-8">
        {/* Frame outline */}
        <div className="absolute inset-0 border-2 border-zinc-600 rounded-sm" />

        {/* Grid */}
        <div
          className="grid gap-1 p-2"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            width: 280,
            height: 200,
          }}
        >
          {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
            const isFilled = filledCells.includes(index)
            const cellColor = getColorForCell(index)

            return (
              <motion.div key={index} className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1" }}>
                {/* Empty cell background */}
                <div className="absolute inset-0 bg-zinc-800 border border-zinc-700" />

                {/* Filled cell animation */}
                <AnimatePresence>
                  {isFilled && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="absolute inset-0 rounded-sm border-2"
                      style={{
                        backgroundColor: cellColor,
                        borderColor: "rgba(0,0,0,0.2)",
                      }}
                    >
                      {/* Inner shelf detail */}
                      <div
                        className="absolute inset-1 rounded-sm opacity-30"
                        style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                      />
                      {/* Shelf bottom line */}
                      <div
                        className="absolute bottom-1 left-1 right-1 h-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Frame legs */}
        <div className="absolute -bottom-4 left-2 w-1.5 h-4 bg-zinc-600 rounded-b" />
        <div className="absolute -bottom-4 right-2 w-1.5 h-4 bg-zinc-600 rounded-b" />
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Loading text */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-400 text-sm">
        Konfigurierung wird geladen...
      </motion.p>
    </div>
  )
}
