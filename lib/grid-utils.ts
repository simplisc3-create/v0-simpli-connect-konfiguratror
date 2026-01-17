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
  let shifted = false

  // Pre-allocate the grid with correct dimensions instead of dynamic pushing
  const newGrid: GridCell[][] = new Array(rows)
  for (let r = 0; r < rows; r++) {
    newGrid[r] = new Array(cols)
    for (let c = 0; c < cols; c++) {
      const originalCell = grid[r][c]
      // Reuse object structure, only change type if needed
      newGrid[r][c] = {
        id: originalCell.id,
        type: originalCell.type === "ghost" ? "empty" : originalCell.type,
        row: originalCell.row,
        col: originalCell.col,
        color: originalCell.color,
      }
    }
  }

  // Single pass to check for filled modules
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

  // Check if top row has filled modules
  let needsTopRow = false
  const currentCols = newGrid[0]?.length || 0
  for (let c = 0; c < currentCols; c++) {
    const type = newGrid[0][c].type
    if (type !== "empty" && type !== "ghost") {
      needsTopRow = true
      break
    }
  }

  // Use a working copy for column widths
  const workingColumnWidths = columnWidths.slice()

  if (needsTopRow) {
    // Pre-allocate new top row
    const newTopRow: GridCell[] = new Array(currentCols)
    for (let c = 0; c < currentCols; c++) {
      newTopRow[c] = { id: `cell-0-${c}`, type: "empty", row: 0, col: c }
    }
    newGrid.unshift(newTopRow)
    // Update IDs and rows in single pass
    const updatedRows = newGrid.length
    for (let r = 0; r < updatedRows; r++) {
      const row = newGrid[r]
      for (let c = 0; c < row.length; c++) {
        row[c].row = r
        row[c].id = `cell-${r}-${c}`
      }
    }
    shifted = true
  }

  // Add vertical stacking ghost cells - single pass per column
  const updatedRows = newGrid.length
  const updatedCols = newGrid[0]?.length || 0
  for (let c = 0; c < updatedCols; c++) {
    for (let r = 0; r < updatedRows; r++) {
      const type = newGrid[r][c].type
      if (type !== "empty" && type !== "ghost") {
        // Found topmost filled, check cell above
        if (r > 0 && newGrid[r - 1][c].type === "empty") {
          newGrid[r - 1][c].type = "ghost"
        }
        break
      }
    }
  }

  // Find leftmost and rightmost filled columns in single pass
  let leftmostFilled = updatedCols
  let rightmostFilled = -1
  for (let c = 0; c < updatedCols; c++) {
    const type = newGrid[0][c].type
    if (type !== "empty" && type !== "ghost") {
      if (c < leftmostFilled) leftmostFilled = c
      if (c > rightmostFilled) rightmostFilled = c
    }
  }

  // Left expansion
  if (leftmostFilled === 0) {
    const currentRows = newGrid.length
    for (let r = 0; r < currentRows; r++) {
      // Insert at beginning - use unshift once per row
      newGrid[r].unshift({
        id: `cell-${r}-0`,
        type: r === 0 ? "ghost" : "empty",
        row: r,
        col: 0,
      })
    }
    // Update column indices in single pass
    for (let r = 0; r < currentRows; r++) {
      const row = newGrid[r]
      for (let c = 1; c < row.length; c++) {
        row[c].col = c
        row[c].id = `cell-${r}-${c}`
      }
    }
    workingColumnWidths.unshift(defaultNewColumnWidth)
    shifted = true
  } else if (leftmostFilled > 0 && newGrid[0][leftmostFilled - 1].type === "empty") {
    newGrid[0][leftmostFilled - 1].type = "ghost"
  }

  // Right expansion - recalculate after potential left expansion
  const currentColsAfterLeft = newGrid[0]?.length || 0
  let currentRightmostFilled = -1
  for (let c = 0; c < currentColsAfterLeft; c++) {
    const type = newGrid[0][c].type
    if (type !== "empty" && type !== "ghost") {
      currentRightmostFilled = c
    }
  }

  if (currentRightmostFilled === currentColsAfterLeft - 1) {
    const currentRows = newGrid.length
    for (let r = 0; r < currentRows; r++) {
      newGrid[r].push({
        id: `cell-${r}-${currentColsAfterLeft}`,
        type: r === 0 ? "ghost" : "empty",
        row: r,
        col: currentColsAfterLeft,
      })
    }
    workingColumnWidths.push(defaultNewColumnWidth)
  } else if (currentRightmostFilled >= 0 && currentRightmostFilled + 1 < currentColsAfterLeft) {
    if (newGrid[0][currentRightmostFilled + 1].type === "empty") {
      newGrid[0][currentRightmostFilled + 1].type = "ghost"
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
  const rows = grid.length
  const cols = grid[0]?.length || 0
  let shifted = false

  // Pre-allocate new grid - shallow copy rows, create new cell objects
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

  // Check expansion needs in single passes
  let expandLeft = false
  let expandRight = false
  let expandUp = false

  // Check column 0 for filled cells
  for (let r = 0; r < rows; r++) {
    const type = newGrid[r][0]?.type
    if (type && type !== "empty" && type !== "ghost") {
      expandLeft = true
      break
    }
  }

  // Check last column for filled cells
  const lastColIdx = cols - 1
  for (let r = 0; r < rows; r++) {
    const type = newGrid[r][lastColIdx]?.type
    if (type && type !== "empty" && type !== "ghost") {
      expandRight = true
      break
    }
  }

  // Check top row for filled cells
  const topRowIdx = rows - 1
  for (let c = 0; c < cols; c++) {
    const type = newGrid[topRowIdx]?.[c]?.type
    if (type && type !== "empty" && type !== "ghost") {
      expandUp = true
      break
    }
  }

  // Apply expansions - batch operations instead of per-cell
  if (expandLeft) {
    shifted = true
    const currentRows = newGrid.length
    const currentCols = newGrid[0]?.length || 0

    // Create new grid with extra column pre-allocated
    const expandedGrid: GridCell[][] = new Array(currentRows)
    for (let r = 0; r < currentRows; r++) {
      expandedGrid[r] = new Array(currentCols + 1)
      // New cell at column 0
      expandedGrid[r][0] = {
        id: `cell-${r}-0`,
        type: "empty",
        row: r,
        col: 0,
      }
      // Copy existing cells with updated column indices
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
    // Pre-allocate new row
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

  // Final pass to ensure IDs are correct and add ghosts
  const updatedRows = newGrid.length
  const updatedCols = newGrid[0]?.length || 0

  // Add ghosts above topmost filled cells in each column
  for (let c = 0; c < updatedCols; c++) {
    for (let r = updatedRows - 1; r >= 0; r--) {
      const type = newGrid[r][c].type
      if (type !== "empty" && type !== "ghost") {
        // Found topmost filled
        if (r + 1 < updatedRows && newGrid[r + 1][c].type === "empty") {
          newGrid[r + 1][c].type = "ghost"
        }
        break
      }
    }
  }

  // Add horizontal ghosts in bottom row (row 0)
  let topRowLeftmost = updatedCols
  let topRowRightmost = -1
  for (let c = 0; c < updatedCols; c++) {
    const type = newGrid[0][c].type
    if (type !== "empty" && type !== "ghost") {
      if (c < topRowLeftmost) topRowLeftmost = c
      if (c > topRowRightmost) topRowRightmost = c
    }
  }

  if (topRowLeftmost > 0 && newGrid[0][topRowLeftmost - 1].type === "empty") {
    newGrid[0][topRowLeftmost - 1].type = "ghost"
  }
  if (topRowRightmost >= 0 && topRowRightmost + 1 < updatedCols && newGrid[0][topRowRightmost + 1].type === "empty") {
    newGrid[0][topRowRightmost + 1].type = "ghost"
  }

  return { grid: newGrid, columnWidths: workingColumnWidths, shifted }
}

export const pruneCellStyles = (styles: CellStyles, maxRows: number, maxCols: number): CellStyles => {
  const pruned: CellStyles = {}
  const keys = Object.keys(styles)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    // Parse "c-{row}-{col}" format without regex
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
