"use client"

import { Html } from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2, Palette, ArrowRightLeft } from "lucide-react"
import type { GridCell } from "@/lib/types"

const moduleTypes: { id: GridCell["type"]; label: string; icon: string }[] = [
  { id: "ohne-seitenwaende", label: "Offen", icon: "□" },
  { id: "ohne-rueckwand", label: "Ohne Rückwand", icon: "▢" },
  { id: "mit-rueckwand", label: "Mit Rückwand", icon: "▣" },
  { id: "mit-tueren", label: "Türen", icon: "▥" },
  { id: "mit-klapptuer", label: "Klapptür", icon: "▤" },
  { id: "mit-doppelschublade", label: "Schubladen", icon: "☰" },
  { id: "abschliessbare-tueren", label: "Abschließbar", icon: "🔒" },
]

const colors: { id: string; hex: string; label: string }[] = [
  { id: "white", hex: "#ffffff", label: "Weiß" },
  { id: "black", hex: "#1a1a1a", label: "Schwarz" },
  { id: "orange", hex: "#f97316", label: "Orange" },
  { id: "red", hex: "#ef4444", label: "Rot" },
  { id: "green", hex: "#22c55e", label: "Grün" },
  { id: "blue", hex: "#3b82f6", label: "Blau" },
  { id: "yellow", hex: "#eab308", label: "Gelb" },
]

type CellContextMenuProps = {
  position: [number, number, number]
  currentType: GridCell["type"]
  currentColor?: string
  onSelectType: (type: GridCell["type"]) => void
  onSelectColor: (color: string) => void
  onClear: () => void
  onClose: () => void
}

export function CellContextMenu({
  position,
  currentType,
  currentColor,
  onSelectType,
  onSelectColor,
  onClear,
  onClose,
}: CellContextMenuProps) {
  return (
    <Html position={position} center style={{ pointerEvents: "auto" }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative"
          style={{ transform: "translateY(-100%)" }}
        >
          <div
            className="rounded-xl border border-white/20 bg-black/90 p-3 shadow-2xl backdrop-blur-xl"
            style={{ minWidth: 280 }}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Modul bearbeiten</span>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Module Types */}
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                <ArrowRightLeft size={10} />
                <span>Modul-Typ</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {moduleTypes.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => onSelectType(module.id)}
                    className={`flex flex-col items-center rounded-lg p-2 transition-all ${
                      currentType === module.id
                        ? "bg-white/20 text-white ring-1 ring-white/40"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{module.icon}</span>
                    <span className="mt-0.5 text-[8px] leading-tight">{module.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                <Palette size={10} />
                <span>Farbe</span>
              </div>
              <div className="flex gap-1.5">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onSelectColor(color.hex)}
                    className={`group relative h-7 w-7 rounded-full transition-all hover:scale-110 ${
                      currentColor === color.hex ? "ring-2 ring-white ring-offset-2 ring-offset-black/90" : ""
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  >
                    {color.id === "white" && <span className="absolute inset-0 rounded-full border border-gray-300" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-white/10 pt-2">
              <button
                onClick={onClear}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/30"
              >
                <Trash2 size={12} />
                <span>Leeren</span>
              </button>
            </div>
          </div>

          {/* Arrow pointer */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -8,
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid rgba(0,0,0,0.9)",
            }}
          />
        </motion.div>
      </AnimatePresence>
    </Html>
  )
}
