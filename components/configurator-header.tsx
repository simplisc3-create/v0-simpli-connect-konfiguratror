"use client"

import Link from "next/link"
import { X } from "lucide-react"

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
