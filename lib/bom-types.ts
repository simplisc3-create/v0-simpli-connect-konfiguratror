// --- TYPES ---
export type WidthUI = 38 | 75
export type Height = 40 | 80 | 120 | 160 | 200
export type Material = "metal" | "glass"

export type Finish = "black" | "white" | "blue" | "green" | "yellow" | "orange" | "red" | "satin" // satin nur relevant für glass

export type PanelsInput = {
  shelves?: number // optional -> auto
  sideWalls?: number
  backWalls?: number
}

export type ModulesInput = {
  doors40?: number
  lockableDoors40?: number
  flapDoors?: number
  doubleDrawers80?: number
  jalousie80?: number
  functionalWall1?: number
  functionalWall2?: number
}

export type Config = {
  width: WidthUI
  height: Height
  sections: number // Module nebeneinander
  levels: number // Ebenen
  material: Material
  finish: Finish
  panels?: PanelsInput
  modules?: ModulesInput
}

export type Severity = "error" | "warning" | "info"

export type RuleMessage = {
  code: string
  severity: Severity
  message: string
}

export type BomUnit = "pcs" | "set" | "pack"

export type BomLine = {
  sku: string
  name: string
  qty: number
  unit: BomUnit
  note?: string
  category: "upright" | "tubeset" | "panel" | "accessory" | "module"
}

export type Derived = {
  widthERP: 40 | 80
  compartments: number
  shelvesAuto: number
  totalPanels: number
  panelPacks: number
  uprightsQty: number
  tubeSetQty: number
  adaptersQty: number
  screwSetQty: number
  extraMetalScrewsQty: number
  cornerProtectorsQty: number
  stabilizerRodQty: number
}
