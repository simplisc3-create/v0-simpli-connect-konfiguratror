"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { RuleMessage } from "@/lib/bom-types"

interface ValidationAlertsProps {
  messages: RuleMessage[]
}

export function ValidationAlerts({ messages }: ValidationAlertsProps) {
  if (messages.length === 0) {
    return (
      <Alert className="border-green-600 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Konfiguration valid</AlertTitle>
        <AlertDescription>Alle Regeln erfüllt. Bestellfertig!</AlertDescription>
      </Alert>
    )
  }

  const errors = messages.filter((m) => m.severity === "error")
  const warnings = messages.filter((m) => m.severity === "warning")

  return (
    <div className="space-y-2">
      {errors.map((msg, idx) => (
        <Alert key={`error-${idx}`} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{msg.ruleId}</AlertTitle>
          <AlertDescription>{msg.message}</AlertDescription>
        </Alert>
      ))}

      {warnings.map((msg, idx) => (
        <Alert key={`warning-${idx}`} className="border-yellow-400 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">{msg.ruleId}</AlertTitle>
          <AlertDescription className="text-yellow-700">{msg.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
