import { ShelfConfigurator } from "@/components/shelf-configurator"

const presets = {
  wohnzimmer: {
    // 4 stacked white 80cm modules with back panels (mit-rueckwand) in 1 column
    columns: 1,
    rows: 4,
    columnWidths: [75] as (75 | 38)[],
    rowHeights: [38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [{ id: "cell-0-0", type: "mit-rueckwand" as const, row: 0, col: 0, color: "weiss" as const }],
      [{ id: "cell-1-0", type: "mit-rueckwand" as const, row: 1, col: 0, color: "weiss" as const }],
      [{ id: "cell-2-0", type: "mit-rueckwand" as const, row: 2, col: 0, color: "weiss" as const }],
      [{ id: "cell-3-0", type: "mit-rueckwand" as const, row: 3, col: 0, color: "weiss" as const }],
    ],
  },
  starter: {
    // 2 stacked open shelves
    columns: 1,
    rows: 2,
    columnWidths: [75] as (75 | 38)[],
    rowHeights: [38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [{ id: "cell-0-0", type: "offenes-fach" as const, row: 0, col: 0, color: "weiss" as const }],
      [{ id: "cell-1-0", type: "offenes-fach" as const, row: 1, col: 0, color: "weiss" as const }],
    ],
  },
  homeoffice: {
    // 4 compartments with drawers (2x2 grid)
    columns: 2,
    rows: 2,
    columnWidths: [75, 75] as (75 | 38)[],
    rowHeights: [38, 38] as (40 | 80 | 120 | 160 | 200)[],
    grid: [
      [
        { id: "cell-0-0", type: "mit-doppelschublade" as const, row: 0, col: 0, color: "weiss" as const },
        { id: "cell-0-1", type: "mit-doppelschublade" as const, row: 0, col: 1, color: "weiss" as const },
      ],
      [
        { id: "cell-1-0", type: "offenes-fach" as const, row: 1, col: 0, color: "weiss" as const },
        { id: "cell-1-1", type: "offenes-fach" as const, row: 1, col: 1, color: "weiss" as const },
      ],
    ],
  },
}

export default function KonfiguratorPage({
  searchParams,
}: {
  searchParams: { preset?: string }
}) {
  const presetKey = searchParams.preset as keyof typeof presets
  const initialPreset = presetKey && presets[presetKey] ? presets[presetKey] : undefined

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <ShelfConfigurator initialPreset={initialPreset} />
    </main>
  )
}
