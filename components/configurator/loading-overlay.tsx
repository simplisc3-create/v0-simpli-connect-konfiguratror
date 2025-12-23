"use client"

import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isVisible: boolean
  message: string
}

export function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#4a4a4a] rounded-lg px-8 py-6 flex flex-col items-center gap-4 shadow-xl border border-[#555]">
        <Loader2 className="w-10 h-10 text-[#0066b3] animate-spin" />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  )
}
