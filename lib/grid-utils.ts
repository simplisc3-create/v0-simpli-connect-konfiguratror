import type { GridCell, CellStyles, CellId } from "@/components/shelf-configurator"

export const getCellId = (row: number, col: number): CellId => `c-${row}-${col}`

export const createInitialGrid = (): GridCell[][] => {
  return [[{ id: "cell-0-0", type: "ghost", row: 0, col: 0 }]]
}

export const updateGhostCells = (
  grid: GridCell[][],
  columnWidths: (75 | 38)[],
  defaultNewColumnWidth: 75 | 38 = 75,
): { grid: GridCell[][]; columnWidths: (75 | 38)[]; shifted: boolean } => {
  const rows = grid.length
  const cols = grid[0]?.length || 0
  const newGrid: GridCell[][] = []
  const newColumnWidths = [...columnWidths]
  let shifted = false

  // First pass: copy all non-ghost cells
  for (let r = 0; r < rows; r++) {
    newGrid[r] = []
    for (let c = 0; c < cols; c++) {
      const originalCell = grid[r][c]
      if (originalCell.type === "ghost") {
        newGrid[r][c] = { ...originalCell, type: "empty" }
      } else {
        newGrid[r][c] = { ...originalCell, type: originalCell.type, color: originalCell.color }
      }
    }
  }

  // Check if there are any filled modules
  const hasFilledModules = newGrid.some((row) => row.some((cell) => cell.type !== "empty" && cell.type !== "ghost"))

  if (!hasFilledModules) {
    if (newGrid[0] && newGrid[0][0]) {
      newGrid[0][0] = { ...newGrid[0][0], type: "ghost" }
    }
    return { grid: newGrid, columnWidths: newColumnWidths, shifted: false }
  }

  let needsTopRow = false
  const currentCols = newGrid[0]?.length || 0
  for (let c = 0; c < currentCols; c++) {
    if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
      needsTopRow = true
      break
    }
  }

  if (needsTopRow) {
    const newTopRow: GridCell[] = []
    for (let c = 0; c < currentCols; c++) {
      newTopRow.push({
        id: `cell-0-${c}`,
        type: "empty",
        row: 0,
        col: c,
      })
    }
    newGrid.unshift(newTopRow)
    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        newGrid[r][c].row = r
        newGrid[r][c].id = `cell-${r}-${c}`
      }
    }
    shifted = true
  }

  // Add vertical stacking ghost cells
  const updatedRows = newGrid.length
  const updatedCols = newGrid[0]?.length || 0
  for (let c = 0; c < updatedCols; c++) {
    let topmostFilledRow = -1
    for (let r = 0; r < updatedRows; r++) {
      if (newGrid[r][c].type !== "empty" && newGrid[r][c].type !== "ghost") {
        topmostFilledRow = r
        break
      }
    }
    if (topmostFilledRow > 0) {
      if (newGrid[topmostFilledRow - 1][c].type === "empty") {
        newGrid[topmostFilledRow - 1][c] = { ...newGrid[topmostFilledRow - 1][c], type: "ghost" }
      }
    }
  }

  // Find leftmost and rightmost filled columns
  let leftmostFilled = cols
  let rightmostFilled = -1
  for (let c = 0; c < cols; c++) {
    if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
      leftmostFilled = Math.min(leftmostFilled, c)
      rightmostFilled = Math.max(rightmostFilled, c)
    }
  }

  if (leftmostFilled === 0) {
    for (let r = 0; r < newGrid.length; r++) {
      newGrid[r].unshift({
        id: `cell-${r}-0`,
        type: r === 0 ? "ghost" : "empty",
        row: r,
        col: 0,
      })
    }
    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        newGrid[r][c].col = c
        newGrid[r][c].id = `cell-${r}-${c}`
      }
    }
    newColumnWidths.unshift(defaultNewColumnWidth)
    shifted = true
  } else if (leftmostFilled > 0) {
    if (newGrid[0][leftmostFilled - 1].type === "empty") {
      newGrid[0][leftmostFilled - 1] = { ...newGrid[0][leftmostFilled - 1], type: "ghost" }
    }
  }

  // Right expansion
  const currentColsAfterLeftExpansion = newGrid[0]?.length || 0
  let currentRightmostFilled = -1
  for (let c = 0; c < currentColsAfterLeftExpansion; c++) {
    if (newGrid[0][c].type !== "empty" && newGrid[0][c].type !== "ghost") {
      currentRightmostFilled = Math.max(currentRightmostFilled, c)
    }
  }

  if (currentRightmostFilled === currentColsAfterLeftExpansion - 1) {
    for (let r = 0; r < newGrid.length; r++) {
      newGrid[r].push({
        id: `cell-${r}-${currentColsAfterLeftExpansion}`,
        type: r === 0 ? "ghost" : "empty",
        row: r,
        col: currentColsAfterLeftExpansion,
      })
    }
    newColumnWidths.push(defaultNewColumnWidth)
  } else if (currentRightmostFilled >= 0 && currentRightmostFilled + 1 < currentColsAfterLeftExpansion) {
    if (newGrid[0][currentRightmostFilled + 1].type === "empty") {
      newGrid[0][currentRightmostFilled + 1] = { ...newGrid[0][currentRightmostFilled + 1], type: "ghost" }
    }
  }

  return { grid: newGrid, columnWidths: newColumnWidths, shifted }
}

