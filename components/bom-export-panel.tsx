"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import type { BomLine, RuleMessage } from "@/lib/bom-types"

interface BomExportPanelProps {
  bom: BomLine[]
  messages: RuleMessage[]
  hasErrors: boolean
  onExportCsv: () => string
  onExportJson: () => unknown
}

export function BomExportPanel({ bom, messages, hasErrors, onExportCsv, onExportJson }: BomExportPanelProps) {
  const groupedBom = bom.reduce(
    (acc, line) => {
      if (!acc[line.category]) acc[line.category] = []
      acc[line.category].push(line)
      return acc
    },
    {} as Record<string, BomLine[]>,
  )

  const categoryLabels: Record<string, string> = {
    upright: "Leitern",
    tubeset: "Stangensets",
    panel: "Flächen",
    accessory: "Zubehör",
    module: "Module",
  }

  const handleExport = (format: "csv" | "json") => {
    if (format === "csv") {
      const csv = onExportCsv()
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "bom.csv"
      a.click()
    } else {
      const json = JSON.stringify(onExportJson(), null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "bom.json"
      a.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Validation Messages */}
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <Alert
            key={i}
            variant={msg.severity === "error" ? "destructive" : msg.severity === "warning" ? "default" : "default"}
            className={
              msg.severity === "error"
                ? "border-red-500 bg-red-50"
                : msg.severity === "warning"
                  ? "border-amber-500 bg-amber-50"
                  : "border-blue-500 bg-blue-50"
            }
          >
            {msg.severity === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : msg.severity === "warning" ? (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            ) : (
              <Info className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className="text-sm">{msg.message}</AlertDescription>
          </Alert>
        ))}

        {!hasErrors && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              ✓ Konfiguration ist vollständig und bestellfähig.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* BOM Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Kategorie</th>
              <th className="px-4 py-2 text-left font-semibold">Artikel</th>
              <th className="px-4 py-2 text-center font-semibold">Menge</th>
              <th className="px-4 py-2 text-left font-semibold">Einheit</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedBom).map(([category, lines]) => (
              <tbody key={category}>
                <tr className="bg-gray-50 border-t-2">
                  <td colSpan={4} className="px-4 py-2 font-semibold text-gray-700">
                    {categoryLabels[category] || category}
                  </td>
                </tr>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{line.sku}</td>
                    <td className="px-4 py-2">{line.name}</td>
                    <td className="px-4 py-2 text-center font-semibold">{line.qty}</td>
                    <td className="px-4 py-2">{line.unit}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => handleExport("csv")}>
          CSV exportieren
        </Button>
        <Button variant="outline" onClick={() => handleExport("json")}>
          JSON exportieren
        </Button>
      </div>
    </div>
  )
}
