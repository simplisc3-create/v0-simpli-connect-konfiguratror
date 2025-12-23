"use client"

import { Monitor, RotateCcw } from "lucide-react"

export function MobileWarning() {
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-[#3d3d3d] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="mb-6 flex justify-center gap-4">
          <RotateCcw className="w-12 h-12 text-[#0066b3]" />
          <Monitor className="w-12 h-12 text-[#999]" />
        </div>
        <p className="text-[#ccc] leading-relaxed">
          Zum Verwenden bitte Telefon drehen oder ein Gerät mit einer höheren Auflösung verwenden (z.B. Tablet, Laptop
          oder PC)
        </p>
      </div>
    </div>
  )
}
