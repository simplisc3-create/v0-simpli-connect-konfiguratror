import type { Config, WidthUI } from "./bom-types"

export function mapWidthToERP(width: WidthUI): 40 | 80 {
  // UI speichert 38/75; ERP arbeitet mit 40/80
  return width === 38 ? 40 : 80
}

export function clampInt(n: any, min: number, max: number): number {
  const x = Number.isFinite(Number(n)) ? Math.floor(Number(n)) : min
  return Math.max(min, Math.min(max, x))
}

export function safeNum(n: any): number {
  const x = Number(n)
  return Number.isFinite(x) ? x : 0
}

export function normalizeConfig(raw: Config): Config {
  return {
    ...raw,
    sections: clampInt(raw.sections, 1, 12),
    levels: clampInt(raw.levels, 1, 8),
    panels: {
      shelves: safeNum(raw.panels?.shelves),
      sideWalls: safeNum(raw.panels?.sideWalls),
      backWalls: safeNum(raw.panels?.backWalls),
    },
    modules: {
      doors40: safeNum(raw.modules?.doors40),
      lockableDoors40: safeNum(raw.modules?.lockableDoors40),
      flapDoors: safeNum(raw.modules?.flapDoors),
      doubleDrawers80: safeNum(raw.modules?.doubleDrawers80),
      jalousie80: safeNum(raw.modules?.jalousie80),
      functionalWall1: safeNum(raw.modules?.functionalWall1),
      functionalWall2: safeNum(raw.modules?.functionalWall2),
    },
  }
}
