/**
 * Price Calculator for Simpli Shelf Configurations
 * Calculates total price based on grid configuration
 */

import {
  getLeiterArtNr,
  getSchubladeArtNr,
  getTuerArtNr,
  getKlapptuerArtNr,
  getKlapptuerObenArtNr,
  getEinzelschubladeArtNr,
  getFlaechensetArtNr,
  flaechensets,
} from "./simpli-products"
import { getColorLabel } from "./module-utils"

type GridCell = {
  id: string
  type: string
  row: number
  col: number
  color?: string
}

type PresetConfig = {
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights?: (40 | 80 | 120 | 160 | 200)[]
  grid: GridCell[][]
}

type BomItem = {
  id: string
  name: string
  quantity: number
  pricePerUnit: number
  total: number
}

/**
 * Calculate the total price for a preset configuration
 */
export function calculatePresetPrice(preset: PresetConfig): number {
  const itemMap = new Map<string, BomItem>()

  const addItem = (id: string, name: string, quantity: number, pricePerUnit: number) => {
    if (!id || id.trim() === "") return

    const existing = itemMap.get(id)
    if (existing) {
      existing.quantity += quantity
      existing.total = existing.quantity * pricePerUnit
    } else {
      itemMap.set(id, {
        id,
        name,
        quantity,
        pricePerUnit,
        total: quantity * pricePerUnit,
      })
    }
  }

  // Collect all non-empty, non-ghost cells
  const filledCells: Array<{ row: number; col: number; cell: GridCell }> = []
  for (let row = 0; row < preset.rows; row++) {
    for (let col = 0; col < preset.columns; col++) {
      const cell = preset.grid[row]?.[col]
      if (cell && cell.type !== "empty" && cell.type !== "ghost") {
        filledCells.push({ row, col, cell })
      }
    }
  }

  if (filledCells.length === 0) {
    return 0
  }

  const columnsWithModules = new Set<number>()
  for (const { col } of filledCells) {
    columnsWithModules.add(col)
  }
  const activeColumns = Array.from(columnsWithModules).sort((a, b) => a - b)

  // Calculate column heights only for active columns
  const columnMaxRows: Map<number, number> = new Map()
  for (let col = 0; col < preset.columns; col++) {
    let maxRow = -1
    for (let row = 0; row < preset.rows; row++) {
      const cell = preset.grid[row]?.[col]
      if (cell && cell.type !== "empty" && cell.type !== "ghost") {
        maxRow = Math.max(maxRow, row)
      }
    }
    if (maxRow >= 0) {
      columnMaxRows.set(col, maxRow)
    }
  }

  // --- LEITERN (Ladders) ---
  const leiterCounts: Record<string, { artNr: string; name: string; price: number; count: number }> = {}

  if (activeColumns.length > 0) {
    const columnGroups: number[][] = []
    let currentGroup: number[] = [activeColumns[0]]

    for (let i = 1; i < activeColumns.length; i++) {
      if (activeColumns[i] === activeColumns[i - 1] + 1) {
        currentGroup.push(activeColumns[i])
      } else {
        columnGroups.push(currentGroup)
        currentGroup = [activeColumns[i]]
      }
    }
    columnGroups.push(currentGroup)

    let totalAufbaumodule = 0

    for (const group of columnGroups) {
      for (let i = 0; i <= group.length; i++) {
        const leftCol = i > 0 ? group[i - 1] : -1
        const rightCol = i < group.length ? group[i] : -1

        const leftMaxRow = leftCol >= 0 ? (columnMaxRows.get(leftCol) ?? -1) : -1
        const rightMaxRow = rightCol >= 0 ? (columnMaxRows.get(rightCol) ?? -1) : -1
        const maxRow = Math.max(leftMaxRow, rightMaxRow)

        if (maxRow >= 0) {
          const totalHeightCm = (maxRow + 1) * 40

          if (totalHeightCm <= 200) {
            const leiterInfo = getLeiterArtNr(totalHeightCm)
            if (leiterInfo && leiterInfo.artNr) {
              const key = leiterInfo.artNr
              if (!leiterCounts[key]) {
                leiterCounts[key] = { ...leiterInfo, count: 0 }
              }
              leiterCounts[key].count++
            }
          } else {
            const leiter200Key = "SIM005"
            if (!leiterCounts[leiter200Key]) {
              leiterCounts[leiter200Key] = { artNr: "SIM005", name: "Leiter 200", price: 41.0, count: 0 }
            }
            leiterCounts[leiter200Key].count++

            const extraHeight = totalHeightCm - 200
            const aufbaumoduleForPosition = Math.ceil(extraHeight / 40)
            totalAufbaumodule += aufbaumoduleForPosition
          }
        }
      }
    }

    if (totalAufbaumodule > 0) {
      const aufbaumodulKey = "SIM001a"
      if (!leiterCounts[aufbaumodulKey]) {
        leiterCounts[aufbaumodulKey] = { artNr: "SIM001a", name: "Aufbaumodul", price: 8.5, count: 0 }
      }
      leiterCounts[aufbaumodulKey].count = totalAufbaumodule
    }
  }

  for (const [artNr, data] of Object.entries(leiterCounts)) {
    addItem(artNr, data.name, data.count, data.price)
  }

  // --- STANGENSETS (Bar sets) ---
  let stangenset40Count = 0
  let stangenset80Count = 0

  for (const col of activeColumns) {
    const widthCm = preset.columnWidths[col] === 75 ? 80 : 40
    let filledRowsInColumn = 0
    for (let row = 0; row < preset.rows; row++) {
      const cell = preset.grid[row]?.[col]
      if (cell && cell.type !== "empty" && cell.type !== "ghost") {
        filledRowsInColumn++
      }
    }

    const barsInColumn = filledRowsInColumn > 0 ? filledRowsInColumn + 1 : 0

    if (widthCm === 40) {
      stangenset40Count += barsInColumn
    } else {
      stangenset80Count += barsInColumn
    }
  }

  if (stangenset40Count > 0) {
    addItem("SIM006", "Stangenset 40", stangenset40Count, 6.95)
  }
  if (stangenset80Count > 0) {
    addItem("SIM007", "Stangenset 80", stangenset80Count, 12.0)
  }

  // --- FLÄCHENSETS (Surface sets) ---
  const panels40cmByColor: Record<string, number> = {}
  const panels80cmByColor: Record<string, number> = {}

  for (const { cell, row, col } of filledCells) {
    const cellColor = cell.color || "weiss"
    const widthCm = preset.columnWidths[col] === 75 ? 80 : 40

    const isBottomCell = row === 0 || filledCells.every((c) => c.col !== col || c.row < row)

    let horizontalPanels = 0
    if (isBottomCell) {
      horizontalPanels += 1
    }
    horizontalPanels += 1

    if (widthCm === 40) {
      panels40cmByColor[cellColor] = (panels40cmByColor[cellColor] || 0) + horizontalPanels
    } else {
      panels80cmByColor[cellColor] = (panels80cmByColor[cellColor] || 0) + horizontalPanels
    }

    // Count backwall panels
    const modulesWithBackwall = [
      "mit-rueckwand",
      "ohne-seitenwaende",
      "abschliessbare-tueren",
      "abschliessbar-links",
      "abschliessbar-rechts",
      "mit-tuere-links",
      "mit-tuere-rechts",
      "mit-klapptuer",
      "mit-doppelschublade",
      "mit-klapptuer-oben",
      "mit-einzelschublade",
      "mit-tueren",
    ]
    if (modulesWithBackwall.includes(cell.type)) {
      if (widthCm === 40) {
        panels40cmByColor[cellColor] = (panels40cmByColor[cellColor] || 0) + 1
      } else {
        panels80cmByColor[cellColor] = (panels80cmByColor[cellColor] || 0) + 1
      }
    }

    // Count side wall panels
    const modulesWithSideWalls = [
      "mit-tueren",
      "mit-klapptuer",
      "mit-klapptuer-oben",
      "mit-rueckwand",
      "ohne-rueckwand",
      "abschliessbar",
      "abschliessbare-tueren",
      "abschliessbar-links",
      "mit-tuere-links",
      "mit-tuere-rechts",
      "abschliessbar-rechts",
      "mit-einzelschublade",
      "mit-doppelschublade",
    ]

    const modulesWithFunktionswandBothSides = [
      "mit-tueren",
      "mit-klapptuer",
      "mit-klapptuer-oben",
      "abschliessbare-tueren",
      "mit-doppelschublade",
      "mit-einzelschublade",
    ]
    const modulesWithFunktionswandLeft = ["mit-tuere-links", "abschliessbar-rechts"]
    const modulesWithFunktionswandRight = ["mit-tuere-rechts", "abschliessbar-links"]

    const hasFunktionswandOnSide = (moduleType: string, side: "left" | "right"): boolean => {
      if (modulesWithFunktionswandBothSides.includes(moduleType)) return true
      if (side === "left") return modulesWithFunktionswandLeft.includes(moduleType)
      if (side === "right") return modulesWithFunktionswandRight.includes(moduleType)
      return false
    }

    if (modulesWithSideWalls.includes(cell.type)) {
      let sideWalls = 0
      const leftNeighbor = filledCells.find((c) => c.col === col - 1 && c.row === row)
      const rightNeighbor = filledCells.find((c) => c.col === col + 1 && c.row === row)

      const thisHasFunktionswandLeft = hasFunktionswandOnSide(cell.type, "left")
      const thisHasFunktionswandRight = hasFunktionswandOnSide(cell.type, "right")
      const leftNeighborHasFunktionswandRight =
        leftNeighbor && hasFunktionswandOnSide(leftNeighbor.cell.type, "right")
      const rightNeighborHasFunktionswandLeft =
        rightNeighbor && hasFunktionswandOnSide(rightNeighbor.cell.type, "left")

      if (!leftNeighbor || !modulesWithSideWalls.includes(leftNeighbor.cell.type)) {
        sideWalls += 1
      }

      if (!rightNeighbor || !modulesWithSideWalls.includes(rightNeighbor.cell.type)) {
        sideWalls += 1
      } else if (rightNeighbor && modulesWithSideWalls.includes(rightNeighbor.cell.type)) {
        if (!(thisHasFunktionswandRight && rightNeighborHasFunktionswandLeft)) {
          sideWalls += 1
        }
      }

      panels40cmByColor[cellColor] = (panels40cmByColor[cellColor] || 0) + sideWalls
    }
  }

  // Calculate Flächenset 40
  for (const [colorKey, panelCount] of Object.entries(panels40cmByColor)) {
    if (panelCount > 0) {
      const setsNeeded = Math.ceil(panelCount / 2)
      const colorLabel = getColorLabel(colorKey)
      const artNr = getFlaechensetArtNr(40, colorKey)
      const product = flaechensets.find((p) => p.artNr === artNr)
      addItem(artNr, `Flächenset 40 ${colorLabel}`, setsNeeded, product?.price || 15.0)
    }
  }

  // Calculate Flächenset 80
  for (const [colorKey, panelCount] of Object.entries(panels80cmByColor)) {
    if (panelCount > 0) {
      const setsNeeded = Math.ceil(panelCount / 2)
      const colorLabel = getColorLabel(colorKey)
      const artNr = getFlaechensetArtNr(80, colorKey)
      const product = flaechensets.find((p) => p.artNr === artNr)
      addItem(artNr, `Flächenset 80 ${colorLabel}`, setsNeeded, product?.price || 22.0)
    }
  }

  // --- SCHUBLADEN (Drawers) ---
  for (const { cell } of filledCells) {
    if (cell.type === "mit-doppelschublade") {
      const color = cell.color || "weiss"
      const artNr = getSchubladeArtNr(color)
      const colorLabel = getColorLabel(color)
      addItem(artNr, `Doppelschublade ${colorLabel}`, 1, 88.5)
    }
  }

  // --- TÜREN (Doors) ---
  for (const { cell } of filledCells) {
    if (
      cell.type === "mit-tueren" ||
      cell.type === "abschliessbare-tueren" ||
      cell.type === "mit-tuere-links" ||
      cell.type === "mit-tuere-rechts" ||
      cell.type === "abschliessbar-links" ||
      cell.type === "abschliessbar-rechts"
    ) {
      const color = cell.color || "weiss"
      const artNr = getTuerArtNr(color)
      const colorLabel = getColorLabel(color)

      const doorCount =
        cell.type === "mit-tuere-links" ||
        cell.type === "mit-tuere-rechts" ||
        cell.type === "abschliessbar-links" ||
        cell.type === "abschliessbar-rechts"
          ? 1
          : 2

      addItem(artNr, `Tür 40 cm ${colorLabel}`, doorCount, 45.0)
    }
  }

  // --- SCHLÖSSER (Locks) ---
  let lockCount = 0
  for (const { cell } of filledCells) {
    if (
      cell.type === "abschliessbare-tueren" ||
      cell.type === "abschliessbar-links" ||
      cell.type === "abschliessbar-rechts"
    ) {
      lockCount++
    }
  }
  if (lockCount > 0) {
    addItem("SIM1000a", "Schloss Typ A", lockCount, 25.0)
  }

  // --- KLAPPTÜREN ---
  for (const { cell } of filledCells) {
    if (cell.type === "mit-klapptuer") {
      const color = cell.color || "weiss"
      const artNr = getKlapptuerArtNr(color)
      const colorLabel = getColorLabel(color)
      addItem(artNr, `Klapptür ${colorLabel}`, 1, 65.0)
    }
  }

  // --- KLAPPTÜREN NACH OBEN ---
  for (const { cell } of filledCells) {
    if (cell.type === "mit-klapptuer-oben") {
      const color = cell.color || "weiss"
      const artNr = getKlapptuerObenArtNr(color)
      const colorLabel = getColorLabel(color)
      addItem(artNr, `Klapptür ${colorLabel} (nach oben)`, 1, 65.0)
    }
  }

  // --- EINZELSCHUBLADEN ---
  for (const { cell } of filledCells) {
    if (cell.type === "mit-einzelschublade") {
      const color = cell.color || "weiss"
      const artNr = `ES-${getEinzelschubladeArtNr(color)}`
      const colorLabel = getColorLabel(color)
      addItem(artNr, `Einzelschublade ${colorLabel}`, 1, 55.0)
    }
  }

  // --- FUNKTIONSWÄNDE ---
  let funktionswandCount = 0
  const modulesWithFunktionswand = [
    "mit-tueren",
    "mit-klapptuer",
    "mit-klapptuer-oben",
    "abschliessbare-tueren",
    "mit-doppelschublade",
    "mit-einzelschublade",
    "mit-tuere-links",
    "mit-tuere-rechts",
    "abschliessbar-links",
    "abschliessbar-rechts",
  ]

  for (const { cell, col, row } of filledCells) {
    if (modulesWithFunktionswand.includes(cell.type)) {
      const leftNeighbor = filledCells.find((c) => c.col === col - 1 && c.row === row)
      const rightNeighbor = filledCells.find((c) => c.col === col + 1 && c.row === row)

      // Simplified: count 2 Funktionswände per module, minus 1 for each neighbor that also has Funktionswand
      let fw = 2
      if (leftNeighbor && modulesWithFunktionswand.includes(leftNeighbor.cell.type)) {
        fw -= 1
      }
      if (rightNeighbor && modulesWithFunktionswand.includes(rightNeighbor.cell.type)) {
        // Only subtract if this module "owns" the shared wall (right side)
      }
      funktionswandCount += fw
    }
  }

  if (funktionswandCount > 0) {
    addItem("SIM030", "Funktionswand", funktionswandCount, 12.0)
  }

  // Calculate total price
  const items = Array.from(itemMap.values())
  const totalPrice = items.reduce((sum, item) => sum + item.total, 0)

  return Math.round(totalPrice * 100) / 100
}
