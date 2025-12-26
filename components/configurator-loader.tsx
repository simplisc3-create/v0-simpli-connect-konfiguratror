"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, Box, Layers, Palette, ArrowRight } from "lucide-react"

const ShelfConfigurator = dynamic(
  () => import("@/components/shelf-configurator").then((mod) => mod.ShelfConfigurator),
  {
    ssr: false,
    loading: () => null,
  },
)

// Animated shelf icon for the intro
function AnimatedShelf() {
  return (
    <div className="relative w-48 h-48">
      {/* Base shelf structure */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Vertical poles */}
        <motion.div
          className="absolute left-4 top-0 w-1.5 h-full bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.div
          className="absolute right-4 top-0 w-1.5 h-full bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-1.5 h-full bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        {/* Horizontal shelves */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-2 right-2 h-2 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-sm shadow-md"
            style={{ top: `${20 + i * 35}%` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
          />
        ))}

        {/* Decorative modules appearing */}
        <motion.div
          className="absolute left-6 bg-gradient-to-br from-amber-200 to-amber-300 rounded-sm shadow-inner"
          style={{ top: "23%", width: "35%", height: "30%" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        />
        <motion.div
          className="absolute right-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-sm shadow-inner"
          style={{ top: "58%", width: "35%", height: "30%" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-accent-gold/20 rounded-full blur-3xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.5, 0.3], scale: [0.5, 1.2, 1] }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
    </div>
  )
}

// Feature cards that fly in
const features = [
  { icon: Box, label: "3D Vorschau", delay: 0.8 },
  { icon: Layers, label: "Modulares System", delay: 1.0 },
  { icon: Palette, label: "Individuelle Farben", delay: 1.2 },
]

export function ConfiguratorLoader() {
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState<boolean | null>(null)
  const [introPhase, setIntroPhase] = useState(0)

  useEffect(() => {
    setMounted(true)

    // Check if intro was already played this session
    const played = sessionStorage.getItem("simpli-intro-played")
    if (played) {
      setShowIntro(false)
      return
    }

    // Show intro and start animation sequence
    setShowIntro(true)

    const phase1 = setTimeout(() => setIntroPhase(1), 500)
    const phase2 = setTimeout(() => setIntroPhase(2), 1800)
    const phase3 = setTimeout(() => setIntroPhase(3), 3000)
    const endIntro = setTimeout(() => {
      setShowIntro(false)
      sessionStorage.setItem("simpli-intro-played", "true")
    }, 4000)

    return () => {
      clearTimeout(phase1)
      clearTimeout(phase2)
      clearTimeout(phase3)
      clearTimeout(endIntro)
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
      {/* Main Configurator (always mounted for preloading) */}
      <div className={`h-full w-full transition-opacity duration-700 ${showIntro ? "opacity-0" : "opacity-100"}`}>
        <ShelfConfigurator />
      </div>

      {/* Intro Animation Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            {/* Animated content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Logo/Brand */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: introPhase >= 0 ? 1 : 0, y: introPhase >= 0 ? 0 : -30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-8"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-accent-gold" />
                  <span className="text-2xl font-light tracking-widest text-foreground">SIMPLI</span>
                </div>
              </motion.div>

              {/* Animated Shelf */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: introPhase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <AnimatedShelf />
              </motion.div>

              {/* Tagline */}
              <motion.h1
                className="mt-8 text-center text-3xl font-light tracking-tight text-foreground md:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: introPhase >= 1 ? 1 : 0, y: introPhase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Regal-Konfigurator
              </motion.h1>

              <motion.p
                className="mt-3 text-center text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: introPhase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Gestalten Sie Ihr individuelles Regalsystem
              </motion.p>

              {/* Feature badges */}
              <motion.div
                className="mt-10 flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: introPhase >= 2 ? 1 : 0 }}
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: introPhase >= 2 ? 1 : 0,
                      x: introPhase >= 2 ? 0 : -20,
                    }}
                    transition={{ duration: 0.4, delay: i * 0.15 }}
                  >
                    <feature.icon className="h-4 w-4 text-accent-gold" />
                    <span className="text-sm text-foreground">{feature.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Loading indicator / Start hint */}
              <motion.div
                className="mt-12 flex items-center gap-2 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: introPhase >= 3 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm">Konfigurator wird gestartet</span>
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.div>
            </div>

            {/* Hyperlapse zoom effect on exit */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-background"
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: introPhase >= 3 ? [0, 0.5, 0] : 0,
                scale: introPhase >= 3 ? [1, 0.95, 1.5] : 1,
              }}
              transition={{ duration: 1, ease: "easeIn", delay: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
