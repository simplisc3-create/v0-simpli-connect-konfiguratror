"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { StepId } from "@/lib/use-configurator"
import { ChevronLeft, ChevronRight } from "lucide-react"

const STEP_LABELS: Record<StepId, string> = {
  size: "Größe",
  structure: "Struktur",
  material: "Material",
  panels: "Flächen",
  modules: "Module",
  summary: "Zusammenfassung",
}

interface ConfiguratorStepperProps {
  step: StepId
  hasErrors: boolean
  onNext: () => void
  onPrev: () => void
  canGoNext: boolean
  onRequestOffer: () => void
}

export function ConfiguratorStepper({
  step,
  hasErrors,
  onNext,
  onPrev,
  canGoNext,
  onRequestOffer,
}: ConfiguratorStepperProps) {
  const steps: StepId[] = ["size", "structure", "material", "panels", "modules", "summary"]
  const currentIndex = steps.indexOf(step)

  return (
    <Card className="p-6 space-y-4">
      {/* Progress bar */}
      <div className="flex gap-2 justify-between">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 space-y-2">
            <div className={`h-2 rounded-full ${i <= currentIndex ? "bg-blue-600" : "bg-gray-200"}`} />
            <p className="text-xs text-center font-medium">{STEP_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2 justify-between pt-4">
        <Button variant="outline" onClick={onPrev} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        {currentIndex === steps.length - 1 ? (
          <Button onClick={onRequestOffer} disabled={hasErrors} className="bg-green-600 hover:bg-green-700">
            Angebot anfragen
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canGoNext}>
            Weiter
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {hasErrors && currentIndex < steps.length - 1 && (
        <p className="text-sm text-amber-600">⚠ Bitte beheben Sie die Fehler, um fortzufahren.</p>
      )}
    </Card>
  )
}
