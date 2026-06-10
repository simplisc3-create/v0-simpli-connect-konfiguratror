// =============================================================================
// SIMPLI-CONNECT KATALOG-DATENMODELL
// =============================================================================
// Konsolidiert alle Produkte (vorkonfigurierte Simpli-Regale + Einzelmodule)
// inkl. Namen, Beschreibungen, Materialien, Maßen, Preisen und Farbvarianten.
// Dient als Grundlage für die 3D-Render-Pipeline und die PDF-Magazin-Erzeugung.
// =============================================================================

import { productsSimpliRegale, type SimpliRegalProduct } from "./simpli-products"
import type { ModuleType, ColorKey } from "./glb-registry"

// -----------------------------------------------------------------------------
// FARBEN
// -----------------------------------------------------------------------------
export interface CatalogColor {
  key: ColorKey
  german: string // Name, den GLBModule erwartet (weiss/gruen/gelb/rot/blau)
  label: string // Anzeige-Label
  hex: string
}

export const CATALOG_COLORS: CatalogColor[] = [
  { key: "white", german: "weiss", label: "Reinweiß", hex: "#FFFFFF" },
  { key: "green", german: "gruen", label: "Smaragdgrün", hex: "#2FAE5D" },
  { key: "yellow", german: "gelb", label: "Sonnengelb", hex: "#FFEA00" },
  { key: "red", german: "rot", label: "Signalrot", hex: "#E53935" },
  { key: "blue", german: "blau", label: "Azurblau", hex: "#1E5EFF" },
]

export const PRIMARY_COLOR = CATALOG_COLORS[0] // Weiß als Hero-Farbe

// -----------------------------------------------------------------------------
// ANSICHTEN (4 Richtungen)
// -----------------------------------------------------------------------------
export type ViewKey = "front" | "side" | "back" | "perspective"

export interface CatalogView {
  key: ViewKey
  label: string
}

export const CATALOG_VIEWS: CatalogView[] = [
  { key: "front", label: "Frontansicht" },
  { key: "perspective", label: "Perspektive" },
  { key: "side", label: "Seitenansicht" },
  { key: "back", label: "Rückansicht" },
]

// -----------------------------------------------------------------------------
// EINHEITLICHE MATERIAL-ANGABEN
// -----------------------------------------------------------------------------
export const SIMPLI_MATERIALS = [
  "Gestell aus verchromtem Stahlrohr",
  "Paneele aus pulverbeschichtetem Stahl",
  "Werkzeuglose Steck-Klick-Verbindung",
  "Kunststoff-Stellfüße, höhenverstellbar",
]

// -----------------------------------------------------------------------------
// PRESET-TYP (kompatibel mit SimpliRegal3DPreview)
// -----------------------------------------------------------------------------
export interface CatalogPreset {
  columns: number
  rows: number
  columnWidths: (75 | 38)[]
  rowHeights: (40 | 80 | 120 | 160 | 200)[]
  grid: {
    id: string
    type: string
    row: number
    col: number
    color?: string
  }[][]
}

// =============================================================================
// REGALE (vorkonfigurierte Komplett-Sets)
// =============================================================================
export interface CatalogRegal {
  kind: "regal"
  id: string
  name: string
  subtitle: string
  description: string
  artNr: string
  price: number
  category: string
  features: string[]
  preset: CatalogPreset
  // Abmessungen in cm
  dimensions: { width: number; height: number; depth: number }
  materials: string[]
}

const MODULE_GRID = 40 // jede Zelle (Spalte/Reihe) entspricht 40 cm Achsmaß
const DEPTH_CM = 40

function presetDimensions(p: CatalogPreset): { width: number; height: number; depth: number } {
  const width = p.columnWidths.reduce((sum, w) => sum + (w === 75 ? 80 : 40), 0)
  const height = p.rowHeights.reduce((sum) => sum + MODULE_GRID, 0)
  return { width, height, depth: DEPTH_CM }
}

