import { ShelfConfigurator } from "@/components/shelf-configurator"
import { productsSimpliRegale } from "@/lib/simpli-products"

// Build presets from Simpli Regale products
const simpliRegalePresets = Object.fromEntries(
  productsSimpliRegale
    .filter(product => product.preset)
    .map(product => [product.id, product.preset])
)

const presets = {
  wohnzimmer: {
    columns: 3,
    rows: 5,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      // Row 0 = bottom (floor level)
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-rueckwand" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      // Row 1 = second from bottom
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "mit-rueckwand" as const, row: 1, col: 1, color: "weiss" as const },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      // Row 2 = third from bottom
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "mit-rueckwand" as const, row: 2, col: 1, color: "weiss" as const },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
      // Row 3 = fourth from bottom
      [
        { id: "cell-3-0", type: "ghost" as const, row: 3, col: 0 },
        { id: "cell-3-1", type: "mit-rueckwand" as const, row: 3, col: 1, color: "weiss" as const },
        { id: "cell-3-2", type: "ghost" as const, row: 3, col: 2 },
      ],
      // Row 4 = top (ghost row for upward expansion)
      [
        { id: "cell-4-0", type: "ghost" as const, row: 4, col: 0 },
        { id: "cell-4-1", type: "ghost" as const, row: 4, col: 1 },
        { id: "cell-4-2", type: "ghost" as const, row: 4, col: 2 },
      ],
    ],
    youtubeId: "hUbkjGIyy2E",
  },
  starter: {
    columns: 4,
    rows: 3,
    columnWidths: [75, 75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      // Row 0 = bottom (floor level) - actual modules with ghost cells on sides
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "offenes-fach" as const, row: 0, col: 1, color: "gruen" as const },
        { id: "cell-0-2", type: "offenes-fach" as const, row: 0, col: 2, color: "gruen" as const },
        { id: "cell-0-3", type: "ghost" as const, row: 0, col: 3 },
      ],
      // Row 1 = second level - actual modules with ghost cells on sides
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "offenes-fach" as const, row: 1, col: 1, color: "gruen" as const },
        { id: "cell-1-2", type: "offenes-fach" as const, row: 1, col: 2, color: "gruen" as const },
        { id: "cell-1-3", type: "ghost" as const, row: 1, col: 3 },
      ],
      // Row 2 = top (ghost row for upward expansion)
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
        { id: "cell-2-3", type: "ghost" as const, row: 2, col: 3 },
      ],
    ],
    youtubeId: "ffjWvF61tJg",
  },
  homeoffice: {
    columns: 4,
    rows: 3,
    columnWidths: [75, 75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      // Row 0 = bottom (floor level) - actual modules with ghost cells on sides
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-doppelschublade" as const, row: 0, col: 1, color: "blau" as const },
        { id: "cell-0-2", type: "mit-doppelschublade" as const, row: 0, col: 2, color: "blau" as const },
        { id: "cell-0-3", type: "ghost" as const, row: 0, col: 3 },
      ],
      // Row 1 = second level - actual modules with ghost cells on sides
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "mit-doppelschublade" as const, row: 1, col: 1, color: "blau" as const },
        { id: "cell-1-2", type: "mit-doppelschublade" as const, row: 1, col: 2, color: "blau" as const },
        { id: "cell-1-3", type: "ghost" as const, row: 1, col: 3 },
      ],
      // Row 2 = top (ghost row for upward expansion)
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
        { id: "cell-2-3", type: "ghost" as const, row: 2, col: 3 },
      ],
    ],
    youtubeId: "gBCkDel4Jlc",
  },
  abschliessbar: {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "abschliessbare-tueren" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  // 80cm Module presets
  "offenes-fach": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "offenes-fach" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "ohne-seitenwaende": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "ohne-seitenwaende" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "ohne-rueckwand": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "ohne-rueckwand" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "mit-rueckwand": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-rueckwand" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "mit-tueren": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-tueren" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "mit-klapptuer": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-klapptuer" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "mit-klapptuer-oben": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-klapptuer-oben" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "mit-doppelschublade": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-doppelschublade" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "mit-einzelschublade": {
    columns: 3,
    rows: 3,
    columnWidths: [75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-einzelschublade" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  // 40cm Module presets
  "mit-tuere-rechts": {
    columns: 3,
    rows: 3,
    columnWidths: [38, 38, 38] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-tuere-rechts" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "mit-tuere-links": {
    columns: 3,
    rows: 3,
    columnWidths: [38, 38, 38] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "mit-tuere-links" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
  "abschliessbar-links": {
    columns: 3,
    rows: 3,
    columnWidths: [38, 38, 38] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "abschliessbar-links" as const, row: 0, col: 1, color: "weiss" as const },
        { id: "cell-0-2", type: "ghost" as const, row: 0, col: 2 },
      ],
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "ghost" as const, row: 1, col: 1 },
        { id: "cell-1-2", type: "ghost" as const, row: 1, col: 2 },
      ],
      [
        { id: "cell-2-0", type: "ghost" as const, row: 2, col: 0 },
        { id: "cell-2-1", type: "ghost" as const, row: 2, col: 1 },
        { id: "cell-2-2", type: "ghost" as const, row: 2, col: 2 },
      ],
    ],
  },
}

export default async function KonfiguratorPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>
}) {
  const params = await searchParams
  const presetKey = params.preset as string
  
  // First check module presets, then Simpli Regale presets
  const preset = presetKey 
    ? (presets[presetKey as keyof typeof presets] || simpliRegalePresets[presetKey])
    : undefined

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <ShelfConfigurator initialPreset={preset} presetYoutubeId={preset?.youtubeId} />
    </main>
  )
}
