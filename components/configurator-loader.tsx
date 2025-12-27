"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, MousePointer2, Layers, Move3D, ShoppingCart, X } from "lucide-react"

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

    // Check if intro was already played this session
    const played = sessionStorage.getItem("simpli-intro-played")
    if (played) {
      setShowIntro(false)
      // Show hints briefly for returning users too
      setShowHints(true)
      const hideHints = setTimeout(() => setHintsVisible(false), 8000)
      return () => clearTimeout(hideHints)
    }

    // Show intro
    setShowIntro(true)

    // End intro and show hints
    const endIntro = setTimeout(() => {
      setShowIntro(false)
      sessionStorage.setItem("simpli-intro-played", "true")
      setShowHints(true)
    }, 2500)

    // Auto-hide hints after 10 seconds
    const hideHints = setTimeout(() => {
      setHintsVisible(false)
    }, 12000)

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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Main Configurator - always visible after mount */}
      <div className={`h-full w-full transition-opacity duration-700 ${showIntro ? "opacity-0" : "opacity-100"}`}>
        <ShelfConfigurator />
      </div>

      {/* Professional Intro Overlay - Quick brand flash */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                    linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                  backgroundSize: "60px 60px",
                }}
              />
            </div>

            {/* Centered brand */}
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo */}
              <motion.div
                className="mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 shadow-lg">
                  <Sparkles className="h-6 w-6 text-accent-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold tracking-wider text-foreground">SIMPLI</span>
                  <span className="text-xs tracking-widest text-muted-foreground">CONNECT</span>
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.p
                className="text-lg text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                Regal-Konfigurator
              </motion.p>

              {/* Loading bar */}
              <motion.div
                className="mt-8 h-0.5 w-48 overflow-hidden rounded-full bg-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-gold to-amber-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut", delay: 0.7 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hints - Blend in around edges */}
      <AnimatePresence>
        {showHints && hintsVisible && (
          <>
            {/* Dismiss button */}
            <motion.button
              className="absolute right-4 top-4 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
              onClick={() => setHintsVisible(false)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: 1 }}
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Top center - Title hint */}
            <motion.div
              className="absolute left-1/2 top-6 z-40 -translate-x-1/2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="rounded-2xl border border-border/30 bg-background/70 px-6 py-3 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold/10">
                    <Sparkles className="h-4 w-4 text-accent-gold" />
                  </div>
                  <div>
                    <h1 className="text-sm font-medium text-foreground">SIMPLI Regal-Konfigurator</h1>
                    <p className="text-xs text-muted-foreground">Gestalten Sie Ihr individuelles Regalsystem</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Left side - Tool hint */}
            <motion.div
              className="absolute bottom-1/2 left-20 z-40 hidden translate-y-1/2 lg:block"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-border/30 bg-background/70 p-3 shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4 text-accent-gold" />
                    <span className="text-xs text-foreground">Modul wählen</span>
                  </div>
                </div>
                <motion.div
                  className="h-px w-8 bg-gradient-to-r from-accent-gold/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                />
              </div>
            </motion.div>

            {/* Bottom center - Interaction hints */}
            <motion.div
              className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-border/30 bg-background/70 px-4 py-2 shadow-lg backdrop-blur-md">
                  <Move3D className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ziehen zum Drehen</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/30 bg-background/70 px-4 py-2 shadow-lg backdrop-blur-md">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">+ zum Erweitern</span>
                </div>
              </div>
            </motion.div>

            {/* Right side - Cart hint */}
            <motion.div
              className="absolute bottom-1/2 right-6 z-40 hidden translate-y-1/2 lg:block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-px w-8 bg-gradient-to-l from-accent-gold/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, delay: 1 }}
                />
                <div className="rounded-xl border border-border/30 bg-background/70 p-3 shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-accent-gold" />
                    <span className="text-xs text-foreground">Warenkorb</span>
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
