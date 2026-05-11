"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"

export default function KonfiguratorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Konfigurator error:", error)
  }, [error])

  return (
    <main className="h-dvh w-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
        <div className="h-16 w-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">
            Konfigurator konnte nicht geladen werden
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Dein Browser unterstützt möglicherweise keine 3D-Darstellung. Bitte versuche es mit einem aktuellen Browser wie Chrome oder Safari.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white hover:bg-[#333] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#1a1a1a]/20 px-4 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </main>
  )
}
