import type { GridCell, CellStyles, CellId } from "@/components/shelf-configurator"

export const getCellId = (row: number, col: number): CellId => `c-${row}-${col}`

export const createInitialGrid = (): GridCell[][] => {
  return [[{ id: "cell-0-0", type: "ghost", row: 0, col: 0 }]]
}

// Ghost cells should appear:
// 1. Above filled modules (at row index + 1)
// 2. To left/right of filled modules at the BOTTOM row (row 0)
export const updateGhostCells = (
  grid: GridCell[][],
  columnWidths: (75 | 38)[],
  defaultNewColumnWidth: 75 | 38 = 75,
): { grid: GridCell[][]; columnWidths: (75 | 38)[]; shifted: boolean } => {
  const rows = grid.length
  const cols = grid[0]?.length || 0
  let shifted = false

  // Pre-allocate the grid with correct dimensions
  const newGrid: GridCell[][] = new Array(rows)
  for (let r = 0; r < rows; r++) {
    newGrid[r] = new Array(cols)
    for (let c = 0; c < cols; c++) {
      const originalCell = grid[r][c]
      newGrid[r][c] = {
        id: originalCell.id,
        type: originalCell.type === "ghost" ? "empty" : originalCell.type,
        row: originalCell.row,
        col: originalCell.col,
        color: originalCell.color,
      }
    }
  }

  // Check for filled modules
  let hasFilledModules = false
  outer: for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = newGrid[r][c].type
      if (type !== "empty" && type !== "ghost") {
        hasFilledModules = true
        break outer
      }
    }
  }

  if (!hasFilledModules) {
    if (newGrid[0]?.[0]) {
      newGrid[0][0].type = "ghost"
    }
    return { grid: newGrid, columnWidths: columnWidths.slice(), shifted: false }
  }

  // Use a working copy for column widths
  const workingColumnWidths = columnWidths.slice()

  // Find the topmost row (highest index) that has filled modules - this is the visual TOP
  let topmostFilledRow = -1
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) {
      const type = newGrid[r][c].type
      if (type !== "empty" && type !== "ghost") {
        topmostFilledRow = r
        break
      }
    }
    if (topmostFilledRow !== -1) break
  }

  // Add a new row at the top if needed (highest row index has filled modules)
  if (topmostFilledRow === rows - 1) {
    const newTopRow: GridCell[] = new Array(cols)
    for (let c = 0; c < cols; c++) {
      newTopRow[c] = { id: `cell-${rows}-${c}`, type: "empty", row: rows, col: c }
    }
    newGrid.push(newTopRow)
  }

  // Add vertical stacking ghost cells - above each column's topmost filled module
  const updatedRows = newGrid.length
  const updatedCols = newGrid[0]?.length || 0

  for (let c = 0; c < updatedCols; c++) {
    // Find topmost filled cell in this column (highest row index with a module)
    let topmostInCol = -1
    for (let r = updatedRows - 1; r >= 0; r--) {
      const type = newGrid[r][c].type
      if (type !== "empty" && type !== "ghost") {
        topmostInCol = r
        break
      }
    }

    // Add ghost above the topmost filled cell
    if (topmostInCol !== -1 && topmostInCol + 1 < updatedRows) {
      if (newGrid[topmostInCol + 1][c].type === "empty") {
        newGrid[topmostInCol + 1][c].type = "ghost"
      }
    }
  }

  // Find leftmost and rightmost filled columns in BOTTOM row (row 0) for horizontal expansion
  let bottomLeftmost = updatedCols
  let bottomRightmost = -1
  for (let c = 0; c < updatedCols; c++) {
    const type = newGrid[0][c].type
    if (type !== "empty" && type !== "ghost") {
      if (c < bottomLeftmost) bottomLeftmost = c
      if (c > bottomRightmost) bottomRightmost = c
    }
  }

  // Left expansion - add column if leftmost filled is at column 0
  if (bottomLeftmost === 0) {
    const currentRows = newGrid.length
    for (let r = 0; r < currentRows; r++) {
      newGrid[r].unshift({
        id: `cell-${r}-0`,
        type: r === 0 ? "ghost" : "empty", // Ghost only at bottom row
        row: r,
        col: 0,
      })
    }
    // Update column indices
    for (let r = 0; r < currentRows; r++) {
      const row = newGrid[r]
      for (let c = 1; c < row.length; c++) {
        row[c].col = c
        row[c].id = `cell-${r}-${c}`
      }
    }
    workingColumnWidths.unshift(defaultNewColumnWidth)
    shifted = true
  } else if (bottomLeftmost > 0 && bottomLeftmost < updatedCols) {
    // Add ghost to the left of leftmost filled module at bottom row
    if (newGrid[0][bottomLeftmost - 1].type === "empty") {
      newGrid[0][bottomLeftmost - 1].type = "ghost"
    }
  }

  // Right expansion - recalculate after potential left expansion
  const currentColsAfterLeft = newGrid[0]?.length || 0
  let currentBottomRightmost = -1
  for (let c = 0; c < currentColsAfterLeft; c++) {
    const type = newGrid[0][c].type
    if (type !== "empty" && type !== "ghost") {
      currentBottomRightmost = c
    }
  }

  if (currentBottomRightmost === currentColsAfterLeft - 1) {
    // Add new column to the right
    const currentRows = newGrid.length
    for (let r = 0; r < currentRows; r++) {
      newGrid[r].push({
        id: `cell-${r}-${currentColsAfterLeft}`,
        type: r === 0 ? "ghost" : "empty", // Ghost only at bottom row
        row: r,
        col: currentColsAfterLeft,
      })
    }
    workingColumnWidths.push(defaultNewColumnWidth)
  } else if (currentBottomRightmost >= 0 && currentBottomRightmost + 1 < currentColsAfterLeft) {
    // Add ghost to the right of rightmost filled module at bottom row
    if (newGrid[0][currentBottomRightmost + 1].type === "empty") {
      newGrid[0][currentBottomRightmost + 1].type = "ghost"
    }
  }

  return { grid: newGrid, columnWidths: workingColumnWidths, shifted }
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

  // Check if there's a filled module below (lower row index = below)
  for (let r = row - 1; r >= 0; r--) {
    const cellBelow = grid[r]?.[col]
    if (cellBelow && cellBelow.type !== "empty" && cellBelow.type !== "ghost") {
      return true
    }
  }

  // Check horizontal neighbors at the same level
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
  const rows = grid.length
  const cols = grid[0]?.length || 0
  let shifted = false

  // Pre-allocate new grid
  let newGrid: GridCell[][] = new Array(rows)
  for (let r = 0; r < rows; r++) {
    newGrid[r] = new Array(cols)
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c]
      newGrid[r][c] = {
        id: cell.id,
        type: cell.type === "ghost" ? "empty" : cell.type,
        row: cell.row,
        col: cell.col,
        color: cell.color,
      }
    }
  }

  let workingColumnWidths = columnWidths.slice()

  // Check expansion needs
  let expandLeft = false
  let expandRight = false
  let expandUp = false

  // Check column 0 for filled cells (left edge)
  for (let r = 0; r < rows; r++) {
    const type = newGrid[r][0]?.type
    if (type && type !== "empty" && type !== "ghost") {
      expandLeft = true
      break
    }
  }

  // Check last column for filled cells (right edge)
  const lastColIdx = cols - 1
  for (let r = 0; r < rows; r++) {
    const type = newGrid[r][lastColIdx]?.type
    if (type && type !== "empty" && type !== "ghost") {
      expandRight = true
      break
    }
  }

  // Check top row (highest index) for filled cells
  const topRowIdx = rows - 1
  for (let c = 0; c < cols; c++) {
    const type = newGrid[topRowIdx]?.[c]?.type
    if (type && type !== "empty" && type !== "ghost") {
      expandUp = true
      break
    }
  }

  // Apply expansions
  if (expandLeft) {
    shifted = true
    const currentRows = newGrid.length
    const currentCols = newGrid[0]?.length || 0

    const expandedGrid: GridCell[][] = new Array(currentRows)
    for (let r = 0; r < currentRows; r++) {
      expandedGrid[r] = new Array(currentCols + 1)
      expandedGrid[r][0] = {
        id: `cell-${r}-0`,
        type: "empty",
        row: r,
        col: 0,
      }
      for (let c = 0; c < currentCols; c++) {
        const cell = newGrid[r][c]
        expandedGrid[r][c + 1] = {
          id: `cell-${r}-${c + 1}`,
          type: cell.type,
          row: r,
          col: c + 1,
          color: cell.color,
        }
      }
    }
    newGrid = expandedGrid
    workingColumnWidths = [defaultNewColumnWidth, ...workingColumnWidths]
  }

  if (expandRight) {
    const currentCols = newGrid[0]?.length || 0
    for (let r = 0; r < newGrid.length; r++) {
      newGrid[r].push({
        id: `cell-${r}-${currentCols}`,
        type: "empty",
        row: r,
        col: currentCols,
      })
    }
    workingColumnWidths.push(defaultNewColumnWidth)
  }

  if (expandUp) {
    const currentRows = newGrid.length
    const currentCols = newGrid[0]?.length || 0
    const newRow: GridCell[] = new Array(currentCols)
    for (let c = 0; c < currentCols; c++) {
      newRow[c] = {
        id: `cell-${currentRows}-${c}`,
        type: "empty",
        row: currentRows,
        col: c,
      }
    }
    newGrid.push(newRow)
  }

  // Add ghosts above topmost filled cells in each column
  const updatedRows = newGrid.length
  const updatedCols = newGrid[0]?.length || 0

  for (let c = 0; c < updatedCols; c++) {
    // Find topmost filled (highest row index)
    let topmostFilled = -1
    for (let r = updatedRows - 1; r >= 0; r--) {
      const type = newGrid[r][c].type
      if (type !== "empty" && type !== "ghost") {
        topmostFilled = r
        break
      }
    }
    if (topmostFilled !== -1 && topmostFilled + 1 < updatedRows) {
      if (newGrid[topmostFilled + 1][c].type === "empty") {
        newGrid[topmostFilled + 1][c].type = "ghost"
      }
    }
  }

  // Add horizontal ghosts in bottom row (row 0)
  let bottomLeftmost = updatedCols
  let bottomRightmost = -1
  for (let c = 0; c < updatedCols; c++) {
    const type = newGrid[0][c].type
    if (type !== "empty" && type !== "ghost") {
      if (c < bottomLeftmost) bottomLeftmost = c
      if (c > bottomRightmost) bottomRightmost = c
    }
  }

  if (bottomLeftmost > 0 && newGrid[0][bottomLeftmost - 1].type === "empty") {
    newGrid[0][bottomLeftmost - 1].type = "ghost"
  }
  if (bottomRightmost >= 0 && bottomRightmost + 1 < updatedCols && newGrid[0][bottomRightmost + 1].type === "empty") {
    newGrid[0][bottomRightmost + 1].type = "ghost"
  }

  return { grid: newGrid, columnWidths: workingColumnWidths, shifted }
}

export const pruneCellStyles = (styles: CellStyles, maxRows: number, maxCols: number): CellStyles => {
  const pruned: CellStyles = {}
  const keys = Object.keys(styles)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key.startsWith("c-")) {
      const parts = key.slice(2).split("-")
      if (parts.length === 2) {
        const row = Number.parseInt(parts[0], 10)
        const col = Number.parseInt(parts[1], 10)
        if (!isNaN(row) && !isNaN(col) && row < maxRows && col < maxCols) {
          pruned[key as CellId] = styles[key as CellId]
        }
      }
    }
  }
  return pruned
}
