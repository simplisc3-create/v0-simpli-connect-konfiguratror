// =============================================================================
// SHOP-KATEGORIEN
// =============================================================================
// Definiert die durchsuchbaren Kategorien des Shops und liefert die jeweils
// zugehörigen Produkte. Grundlage für die Kategorie-Landingpages unter
// /shop/kategorie/[slug].
// =============================================================================

import { productsModules, products80, products40, type ShopModule } from "./shop-modules"
import { productsSimpliRegale, type SimpliRegalProduct } from "./simpli-products"

export type ShopCategoryGroup = "regale" | "module"

export interface ShopCategory {
  slug: string
  title: string
  subtitle: string
  description: string
  group: ShopCategoryGroup
  // Tab auf der Shop-Übersicht, zu dem diese Kategorie gehört
  tab: "simpli-regale" | 80 | 40 | "alle"
}

// -----------------------------------------------------------------------------
// Kategorie-Definitionen
// -----------------------------------------------------------------------------
export const shopCategories: ShopCategory[] = [
  // --- Vorkonfigurierte Regale (nach Höhe) ---
  {
    slug: "lowboards",
    title: "Lowboards",
    subtitle: "Niedrig & vielseitig (40–60 cm)",
    description:
      "Niedrige Komplett-Sets für unter das Fenster, hinter das Sofa oder als TV-Bank. Sie schaffen Stauraum, ohne den Raum optisch zu teilen.",
    group: "regale",
    tab: "simpli-regale",
  },
  {
    slug: "sideboards",
    title: "Sideboards",
    subtitle: "Die klassische Höhe (80–100 cm)",
    description:
      "Vielseitige Kompositionen auf Arbeitshöhe – ideal als Raumteiler, Anrichte oder Stauraumwunder im Wohn- und Essbereich.",
    group: "regale",
    tab: "simpli-regale",
  },
  {
    slug: "highboards",
    title: "Highboards",
    subtitle: "Raumhohe Statements (120–400 cm)",
    description:
      "Hohe und raumhohe Regale, die Wände füllen und ordnen. Von der Bücherwand bis zum raumteilenden Monolithen.",
    group: "regale",
    tab: "simpli-regale",
  },
  // --- Einzelmodule (nach Typ) ---
  {
    slug: "offene-module",
    title: "Offene Module",
    subtitle: "Luftig & durchlässig",
    description:
      "Offene Fächer für schnellen Zugriff, Dekoration und durchgehende Regale. Erhältlich in 80 cm und 40 cm Breite.",
    group: "module",
    tab: "alle",
  },
  {
    slug: "geschlossene-module",
    title: "Module mit Türen",
    subtitle: "Diskreter Stauraum",
    description:
      "Türen, Klapptüren und abschließbare Boxen verbergen, was nicht gesehen werden soll – elegant und bündig.",
    group: "module",
    tab: "alle",
  },
  {
    slug: "schubladen-module",
    title: "Schubladen-Module",
    subtitle: "Ordnung im Auszug",
    description:
      "Einzel- und Doppelschubladen mit Vollauszug für Kleinteile, Utensilien und Dokumente.",
    group: "module",
    tab: 80,
  },
]

// Map: Kategorie-Slug -> interne Modul-Kategorie / Regal-Kategorie
const MODULE_CATEGORY_BY_SLUG: Record<string, ShopModule["category"]> = {
  "offene-module": "offen",
  "geschlossene-module": "geschlossen",
  "schubladen-module": "schubladen",
}

const REGAL_CATEGORY_BY_SLUG: Record<string, SimpliRegalProduct["category"]> = {
  lowboards: "lowboard",
  sideboards: "sideboard",
  highboards: "highboard",
}

export function getCategoryBySlug(slug: string): ShopCategory | undefined {
  return shopCategories.find((c) => c.slug === slug)
}

export function getModulesForCategory(slug: string): ShopModule[] {
  const cat = MODULE_CATEGORY_BY_SLUG[slug]
  if (!cat) return []
  return productsModules.filter((p) => p.category === cat)
}

export function getRegaleForCategory(slug: string): SimpliRegalProduct[] {
  const cat = REGAL_CATEGORY_BY_SLUG[slug]
  if (!cat) return []
  return productsSimpliRegale.filter((r) => r.category === cat)
}

export function getCategoryCount(slug: string): number {
  const cat = getCategoryBySlug(slug)
  if (!cat) return 0
  return cat.group === "regale" ? getRegaleForCategory(slug).length : getModulesForCategory(slug).length
}

// Hilfs-Exports für die Übersichts-Seite
export { products80, products40 }
