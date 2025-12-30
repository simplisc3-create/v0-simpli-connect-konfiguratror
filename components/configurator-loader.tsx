"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, MousePointer2, Layers, Move3D, ShoppingCart, X } from "lucide-react"

const ShelfConfigurator = dynamic(
  () => import("@/components/shelf-configurator").then((mod) => mod.ShelfConfigurator),
  {
    ssr: false,
    loading: () => null,
  },
)

export function ConfiguratorLoader() {
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState<boolean | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [hintsVisible, setHintsVisible] = useState(true)

  useEffect(() => {
    setMounted(true)

    const played = sessionStorage.getItem("simpli-intro-played")
    if (played) {
      setShowIntro(false)
      setShowHints(true)
      const hideHints = setTimeout(() => setHintsVisible(false), 8000)
      return () => clearTimeout(hideHints)
    }

    setShowIntro(true)

    const endIntro = setTimeout(() => {
      setShowIntro(false)
      sessionStorage.setItem("simpli-intro-played", "true")
      setShowHints(true)
    }, 2200)

    const hideHints = setTimeout(() => {
      setHintsVisible(false)
    }, 11000)

    return () => {
      clearTimeout(endIntro)
      clearTimeout(hideHints)
    }
  }, [])

  if (!mounted || showIntro === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent-gold" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Main Configurator */}
      <div className={`h-full w-full transition-opacity duration-700 ${showIntro ? "opacity-0" : "opacity-100"}`}>
        <ShelfConfigurator />
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-[0.04]">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                    linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                  backgroundSize: "48px 48px",
                }}
              />
            </div>

            {/* Centered brand */}
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo */}
              <motion.div
                className="mb-5 flex items-center gap-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
                  <span className="text-2xl font-bold text-primary-foreground">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-semibold tracking-tight text-foreground">SIMPLI</span>
                  <span className="text-xs font-medium tracking-widest text-muted-foreground">CONNECT</span>
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.p
                className="text-base text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                Regal-Konfigurator
              </motion.p>

              {/* Loading bar */}
              <motion.div
                className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="h-full rounded-full bg-accent-gold"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHints && hintsVisible && (
          <>
            {/* Dismiss button */}
            <motion.button
              className="absolute right-4 top-4 z-40 flex h-8 w-8 items-center justify-center rounded-full glass border border-border text-muted-foreground shadow-sm transition-colors hover:bg-card hover:text-foreground"
              onClick={() => setHintsVisible(false)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, delay: 0.8 }}
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Top center - Title hint */}
            <motion.div
              className="absolute left-1/2 top-5 z-40 -translate-x-1/2"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-border glass px-5 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                    <span className="text-sm font-bold text-primary-foreground">S</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-foreground">SIMPLI Regal-Konfigurator</h1>
                    <p className="text-xs text-muted-foreground">Gestalten Sie Ihr individuelles Regalsystem</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Left side - Tool hint */}
            <motion.div
              className="absolute bottom-1/2 left-20 z-40 hidden translate-y-1/2 lg:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-border glass p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4 text-accent-gold" />
                    <span className="text-xs font-medium text-foreground">Modul wählen</span>
                  </div>
                </div>
                <motion.div
                  className="h-px w-6 bg-border"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.25, delay: 0.7 }}
                />
              </div>
            </motion.div>

            {/* Bottom center - Interaction hints */}
            <motion.div
              className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-border glass px-4 py-2 shadow-sm">
                  <Move3D className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ziehen zum Drehen</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border glass px-4 py-2 shadow-sm">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">+ zum Erweitern</span>
                </div>
              </div>
            </motion.div>

            {/* Right side - Cart hint */}
            <motion.div
              className="absolute bottom-1/2 right-5 z-40 hidden translate-y-1/2 lg:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-px w-6 bg-border"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.25, delay: 0.8 }}
                />
                <div className="rounded-xl border border-border glass p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-accent-gold" />
                    <span className="text-xs font-medium text-foreground">Warenkorb</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
