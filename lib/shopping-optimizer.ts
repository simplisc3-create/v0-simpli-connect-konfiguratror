import type { ShelfConfig, GridCell, ShoppingItem } from "@/components/shelf-configurator"
import {
  type Product,
  leitern,
  stangensets,
  metallboeden,
  glasboeden,
  holzboeden,
  schubladenTueren,
  funktionswaende,
} from "@/lib/simpli-products"

export type OptimizationResult = {
  shoppingList: ShoppingItem[]
  totalPrice: number
  savings: number
  suggestions: OptimizationSuggestion[]
  optimalPackages: BuyingPackage[]
}

export type OptimizationSuggestion = {
  type: "bundle" | "alternative" | "quantity" | "upgrade" | "savings"
  message: string
  potentialSavings: number
  action?: () => void
}

export type BuyingPackage = {
  id: string
  name: string
  description: string
  items: ShoppingItem[]
  packagePrice: number
  regularPrice: number
  savings: number
  priority: "essential" | "recommended" | "optional"
}

function getToolLabel(tool: GridCell["type"]): string {
  const labels: Record<GridCell["type"], string> = {
    empty: "Leer",
    "ohne-seitenwaende": "Offenes Fach",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-doppelschublade": "Mit Schubladen",
    "abschliessbare-tueren": "Abschließbar",
  }
  return labels[tool] || tool
}