export const getColumnHeights = (grid: GridCell[][]): number[] => {
  const heights: number[] = []
  grid[0]?.forEach((_, colIndex) => {
    let maxHeight = 0
    for (let row = grid.length - 1; row >= 0; row--) {
      if (grid[row]?.[colIndex]?.type !== "empty" && grid[row]?.[colIndex]?.type !== "ghost") {
        maxHeight = grid.length - row
        break
      }
    }
    heights[colIndex] = maxHeight
  })
  return heights
}

export const isConnectedToExisting = (
  row: number,
  col: number,
  grid: GridCell[][],
  type?: GridCell["type"],
): boolean => {
  const currentCell = grid[row]?.[col]
  if (type === "empty") {
    return currentCell !== undefined && currentCell.type !== "empty"
  }
  if (!currentCell || currentCell.type !== "ghost") {
    return false
  }
  return true
}

export const hasSupportBelow = (row: number, col: number, grid: GridCell[][]): boolean => {
  const hasAnyFilledModule = grid.some((r) => r.some((c) => c.type !== "empty" && c.type !== "ghost"))
  if (!hasAnyFilledModule) return true

  for (let r = row - 1; r >= 0; r--) {
    const cellBelow = grid[r]?.[col]
    if (cellBelow && cellBelow.type !== "empty" && cellBelow.type !== "ghost") {
      return true
    }
  }

  const leftCell = grid[row]?.[col - 1]
  const rightCell = grid[row]?.[col + 1]
  if (
    (leftCell && leftCell.type !== "empty" && leftCell.type !== "ghost") ||
    (rightCell && rightCell.type !== "empty" && rightCell.type !== "ghost")
  ) {
    return true
  }

  return false
}