export const CATALOG_REGALE: CatalogRegal[] = (productsSimpliRegale as SimpliRegalProduct[])
  .filter((r) => !!r.preset)
  .map((r) => {
    const preset = r.preset as CatalogPreset
    return {
      kind: "regal" as const,
      id: r.id,
      name: r.name,
      subtitle: r.subtitle,
      description: r.description,
      artNr: r.artNr,
      price: r.price,
      category: r.category,
      features: r.features ?? [],
      preset,
      dimensions: presetDimensions(preset),
      materials: SIMPLI_MATERIALS,
    }
  })

// =============================================================================
// EINZELMODULE
// =============================================================================
export interface CatalogModule {
  kind: "module"
  id: string
  name: string
  subtitle: string
  description: string
  moduleType: ModuleType
  width: 40 | 80
  price: number
  features: string[]
  dimensions: { width: number; height: number; depth: number }
  materials: string[]
  preset: CatalogPreset
}

interface ModuleSeed {
  moduleType: ModuleType
  width: 40 | 80
  name: string
  subtitle: string
  description: string
  price: number
  features: string[]
}

// Generierte, konsistente Beschreibungen für jeden Modultyp.
const MODULE_SEEDS: ModuleSeed[] = [
  // ---- 80 cm Module ----
  {
    moduleType: "offenes-fach",
    width: 80,
    name: "Das Offene Fach 80",
    subtitle: "Pure Leichtigkeit",
    description:
      "Das offene Fach ist die reinste Form des Simpli-Systems: vier Streben, eine Bodenplatte, maximale Transparenz. Ideal als luftiger Raumteiler oder als Bühne für Bücher, Vasen und Lieblingsstücke.",
    price: 29.0,
    features: ["Vollständig offen", "Lichtdurchlässig", "Als Raumteiler nutzbar"],
  },
  {
    moduleType: "ohne-seitenwaende",
    width: 80,
    name: "Das Durchblick-Fach 80",
    subtitle: "Rückwand trifft Offenheit",
    description:
      "Eine ruhige Rückwand gibt diesem Fach Halt, während die offenen Seiten den Blick freigeben. So entsteht ein sanfter Rahmen für Ihre Dekoration – aufgeräumt, aber niemals geschlossen.",
    price: 32.0,
    features: ["Geschlossene Rückwand", "Offene Seiten", "Leichter Auftritt"],
  },
  {
    moduleType: "mit-rueckwand",
    width: 80,
    name: "Das Rückwand-Fach 80",
    subtitle: "Struktur & Stabilität",
    description:
      "Mit Seiten- und Rückwänden wird dieses Fach zum verlässlichen Ordnungselement. Es schafft definierte Flächen, verbirgt unruhige Hintergründe und verleiht jedem Aufbau zusätzliche Steifigkeit.",
    price: 42.0,
    features: ["Seiten- und Rückwand", "Hohe Stabilität", "Ruhiger Hintergrund"],
  },
  {
    moduleType: "ohne-rueckwand",
    width: 80,
    name: "Das Seitenfach 80",
    subtitle: "Offen nach hinten",
    description:
      "Seitenwände geben Halt, die offene Rückseite lässt Luft und Licht hindurch. Ein vielseitiges Modul für Wände und Durchgänge, das Stauraum schafft, ohne den Raum zu verschließen.",
    price: 35.0,
    features: ["Seitenwände", "Offene Rückseite", "Vielseitig kombinierbar"],
  },
  {
    moduleType: "mit-klapptuer",
    width: 80,
    name: "Die Klapptür-Box 80",
    subtitle: "Stauraum auf Knopfdruck",
    description:
      "Eine großzügige Klappe verschließt das gesamte Fach und öffnet nach unten. Hinter der klaren Front verschwindet, was nicht gesehen werden soll – elegant, griffarm und absolut bündig.",
    price: 55.0,
    features: ["Nach unten öffnende Klappe", "Bündige Front", "Diskreter Stauraum"],
  },
  {
    moduleType: "mit-klapptuer-oben",
    width: 80,
    name: "Die Hochklappe 80",
    subtitle: "Nach oben öffnend",
    description:
      "Die nach oben schwingende Klappe gibt den Inhalt frei, ohne in den Raum zu ragen. Perfekt über Arbeitsflächen oder in Augenhöhe, wo herkömmliche Türen stören würden.",
    price: 65.0,
    features: ["Nach oben öffnende Klappe", "Platzsparend", "Komfortabler Zugriff"],
  },
  {
    moduleType: "mit-doppelschublade",
    width: 80,
    name: "Die Doppelschublade 80",
    subtitle: "Zweifacher Komfort",
    description:
      "Zwei vollwertige Schubladen übereinander bündeln Kleinteile, Utensilien und Dokumente. Sanft laufende Auszüge und grifflose Fronten machen jeden Zugriff zum stillen Vergnügen.",
    price: 85.0,
    features: ["Zwei Auszüge", "Grifflose Fronten", "Viel Innenvolumen"],
  },
  {
    moduleType: "mit-tueren",
    width: 80,
    name: "Die Türenbox 80",
    subtitle: "Der Klassiker",
    description:
      "Zwei Türen verschließen das Fach vollständig und schaffen geschlossenen Stauraum mit ruhiger Optik. Das vielseitigste Modul des Systems – im Wohnraum ebenso zu Hause wie im Büro.",
    price: 65.0,
    features: ["Doppeltür", "Vollständig geschlossen", "Zeitlose Optik"],
  },
  {
    moduleType: "abschliessbare-tueren",
    width: 80,
    name: "Die Tresor-Box 80",
    subtitle: "Sicher verschlossen",
    description:
      "Abschließbare Türen schützen, was wertvoll oder vertraulich ist. Solide Mechanik und bündige Fronten verbinden Sicherheit mit dem reduzierten Designanspruch des Simpli-Systems.",
    price: 95.0,
    features: ["Abschließbar", "Doppeltür", "Schutz für Wertvolles"],
  },
  // ---- 40 cm Module ----
  {
    moduleType: "offenes-fach",
    width: 40,
    name: "Das Offene Fach 40",
    subtitle: "Kompakte Leichtigkeit",
    description:
      "Das schmale offene Fach setzt präzise Akzente und füllt jede Lücke. Als Abschluss einer Reihe oder als zierliche Bühne für ein einzelnes Lieblingsstück.",
    price: 19.0,
    features: ["Schmales Format", "Vollständig offen", "Ideal als Abschluss"],
  },
  {
    moduleType: "ohne-seitenwaende",
    width: 40,
    name: "Das Durchblick-Fach 40",
    subtitle: "Rückwand, schmal",
    description:
      "Eine Rückwand im schlanken 40er-Format – offen zu den Seiten, ruhig im Hintergrund. Das ideale Bindeglied zwischen offenen und geschlossenen Modulen.",
    price: 21.0,
    features: ["Geschlossene Rückwand", "Offene Seiten", "Schmales Format"],
  },
  {
    moduleType: "mit-rueckwand",
    width: 40,
    name: "Das Rückwand-Fach 40",
    subtitle: "Schmal & stabil",
    description:
      "Seiten- und Rückwand im kompakten Format sorgen für definierte Ablagen und zusätzliche Steifigkeit – perfekt, um hohe Aufbauten zu verstärken.",
    price: 28.0,
    features: ["Seiten- und Rückwand", "Aussteifend", "Schmales Format"],
  },
  {
    moduleType: "mit-tuere-rechts",
    width: 40,
    name: "Die Türbox 40 (rechts)",
    subtitle: "Rechts angeschlagen",
    description:
      "Eine rechts angeschlagene Tür verschließt das schmale Fach vollständig. In Reihe gesetzt entstehen elegante, symmetrische Fronten mit verborgenem Stauraum.",
    price: 39.0,
    features: ["Tür rechts angeschlagen", "Geschlossener Stauraum", "Schmales Format"],
  },
  {
    moduleType: "mit-tuere-links",
    width: 40,
    name: "Die Türbox 40 (links)",
    subtitle: "Links angeschlagen",
    description:
      "Das Pendant mit links angeschlagener Tür. Paarweise verbaut ergeben sich spiegelsymmetrische Doppeltüren, die wie aus einem Guss wirken.",
    price: 39.0,
    features: ["Tür links angeschlagen", "Geschlossener Stauraum", "Schmales Format"],
  },
  {
    moduleType: "abschliessbar-links",
    width: 40,
    name: "Die Schließbox 40 (links)",
    subtitle: "Abschließbar, links",
    description:
      "Schmaler, abschließbarer Stauraum mit links angeschlagener Tür. Ideal für Wertsachen, Dokumente oder Medikamente – sicher und dennoch unauffällig.",
    price: 58.0,
    features: ["Abschließbar", "Tür links", "Schutz auf kleinem Raum"],
  },
  {
    moduleType: "abschliessbar-rechts",
    width: 40,
    name: "Die Schließbox 40 (rechts)",
    subtitle: "Abschließbar, rechts",
    description:
      "Das rechts angeschlagene Gegenstück der Schließbox. Kombiniert man beide, entsteht ein abschließbarer Doppelschrank im kompakten Format.",
    price: 58.0,
    features: ["Abschließbar", "Tür rechts", "Schutz auf kleinem Raum"],
  },
]

