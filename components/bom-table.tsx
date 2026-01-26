"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BomLine } from "@/lib/bom-types"

interface BomTableProps {
  bom: BomLine[]
}

export function BomTable({ bom }: BomTableProps) {
  const grouped = bom.reduce(
    (acc, line) => {
      const cat = line.category || "Other"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(line)
      return acc
    },
    {} as Record<string, BomLine[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, lines]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{category}</h3>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>SKU</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-right">Menge</TableHead>
                  <TableHead>Einheit</TableHead>
                  <TableHead className="text-right">Hinweis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">{line.sku}</TableCell>
                    <TableCell className="text-foreground">{line.name}</TableCell>
                    <TableCell className="text-right font-semibold">{line.qty}</TableCell>
                    <TableCell>{line.unit}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {line.note && <span className="italic">{line.note}</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  )
}
