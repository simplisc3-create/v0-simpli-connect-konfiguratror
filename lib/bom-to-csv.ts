export interface BomLine {
  sku: string
  name: string
  qty: number
  unit: string
  category: string
  note?: string
}

export function bomToCsv(lines: BomLine[]): string {
  const header = ["SKU", "Name", "Quantity", "Unit", "Category", "Note"]
  const rows = lines.map((l) => [l.sku, l.name, String(l.qty), l.unit, l.category, l.note ?? ""])

  // CSV safe escaping
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [header, ...rows].map((r) => r.map((x) => esc(x)).join(",")).join("\n")
}
