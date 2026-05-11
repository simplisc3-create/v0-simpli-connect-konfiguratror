"use client"

import Link from "next/link"
import { X, HelpCircle } from "lucide-react"

interface ConfiguratorHeaderProps {
  onShowTutorial?: () => void
}

export function ConfiguratorHeader({ onShowTutorial }: ConfiguratorHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-[#f5f5f5] px-3 sm:px-5 py-2 overflow-hidden shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] text-white transition-colors hover:bg-[#333]"
          title="Konfigurator verlassen"
        >
          <X className="h-4 w-4" />
        </Link>
        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a]">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="hidden md:inline text-xs font-semibold tracking-widest uppercase text-[#1a1a1a]/60 ml-1">
          Konfigurator
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {onShowTutorial && (
          <button 
            onClick={onShowTutorial}
            className="flex items-center gap-1.5 rounded-lg border border-[#1a1a1a]/20 px-3 py-1.5 text-xs font-medium text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a]/10"
            title="Tutorial anzeigen"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hilfe</span>
          </button>
        )}
        <button className="hidden sm:block rounded-lg border border-[#1a1a1a]/20 px-3 py-1.5 text-xs font-medium text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a]/10">
          Speichern
        </button>
        <button className="hidden sm:block rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#333]">
          Teilen
        </button>
      </div>
    </header>
  )
}