export function optimizeShoppingList(config: ShelfConfig): OptimizationResult {
  const items: Map<string, ShoppingItem> = new Map()
  const suggestions: OptimizationSuggestion[] = []
  const packages: BuyingPackage[] = []

  const addItem = (product: Product, qty = 1) => {
    const existing = items.get(product.artNr)
    if (existing) {
      existing.quantity += qty
      existing.subtotal = existing.quantity * existing.product.price
    } else {
      items.set(product.artNr, {
        product,
        quantity: qty,
        subtotal: product.price * qty,
      })
    }
  }

  const filledCells = config.grid.flat().filter((c) => c.type !== "empty")

  if (filledCells.length === 0) {
    return { shoppingList: [], totalPrice: 0, savings: 0, suggestions: [], optimalPackages: [] }
  }

  // Calculate optimal ladder height based on total shelf height
  const totalHeightCm = config.rowHeights.reduce((sum, h) => sum + h, 0)
  let leiterHeight = 40
  if (totalHeightCm > 160) leiterHeight = 200
  else if (totalHeightCm > 120) leiterHeight = 160
  else if (totalHeightCm > 80) leiterHeight = 120
  else if (totalHeightCm > 40) leiterHeight = 80

  const leiterProduct = leitern.find((l) => l.size === leiterHeight)
  if (leiterProduct) {
    addItem(leiterProduct, config.columns + 1)
  }

  // Each Stangenset contains 2 tubes (front + back) and connects between two uprights
  // For each row, we need horizontal tube sets at top and bottom = rows + 1 levels
  // But each Stangenset package contains 2 tubes, so we need:
  // - Number of tube positions = (rows + 1) levels × columns
  // - Each position needs tubes for front AND back depth
  // - Since each Stangenset contains 2 tubes (for front+back), we need 1 set per position
  //
  // CORRECT FORMULA: Each level needs tube sets equal to number of columns
  // Total Stangensets = columns × (rows + 1) levels
  // BUT: Looking at real SIMPLI-CONNECT, each LEVEL is a horizontal plane
  // A shelf with 2 rows has 2 horizontal shelves, needing tubes at:
  // - Bottom (floor level) - optional, often just feet
  // - Between row 1 and 2 (middle shelf)
  // - Top
  //
  // Per the documentation, Stangensets connect BETWEEN uprights horizontally
  // So for 3 columns = 3 bays, each bay needs 1 Stangenset per level
  // For 2 rows: shelves are at row boundaries = 2 shelf levels (not 3!)
  const shelfLevels = config.rows + 1 // Number of horizontal frame levels (bottom, between rows, top)

  // Count columns by width
  const col80Count = config.columnWidths.filter((w) => w === 75).length
  const col40Count = config.columnWidths.filter((w) => w === 38).length

  const stange80 = stangensets.find((s) => s.size === 80 && s.variant === "metall")
  const stange40 = stangensets.find((s) => s.size === 40 && s.variant === "metall")

  // Each column needs Stangensets for each shelf level
  // Example: 3 columns, 2 rows = 3 × 3 = 9 Stangensets
  if (stange80 && col80Count > 0) addItem(stange80, col80Count * shelfLevels)
  if (stange40 && col40Count > 0) addItem(stange40, col40Count * shelfLevels)

  // Track color and type usage for optimization suggestions
  const colorUsage: Record<string, number> = {}
  const typeUsage: Record<string, number> = {}

  filledCells.forEach((cell) => {
    const cellWidth = config.columnWidths[cell.col]
    const bodenSize = cellWidth === 75 ? 80 : 40
    const cellColor = cell.color || (config.accentColor !== "none" ? config.accentColor : config.baseColor)

    // Track for optimization
    colorUsage[cellColor] = (colorUsage[cellColor] || 0) + 1
    typeUsage[cell.type] = (typeUsage[cell.type] || 0) + 1

    // Get shelf product based on material preference
    let shelfProduct: Product | undefined
    if (config.shelfMaterial === "metall") {
      shelfProduct =
        metallboeden.find((p) => p.size === bodenSize && p.color === cellColor) ||
        metallboeden.find((p) => p.size === bodenSize && p.color === "weiss")
    } else if (config.shelfMaterial === "glas") {
      shelfProduct = glasboeden.find((p) => p.size === bodenSize)
    } else {
      shelfProduct = holzboeden.find((p) => p.size === bodenSize)
    }

    if (shelfProduct) addItem(shelfProduct, 1)

    // Add accessories based on module type
    switch (cell.type) {
      case "mit-rueckwand": {
        const backPanel =
          funktionswaende.find((p) => p.variant === "1-seitig" && p.color === cellColor) ||
          funktionswaende.find((p) => p.variant === "1-seitig")
        if (backPanel) addItem(backPanel, 1)
        break
      }
      case "mit-tueren":
      case "abschliessbare-tueren": {
        const door =
          schubladenTueren.find((p) => p.category === "tuer" && p.color === cellColor) ||
          schubladenTueren.find((p) => p.category === "tuer")
        if (door) addItem(door, 2) // Two doors per compartment
        break
      }
      case "mit-klapptuer": {
        const door =
          schubladenTueren.find((p) => p.category === "tuer" && p.color === cellColor) ||
          schubladenTueren.find((p) => p.category === "tuer")
        if (door) addItem(door, 1)
        break
      }
      case "mit-doppelschublade": {
        const drawer =
          schubladenTueren.find((p) => p.category === "schublade" && p.color === cellColor) ||
          schubladenTueren.find((p) => p.category === "schublade")
        if (drawer) addItem(drawer, 1)
        break
      }
    }
  })

  const list = Array.from(items.values())
  const total = list.reduce((sum, item) => sum + item.subtotal, 0)

  const frameItems = list.filter((item) => item.product.category === "leiter" || item.product.category === "stangenset")
  const shelfItems = list.filter(
    (item) =>
      item.product.category === "metallboden" ||
      item.product.category === "glasboden" ||
      item.product.category === "holzboden",
  )
  const accessoryItems = list.filter(
    (item) =>
      item.product.category === "tuer" ||
      item.product.category === "schublade" ||
      item.product.category === "funktionswand" ||
      item.product.category === "jalousie",
  )

  // Package 1: Essential Frame Structure
  if (frameItems.length > 0) {
    const frameTotal = frameItems.reduce((sum, item) => sum + item.subtotal, 0)
    packages.push({
      id: "frame",
      name: "Grundgerüst",
      description: `${config.columns + 1} Leitern + ${config.rows + 1} Stangensets pro Spalte`,
      items: frameItems,
      packagePrice: frameTotal,
      regularPrice: frameTotal,
      savings: 0,
      priority: "essential",
    })
  }

  // Package 2: Shelf Panels
  if (shelfItems.length > 0) {
    const shelfTotal = shelfItems.reduce((sum, item) => sum + item.subtotal, 0)
    packages.push({
      id: "shelves",
      name: "Böden & Flächen",
      description: `${filledCells.length} ${config.shelfMaterial === "metall" ? "Metallböden" : config.shelfMaterial === "glas" ? "Glasböden" : "Holzböden"}`,
      items: shelfItems,
      packagePrice: shelfTotal,
      regularPrice: shelfTotal,
      savings: 0,
      priority: "essential",
    })
  }

  // Package 3: Accessories (doors, drawers, back panels)
  if (accessoryItems.length > 0) {
    const accessoryTotal = accessoryItems.reduce((sum, item) => sum + item.subtotal, 0)
    packages.push({
      id: "accessories",
      name: "Zubehör",
      description: "Türen, Schubladen, Rückwände",
      items: accessoryItems,
      packagePrice: accessoryTotal,
      regularPrice: accessoryTotal,
      savings: 0,
      priority: "recommended",
    })
  }

  // Generate optimization suggestions
  const uniqueColors = Object.keys(colorUsage).length
  if (uniqueColors > 3) {
    suggestions.push({
      type: "alternative",
      message: `Du verwendest ${uniqueColors} verschiedene Farben. Weniger Farben können die Bestellung vereinfachen.`,
      potentialSavings: uniqueColors * 2,
    })
  }

  // Suggest bulk buying for repeated module types
  Object.entries(typeUsage).forEach(([type, count]) => {
    if (count >= 4 && type !== "ohne-seitenwaende") {
      suggestions.push({
        type: "quantity",
        message: `${count}x ${getToolLabel(type as GridCell["type"])} - Mengenrabatt möglich!`,
        potentialSavings: count * 1.5,
      })
    }
  })

  // Suggest standard colors for potential savings
  const specialColorCount = Object.entries(colorUsage)
    .filter(([color]) => !["weiss", "schwarz"].includes(color))
    .reduce((sum, [, count]) => sum + count, 0)

  if (specialColorCount > 2) {
    suggestions.push({
      type: "savings",
      message: "Tipp: Standardfarben (Weiß/Schwarz) sind oft schneller lieferbar.",
      potentialSavings: 0,
    })
  }

  const emptyCount = config.grid.flat().filter((c) => c.type === "empty").length
  if (emptyCount > config.columns) {
    suggestions.push({
      type: "bundle",
      message: `${emptyCount} leere Zellen. Verkleinere das Raster um Material zu sparen.`,
      potentialSavings: emptyCount * 5,
    })
  }

  const potentialSavings = suggestions.reduce((sum, s) => sum + s.potentialSavings, 0)

  return {
    shoppingList: list,
    totalPrice: total,
    savings: potentialSavings,
    suggestions,
    optimalPackages: packages,
  }
}