function buildModulePreset(moduleType: ModuleType, width: 40 | 80): CatalogPreset {
  const colWidth: 75 | 38 = width === 80 ? 75 : 38
  return {
    columns: 1,
    rows: 1,
    columnWidths: [colWidth],
    rowHeights: [38],
    grid: [[{ id: "cell-0-0", type: moduleType, row: 0, col: 0, color: "weiss" }]],
  }
}

export const CATALOG_MODULES: CatalogModule[] = MODULE_SEEDS.map((s) => ({
  kind: "module" as const,
  id: `modul-${s.width}-${s.moduleType}`,
  name: s.name,
  subtitle: s.subtitle,
  description: s.description,
  moduleType: s.moduleType,
  width: s.width,
  price: s.price,
  features: s.features,
  dimensions: { width: s.width, height: 40, depth: DEPTH_CM },
  materials: SIMPLI_MATERIALS,
  preset: buildModulePreset(s.moduleType, s.width),
}))

// =============================================================================
// RENDER-JOBS
// =============================================================================
// Pro Produkt: 4 Hero-Ansichten in Weiß + je 1 Perspektiv-Render für alle 5 Farben.
// Das erfüllt "4 Ansichten aller Modelle UND ihrer (Farb-)Varianten".
export type CatalogItem = CatalogRegal | CatalogModule

