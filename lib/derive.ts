import type { Config, Derived } from "./bom-types"
import { mapWidthToERP, normalizeConfig } from "./config-utils"

export function derive(configRaw: Config): Derived {
  const cfg = normalizeConfig(configRaw)

  const widthERP = mapWidthToERP(cfg.width)
  const compartments = cfg.sections * cfg.levels

  // Auto-Perfektionierung: Wenn shelves nicht gesetzt -> compartments
  const shelvesAuto = cfg.panels?.shelves && cfg.panels.shelves > 0 ? cfg.panels.shelves : compartments

  const sideWalls = cfg.panels?.sideWalls ?? 0
  const backWalls = cfg.panels?.backWalls ?? 0

  const totalPanels = shelvesAuto + sideWalls + backWalls
  const panelPacks = Math.ceil(totalPanels / 2)

  // Struktur
  const uprightsQty = cfg.sections + 1
  const tubeSetQty = cfg.sections * cfg.levels

  // Zubehör
  const adaptersQty = tubeSetQty * 4
  const screwSetQty = Math.max(1, Math.ceil(tubeSetQty / 4))

  // Metall + breite 75 (ERP 80) => Zusatzschrauben pro Fläche
  const extraMetalScrewsQty = cfg.material === "metal" && cfg.width === 75 ? totalPanels : 0

  // Glas => Eckschutz 4 pro Fläche; + Stab (nur bei 75/80)
  const cornerProtectorsQty = cfg.material === "glass" ? totalPanels * 4 : 0
  const stabilizerRodQty = cfg.material === "glass" && cfg.width === 75 ? tubeSetQty : 0

  return {
    widthERP,
    compartments,
    shelvesAuto,
    totalPanels,
    panelPacks,
    uprightsQty,
    tubeSetQty,
    adaptersQty,
    screwSetQty,
    extraMetalScrewsQty,
    cornerProtectorsQty,
    stabilizerRodQty,
  }
}
