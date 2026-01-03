/**
 * BOM (Bill of Materials) Generator for Simpli Connect Shelves
 * Automatically calculates required parts based on shelf configuration
 */

export type BomLine = {
  sku: string
  name: string
  qty: number
  unit: "pcs" | "set" | "pack"
  note?: string
}

export type BomConfig = {
  width: 38 | 75
  height: 40 | 80 | 120 | 160 | 200
  sections: number
  levels: number
  material: "metal" | "glass"
  finish: "black" | "white" | "blue" | "green" | "yellow" | "orange" | "red" | "satin"
  panels?: {
    shelves?: number
    sideWalls?: number
    backWalls?: number
  }
  modules?: {
    doors40?: number
    lockableDoors40?: number
    flapDoors?: number
    doubleDrawers80?: number
    jalousie80?: number
    functionalWall1?: number
    functionalWall2?: number
  }
}

/**
 * Validate configuration before BOM generation
 * Implements Rules J, K, L from specification
 */
export function validateConfig(config: BomConfig): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const compartments = config.sections * config.levels

  const frontsTotal =
    (config.modules?.doors40 || 0) +
    (config.modules?.lockableDoors40 || 0) +
    (config.modules?.flapDoors || 0) +
    (config.modules?.doubleDrawers80 || 0) +
    (config.modules?.jalousie80 || 0)

  if (frontsTotal > compartments) {
    errors.push(`Zu viele Frontmodule. Maximal ${compartments} erlaubt, ${frontsTotal} konfiguriert`)
  }

  if ((config.modules?.doors40 || 0) % 2 !== 0) {
    warnings.push("Türmodule 40 cm werden üblicherweise paarweise eingesetzt.")
  }

  if ((config.modules?.doubleDrawers80 || 0) > compartments) {
    errors.push(`Zu viele Doppelschubladen. Maximal ${compartments} erlaubt`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Generate complete BOM from configuration
 */
export function generateBOM(config: BomConfig): BomLine[] {
  const validation = validateConfig(config)
  if (!validation.valid) {
    console.warn("[v0] BOM Validation errors:", validation.errors)
    return []
  }
  if (validation.warnings.length > 0) {
    console.warn("[v0] BOM Validation warnings:", validation.warnings)
  }

  const sections = config.sections
  const levels = config.levels

  const shelves = config.panels?.shelves && config.panels.shelves > 0 ? config.panels.shelves : sections * levels

  const sideWalls = config.panels?.sideWalls || 0
  const backWalls = config.panels?.backWalls || 0

  const totalPanels = shelves + sideWalls + backWalls
  const tubeSetQty = sections * levels

  const bom: BomLine[] = []

  // LEITERN (Uprights)
  bom.push({
    sku: `SIM-UP-${config.height}`,
    name: `Leiter ${config.height} cm`,
    qty: sections + 1,
    unit: "pcs",
  })

  // STANGENSETS (Tube Sets)
  const tubeSetSku = config.material === "glass" ? `SIM-S-${config.width}-G` : `SIM-S-${config.width}-M`

  bom.push({
    sku: tubeSetSku,
    name: `Stangenset ${config.width} ${config.material === "glass" ? "Glas" : "Metall"}`,
    qty: tubeSetQty,
    unit: "set",
  })

  // FLÄCHEN (Panels/Shelves)
  const panelSku =
    config.material === "glass"
      ? `SIM-P-G-${config.width}-${config.finish}`
      : `SIM-P-M-${config.width}-${config.finish}`

  bom.push({
    sku: panelSku,
    name: `Flächen-Set ${config.material}`,
    qty: Math.ceil(totalPanels / 2),
    unit: "pack",
    note: "2 Stück pro Pack",
  })

  // ZUBEHÖR (Accessories)

  // Adapter
  bom.push({
    sku: "SIM-AD",
    name: "Adapter",
    qty: tubeSetQty * 4,
    unit: "pcs",
  })

  // Screwset
  bom.push({
    sku: "SIM-SCR-SET",
    name: "Schraubenset",
    qty: Math.max(1, Math.ceil(tubeSetQty / 4)),
    unit: "set",
  })

  // Extra screws for metal 75cm
  if (config.material === "metal" && config.width === 75) {
    bom.push({
      sku: "SIM-SCR-80",
      name: "Zusatzschrauben 80",
      qty: totalPanels,
      unit: "pcs",
    })
  }

  // Glass protection
  if (config.material === "glass") {
    bom.push({
      sku: "SIM-CP-G",
      name: "Eckschutz Glas",
      qty: totalPanels * 4,
      unit: "pcs",
    })

    // Stabilizer rod for 75cm glass
    if (config.width === 75) {
      bom.push({
        sku: "SIM-STAB-80",
        name: "Stabilisierungsstab 80",
        qty: tubeSetQty,
        unit: "pcs",
      })
    }
  }

  // MODULES

  if ((config.modules?.doors40 || 0) > 0) {
    bom.push({
      sku: "SIM-DOOR-40",
      name: "Tür 40 cm",
      qty: config.modules?.doors40!,
      unit: "pcs",
    })
  }

  if ((config.modules?.lockableDoors40 || 0) > 0) {
    bom.push({
      sku: "SIM-DOOR-40-LOCK",
      name: "Abschließbare Tür 40 cm",
      qty: config.modules?.lockableDoors40!,
      unit: "pcs",
    })
  }

  if ((config.modules?.flapDoors || 0) > 0) {
    bom.push({
      sku: "SIM-FLAP-DOOR",
      name: "Klapprahmen",
      qty: config.modules?.flapDoors!,
      unit: "pcs",
    })
  }

  if ((config.modules?.doubleDrawers80 || 0) > 0) {
    bom.push({
      sku: "SIM-DRAWER-80",
      name: "Doppelschublade 80 cm",
      qty: config.modules?.doubleDrawers80!,
      unit: "pcs",
    })
  }

  if ((config.modules?.jalousie80 || 0) > 0) {
    bom.push({
      sku: "SIM-JAL-80",
      name: "Jalousie 80 cm",
      qty: config.modules?.jalousie80!,
      unit: "pcs",
    })
  }

  if ((config.modules?.functionalWall1 || 0) > 0) {
    bom.push({
      sku: "SIM-FW1",
      name: "Funktionswand 1",
      qty: config.modules?.functionalWall1!,
      unit: "pcs",
    })
  }

  if ((config.modules?.functionalWall2 || 0) > 0) {
    bom.push({
      sku: "SIM-FW2",
      name: "Funktionswand 2",
      qty: config.modules?.functionalWall2!,
      unit: "pcs",
    })
  }

  // Filter out zero-qty lines and return
  return bom.filter((line) => line.qty > 0)
}

/**
 * Calculate just the main structural parts (for quick preview)
 */
export function calculateStructure(sections: number, levels: number, width: 38 | 75) {
  return {
    uprights: sections + 1,
    tubeSets: sections * levels,
    compartments: sections * levels,
  }
}