export interface RenderJob {
  jobId: string
  itemId: string
  itemKind: "regal" | "module"
  view: ViewKey
  color: ColorKey
  colorGerman: string
  role: "hero" | "variant"
}

export const ALL_CATALOG_ITEMS: CatalogItem[] = [...CATALOG_REGALE, ...CATALOG_MODULES]

export function buildRenderJobs(): RenderJob[] {
  const jobs: RenderJob[] = []
  for (const item of ALL_CATALOG_ITEMS) {
    // 4 Hero-Ansichten in der Primärfarbe (Weiß)
    for (const view of CATALOG_VIEWS) {
      jobs.push({
        jobId: `${item.id}__${view.key}__${PRIMARY_COLOR.key}`,
        itemId: item.id,
        itemKind: item.kind,
        view: view.key,
        color: PRIMARY_COLOR.key,
        colorGerman: PRIMARY_COLOR.german,
        role: "hero",
      })
    }
    // Farbvarianten: Perspektive in allen Farben außer der Primärfarbe
    for (const color of CATALOG_COLORS) {
      if (color.key === PRIMARY_COLOR.key) continue
      jobs.push({
        jobId: `${item.id}__variant__${color.key}`,
        itemId: item.id,
        itemKind: item.kind,
        view: "perspective",
        color: color.key,
        colorGerman: color.german,
        role: "variant",
      })
    }
  }
  return jobs
}

export function getItemById(id: string): CatalogItem | undefined {
  return ALL_CATALOG_ITEMS.find((i) => i.id === id)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price)
}

// Manifest-Struktur (in Blob gespeichert)
export interface CatalogManifest {
  generatedAt: string
  version: number
  images: Record<string, string> // jobId -> Blob-URL
}

export const MANIFEST_PATHNAME = "katalog/manifest.json"
