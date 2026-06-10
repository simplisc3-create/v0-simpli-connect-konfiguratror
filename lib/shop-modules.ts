// =============================================================================
// SHOP-MODULE (Einzelmodule 80 cm & 40 cm)
// =============================================================================
// Einzige Quelle der Wahrheit für die im Shop verkauften Einzelmodule.
// Wird sowohl von der Shop-Übersicht als auch von den Kategorie-Seiten genutzt.
// =============================================================================

import type { ModuleType, ColorKey } from "./glb-registry"

export type ModuleCategoryId = "offen" | "geschlossen" | "schubladen"

export interface ShopModule {
  id: string
  name: string
  artNr: string
  description: string
  price: number
  category: ModuleCategoryId
  width: 40 | 80
  glbModule: { moduleType: ModuleType; color: ColorKey; width: 40 | 80 }
}

// 80cm Module
export const products80: ShopModule[] = [
  {
    id: "offenes-fach-80",
    name: "Offenes Fach",
    artNr: "MOD-80-001",
    description: "Perfekt für schnellen Zugriff und Dekoration",
    price: 29.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "offenes-fach", color: "white", width: 80 },
  },
  {
    id: "ohne-seitenwaende-80",
    name: "Ohne Seitenwände",
    artNr: "MOD-80-002",
    description: "Für durchgehende Regale und offene Raumgestaltung",
    price: 32.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "ohne-seitenwaende", color: "white", width: 80 },
  },
  {
    id: "ohne-rueckwand-80",
    name: "Ohne Rückwand",
    artNr: "MOD-80-003",
    description: "Ideal als Raumteiler mit beidseitigem Zugang",
    price: 35.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "ohne-rueckwand", color: "white", width: 80 },
  },
  {
    id: "mit-rueckwand-80",
    name: "Mit Rückwand",
    artNr: "MOD-80-004",
    description: "Für einen aufgeräumten, geschlossenen Look",
    price: 42.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "mit-rueckwand", color: "white", width: 80 },
  },
  {
    id: "mit-tueren-80",
    name: "Mit Türen",
    artNr: "MOD-80-005",
    description: "Stauraum mit elegantem Verschluss",
    price: 65.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "mit-tueren", color: "white", width: 80 },
  },
  {
    id: "mit-klapptuer-80",
    name: "Mit Klapptür",
    artNr: "MOD-80-006",
    description: "Platzsparend mit Soft-Close-Scharnieren",
    price: 55.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "mit-klapptuer", color: "white", width: 80 },
  },
  {
    id: "mit-klapptuer-oben-80",
    name: "Klapptür (oben)",
    artNr: "MOD-80-007",
    description: "Nach oben öffnend mit Gasfeder-Unterstützung",
    price: 58.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "mit-klapptuer-oben", color: "white", width: 80 },
  },
  {
    id: "mit-doppelschublade-80",
    name: "Mit Schubladen",
    artNr: "MOD-80-008",
    description: "Optimaler Stauraum mit Vollauszug",
    price: 85.0,
    category: "schubladen",
    width: 80,
    glbModule: { moduleType: "mit-doppelschublade", color: "white", width: 80 },
  },
  {
    id: "mit-einzelschublade-80",
    name: "Einzelschublade",
    artNr: "MOD-80-009",
    description: "Kompakter Stauraum für einzelne Fächer",
    price: 48.0,
    category: "schubladen",
    width: 80,
    glbModule: { moduleType: "mit-einzelschublade", color: "white", width: 80 },
  },
  {
    id: "abschliessbare-tueren-80",
    name: "Abschließbar",
    artNr: "MOD-80-010",
    description: "Sicherer Stauraum mit Schloss",
    price: 95.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "abschliessbare-tueren", color: "white", width: 80 },
  },
]

// 40cm Module
export const products40: ShopModule[] = [
  {
    id: "offenes-fach-40",
    name: "Offenes Fach",
    artNr: "MOD-40-001",
    description: "Kompaktes offenes Fach für kleine Räume",
    price: 22.0,
    category: "offen",
    width: 40,
    glbModule: { moduleType: "offenes-fach", color: "white", width: 40 },
  },
  {
    id: "ohne-seitenwaende-40",
    name: "Ohne Seitenwände",
    artNr: "MOD-40-002",
    description: "Schlankes Design ohne seitliche Begrenzung",
    price: 25.0,
    category: "offen",
    width: 40,
    glbModule: { moduleType: "ohne-seitenwaende", color: "white", width: 40 },
  },
  {
    id: "mit-rueckwand-40",
    name: "Mit Rückwand",
    artNr: "MOD-40-003",
    description: "Geschlossene Rückseite für sauberen Look",
    price: 32.0,
    category: "offen",
    width: 40,
    glbModule: { moduleType: "mit-rueckwand", color: "white", width: 40 },
  },
  {
    id: "mit-tuere-rechts-40",
    name: "Mit Tür rechts",
    artNr: "MOD-40-004",
    description: "Einzeltür mit Anschlag rechts",
    price: 45.0,
    category: "geschlossen",
    width: 40,
    glbModule: { moduleType: "mit-tuere-rechts", color: "white", width: 40 },
  },
  {
    id: "mit-tuere-links-40",
    name: "Mit Tür links",
    artNr: "MOD-40-005",
    description: "Einzeltür mit Anschlag links",
    price: 45.0,
    category: "geschlossen",
    width: 40,
    glbModule: { moduleType: "mit-tuere-links", color: "white", width: 40 },
  },
  {
    id: "abschliessbar-links-40",
    name: "Abschließbar links",
    artNr: "MOD-40-006",
    description: "Sicherer Stauraum mit Schloss, Anschlag links",
    price: 65.0,
    category: "geschlossen",
    width: 40,
    glbModule: { moduleType: "abschliessbar-links", color: "white", width: 40 },
  },
  {
    id: "abschliessbar-rechts-40",
    name: "Abschließbar rechts",
    artNr: "MOD-40-007",
    description: "Sicherer Stauraum mit Schloss, Anschlag rechts",
    price: 65.0,
    category: "geschlossen",
    width: 40,
    glbModule: { moduleType: "abschliessbar-rechts", color: "white", width: 40 },
  },
]

export const productsModules: ShopModule[] = [...products80, ...products40]
