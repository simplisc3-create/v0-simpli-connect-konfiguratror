"use client"

import Link from "next/link"
import { X } from "lucide-react"

export function ConfiguratorHeader() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-3 sm:px-6 py-2 sm:py-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
          title="Konfigurator verlassen"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white">
          <span className="text-base sm:text-lg font-bold text-[#1a1a1a]">S</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-white">Shelf Configurator</h1>
          <p className="text-xs text-white/50">Design your perfect shelf system</p>
        </div>
        {/* Mobile title - shorter */}
        <div className="block sm:hidden">
          <h1 className="text-sm font-semibold text-white">Konfigurator</h1>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <button className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
          Save Design
        </button>
        <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-white/90">
          Share
        </button>
      </div>
    </header>
  )
}
