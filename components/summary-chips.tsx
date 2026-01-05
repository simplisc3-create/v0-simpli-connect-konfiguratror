"use client"

import { Badge } from "@/components/ui/badge"
import type { Derived, Config } from "@/lib/bom-types"
import { mapWidthToERP } from "@/lib/config-utils"

interface SummaryChipsProps {
  config: Config
  derived: Derived
}

export function SummaryChips({ config, derived }: SummaryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">
        {config.width}cm × {config.height}cm
      </Badge>

      <Badge variant="outline">
        {config.sections}×{config.levels} (Fächer: {derived.compartments})
      </Badge>

      <Badge variant="outline">
        {config.material} · {config.finish}
      </Badge>

      <Badge variant="secondary">Flächen: {derived.panelsTotal}</Badge>

      <Badge variant="secondary">Leitern: {derived.uprightsQty}</Badge>

      <Badge variant="outline" className="text-xs">
        ERP: {mapWidthToERP(config.width)}cm
      </Badge>
    </div>
  )
}
