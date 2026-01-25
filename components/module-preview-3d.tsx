"use client"
import { memo } from "react"
import type { ModuleType, WidthKey } from "@/lib/glb-registry"
import { colorHexMap } from "@/lib/simpli-products"
import type { ColorKey } from "./shelf-configurator"

type ModulePreview3DProps = {
  moduleType: ModuleType
  width?: WidthKey
  className?: string
  color?: ColorKey
}

// Module icon mapping - using simple SVG icons instead of heavy 3D Canvas
const moduleIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "offenes-fach": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="16" fill="none" stroke="#9ca3af" strokeWidth="0.5" rx="0.5" />
      </svg>
    ),
    label: "Offen",
  },
  "ohne-seitenwaende": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <line x1="2" y1="12" x2="30" y2="12" stroke="#9ca3af" strokeWidth="0.5" />
      </svg>
    ),
    label: "Ohne Seiten",
  },
  "ohne-rueckwand": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="6" y="6" width="20" height="12" fill="none" stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="2 1" />
      </svg>
    ),
    label: "Ohne Rück",
  },
  "mit-rueckwand": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="6" y="6" width="20" height="12" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
      </svg>
    ),
    label: "Mit Rück",
  },
  "mit-tueren": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="11" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <rect x="17" y="4" width="11" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <circle cx="13" cy="12" r="1" fill="#6b7280" />
        <circle cx="19" cy="12" r="1" fill="#6b7280" />
      </svg>
    ),
    label: "Mit Türen",
  },
  "mit-klapptuer": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <line x1="16" y1="18" x2="16" y2="20" stroke="#6b7280" strokeWidth="1" />
      </svg>
    ),
    label: "Klapptür",
  },
  "mit-klapptuer-oben": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <line x1="16" y1="4" x2="16" y2="6" stroke="#6b7280" strokeWidth="1" />
      </svg>
    ),
    label: "Klapptür oben",
  },
  "mit-doppelschublade": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="7" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <rect x="4" y="13" width="24" height="7" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <line x1="12" y1="7" x2="20" y2="7" stroke="#6b7280" strokeWidth="1" />
        <line x1="12" y1="16" x2="20" y2="16" stroke="#6b7280" strokeWidth="1" />
      </svg>
    ),
    label: "Schubladen",
  },
  "mit-einzelschublade": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="8" width="24" height="8" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <line x1="12" y1="12" x2="20" y2="12" stroke="#6b7280" strokeWidth="1" />
      </svg>
    ),
    label: "Einzelschublade",
  },
  "abschliessbare-tueren": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="11" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <rect x="17" y="4" width="11" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <rect cx="13" cy="12" x="12" y="10" width="2" height="4" fill="#6b7280" rx="0.5" />
        <rect cx="19" cy="12" x="18" y="10" width="2" height="4" fill="#6b7280" rx="0.5" />
      </svg>
    ),
    label: "Abschließbar",
  },
  "mit-tuere-links": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <circle cx="24" cy="12" r="1" fill="#6b7280" />
      </svg>
    ),
    label: "Türe Links",
  },
  "mit-tuere-rechts": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <circle cx="8" cy="12" r="1" fill="#6b7280" />
      </svg>
    ),
    label: "Türe Rechts",
  },
  "abschliessbar-links": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <rect x="22" y="10" width="2" height="4" fill="#6b7280" rx="0.5" />
      </svg>
    ),
    label: "Abschl. Links",
  },
  "abschliessbar-rechts": {
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="2" width="28" height="20" fill="currentColor" stroke="#9ca3af" strokeWidth="1" rx="1" />
        <rect x="4" y="4" width="24" height="16" fill="currentColor" stroke="#6b7280" strokeWidth="0.8" rx="0.5" />
        <rect x="8" y="10" width="2" height="4" fill="#6b7280" rx="0.5" />
      </svg>
    ),
    label: "Abschl. Rechts",
  },
}

// Lightweight SVG-based preview component - NO Canvas, NO 3D rendering
export const ModulePreview3D = memo(function ModulePreview3D({ 
  moduleType, 
  width = 80, 
  className = "", 
  color 
}: ModulePreview3DProps) {
  const bgColor = color ? colorHexMap[color] : colorHexMap.weiss
  const moduleIcon = moduleIcons[moduleType] || moduleIcons["offenes-fach"]
  
  // Determine text color based on background brightness
  const isLightColor = color === "weiss" || color === "gelb" || !color

  return (
    <div 
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ color: bgColor }}
    >
      <div className="w-10 h-8 relative">
        {moduleIcon.icon}
        {/* Chrome frame accent */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{ 
            boxShadow: 'inset 0 0 0 1px rgba(156, 163, 175, 0.3)',
          }}
        />
      </div>
    </div>
  )
})
