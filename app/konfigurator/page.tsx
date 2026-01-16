import { ShelfConfigurator } from "@/components/shelf-configurator"

const presets = {
  wohnzimmer: {
    columns: 1,
    rows: 4,
    columnWidths: [75] as (75 | 38)[],
    rowHeights: [38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      // Row 0 = bottom (floor level)
      [{ id: "cell-0-0", type: "mit-rueckwand" as const, row: 0, col: 0, color: "weiss" as const }],
      // Row 1 = second from bottom
      [{ id: "cell-1-0", type: "mit-rueckwand" as const, row: 1, col: 0, color: "weiss" as const }],
      // Row 2 = third from bottom
      [{ id: "cell-2-0", type: "mit-rueckwand" as const, row: 2, col: 0, color: "weiss" as const }],
      // Row 3 = top
      [{ id: "cell-3-0", type: "mit-rueckwand" as const, row: 3, col: 0, color: "weiss" as const }],
    ],
    youtubeId: "hUbkjGIyy2E",
  },
  starter: {
    columns: 4,
    rows: 3,
    columnWidths: [75, 75, 75, 75] as (75 | 38)[],
    rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      // Row 0 = bottom (floor level)
      [
        { id: "cell-0-0", type: "ghost" as const, row: 0, col: 0 },
        { id: "cell-0-1", type: "offenes-fach" as const, row: 0, col: 1, color: "gruen" as const },
        { id: "cell-0-2", type: "offenes-fach" as const, row: 0, col: 2, color: "gruen" as const },
        { id: "cell-0-3", type: "ghost" as const, row: 0, col: 3 },
      ],
      // Row 1 = second level
      [
        { id: "cell-1-0", type: "ghost" as const, row: 1, col: 0 },
        { id: "cell-1-1", type: "offenes-fach" as const, row: 1, col: 1, color: "gruen" as const },
        { id: "cell-1-2", type: "offenes-fach" as const, row: 1, col: 2, color: "gruen" as const },
        { id: "cell-1-3", type: "ghost" as const, row: 1, col: 3 },
      ],
      // Row 2 = top (ghost row for expansion)
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
    columns: 2,
    rows: 2,
    columnWidths: [75, 75] as (75 | 38)[],
    rowHeights: [38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      // Row 0 = bottom (floor level)
      [
        { id: "cell-0-0", type: "mit-doppelschublade" as const, row: 0, col: 0, color: "blau" as const },
        { id: "cell-0-1", type: "mit-doppelschublade" as const, row: 0, col: 1, color: "blau" as const },
      ],
      // Row 1 = top
      [
        { id: "cell-1-0", type: "mit-doppelschublade" as const, row: 1, col: 0, color: "blau" as const },
        { id: "cell-1-1", type: "mit-doppelschublade" as const, row: 1, col: 1, color: "blau" as const },
      ],
    ],
    youtubeId: "gBCkDel4Jlc",
  },
}

export default async function KonfiguratorPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>
}) {
  const params = await searchParams
  const presetKey = params.preset as keyof typeof presets
  const preset = presetKey && presets[presetKey] ? presets[presetKey] : undefined

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <ShelfConfigurator initialPreset={preset} presetYoutubeId={preset?.youtubeId} />
    </main>
  )
}
