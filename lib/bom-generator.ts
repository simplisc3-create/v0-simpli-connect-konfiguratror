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
  sections: number // modules horizontally (width count)
  levels: number // shelf levels/rows
  height: number // total height in cm (40, 80, 120, 160, 200)
  width: 38 | 75 // module width in cm
  material: "metall" | "glas" | "holz"
  panelFinish: "weiss" | "schwarz" | "blau" | "gruen" | "gelb" | "orange" | "rot"
  shelves?: number // explicit shelf count (auto-calculated if not set)
  sideWalls?: number
  backWalls?: number
  doors40?: number
  lockableDoors40?: number
  flapDoors?: number
  doubleDrawers80?: number
  jalousie80?: number
  led2?: number
  led4?: number
}

/**
 * Validate configuration before BOM generation
 */
export function validateConfig(config: BomConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const compartments = config.sections * config.levels

  // Module limits
  const frontsTotal =
    (config.doors40 || 0) +
    (config.lockableDoors40 || 0) +
    (config.flapDoors || 0) +
    (config.doubleDrawers80 || 0) +
    (config.jalousie80 || 0)

  if (frontsTotal > compartments) {
    errors.push(`Zu viele Front-Module: maximal ${compartments} erlaubt, ${frontsTotal} konfiguriert`)
  }

  // Door 40 should be even
  if ((config.doors40 || 0) % 2 !== 0) {
    errors.push("Tür 40 Module sollten in geraden Anzahlen verwendet werden (paarweise)")
  }

  // LED limit
  const ledTotal = (config.led2 || 0) + (config.led4 || 0)
  if (ledTotal > config.sections) {
    errors.push(`LED-Units (${ledTotal}) sollten nicht mehr als Sektionen (${config.sections}) sein`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate complete BOM from configuration
 */
export function generateBOM(config: BomConfig): BomLine[] {
  const validation = validateConfig(config)
  if (!validation.valid) {
    console.warn("[v0] BOM Validation warnings:", validation.errors)
  }

  const compartments = config.sections * config.levels

  const shelves = config.shelves && config.shelves > 0 ? config.shelves : compartments
  const sideWalls = config.sideWalls || 0
  const backWalls = config.backWalls || 0

  const totalPanels = shelves + sideWalls + backWalls
  const panelPacks = Math.ceil(totalPanels / 2)

  const uprightsQty = config.sections + 1
  const tubeSetQty = config.sections * config.levels

  const bom: BomLine[] = []

  // STRUCTURE PARTS

  // Uprights/Leitern
  bom.push({
    sku: `SIM-UP-${config.height}`,
    name: `Leiter ${config.height} cm`,
    qty: uprightsQty,
    unit: "pcs",
    note: `${config.sections} Module benötigen ${uprightsQty} Leitern`,
  })

  // Tube Sets
  const tubeSetName =
    config.material === "glas"
      ? `Stangenset ${config.width} cm (Glas)`
      : config.material === "holz"
        ? `Stangenset ${config.width} cm (Holz)`
        : `Stangenset ${config.width} cm (Metall)`

  bom.push({
    sku: `SIM-TUBE-${config.width}-${config.material}`,
    name: tubeSetName,
    qty: tubeSetQty,
    unit: "set",
    note: `${config.sections} Sektionen × ${config.levels} Ebenen`,
  })

  // Panels
  const panelDescription =
    config.material === "glas"
      ? `Glasfläche ${config.width} cm`
      : config.material === "holz"
        ? `Holzfläche ${config.width} cm`
        : `Metallfläche ${config.width} cm`

  bom.push({
    sku: `SIM-PAN-${config.width}-${config.material}-${config.panelFinish}`,
    name: panelDescription,
    qty: panelPacks,
    unit: "pack",
    note: `2 Stück pro Pack. Gesamt: ${totalPanels} Flächen (${shelves} Böden, ${sideWalls} Seitenwände, ${backWalls} Rückwände)`,
  })

  // ACCESSORIES

  // Adapters
  bom.push({
    sku: "SIM-AD-4",
    name: "Adapter-Set (4er)",
    qty: tubeSetQty,
    unit: "set",
    note: "4 Adapter pro Stangenset",
  })

  // Screw Sets
  const screwSetQty = Math.max(1, Math.ceil(tubeSetQty / 4))
  bom.push({
    sku: "SIM-SCR-SET",
    name: "Schraubenset",
    qty: screwSetQty,
    unit: "set",
  })

  // Extra metal screws for 80cm (75) width
  if ((config.material === "metall" || config.material === "holz") && config.width === 75) {
    bom.push({
      sku: "SIM-SCR-80-EX",
      name: "Zusatzschrauben für 80er Breite",
      qty: totalPanels,
      unit: "pcs",
      note: "Pro Metallfläche erforderlich",
    })
  }

  // Glass protection
  if (config.material === "glas") {
    bom.push({
      sku: "SIM-CP-4",
      name: "Eckschutz Glas (4er)",
      qty: totalPanels,
      unit: "set",
      note: "4 Eckschützer pro Glasfläche",
    })

    // Stabilizer rod for large glass
    if (config.width === 75) {
      bom.push({
        sku: "SIM-STAB-80-ROD",
        name: "Stabilisierungsstab für 80cm Glas",
        qty: tubeSetQty,
        unit: "pcs",
        note: "Pro Ebene/Sektion",
      })
    }
  }

  // MODULES

  if ((config.doors40 || 0) > 0) {
    bom.push({
      sku: "SIM-DOOR-40",
      name: "Tür 40 cm",
      qty: config.doors40!,
      unit: "pcs",
    })
  }

  if ((config.lockableDoors40 || 0) > 0) {
    bom.push({
      sku: "SIM-DOOR-40-LOCK",
      name: "Abschließbare Tür 40 cm",
      qty: config.lockableDoors40!,
      unit: "pcs",
    })
  }

  if ((config.flapDoors || 0) > 0) {
    bom.push({
      sku: "SIM-FLAP-DOOR",
      name: "Klapprahmen",
      qty: config.flapDoors!,
      unit: "pcs",
    })
  }

  if ((config.doubleDrawers80 || 0) > 0) {
    bom.push({
      sku: "SIM-DRAWER-80",
      name: "Doppelschublade 80 cm",
      qty: config.doubleDrawers80!,
      unit: "pcs",
    })
  }

  if ((config.jalousie80 || 0) > 0) {
    bom.push({
      sku: "SIM-JAL-80",
      name: "Jalousie 80 cm",
      qty: config.jalousie80!,
      unit: "pcs",
    })
  }

  // LED

  if ((config.led2 || 0) > 0) {
    bom.push({
      sku: "SIM-LED-2",
      name: "LED-Leiste 2",
      qty: config.led2!,
      unit: "pcs",
    })
  }

  if ((config.led4 || 0) > 0) {
    bom.push({
      sku: "SIM-LED-4",
      name: "LED-Leiste 4",
      qty: config.led4!,
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