export const expandGridAroundPlacement = (
  grid: GridCell[][],
  placedRow: number,
  placedCol: number,
  columnWidths: (75 | 38)[] = [],
  defaultNewColumnWidth: 75 | 38 = 75,
): { grid: GridCell[][]; columnWidths: (75 | 38)[]; shifted: boolean } => {
  let newGrid = grid.map((row) => [...row])
  let newColumnWidths = [...columnWidths]
  let shifted = false
  const rows = newGrid.length
  const cols = newGrid[0]?.length || 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].type === "ghost") {
        newGrid[r][c] = { ...newGrid[r][c], type: "empty" }
      }
    }
  }

  let expandLeft = false
  let expandRight = false
  let expandUp = false

  const hasFilledAtCol0 = newGrid.some((row) => row[0] && row[0].type !== "empty" && row[0].type !== "ghost")
  if (hasFilledAtCol0) {
    expandLeft = true
  }

  const lastColIdx = cols - 1
  const hasFilledAtLastCol = newGrid.some((row) => {
    const cell = row[lastColIdx]
    return cell && cell.type !== "empty" && cell.type !== "ghost"
  })
  if (hasFilledAtLastCol) {
    expandRight = true
  }

  const topRowIdx = rows - 1
  const hasFilledAtTopRow = newGrid[topRowIdx]?.some((cell) => cell.type !== "empty" && cell.type !== "ghost")
  if (hasFilledAtTopRow) {
    expandUp = true
  }

  if (expandLeft) {
    shifted = true
    newGrid = newGrid.map((row, ri) => {
      const newCell: GridCell = {
        id: `cell-${ri}--1-temp`,
        type: "empty" as const,
        row: ri,
        col: -1,
      }
      return [newCell, ...row.map((c) => ({ ...c, col: c.col + 1, id: `cell-${c.row}-${c.col + 1}` }))]
    })
    newColumnWidths = [defaultNewColumnWidth as const, ...newColumnWidths]
  }

  if (expandRight) {
    const currentCols = newGrid[0]?.length || 0
    newGrid = newGrid.map((row, ri) => {
      const newCell: GridCell = {
        id: `cell-${ri}-${currentCols}`,
        type: "empty" as const,
        row: ri,
        col: currentCols,
      }
      return [...row, newCell]
    })
    newColumnWidths.push(defaultNewColumnWidth as const)
  }

  if (expandUp) {
    const currentRows = newGrid.length
    const currentCols = newGrid[0]?.length || 0
    const newRow = Array.from({ length: currentCols }, (_, ci) => ({
      id: `cell-${currentRows}-${ci}`,
      type: "empty" as const,
      row: currentRows,
      col: ci,
    }))
    newGrid.push(newRow)
  }

  const updatedRows = newGrid.length
  const updatedCols = newGrid[0]?.length || 0

  for (let r = 0; r < updatedRows; r++) {
    for (let c = 0; c < updatedCols; c++) {
      newGrid[r][c].row = r
      newGrid[r][c].col = c
      newGrid[r][c].id = `cell-${r}-${c}`
    }
  }

  // Add ghosts above topmost filled cells in each column
  for (let c = 0; c < updatedCols; c++) {
    let topmostFilled = -1
    for (let r = updatedRows - 1; r >= 0; r--) {
      if (newGrid[r][c].type !== "empty" && newGrid[r][c].type !== "ghost") {
        topmostFilled = r
        break
      }
    }
    if (topmostFilled >= 0 && topmostFilled + 1 < updatedRows) {
      if (newGrid[topmostFilled + 1][c].type === "empty") {
        newGrid[topmostFilled + 1][c] = { ...newGrid[topmostFilled + 1][c], type: "ghost" }
      }
    }
  }

  // Add horizontal ghosts adjacent to filled cells in the top row
  let topRowLeftmost = updatedCols
  let topRowRightmost = -1
  for (let c = 0; c < updatedCols; c++) {
    const cell = newGrid[0][c]
    if (cell.type !== "empty" && cell.type !== "ghost") {
      topRowLeftmost = Math.min(topRowLeftmost, c)
      topRowRightmost = Math.max(topRowRightmost, c)
    }
  }
  if (topRowLeftmost > 0 && newGrid[0][topRowLeftmost - 1].type === "empty") {
    newGrid[0][topRowLeftmost - 1] = { ...newGrid[0][topRowLeftmost - 1], type: "ghost" }
  }
  if (topRowRightmost >= 0 && topRowRightmost + 1 < updatedCols && newGrid[0][topRowRightmost + 1].type === "empty") {
    newGrid[0][topRowRightmost + 1] = { ...newGrid[0][topRowRightmost + 1], type: "ghost" }
  }

  return { grid: newGrid, columnWidths: newColumnWidths, shifted }
}

export const pruneCellStyles = (styles: CellStyles, maxRows: number, maxCols: number): CellStyles => {
  const pruned: CellStyles = {}
  Object.entries(styles).forEach(([key, value]) => {
    const match = key.match(/^c-(\d+)-(\d+)$/)
    if (match) {
      const row = Number.parseInt(match[1], 10)
      const col = Number.parseInt(match[2], 10)
      if (row < maxRows && col < maxCols) {
        pruned[key as CellId] = value
      }
    }
  })
  return pruned
}
