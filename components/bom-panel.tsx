"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, AlertTriangle, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { generateBOM, validateConfig, type BomConfig, type BomLine } from "@/lib/bom-generator"
import type { ShelfConfig } from "./shelf-configurator"

type BomPanelProps = {
  config: ShelfConfig
}

export function BomPanel({ config }: BomPanelProps) {
  const [bom, setBom] = useState<BomLine[]>([])
  const [showBom, setShowBom] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Convert ShelfConfig to BomConfig
  const bomConfig: BomConfig = {
    width: config.columnWidths[0] > 0.6 ? 75 : 38,
    height: (config.rows * 40) as 40 | 80 | 120 | 160 | 200,
    sections: config.columns,
    levels: config.rows,
    material: config.material,
    finish: config.shelfColor as "black" | "white" | "blue" | "green" | "yellow" | "orange" | "red" | "satin",
    panels: {
      shelves: undefined,
      sideWalls: 0,
      backWalls: 0,
    },
    modules: {
      doors40: 0,
      lockableDoors40: 0,
      flapDoors: 0,
      doubleDrawers80: 0,
      jalousie80: 0,
      functionalWall1: 0,
      functionalWall2: 0,
    },
  }

  const validationMessages = validateConfig(bomConfig)
  const errors = validationMessages.filter((m) => m.severity === "error")
  const warnings = validationMessages.filter((m) => m.severity === "warning")
  const infos = validationMessages.filter((m) => m.severity === "info")

  const handleGenerateBOM = () => {
    const generatedBom = generateBOM(bomConfig)
    setBom(generatedBom)
    setShowBom(true)
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const configParam = encodeURIComponent(JSON.stringify(bomConfig))
      const response = await fetch(`/api/bom/export?config=${configParam}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `BOM-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/bom/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bomConfig),
      })
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `BOM-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const configParam = encodeURIComponent(JSON.stringify(bomConfig))
      const response = await fetch(`/api/bom/export?config=${configParam}&format=excel`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `BOM-${new Date().toISOString().split("T")[0]}.xls`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stückliste (BOM)</h3>
        <Button onClick={handleGenerateBOM} size="sm" variant="outline" disabled={errors.length > 0}>
          <FileText className="mr-2 h-4 w-4" />
          Generieren
        </Button>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {warnings.map((warning, i) => (
                <li key={i}>{warning.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {infos.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {infos.map((info, i) => (
                <li key={i}>{info.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {showBom && bom.length > 0 && (
        <>
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Stückliste erstellt ({bom.length} Artikel)</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bom.map((line, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium">{line.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {line.sku}
                        {line.note && ` • ${line.note}`}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {line.qty} {line.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={isExporting} size="sm" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              CSV Export
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={isExporting}
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel Export
            </Button>
            <Button
              onClick={handleExportJSON}
              disabled={isExporting}
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              JSON Export
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
