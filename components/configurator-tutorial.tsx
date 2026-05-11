"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, MousePointer2, Move3D, Palette, Package, RotateCcw } from "lucide-react"

interface TutorialStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  highlight: "canvas" | "panel" | "modules" | "colors" | "none"
  animation: "click" | "drag" | "scroll" | "none"
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Willkommen im Konfigurator",
    description: "Gestalte dein individuelles Regalsystem in wenigen Schritten. Wir zeigen dir, wie es funktioniert.",
    icon: <Package className="h-8 w-8" />,
    highlight: "none",
    animation: "none",
  },
  {
    id: 2,
    title: "Module auswählen",
    description: "Wähle aus verschiedenen Modultypen: offene Fächer, Türen, Schubladen und mehr. Klicke auf ein Modul im rechten Panel.",
    icon: <MousePointer2 className="h-8 w-8" />,
    highlight: "modules",
    animation: "click",
  },
  {
    id: 3,
    title: "Module platzieren",
    description: "Klicke auf eine Zelle im Regal, um das ausgewählte Modul dort zu platzieren. Du kannst Module jederzeit austauschen.",
    icon: <MousePointer2 className="h-8 w-8" />,
    highlight: "canvas",
    animation: "click",
  },
  {
    id: 4,
    title: "3D-Ansicht drehen",
    description: "Halte die Maustaste gedrückt und ziehe, um das Regal aus verschiedenen Blickwinkeln zu betrachten.",
    icon: <Move3D className="h-8 w-8" />,
    highlight: "canvas",
    animation: "drag",
  },
  {
    id: 5,
    title: "Farben anpassen",
    description: "Wähle eine Farbe für neue Module. Du kannst auch einzelne Module nachträglich umfärben.",
    icon: <Palette className="h-8 w-8" />,
    highlight: "colors",
    animation: "click",
  },
  {
    id: 6,
    title: "Regal anpassen",
    description: "Füge Spalten und Reihen hinzu, passe Breiten an und wähle verschiedene Fußoptionen.",
    icon: <RotateCcw className="h-8 w-8" />,
    highlight: "panel",
    animation: "scroll",
  },
]

interface ConfiguratorTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

export function ConfiguratorTutorial({ onComplete, onSkip }: ConfiguratorTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false)
      setTimeout(onComplete, 300)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
    setTimeout(onSkip, 300)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext()
      } else if (e.key === "ArrowLeft") {
        handlePrev()
      } else if (e.key === "Escape") {
        handleSkip()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentStep, isLastStep])

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Highlight Overlays */}
          {step.highlight !== "none" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[101] pointer-events-none"
            >
              {/* Canvas highlight */}
              {step.highlight === "canvas" && (
                <div className="absolute left-0 top-12 bottom-0 right-72 xl:right-80 2xl:right-96 hidden lg:block">
                  <div className="absolute inset-4 rounded-2xl border-2 border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                    {step.animation === "drag" && (
                      <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        animate={{
                          x: [0, 60, 60, 0, 0],
                          y: [0, 0, -40, -40, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="flex items-center gap-2 bg-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                          <Move3D className="h-4 w-4" />
                          Ziehen
                        </div>
                      </motion.div>
                    )}
                    {step.animation === "click" && (
                      <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        animate={{
                          scale: [1, 0.9, 1],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="h-12 w-12 rounded-full bg-teal-500/30 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-teal-500" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Panel highlight */}
              {(step.highlight === "panel" || step.highlight === "modules" || step.highlight === "colors") && (
                <div className="absolute right-0 top-12 bottom-0 w-72 xl:w-80 2xl:w-96 hidden lg:block">
                  <div className="absolute inset-2 rounded-2xl border-2 border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                    {step.highlight === "modules" && (
                      <motion.div
                        className="absolute top-32 left-1/2 -translate-x-1/2"
                        animate={{
                          y: [0, 10, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="flex items-center gap-2 bg-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                          <MousePointer2 className="h-4 w-4" />
                          Modul wählen
                        </div>
                      </motion.div>
                    )}
                    {step.highlight === "colors" && (
                      <motion.div
                        className="absolute top-64 left-1/2 -translate-x-1/2"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="flex items-center gap-2 bg-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                          <Palette className="h-4 w-4" />
                          Farbe wählen
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[102] w-[90vw] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-gray-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="p-6">
                {/* Header with icon */}
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-lg"
                  >
                    {step.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      key={`title-${currentStep}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-lg font-bold text-gray-900 mb-1"
                    >
                      {step.title}
                    </motion.h3>
                    <motion.p
                      key={`desc-${currentStep}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-gray-600 leading-relaxed"
                    >
                      {step.description}
                    </motion.p>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Tutorial schließen"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    {tutorialSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentStep
                            ? "w-6 bg-teal-500"
                            : index < currentStep
                              ? "w-2 bg-teal-300"
                              : "w-2 bg-gray-200"
                        }`}
                        aria-label={`Schritt ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isFirstStep && (
                      <button
                        onClick={handlePrev}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Zurück
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-sm"
                    >
                      {isLastStep ? "Los geht's" : "Weiter"}
                      {!isLastStep && <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs text-white/60 mt-3"
            >
              Drücke <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80">→</kbd> für weiter oder <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80">Esc</kbd> zum Überspringen
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
