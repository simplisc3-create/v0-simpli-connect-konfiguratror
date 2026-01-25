"use client"

import Link from "next/link"
import { X } from "lucide-react"

// Module sequence with integrated text
type MarqueeItem = 
  | { type: "module"; width: number; color: string }
  | { type: "text"; content: string }

const marqueeItems: MarqueeItem[] = [
  { type: "module", width: 80, color: "#ffffff" },
  { type: "module", width: 40, color: "#22c55e" },
  { type: "module", width: 80, color: "#eab308" },
  { type: "text", content: "VIEL" },
  { type: "module", width: 40, color: "#ef4444" },
  { type: "module", width: 80, color: "#3b82f6" },
  { type: "module", width: 40, color: "#ffffff" },
  { type: "text", content: "SPASS" },
  { type: "module", width: 80, color: "#22c55e" },
  { type: "module", width: 40, color: "#eab308" },
  { type: "module", width: 80, color: "#ef4444" },
  { type: "text", content: "BEIM" },
  { type: "module", width: 40, color: "#3b82f6" },
  { type: "module", width: 80, color: "#ffffff" },
  { type: "module", width: 40, color: "#22c55e" },
  { type: "text", content: "DESIGNEN" },
  { type: "module", width: 80, color: "#eab308" },
  { type: "module", width: 40, color: "#ef4444" },
]

function ModuleMarquee() {
  // Double the items for seamless loop
  const allItems = [...marqueeItems, ...marqueeItems]
  
  return (
    <div className="w-full overflow-hidden">
      <div className="flex animate-marquee items-center">
        {allItems.map((item, index) => (
          item.type === "module" ? (
            <div
              key={index}
              className="flex-shrink-0 h-10 mx-0.5 rounded-sm border border-black/10"
              style={{
                width: `${item.width}px`,
                backgroundColor: item.color,
              }}
            />
          ) : (
            <span
              key={index}
              className="flex-shrink-0 mx-4 text-sm font-bold tracking-widest text-[#1a1a1a]/70"
            >
              {item.content}
            </span>
          )
        ))}
      </div>
    </div>
  )
}

export function ConfiguratorHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-[#f5f5f5] px-3 sm:px-6 py-2 overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#1a1a1a] text-white transition-colors hover:bg-[#333]"
          title="Konfigurator verlassen"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#1a1a1a]">
          <span className="text-base sm:text-lg font-bold text-white">S</span>
        </div>
      </div>
      
      {/* Animated module marquee with integrated text */}
      <div className="flex-1 mx-4 hidden sm:block">
        <ModuleMarquee />
      </div>
      
      <div className="hidden sm:flex items-center gap-4">
        <button className="rounded-lg border border-[#1a1a1a]/20 px-4 py-2 text-sm text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a]/10">
          Save Design
        </button>
        <button className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333]">
          Share
        </button>
      </div>
    </header>
  )
}
