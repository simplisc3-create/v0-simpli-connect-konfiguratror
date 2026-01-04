import type { Config, BomLine, Derived } from "./bom-types"
import { derive } from "./derive"
import { validateConfig } from "./validate-config"

/**
 * Validate configuration before BOM generation
 * Implements comprehensive validation rules
 */

/**
 * Calculate derived values from configuration
 */
export function calculateDerived(config: Config): Derived {
  return derive(config)
}

/**
 * Generate complete BOM from configuration
 */
export function generateBOM(config: Config): BomLine[] {
  const messages = validateConfig(config)
  const hasErrors = messages.some((m) => m.severity === "error")

  if (hasErrors) {
    console.warn(
      "[v0] BOM Validation errors:",
      messages.filter((m) => m.severity === "error"),
    )
    return []
  }

  const derived = calculateDerived(config)
  const bom: BomLine[] = []

  // LEITERN (Uprights)
  bom.push({
    sku: `SIM-UP-${config.height}`,
    name: `Leiter ${config.height} cm`,
    qty: derived.uprightsQty,
    unit: "pcs",
    category: "upright",
  })

  // STANGENSETS (Tube Sets)
  const tubeSetSku = config.material === "glass" ? `SIM-S-${derived.widthERP}-G` : `SIM-S-${derived.widthERP}-M`

  bom.push({
    sku: tubeSetSku,
    name: `Stangenset ${derived.widthERP} ${config.material === "glass" ? "Glas" : "Metall"}`,
    qty: derived.tubeSetQty,
    unit: "set",
    category: "tubeset",
  })

  // FLÄCHEN (Panels/Shelves)
  const panelSku =
    config.material === "glass"
      ? `SIM-P-G-${derived.widthERP}-${config.finish}`
      : `SIM-P-M-${derived.widthERP}-${config.finish}`

  bom.push({
    sku: panelSku,
    name: `Flächen-Set ${config.material} ${config.finish}`,
    qty: derived.panelPacks,
    unit: "pack",
    note: "2 Stück pro Pack",
    category: "panel",
  })

  // ZUBEHÖR (Accessories)

  // Adapter
  bom.push({
    sku: "SIM-AD",
    name: "Adapter",
    qty: derived.adaptersQty,
    unit: "pcs",
    category: "accessory",
  })

  // Screwset
  bom.push({
    sku: "SIM-SCR-SET",
    name: "Schraubenset",
    qty: derived.screwSetQty,
    unit: "set",
    category: "accessory",
  })

  // Extra screws for metal 80cm (75 UI)
  if (derived.extraMetalScrewsQty > 0) {
    bom.push({
      sku: "SIM-SCR-80",
      name: "Zusatzschrauben 80",
      qty: derived.extraMetalScrewsQty,
      unit: "pcs",
      category: "accessory",
    })
  }

  // Glass protection
  if (derived.cornerProtectorsQty > 0) {
    bom.push({
      sku: "SIM-CP-G",
      name: "Eckschutz Glas",
      qty: derived.cornerProtectorsQty,
      unit: "pcs",
      category: "accessory",
    })
  }

  // Stabilizer rod for 80cm glass (75 UI)
  if (derived.stabilizerRodQty > 0) {
    bom.push({
      sku: "SIM-STAB-80",
      name: "Stabilisierungsstab 80",
      qty: derived.stabilizerRodQty,
      unit: "pcs",
      category: "accessory",
    })
  }

  // MODULES

  if ((config.modules?.doors40 || 0) > 0) {
    bom.push({
      sku: "SIM-DOOR-40",
      name: "Tür 40 cm",
      qty: config.modules!.doors40!,
      unit: "pcs",
      category: "module",
    })
  }

  if ((config.modules?.lockableDoors40 || 0) > 0) {
    bom.push({
      sku: "SIM-DOOR-40-LOCK",
      name: "Abschließbare Tür 40 cm",
      qty: config.modules!.lockableDoors40!,
      unit: "pcs",
      category: "module",
    })
  }

  if ((config.modules?.flapDoors || 0) > 0) {
    bom.push({
      sku: "SIM-FLAP-DOOR",
      name: "Klapprahmen",
      qty: config.modules!.flapDoors!,
      unit: "pcs",
      category: "module",
    })
  }

  if ((config.modules?.doubleDrawers80 || 0) > 0) {
    bom.push({
      sku: "SIM-DRAWER-80",
      name: "Doppelschublade 80 cm",
      qty: config.modules!.doubleDrawers80!,
      unit: "pcs",
      category: "module",
    })
  }

  if ((config.modules?.jalousie80 || 0) > 0) {
    bom.push({
      sku: "SIM-JAL-80",
      name: "Jalousie 80 cm",
      qty: config.modules!.jalousie80!,
      unit: "pcs",
      category: "module",
    })
  }

  if ((config.modules?.functionalWall1 || 0) > 0) {
    bom.push({
      sku: "SIM-FW1",
      name: "Funktionswand 1",
      qty: config.modules!.functionalWall1!,
      unit: "pcs",
      category: "module",
    })
  }

  if ((config.modules?.functionalWall2 || 0) > 0) {
    bom.push({
      sku: "SIM-FW2",
      name: "Funktionswand 2",
      qty: config.modules!.functionalWall2!,
      unit: "pcs",
      category: "module",
    })
  }

  // Filter out zero-qty lines and return
  return bom.filter((line) => line.qty > 0)
}

export type { Config as BomConfig, BomLine }
export { validateConfig }
