// Simpli-Connect Complete Product Catalog with Official SKUs
// Strukturierte Artikelliste für Simpli-Konfigurator und Warenwirtschaftssystem

export type ProductCategory =
  | "leiter"
  | "aufbaumodul"
  | "stangenset"
  | "flaechenset"
  | "flaechenset-glas"
  | "metallboden"
  | "glasboden"
  | "holzboden"
  | "schublade"
  | "einzelschublade"
  | "korpus"
  | "front"
  | "tuer"
  | "klapptuer"
  | "jalousie"
  | "funktionswand"
  | "seitenwand"
  | "led"
  | "adapter"
  | "schraube"
  | "metallstab"
  | "eckschutz"
  | "eckverbinder"
  | "rollenset"
  | "stellfuesse"
  | "haengeregisterschiene"
  | "griff"
  | "abdeckkappe"
  | "glasecke"
  | "spreizdübel"
  | "schloss"
  | "gasdruckdaempfer"

export interface Product {
  artNr: string // Official SKU (SIMxxx format)
  name: string
  category: ProductCategory
  size: number // in cm (0 for universal parts)
  price: number
  color?: ShelfColor
  variant?: string
  description?: string
  packSize?: number // Number of pieces in pack for display
  components?: string[] // Sub-components for composite products
  image?: string // Product image URL (can be Blob URL or external URL)
}

export type ShelfColor = "schwarz" | "weiss" | "blau" | "orange" | "rot" | "gruen" | "gelb" | "grau"

// =============================================================================
// LEITERN (Ladders/Heights) - Vertical frame posts
// =============================================================================
export const leitern: Product[] = [
  { artNr: "SIM001", name: "Leiter 40", category: "leiter", size: 40, price: 13.5 },
  {
    artNr: "SIM001a",
    name: "Aufbaumodul",
    category: "aufbaumodul",
    size: 40,
    price: 8.5,
    description: "Erweiterungsmodul für Leitern",
  },
  { artNr: "SIM002", name: "Leiter 80", category: "leiter", size: 80, price: 20.5 },
  { artNr: "SIM003", name: "Leiter 120", category: "leiter", size: 120, price: 27.5 },
  { artNr: "SIM004", name: "Leiter 160", category: "leiter", size: 160, price: 33.5 },
  { artNr: "SIM005", name: "Leiter 200", category: "leiter", size: 200, price: 41.0 },
  { artNr: "SIM060", name: "Leiter 60", category: "leiter", size: 60, price: 17.0 },
  { artNr: "SIM100", name: "Leiter 100", category: "leiter", size: 100, price: 24.0 },
]

// =============================================================================
// STANGENSETS (Tube sets - horizontal bars)
// =============================================================================
export const stangensets: Product[] = [
  { artNr: "SIM006", name: "Stangenset 40", category: "stangenset", size: 40, price: 6.95, variant: "metall" },
  { artNr: "SIM007", name: "Stangenset 80", category: "stangenset", size: 80, price: 12.0, variant: "metall" },
]

// =============================================================================
// FLÄCHENSETS (Panel sets) - Metall
// =============================================================================
const colors: ShelfColor[] = ["weiss", "grau", "rot", "orange", "gruen", "blau", "gelb"]
const colorSuffixes: Record<ShelfColor, string> = {
  weiss: "",
  schwarz: "-black",
  grau: "-grey",
  rot: "-red",
  orange: "-orange",
  gruen: "-green",
  blau: "-blue",
  gelb: "-yellow",
}
const colorNames: Record<ShelfColor, string> = {
  weiss: "weiß",
  schwarz: "schwarz",
  grau: "grau",
  rot: "rot",
  orange: "orange",
  gruen: "grün",
  blau: "blau",
  gelb: "gelb",
}

export const flaechensets: Product[] = [
  // 40cm Flächensets - all colors (SIM010 base) - 15,00 € per set
  {
    artNr: "SIM010",
    name: "Flächenset 40 weiß",
    category: "flaechenset",
    size: 40,
    price: 15.0,
    color: "weiss",
    packSize: 2,
  },
  {
    artNr: "SIM010-grey",
    name: "Flächenset 40 grau",
    category: "flaechenset",
    size: 40,
    price: 15.0,
    color: "grau",
    packSize: 2,
  },
  {
    artNr: "SIM010-red",
    name: "Flächenset 40 rot",
    category: "flaechenset",
    size: 40,
    price: 15.0,
    color: "rot",
    packSize: 2,
  },
  {
    artNr: "SIM010-orange",
    name: "Flächenset 40 orange",
    category: "flaechenset",
    size: 40,
    price: 15.0,
    color: "orange",
    packSize: 2,
  },
  {
    artNr: "SIM010-green",
    name: "Flächenset 40 grün",
    category: "flaechenset",
    size: 40,
    price: 15.0,
    color: "gruen",
    packSize: 2,
  },
  {
    artNr: "SIM010-blue",
    name: "Flächenset 40 blau",
    category: "flaechenset",
    size: 40,
    price: 15.0,
    color: "blau",
    packSize: 2,
  },
  {
    artNr: "SIM010-yellow",
    name: "Flächenset 40 gelb",
    category: "flaechenset",
    size: 40,
    price: 15.0,
    color: "gelb",
    packSize: 2,
  },

  // 80cm Flächensets - all colors (SIM011 base) - 22,00 € per set
  {
    artNr: "SIM011",
    name: "Flächenset 80 weiß",
    category: "flaechenset",
    size: 80,
    price: 22.0,
    color: "weiss",
    packSize: 2,
  },
  {
    artNr: "SIM011-grey",
    name: "Flächenset 80 grau",
    category: "flaechenset",
    size: 80,
    price: 22.0,
    color: "grau",
    packSize: 2,
  },
  {
    artNr: "SIM011-red",
    name: "Flächenset 80 rot",
    category: "flaechenset",
    size: 80,
    price: 22.0,
    color: "rot",
    packSize: 2,
  },
  {
    artNr: "SIM011-orange",
    name: "Flächenset 80 orange",
    category: "flaechenset",
    size: 80,
    price: 22.0,
    color: "orange",
    packSize: 2,
  },
  {
    artNr: "SIM011-green",
    name: "Flächenset 80 grün",
    category: "flaechenset",
    size: 80,
    price: 22.0,
    color: "gruen",
    packSize: 2,
  },
  {
    artNr: "SIM011-blue",
    name: "Flächenset 80 blau",
    category: "flaechenset",
    size: 80,
    price: 22.0,
    color: "blau",
    packSize: 2,
  },
  {
    artNr: "SIM011-yellow",
    name: "Flächenset 80 gelb",
    category: "flaechenset",
    size: 80,
    price: 22.0,
    color: "gelb",
    packSize: 2,
  },
]

// =============================================================================
// FLÄCHENSETS GLAS (Glass panel sets)
// =============================================================================
export const flaechensetsGlas: Product[] = [
  // 40cm Glas
  {
    artNr: "SIM014",
    name: "Flächenset 40 Glas satiniert",
    category: "flaechenset-glas",
    size: 40,
    price: 26.0,
    variant: "satiniert",
  },
  {
    artNr: "SIM014K",
    name: "Flächenset 40 Glas klar",
    category: "flaechenset-glas",
    size: 40,
    price: 26.0,
    variant: "klar",
  },
  // 80cm Glas
  {
    artNr: "SIM015",
    name: "Flächenset 80 Glas satiniert",
    category: "flaechenset-glas",
    size: 80,
    price: 35.0,
    variant: "satiniert",
  },
  {
    artNr: "SIM015K",
    name: "Flächenset 80 Glas klar",
    category: "flaechenset-glas",
    size: 80,
    price: 35.0,
    variant: "klar",
  },
]

// =============================================================================
// SCHUBLADEN (Drawers)
// =============================================================================
export const schubladen: Product[] = [
  // Doppelschubladen (80cm) - alle Farben
  {
    artNr: "SIM018",
    name: "Doppelschublade weiß",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "weiss",
    description: "bestehend aus 2x Korpus und 2x SIM018-front-white – Front für Doppelschublade weiß",
    components: ["2x Korpus", "2x SIM018-front-white"],
  },
  {
    artNr: "SIM018-grey",
    name: "Doppelschublade grau",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "grau",
    description: "bestehend aus 2x Korpus und 2x SIM018-front-grey – Front für Doppelschublade grau",
    components: ["2x Korpus", "2x SIM018-front-grey"],
  },
  {
    artNr: "SIM018-red",
    name: "Doppelschublade rot",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "rot",
    description: "bestehend aus 2x Korpus und 2x SIM018-front-red – Front für Doppelschublade rot",
    components: ["2x Korpus", "2x SIM018-front-red"],
  },
  {
    artNr: "SIM018-orange",
    name: "Doppelschublade orange",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "orange",
    description: "bestehend aus 2x Korpus und 2x SIM018-front-orange – Front für Doppelschublade orange",
    components: ["2x Korpus", "2x SIM018-front-orange"],
  },
  {
    artNr: "SIM018-green",
    name: "Doppelschublade grün",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "gruen",
    description: "bestehend aus 2x Korpus und 2x SIM018-front-green – Front für Doppelschublade grün",
    components: ["2x Korpus", "2x SIM018-front-green"],
  },
  {
    artNr: "SIM018-blue",
    name: "Doppelschublade blau",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "blau",
    description: "bestehend aus 2x Korpus und 2x SIM018-front-blue – Front für Doppelschublade blau",
    components: ["2x Korpus", "2x SIM018-front-blue"],
  },
  {
    artNr: "SIM018-yellow",
    name: "Doppelschublade gelb",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "gelb",
    description: "bestehend aus 2x Korpus und 2x SIM018-front-yellow – Front für Doppelschublade gelb",
    components: ["2x Korpus", "2x SIM018-front-yellow"],
  },
]

// Fronten für Doppelschubladen
export const schubladenFronten: Product[] = [
  {
    artNr: "SIM018-front-white",
    name: "Front für Doppelschublade weiß",
    category: "front",
    size: 80,
    price: 19.25,
    color: "weiss",
  },
  {
    artNr: "SIM018-front-grey",
    name: "Front für Doppelschublade grau",
    category: "front",
    size: 80,
    price: 19.25,
    color: "grau",
  },
  {
    artNr: "SIM018-front-red",
    name: "Front für Doppelschublade rot",
    category: "front",
    size: 80,
    price: 19.25,
    color: "rot",
  },
  {
    artNr: "SIM018-front-orange",
    name: "Front für Doppelschublade orange",
    category: "front",
    size: 80,
    price: 19.25,
    color: "orange",
  },
  {
    artNr: "SIM018-front-green",
    name: "Front für Doppelschublade grün",
    category: "front",
    size: 80,
    price: 19.25,
    color: "gruen",
  },
  {
    artNr: "SIM018-front-blue",
    name: "Front für Doppelschublade blau",
    category: "front",
    size: 80,
    price: 19.25,
    color: "blau",
  },
  {
    artNr: "SIM018-front-yellow",
    name: "Front für Doppelschublade gelb",
    category: "front",
    size: 80,
    price: 19.25,
    color: "gelb",
  },
]

// Einzelschubladen (80cm)
export const einzelschubladen: Product[] = [
  {
    artNr: "SIM025-white",
    name: "Einzelschublade 80 weiß",
    category: "einzelschublade",
    size: 80,
    price: 55.0,
    color: "weiss",
  },
  {
    artNr: "SIM025-grey",
    name: "Einzelschublade 80 grau",
    category: "einzelschublade",
    size: 80,
    price: 55.0,
    color: "grau",
  },
  {
    artNr: "SIM025-red",
    name: "Einzelschublade 80 rot",
    category: "einzelschublade",
    size: 80,
    price: 55.0,
    color: "rot",
  },
  {
    artNr: "SIM025-orange",
    name: "Einzelschublade 80 orange",
    category: "einzelschublade",
    size: 80,
    price: 55.0,
    color: "orange",
  },
  {
    artNr: "SIM025-green",
    name: "Einzelschublade 80 grün",
    category: "einzelschublade",
    size: 80,
    price: 55.0,
    color: "gruen",
  },
  {
    artNr: "SIM025-blue",
    name: "Einzelschublade 80 blau",
    category: "einzelschublade",
    size: 80,
    price: 55.0,
    color: "blau",
  },
  {
    artNr: "SIM025-yellow",
    name: "Einzelschublade 80 gelb",
    category: "einzelschublade",
    size: 80,
    price: 55.0,
    color: "gelb",
  },
]

// =============================================================================
// TÜREN (Doors)
// =============================================================================
export const tueren: Product[] = [
  // Türen 40cm - alle Farben
  { artNr: "SIM019-white", name: "Tür 40 cm weiß", category: "tuer", size: 40, price: 32.5, color: "weiss" },
  { artNr: "SIM019-grey", name: "Tür 40 cm grau", category: "tuer", size: 40, price: 32.5, color: "grau" },
  { artNr: "SIM019-red", name: "Tür 40 cm rot", category: "tuer", size: 40, price: 32.5, color: "rot" },
  { artNr: "SIM019-orange", name: "Tür 40 cm orange", category: "tuer", size: 40, price: 32.5, color: "orange" },
  { artNr: "SIM019-green", name: "Tür 40 cm grün", category: "tuer", size: 40, price: 32.5, color: "gruen" },
  { artNr: "SIM019-blue", name: "Tür 40 cm blau", category: "tuer", size: 40, price: 32.5, color: "blau" },
  { artNr: "SIM019-yellow", name: "Tür 40 cm gelb", category: "tuer", size: 40, price: 32.5, color: "gelb" },
]

// =============================================================================
// KLAPPTÜREN (Flip doors)
// =============================================================================
export const klapptueren: Product[] = [
  {
    artNr: "SIM032-white",
    name: "Klapptür weiß",
    category: "klapptuer",
    size: 80,
    price: 52.0,
    color: "weiss",
    description: "bestehend aus SIM025 Front weiß und SIM025-scharnier – Scharnier für Klappe",
    components: ["SIM025 Front weiß", "SIM025-scharnier"],
  },
  { artNr: "SIM032-grey", name: "Klapptür grau", category: "klapptuer", size: 80, price: 52.0, color: "grau" },
  { artNr: "SIM032-red", name: "Klapptür rot", category: "klapptuer", size: 80, price: 52.0, color: "rot" },
  { artNr: "SIM032-orange", name: "Klapptür orange", category: "klapptuer", size: 80, price: 52.0, color: "orange" },
  { artNr: "SIM032-green", name: "Klapptür grün", category: "klapptuer", size: 80, price: 52.0, color: "gruen" },
  { artNr: "SIM032-blue", name: "Klapptür blau", category: "klapptuer", size: 80, price: 52.0, color: "blau" },
  { artNr: "SIM032-yellow", name: "Klapptür gelb", category: "klapptuer", size: 80, price: 52.0, color: "gelb" },
]

// =============================================================================
// KLAPPTÜREN nach oben (Upward-opening flip doors) - neue SKU-Serie
// =============================================================================
export const klapptuerenOben: Product[] = [
  {
    artNr: "SIM025-white",
    name: "Klapptür weiß (nach oben)",
    category: "klapptuer",
    size: 80,
    price: 65.0,
    color: "weiss",
    description: "Klapptür für nach oben öffnende Module",
  },
  {
    artNr: "SIM025-grey",
    name: "Klapptür grau (nach oben)",
    category: "klapptuer",
    size: 80,
    price: 65.0,
    color: "grau",
  },
  { artNr: "SIM025-red", name: "Klapptür rot (nach oben)", category: "klapptuer", size: 80, price: 65.0, color: "rot" },
  {
    artNr: "SIM025-orange",
    name: "Klapptür orange (nach oben)",
    category: "klapptuer",
    size: 80,
    price: 65.0,
    color: "orange",
  },
  {
    artNr: "SIM025-green",
    name: "Klapptür grün (nach oben)",
    category: "klapptuer",
    size: 80,
    price: 65.0,
    color: "gruen",
  },
  {
    artNr: "SIM025-blue",
    name: "Klapptür blau (nach oben)",
    category: "klapptuer",
    size: 80,
    price: 65.0,
    color: "blau",
  },
  {
    artNr: "SIM025-yellow",
    name: "Klapptür gelb (nach oben)",
    category: "klapptuer",
    size: 80,
    price: 65.0,
    color: "gelb",
  },
]

// =============================================================================
// FUNKTIONSWÄNDE (Back panels - Stainless steel)
// =============================================================================
export const funktionswaende: Product[] = [
  {
    artNr: "SIM023",
    name: "Funktionswand Edelstahl",
    category: "funktionswand",
    size: 0,
    price: 12.5,
    variant: "edelstahl",
  },
]

// =============================================================================
// ZUBEHÖR (Accessories)
// =============================================================================
export const zubehoer: Product[] = [
  // Rollenset
  {
    artNr: "SIM029",
    name: "Rollenset",
    category: "rollenset",
    size: 0,
    price: 35.0,
    description: "Set mit Rollen für mobile Regale",
  },

  // Stellfüße
  {
    artNr: "SIM030",
    name: "Verchromte Stellfüße",
    category: "stellfuesse",
    size: 0,
    price: 12.0,
    description: "Set verchromte Stellfüße",
  },

  // Hängeregisterschiene
  { artNr: "SIM031", name: "Schiene für Hängeregister", category: "haengeregisterschiene", size: 0, price: 18.5 },

  // Gasdruckdämpfer for upward-opening flip doors
  {
    artNr: "SIM033",
    name: "Gasdruckdämpfer",
    category: "gasdruckdaempfer",
    size: 0,
    price: 18.5,
    description: "Gasdruckdämpfer für nach oben öffnende Klappen (2 Stück pro Klapptür erforderlich)",
  },

  // Eckverbinder
  {
    artNr: "SIM101",
    name: "Eckverbinder",
    category: "eckverbinder",
    size: 0,
    price: 8.5,
    description: "Verbinder für Eck-Konfigurationen",
  },

  // Glasecken
  {
    artNr: "SIM0004",
    name: "Ecken für Glasflächen verchromt",
    category: "glasecke",
    size: 0,
    price: 2.0,
    description: "4 Stück pro Set",
  },

  // Abdeckkappen
  { artNr: "SIM0009", name: "Abdeckkappen verchromt", category: "abdeckkappe", size: 0, price: 1.5 },

  // Griffe
  { artNr: "SIM0011", name: "Griff für Klappen/Schubladen", category: "griff", size: 0, price: 4.5 },

  // Spreizdübel
  {
    artNr: "SIM094",
    name: "Spreizdübel weiß",
    category: "spreizdübel",
    size: 80,
    price: 0.5,
    description: "zur mittigen Befestigung der 80er Böden an den Stangensets",
  },

  // Schlösser
  {
    artNr: "SIM1000a",
    name: "Schloss Typ A",
    category: "schloss",
    size: 0,
    price: 15.0,
    variant: "gleichschliessend",
    description: "Gleichschließendes Schloss",
  },
  {
    artNr: "SIM1000b",
    name: "Schloss Typ B",
    category: "schloss",
    size: 0,
    price: 15.0,
    variant: "unterschiedlich",
    description: "Unterschiedlich schließendes Schloss",
  },
]

// =============================================================================
// GASDRUCKDÄMPFER (Gas dampers)
// =============================================================================
export const gasdruckdaempfer: Product[] = [
  {
    artNr: "SIM-GD-01",
    name: "Gasdruckdaempfer Modell 1",
    category: "gasdruckdaempfer",
    size: 0,
    price: 25.0,
    description: "Daempfer für gasbedingte Spannungen",
  },
  {
    artNr: "SIM-GD-02",
    name: "Gasdruckdaempfer Modell 2",
    category: "gasdruckdaempfer",
    size: 0,
    price: 30.0,
    description: "Daempfer für gasbedingte Spannungen",
  },
  {
    artNr: "SIM033",
    name: "Gasdruckdämpfer",
    category: "gasdruckdaempfer",
    size: 0,
    price: 18.5,
    description: "Gasdruckdämpfer für nach oben öffnende Klappen (2 Stück pro Klapptür erforderlich)",
  },
]

// =============================================================================
// LEGACY PRODUCTS (for backwards compatibility)
// =============================================================================
export const metallboeden: Product[] = [
  {
    artNr: "SIM-B-M-40-B",
    name: "Boden Metall 40 Schwarz",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "schwarz",
  },
  {
    artNr: "SIM-B-M-80-B",
    name: "Boden Metall 80 Schwarz",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "schwarz",
  },
  {
    artNr: "SIM-B-M-40-W",
    name: "Boden Metall 40 Weiß",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "weiss",
  },
  {
    artNr: "SIM-B-M-80-W",
    name: "Boden Metall 80 Weiß",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "weiss",
  },
]

export const glasboeden: Product[] = [
  {
    artNr: "SIM-B-G-40-B",
    name: "Boden Glas 40 Schwarz",
    category: "glasboden",
    size: 40,
    price: 26.0,
    color: "schwarz",
  },
  {
    artNr: "SIM-B-G-80-B",
    name: "Boden Glas 80 Schwarz",
    category: "glasboden",
    size: 80,
    price: 35.0,
    color: "schwarz",
  },
  {
    artNr: "SIM-B-G-40-F",
    name: "Boden Glas 40 Satiniert",
    category: "glasboden",
    size: 40,
    price: 26.0,
    variant: "satiniert",
  },
  {
    artNr: "SIM-B-G-80-F",
    name: "Boden Glas 80 Satiniert",
    category: "glasboden",
    size: 80,
    price: 35.0,
    variant: "satiniert",
  },
]

export const holzboeden: Product[] = [
  {
    artNr: "SIM-B-W-40-MK",
    name: "Boden Holz 40 Makassar",
    category: "holzboden",
    size: 40,
    price: 32.0,
    variant: "makassar",
  },
  {
    artNr: "SIM-B-W-80-MK",
    name: "Boden Holz 80 Makassar",
    category: "holzboden",
    size: 80,
    price: 45.0,
    variant: "makassar",
  },
]

export const seitenwaende: Product[] = [
  {
    artNr: "SIM-SW-40-B",
    name: "Seitenwand 40 Schwarz",
    category: "seitenwand",
    size: 40,
    price: 15.5,
    color: "schwarz",
  },
  { artNr: "SIM-SW-40-W", name: "Seitenwand 40 Weiß", category: "seitenwand", size: 40, price: 15.5, color: "weiss" },
  {
    artNr: "SIM-SW-80-B",
    name: "Seitenwand 80 Schwarz",
    category: "seitenwand",
    size: 80,
    price: 22.5,
    color: "schwarz",
  },
  { artNr: "SIM-SW-80-W", name: "Seitenwand 80 Weiß", category: "seitenwand", size: 80, price: 22.5, color: "weiss" },
]

export const ledUnits: Product[] = [
  { artNr: "SIM-LED-2", name: "LED Unit 2 Stripes", category: "led", size: 2, price: 75.0 },
  { artNr: "SIM-LED-4", name: "LED Unit 4 Stripes", category: "led", size: 4, price: 99.5 },
]

export const adapter: Product[] = [{ artNr: "SIM-AD", name: "Adapter", category: "adapter", size: 1, price: 2.5 }]

export const schrauben: Product[] = [
  { artNr: "SIM-SCR-STD", name: "Standardschraube", category: "schraube", size: 1, price: 0.5, variant: "start" },
  {
    artNr: "SIM-SCR-EXT",
    name: "Erweiterungsschraube",
    category: "schraube",
    size: 1,
    price: 0.5,
    variant: "erweiterung",
  },
]

export const metallstaebe: Product[] = [
  { artNr: "SIM-MS-80", name: "Metallstab Glasboden 80", category: "metallstab", size: 80, price: 4.5 },
  { artNr: "SIM-MS-40", name: "Metallstab Glasboden 40", category: "metallstab", size: 40, price: 3.5 },
]

export const eckschutz: Product[] = [
  { artNr: "SIM-CP-G", name: "Eckschutz Glas (4er)", category: "eckschutz", size: 1, price: 2.0 },
]

// Legacy combined array for backwards compatibility
export const schubladenTueren: Product[] = [
  ...schubladen,
  ...schubladenFronten,
  ...einzelschubladen,
  ...tueren,
  ...klapptueren,
]

// =============================================================================
// SIMPLI REGALE - Vorkonfigurierte Komplett-Sets
// =============================================================================

export interface SimpliRegalProduct {
  id: string
  name: string
  description: string
  subtitle: string
  artNr: string
  width: 80 | 40
  rows: number
  cols: number
  configuration: string[][] // Grid of module types [row][col]
  price: number
  image?: string
  features?: string[]
  // Konfigurator Preset - für 3D Preview und Link zum Konfigurator
  preset?: {
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
}

// =============================================================================
// ALL PRODUCTS COMBINED
// =============================================================================
export const allProducts: Product[] = [
  ...leitern,
  ...stangensets,
  ...flaechensets,
  ...flaechensetsGlas,
  ...schubladen,
  ...schubladenFronten,
  ...einzelschubladen,
  ...tueren,
  ...klapptueren,
  ...klapptuerenOben,
  ...funktionswaende,
  ...zubehoer,
  // Legacy
  ...metallboeden,
  ...glasboeden,
  ...holzboeden,
  ...seitenwaende,
  ...ledUnits,
  ...adapter,
  ...schrauben,
  ...metallstaebe,
  ...eckschutz,
  // New category
  ...gasdruckdaempfer,
]

// =============================================================================
// HELPER FUNCTIONS - Article Number Lookups
// =============================================================================

/**
 * Get Flächenset article number based on size and color
 */
export function getFlaechensetArtNr(size: number, color: string): string {
  const colorSuffix = getColorSuffix(color)

  if (size === 40) {
    return colorSuffix ? `SIM010${colorSuffix}` : "SIM010"
  } else {
    // 80cm
    return colorSuffix ? `SIM011${colorSuffix}` : "SIM011"
  }
}

/**
 * Get Flächenset Glas article number
 */
export function getFlaechensetGlasArtNr(size: number, variant: "satiniert" | "klar"): string {
  if (size === 40) {
    return variant === "klar" ? "SIM014K" : "SIM014"
  } else {
    return variant === "klar" ? "SIM015K" : "SIM015"
  }
}

/**
 * Get Doppelschublade article number based on color
 */
export function getSchubladeArtNr(color: string): string {
  const colorSuffix = getColorSuffix(color)
  return colorSuffix ? `SIM018${colorSuffix}` : "SIM018"
}

/**
 * Get Einzelschublade article number based on color
 */
export function getEinzelschubladeArtNr(color: string): string {
  const colorMap: Record<string, string> = {
    weiss: "SIM025-white",
    grau: "SIM025-grey",
    rot: "SIM025-red",
    orange: "SIM025-orange",
    gruen: "SIM025-green",
    blau: "SIM025-blue",
    gelb: "SIM025-yellow",
  }
  return colorMap[color] || "SIM025-white"
}

/**
 * Get Tür article number based on color
 */
export function getTuerArtNr(color: string): string {
  const colorMap: Record<string, string> = {
    weiss: "SIM019-white",
    schwarz: "SIM019-black",
    grau: "SIM019-grey",
    rot: "SIM019-red",
    orange: "SIM019-orange",
    gruen: "SIM019-green",
    blau: "SIM019-blue",
    gelb: "SIM019-yellow",
  }
  return colorMap[color] || "SIM019-white"
}

/**
 * Get Klapptür article number based on color
 */
export function getKlapptuerArtNr(color: string): string {
  const colorMap: Record<string, string> = {
    weiss: "SIM032-white",
    grau: "SIM032-grey",
    rot: "SIM032-red",
    orange: "SIM032-orange",
    gruen: "SIM032-green",
    blau: "SIM032-blue",
    gelb: "SIM032-yellow",
  }
  return colorMap[color] || "SIM032-white"
}

/**
 * Get Klapptür B (nach oben öffnend) article number based on color
 * Klapptür B uses SIM025 series (same as Einzelschublade front)
 */
export function getKlapptuerObenArtNr(color: string): string {
  const colorMap: Record<string, string> = {
    weiss: "SIM025-white",
    grau: "SIM025-grey",
    rot: "SIM025-red",
    orange: "SIM025-orange",
    gruen: "SIM025-green",
    blau: "SIM025-blue",
    gelb: "SIM025-yellow",
  }
  return colorMap[color] || "SIM025-white"
}

/**
 * Get Leiter article info based on height
 */
export function getLeiterArtNr(height: number): { artNr: string; name: string; price: number } {
  const leiterSizes = [
    { size: 40, artNr: "SIM001", name: "Leiter 40", price: 13.5 },
    { size: 60, artNr: "SIM060", name: "Leiter 60", price: 17.0 },
    { size: 80, artNr: "SIM002", name: "Leiter 80", price: 20.5 },
    { size: 100, artNr: "SIM100", name: "Leiter 100", price: 24.0 },
    { size: 120, artNr: "SIM003", name: "Leiter 120", price: 27.5 },
    { size: 160, artNr: "SIM004", name: "Leiter 160", price: 33.5 },
    { size: 200, artNr: "SIM005", name: "Leiter 200", price: 41.0 },
  ]

  // Find the smallest ladder that can accommodate the height
  // For heights > 200, we need multiple ladders (handled elsewhere)
  // Here we return the largest available ladder
  for (const leiter of leiterSizes) {
    if (height <= leiter.size) {
      return { artNr: leiter.artNr, name: leiter.name, price: leiter.price }
    }
  }

  // For heights > 200, return Leiter 200 (will need Aufbaumodule)
  return { artNr: "SIM005", name: "Leiter 200", price: 41.0 }
}

/**
 * Get Stangenset article info based on width
 */
export function getStangensetArtNr(width: number): { artNr: string; name: string; price: number } {
  if (width === 40) {
    return { artNr: "SIM006", name: "Stangenset 40", price: 8.0 }
  }
  return { artNr: "SIM007", name: "Stangenset 80", price: 12.0 }
}

/**
 * Helper to get color suffix for article numbers
 */
function getColorSuffix(color: string): string {
  const suffixMap: Record<string, string> = {
    weiss: "",
    schwarz: "-black",
    grau: "-grey",
    rot: "-red",
    orange: "-orange",
    gruen: "-green",
    blau: "-blue",
    gelb: "-yellow",
  }
  return suffixMap[color] || ""
}

// =============================================================================
// PRICE LOOKUP HELPERS
// =============================================================================
export function getLeiterPrice(height: number): number {
  const leiter = leitern.find((l) => l.size === height)
  return leiter?.price ?? 0
}

export function getStangensetPrice(width: number): number {
  const stange = stangensets.find((s) => s.size === width)
  return stange?.price ?? 0
}

export function getFlaechensetPrice(size: number): number {
  return size === 40 ? 15.0 : 22.0
}

export function getFlaechensetGlasPrice(size: number): number {
  return size === 40 ? 26.0 : 35.0
}

export function getMetallbodenPrice(width: number): number {
  return width === 40 ? 19.5 : width === 80 ? 33.5 : 0
}

export function getGlasbodenPrice(width: number): number {
  return width === 40 ? 26.0 : width === 80 ? 35.0 : 0
}

export function getHolzbodenPrice(width: number): number {
  return width === 40 ? 32.0 : width === 80 ? 45.0 : 0
}

export function getSchubladePrice(): number {
  return 88.5 // Doppelschublade
}

export function getEinzelschubladePrice(): number {
  return 55.0
}

export function getTuerPrice(): number {
  return 32.5 // Tür 40cm
}

export function getKlapptuerPrice(): number {
  return 52.0
}

export function getKlapptuerObenPrice(): number {
  return 65.0
}

export function getJalousiePrice(): number {
  return 68.0
}

export function getFunktionswandPrice(): number {
  return 12.5
}

export function getLedPrice(stripes: 2 | 4): number {
  return stripes === 2 ? 75.0 : 99.5
}

export function getGasdruckdaempferPrice(model: string): number {
  const daempfer = gasdruckdaempfer.find((d) => d.name.includes(model))
  return daempfer?.price ?? 0
}

// =============================================================================
// COLOR MAPPING
// =============================================================================
export const colorHexMap: Record<ShelfColor | "satiniert", string> = {
  weiss: "#f5f5f5",
  grau: "#9E9E9E",
  schwarz: "#111111",
  blau: "#1E5EFF",
  gruen: "#2FAE5D",
  gelb: "#FFD400",
  orange: "#FF8A00",
  rot: "#E53935",
  satiniert: "#e8e8e8",
}

// German color names for display
export const colorDisplayNames: Record<ShelfColor, string> = {
  schwarz: "schwarz",
  weiss: "weiß",
  grau: "grau",
  blau: "blau",
  orange: "orange",
  rot: "rot",
  gruen: "grün",
  gelb: "gelb",
}

// =============================================================================
// SIMPLI REGALE - Vorkonfigurierte Komplett-Sets
// =============================================================================

export const productsSimpliRegale: SimpliRegalProduct[] = [
  {
    id: "die-klarlinie",
    name: "Die Klarlinie",
    description: "Reduktion auf das Wesentliche. Die Klarlinie kombiniert offene Fächer mit stabilen Rückwänden und schafft eine ruhige, architektonische Ordnung. Perfekt für Wohnräume, in denen Struktur sichtbar sein darf, ohne dominant zu wirken.",
    subtitle: "Minimalistisch im Look – maximal flexibel im Einsatz",
    artNr: "SR-KLARLINIE-80-2x3",
    width: 80,
    rows: 2,
    cols: 3,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben
      ["mit-rueckwand-80", "mit-rueckwand-80", "mit-rueckwand-80"], // Unten
    ],
    // Preis berechnen: 3x offenes-fach-80 + 3x mit-rueckwand-80
    // offenes-fach-80: 52.50€, mit-rueckwand-80: 65.00€
    price: 3 * 52.5 + 3 * 65.0, // = 352.50€
    features: [
      "2 Ebenen × 3 Spalten",
      "Stabile Rückwände unten",
      "Offene Fächer oben",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 2,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-rueckwand)
        [
          { id: "cell-0-0", type: "mit-rueckwand", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-rueckwand", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-rueckwand", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = oben (offenes-fach)
        [
          { id: "cell-1-0", type: "offenes-fach", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "offenes-fach", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "offenes-fach", row: 1, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "das-sideboard",
    name: "Das Sideboard",
    description: "Kompakt und funktional. Das Sideboard vereint schlanke 40er-Fächer mit einem zentralen Doppelschubladen-Element. Ideal als TV-Lowboard, Flurkommode oder stilvolle Ablage im Wohnbereich.",
    subtitle: "Die perfekte Balance aus Stauraum und Design",
    artNr: "SR-SIDEBOARD-MIX-1x3",
    width: 80, // Gesamtbreite gemischt: 40 + 80 + 40 = 160cm
    rows: 1,
    cols: 3,
    configuration: [
      ["mit-rueckwand-40", "mit-doppelschublade-80", "mit-rueckwand-40"],
    ],
    // Preis: mit-rueckwand-40: 45.00€ x2 + mit-doppelschublade-80: 125.00€
    price: 2 * 45.0 + 125.0, // = 215.00€
    features: [
      "1 Ebene × 3 Spalten (40-80-40)",
      "Zentrale Doppelschublade",
      "Seitenfächer mit Rückwand",
      "Komplett-Set inkl. Rahmen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 1,
      columnWidths: [38, 75, 38] as (75 | 38)[], // 40er, 80er, 40er
      rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        [
          { id: "cell-0-0", type: "mit-rueckwand", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-doppelschublade", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-rueckwand", row: 0, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "der-ordnungshueter",
    name: "Der Ordnungshüter",
    description: "Maximaler Stauraum trifft auf maximale Sicherheit. Der Ordnungshüter kombiniert abschließbare Fächer im unteren Bereich mit klassischen Türelementen oben. Perfekt für Büros, Archive oder überall dort, wo Ordnung und Schutz Hand in Hand gehen sollen.",
    subtitle: "Maximaler Stauraum & Sicherheit",
    artNr: "SR-ORDNUNGSHUETER-80-2x3",
    width: 80,
    rows: 2,
    cols: 3,
    configuration: [
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // Oben
      ["abschliessbare-tueren-80", "abschliessbare-tueren-80", "abschliessbare-tueren-80"], // Unten
    ],
    // Preis berechnen: 3x abschliessbare-tueren-80 + 3x mit-tueren-80
    // abschliessbare-tueren-80: 95.00€, mit-tueren-80: 65.00€
    price: 3 * 95.0 + 3 * 65.0, // = 480.00€
    features: [
      "2 Ebenen × 3 Spalten (80er)",
      "Abschließbare Türen unten",
      "Klassische Türen oben",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 2,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (abschliessbare-tueren)
        [
          { id: "cell-0-0", type: "abschliessbare-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "abschliessbare-tueren", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "abschliessbare-tueren", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = oben (mit-tueren)
        [
          { id: "cell-1-0", type: "mit-tueren", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "mit-tueren", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "mit-tueren", row: 1, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "das-schaufenster",
    name: "Das Schaufenster",
    description: "Präsentieren Sie Ihre Lieblingsstücke im oberen Bereich und verstauen Sie alles andere diskret hinter Türen unten. Das Schaufenster vereint offene Ausstellungsfläche mit praktischem, verschlossenem Stauraum – ideal für Wohnzimmer, Büros oder Geschäftsräume.",
    subtitle: "Präsentation oben, Ordnung unten",
    artNr: "SR-SCHAUFENSTER-80-2x3",
    width: 80,
    rows: 2,
    cols: 3,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // Unten
    ],
    // Preis berechnen: 3x offenes-fach-80 + 3x mit-tueren-80
    // offenes-fach-80: 29.00€, mit-tueren-80: 65.00€
    price: 3 * 29.0 + 3 * 65.0, // = 282.00€
    features: [
      "2 Ebenen × 3 Spalten (80er)",
      "Offene Fächer oben für Präsentation",
      "Türen unten für Stauraum",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 2,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-tueren)
        [
          { id: "cell-0-0", type: "mit-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-tueren", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-tueren", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = oben (offenes-fach)
        [
          { id: "cell-1-0", type: "offenes-fach", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "offenes-fach", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "offenes-fach", row: 1, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "die-buecherwand",
    name: "Die Bücherwand",
    description: "Der zeitlose Klassiker für Bibliophile und Dekoliebhaber. Die Bücherwand bietet großzügige offene Flächen in den oberen zwei Ebenen für Bücher, Pflanzen und Lieblingsstücke. Die Rückwand unten sorgt für einen aufgeräumten Abschluss und zusätzliche Stabilität.",
    subtitle: "Klassiker für Bücher & Deko",
    artNr: "SR-BUECHERWAND-80-3x3",
    width: 80,
    rows: 3,
    cols: 3,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Mitte
      ["mit-rueckwand-80", "mit-rueckwand-80", "mit-rueckwand-80"], // Unten
    ],
    // Preis berechnen: 3x mit-rueckwand-80 + 6x offenes-fach-80
    // mit-rueckwand-80: 42.00€, offenes-fach-80: 29.00€
    price: 3 * 42.0 + 6 * 29.0, // = 300.00€
    features: [
      "3 Ebenen × 3 Spalten (80er)",
      "Offene Fächer für Bücher & Deko",
      "Rückwand unten für Stabilität",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 3,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-rueckwand)
        [
          { id: "cell-0-0", type: "mit-rueckwand", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-rueckwand", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-rueckwand", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = mitte (offenes-fach)
        [
          { id: "cell-1-0", type: "offenes-fach", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "offenes-fach", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "offenes-fach", row: 1, col: 2, color: "weiss" },
        ],
        // Row 2 = oben (offenes-fach)
        [
          { id: "cell-2-0", type: "offenes-fach", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "offenes-fach", row: 2, col: 1, color: "weiss" },
          { id: "cell-2-2", type: "offenes-fach", row: 2, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "die-treppe",
    name: "Die Treppe",
    description: "Ein architektonisches Statement für Showrooms und moderne Wohnräume. Die gestaffelte Treppenform steigt von einer Ebene bis auf vier Ebenen an und kombiniert offene Präsentationsflächen mit verschlossenen Stauräumen. Unten rechts sicher abschließbar, oben offen für Ihre schönsten Stücke.",
    subtitle: "Sehr stark für Showrooms",
    artNr: "SR-TREPPE-80-GESTAFFELT",
    width: 80,
    rows: 4,
    cols: 4,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Ebene 4 (oben)
      ["", "offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Ebene 3
      ["", "", "offenes-fach-80", "offenes-fach-80"], // Ebene 2
      ["offenes-fach-80", "mit-rueckwand-80", "mit-tueren-80", "abschliessbare-tueren-80"], // Ebene 1 (unten)
    ],
    // Preis berechnen: 
    // Spalte 1: 1x offenes-fach = 29.00
    // Spalte 2: 1x mit-rueckwand + 1x offenes-fach = 42 + 29 = 71.00
    // Spalte 3: 1x mit-tueren + 2x offenes-fach = 65 + 58 = 123.00
    // Spalte 4: 1x abschliessbar + 3x offenes-fach = 95 + 87 = 182.00
    // Total: 29 + 71 + 123 + 182 = 405.00
    price: 405.0,
    features: [
      "Gestaffelt: 1 bis 4 Ebenen",
      "4 Spalten (80er)",
      "Abschließbar unten rechts",
      "Perfekt für Showrooms",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview (gestaffelt)
    preset: {
      columns: 4,
      rows: 4,
      columnWidths: [75, 75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (Basis)
        [
          { id: "cell-0-0", type: "offenes-fach", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-rueckwand", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-tueren", row: 0, col: 2, color: "weiss" },
          { id: "cell-0-3", type: "abschliessbare-tueren", row: 0, col: 3, color: "weiss" },
        ],
        // Row 1 = Ebene 2
        [
          { id: "cell-1-0", type: "empty", row: 1, col: 0 },
          { id: "cell-1-1", type: "offenes-fach", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "offenes-fach", row: 1, col: 2, color: "weiss" },
          { id: "cell-1-3", type: "offenes-fach", row: 1, col: 3, color: "weiss" },
        ],
        // Row 2 = Ebene 3
        [
          { id: "cell-2-0", type: "empty", row: 2, col: 0 },
          { id: "cell-2-1", type: "empty", row: 2, col: 1 },
          { id: "cell-2-2", type: "offenes-fach", row: 2, col: 2, color: "weiss" },
          { id: "cell-2-3", type: "offenes-fach", row: 2, col: 3, color: "weiss" },
        ],
        // Row 3 = Ebene 4 (oben)
        [
          { id: "cell-3-0", type: "empty", row: 3, col: 0 },
          { id: "cell-3-1", type: "empty", row: 3, col: 1 },
          { id: "cell-3-2", type: "empty", row: 3, col: 2 },
          { id: "cell-3-3", type: "offenes-fach", row: 3, col: 3, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "der-hocharchivator",
    name: "Der Hocharchivator",
    description: "Das ultimative Ordnungssystem für Archivräume, Büros und Lager. Vier Ebenen bieten maximale Staufläche: unten abschließbar für Wertvolles, darüber Türen für den täglichen Zugriff, Rückwände für stabile Ablage und oben offene Fächer für schnellen Zugriff auf häufig benötigte Dinge.",
    subtitle: "Maximale Ordnung + Zugriff oben",
    artNr: "SR-HOCHARCHIVATOR-80-4x3",
    width: 80,
    rows: 4,
    cols: 3,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben (4. Ebene)
      ["mit-rueckwand-80", "mit-rueckwand-80", "mit-rueckwand-80"], // 3. Ebene
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // 2. Ebene
      ["abschliessbare-tueren-80", "abschliessbare-tueren-80", "abschliessbare-tueren-80"], // Unten (1. Ebene)
    ],
    // Preis berechnen:
    // 3x abschliessbare-tueren @ 95.00 = 285.00
    // 3x mit-tueren @ 65.00 = 195.00
    // 3x mit-rueckwand @ 42.00 = 126.00
    // 3x offenes-fach @ 29.00 = 87.00
    // Total: 693.00
    price: 693.0,
    features: [
      "4 Ebenen x 3 Spalten (80er)",
      "Abschließbar unten",
      "Türen + Rückwand in der Mitte",
      "Offene Fächer oben",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 4,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (abschliessbare-tueren)
        [
          { id: "cell-0-0", type: "abschliessbare-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "abschliessbare-tueren", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "abschliessbare-tueren", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = 2. Ebene (mit-tueren)
        [
          { id: "cell-1-0", type: "mit-tueren", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "mit-tueren", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "mit-tueren", row: 1, col: 2, color: "weiss" },
        ],
        // Row 2 = 3. Ebene (mit-rueckwand)
        [
          { id: "cell-2-0", type: "mit-rueckwand", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "mit-rueckwand", row: 2, col: 1, color: "weiss" },
          { id: "cell-2-2", type: "mit-rueckwand", row: 2, col: 2, color: "weiss" },
        ],
        // Row 3 = oben (offenes-fach)
        [
          { id: "cell-3-0", type: "offenes-fach", row: 3, col: 0, color: "weiss" },
          { id: "cell-3-1", type: "offenes-fach", row: 3, col: 1, color: "weiss" },
          { id: "cell-3-2", type: "offenes-fach", row: 3, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "die-vertikale-klarheit",
    name: "Die Vertikale Klarheit",
    description: "Architektonische Ruhe in vertikaler Form. Dieses schlanke, hohe Regal schafft klare Linien und einen ruhigen Rhythmus im Raum. Unten geschlossen für Ordnung, oben offen für Ihre schönsten Stücke – ein Statement für minimalistische Ästhetik.",
    subtitle: "Hoch, ruhig, architektonisch",
    artNr: "SR-VERTIKALE-KLARHEIT-80-5x2",
    width: 80,
    rows: 5,
    cols: 2,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80"], // Oben (5. Ebene)
      ["offenes-fach-80", "offenes-fach-80"], // 4. Ebene
      ["offenes-fach-80", "offenes-fach-80"], // 3. Ebene
      ["mit-rueckwand-80", "mit-rueckwand-80"], // 2. Ebene
      ["mit-tueren-80", "mit-tueren-80"], // Unten (1. Ebene)
    ],
    // Preis berechnen:
    // 2x mit-tueren @ 65.00 = 130.00
    // 2x mit-rueckwand @ 42.00 = 84.00
    // 6x offenes-fach @ 29.00 = 174.00
    // Total: 388.00
    price: 388.0,
    features: [
      "5 Ebenen x 2 Spalten (80er)",
      "Schlanke, hohe Silhouette",
      "Türen unten, offen oben",
      "Architektonisches Design",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 2,
      rows: 5,
      columnWidths: [75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-tueren)
        [
          { id: "cell-0-0", type: "mit-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-tueren", row: 0, col: 1, color: "weiss" },
        ],
        // Row 1 = 2. Ebene (mit-rueckwand)
        [
          { id: "cell-1-0", type: "mit-rueckwand", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "mit-rueckwand", row: 1, col: 1, color: "weiss" },
        ],
        // Row 2 = 3. Ebene (offenes-fach)
        [
          { id: "cell-2-0", type: "offenes-fach", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "offenes-fach", row: 2, col: 1, color: "weiss" },
        ],
        // Row 3 = 4. Ebene (offenes-fach)
        [
          { id: "cell-3-0", type: "offenes-fach", row: 3, col: 0, color: "weiss" },
          { id: "cell-3-1", type: "offenes-fach", row: 3, col: 1, color: "weiss" },
        ],
        // Row 4 = oben (offenes-fach)
        [
          { id: "cell-4-0", type: "offenes-fach", row: 4, col: 0, color: "weiss" },
          { id: "cell-4-1", type: "offenes-fach", row: 4, col: 1, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "der-showtower",
    name: "Der Showtower",
    description: "Das ultimative Präsentationsregal für Showrooms, Galerien und stilbewusste Räume. Eine sichere Basis aus Türen unten, gerahmt von Rückwänden auf der zweiten Ebene mit offenem Highlight in der Mitte, und darüber drei Ebenen offener Präsentationsfläche für Ihre besten Stücke.",
    subtitle: "Präsentation mit sicherer Basis",
    artNr: "SR-SHOWTOWER-80-5x3",
    width: 80,
    rows: 5,
    cols: 3,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben (5. Ebene)
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // 4. Ebene
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // 3. Ebene
      ["mit-rueckwand-80", "offenes-fach-80", "mit-rueckwand-80"], // 2. Ebene
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // Unten (1. Ebene)
    ],
    // Preis berechnen:
    // 3x mit-tueren @ 65.00 = 195.00
    // 2x mit-rueckwand @ 42.00 + 1x offenes-fach @ 29.00 = 113.00
    // 9x offenes-fach @ 29.00 = 261.00
    // Total: 569.00
    price: 569.0,
    features: [
      "5 Ebenen x 3 Spalten (80er)",
      "Sichere Basis mit Türen",
      "Gerahmtes Highlight in der Mitte",
      "Maximale Präsentationsfläche oben",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 5,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-tueren)
        [
          { id: "cell-0-0", type: "mit-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-tueren", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-tueren", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = 2. Ebene (mit-rueckwand | offenes-fach | mit-rueckwand)
        [
          { id: "cell-1-0", type: "mit-rueckwand", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "offenes-fach", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "mit-rueckwand", row: 1, col: 2, color: "weiss" },
        ],
        // Row 2 = 3. Ebene (offenes-fach)
        [
          { id: "cell-2-0", type: "offenes-fach", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "offenes-fach", row: 2, col: 1, color: "weiss" },
          { id: "cell-2-2", type: "offenes-fach", row: 2, col: 2, color: "weiss" },
        ],
        // Row 3 = 4. Ebene (offenes-fach)
        [
          { id: "cell-3-0", type: "offenes-fach", row: 3, col: 0, color: "weiss" },
          { id: "cell-3-1", type: "offenes-fach", row: 3, col: 1, color: "weiss" },
          { id: "cell-3-2", type: "offenes-fach", row: 3, col: 2, color: "weiss" },
        ],
        // Row 4 = oben (offenes-fach)
        [
          { id: "cell-4-0", type: "offenes-fach", row: 4, col: 0, color: "weiss" },
          { id: "cell-4-1", type: "offenes-fach", row: 4, col: 1, color: "weiss" },
          { id: "cell-4-2", type: "offenes-fach", row: 4, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "der-loft-riese",
    name: "Der Loft-Riese",
    description: "Urban, offen, brutal ehrlich. Der Loft-Riese verkörpert den industriellen Charme moderner Loftwohnungen. Offene Module ohne Rückwand lassen Licht durch und schaffen Durchsicht, während die zentrale Achse mit offenen Fächern Akzente setzt. Unten praktisch mit Türen und Schubladen.",
    subtitle: "Urban, offen, brutal ehrlich",
    artNr: "SR-LOFT-RIESE-80-4x3",
    width: 80,
    rows: 4,
    cols: 3,
    configuration: [
      ["ohne-rueckwand-80", "offenes-fach-80", "ohne-rueckwand-80"], // Oben (4. Ebene)
      ["ohne-rueckwand-80", "offenes-fach-80", "ohne-rueckwand-80"], // 3. Ebene
      ["ohne-rueckwand-80", "offenes-fach-80", "ohne-rueckwand-80"], // 2. Ebene
      ["mit-tueren-80", "mit-doppelschublade-80", "mit-tueren-80"], // Unten (1. Ebene)
    ],
    // Preis berechnen:
    // 2x mit-tueren @ 65.00 + 1x mit-doppelschublade @ 85.00 = 215.00
    // 6x ohne-rueckwand @ 35.00 + 3x offenes-fach @ 29.00 = 297.00
    // Total: 512.00
    price: 512.0,
    features: [
      "4 Ebenen x 3 Spalten (80er)",
      "Industrieller Loft-Style",
      "Ohne Rückwand als Raumteiler",
      "Schubladen + Türen unten",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 4,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-tueren | mit-doppelschublade | mit-tueren)
        [
          { id: "cell-0-0", type: "mit-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-doppelschublade", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-tueren", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = 2. Ebene (ohne-rueckwand | offenes-fach | ohne-rueckwand)
        [
          { id: "cell-1-0", type: "ohne-rueckwand", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "offenes-fach", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "ohne-rueckwand", row: 1, col: 2, color: "weiss" },
        ],
        // Row 2 = 3. Ebene (ohne-rueckwand | offenes-fach | ohne-rueckwand)
        [
          { id: "cell-2-0", type: "ohne-rueckwand", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "offenes-fach", row: 2, col: 1, color: "weiss" },
          { id: "cell-2-2", type: "ohne-rueckwand", row: 2, col: 2, color: "weiss" },
        ],
        // Row 3 = oben (ohne-rueckwand | offenes-fach | ohne-rueckwand)
        [
          { id: "cell-3-0", type: "ohne-rueckwand", row: 3, col: 0, color: "weiss" },
          { id: "cell-3-1", type: "offenes-fach", row: 3, col: 1, color: "weiss" },
          { id: "cell-3-2", type: "ohne-rueckwand", row: 3, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "die-komposition",
    name: "Die Komposition",
    description: "Design trifft Funktion in perfekter Harmonie. Die Komposition vereint verschiedene Modultypen zu einem durchdachten Gesamtkunstwerk. Die zentrale Klapptür in der Mitte setzt einen funktionalen Akzent, während Türen, Rückwände und offene Fächer ein ausgewogenes Spiel aus Zeigen und Verbergen schaffen.",
    subtitle: "Design + Funktion",
    artNr: "SR-KOMPOSITION-80-5x3",
    width: 80,
    rows: 5,
    cols: 3,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben (5. Ebene)
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // 4. Ebene
      ["offenes-fach-80", "mit-klapptuer-80", "offenes-fach-80"], // 3. Ebene
      ["mit-rueckwand-80", "offenes-fach-80", "mit-rueckwand-80"], // 2. Ebene
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // Unten (1. Ebene)
    ],
    // Preis berechnen:
    // 3x mit-tueren @ 65.00 = 195.00
    // 2x mit-rueckwand @ 42.00 + 1x offenes-fach @ 29.00 = 113.00
    // 2x offenes-fach @ 29.00 + 1x mit-klapptuer @ 55.00 = 113.00
    // 6x offenes-fach @ 29.00 = 174.00
    // Total: 595.00
    price: 595.0,
    features: [
      "5 Ebenen x 3 Spalten (80er)",
      "Einzigartige Modulkombination",
      "Klapptür als zentrales Element",
      "Perfekte Balance aus Design + Funktion",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 5,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-tueren)
        [
          { id: "cell-0-0", type: "mit-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-tueren", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-tueren", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = 2. Ebene (mit-rueckwand | offenes-fach | mit-rueckwand)
        [
          { id: "cell-1-0", type: "mit-rueckwand", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "offenes-fach", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "mit-rueckwand", row: 1, col: 2, color: "weiss" },
        ],
        // Row 2 = 3. Ebene (offenes-fach | mit-klapptuer | offenes-fach)
        [
          { id: "cell-2-0", type: "offenes-fach", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "mit-klapptuer", row: 2, col: 1, color: "weiss" },
          { id: "cell-2-2", type: "offenes-fach", row: 2, col: 2, color: "weiss" },
        ],
        // Row 3 = 4. Ebene (offenes-fach)
        [
          { id: "cell-3-0", type: "offenes-fach", row: 3, col: 0, color: "weiss" },
          { id: "cell-3-1", type: "offenes-fach", row: 3, col: 1, color: "weiss" },
          { id: "cell-3-2", type: "offenes-fach", row: 3, col: 2, color: "weiss" },
        ],
        // Row 4 = oben (offenes-fach)
        [
          { id: "cell-4-0", type: "offenes-fach", row: 4, col: 0, color: "weiss" },
          { id: "cell-4-1", type: "offenes-fach", row: 4, col: 1, color: "weiss" },
          { id: "cell-4-2", type: "offenes-fach", row: 4, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "der-familien-tower",
    name: "Der Familien-Tower",
    description: "Das ideale Regal für Familien mit Kindern. Die abschließbaren Fächer links unten schützen Wertvolles und Gefährliches vor neugierigen Kinderhänden, während der Rest des Regals flexibel für alle zugänglich bleibt. Oben offen für Spielzeug und Bücher, unten sicher verschlossen.",
    subtitle: "Kindersicher + flexibel",
    artNr: "SR-FAMILIEN-TOWER-80-4x4",
    width: 80,
    rows: 4,
    cols: 4,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben (4. Ebene)
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // 3. Ebene
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // 2. Ebene
      ["abschliessbare-tueren-80", "abschliessbare-tueren-80", "mit-tueren-80", "mit-tueren-80"], // Unten (1. Ebene)
    ],
    // Preis berechnen:
    // 2x abschliessbare-tueren @ 95.00 + 2x mit-tueren @ 65.00 = 320.00
    // 4x mit-tueren @ 65.00 = 260.00
    // 8x offenes-fach @ 29.00 = 232.00
    // Total: 812.00
    price: 812.0,
    features: [
      "4 Ebenen x 4 Spalten (80er)",
      "Abschließbar links unten",
      "Kindersicher + familienfreundlich",
      "Flexibel für alle Generationen",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 4,
      rows: 4,
      columnWidths: [75, 75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (abschliessbar | abschliessbar | mit-tueren | mit-tueren)
        [
          { id: "cell-0-0", type: "abschliessbare-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "abschliessbare-tueren", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-tueren", row: 0, col: 2, color: "weiss" },
          { id: "cell-0-3", type: "mit-tueren", row: 0, col: 3, color: "weiss" },
        ],
        // Row 1 = 2. Ebene (mit-tueren)
        [
          { id: "cell-1-0", type: "mit-tueren", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "mit-tueren", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "mit-tueren", row: 1, col: 2, color: "weiss" },
          { id: "cell-1-3", type: "mit-tueren", row: 1, col: 3, color: "weiss" },
        ],
        // Row 2 = 3. Ebene (offenes-fach)
        [
          { id: "cell-2-0", type: "offenes-fach", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "offenes-fach", row: 2, col: 1, color: "weiss" },
          { id: "cell-2-2", type: "offenes-fach", row: 2, col: 2, color: "weiss" },
          { id: "cell-2-3", type: "offenes-fach", row: 2, col: 3, color: "weiss" },
        ],
        // Row 3 = oben (offenes-fach)
        [
          { id: "cell-3-0", type: "offenes-fach", row: 3, col: 0, color: "weiss" },
          { id: "cell-3-1", type: "offenes-fach", row: 3, col: 1, color: "weiss" },
          { id: "cell-3-2", type: "offenes-fach", row: 3, col: 2, color: "weiss" },
          { id: "cell-3-3", type: "offenes-fach", row: 3, col: 3, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "der-system-monolith",
    name: "Der System-Monolith",
    description: "Maximaler Stauraum mit klarer Logik. Der System-Monolith folgt einem durchdachten Aufbau: Schubladen unten für schnellen Zugriff, Türen darüber für geschlossenen Stauraum, Rückwände für stabile Ablage und offene Fächer oben für Präsentation. Ein Monument der Ordnung.",
    subtitle: "Maximaler Stauraum, klare Logik",
    artNr: "SR-SYSTEM-MONOLITH-80-5x3",
    width: 80,
    rows: 5,
    cols: 3,
    configuration: [
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // Oben (5. Ebene)
      ["offenes-fach-80", "offenes-fach-80", "offenes-fach-80"], // 4. Ebene
      ["mit-rueckwand-80", "mit-rueckwand-80", "mit-rueckwand-80"], // 3. Ebene
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // 2. Ebene
      ["mit-doppelschublade-80", "mit-doppelschublade-80", "mit-doppelschublade-80"], // Unten (1. Ebene)
    ],
    // Preis berechnen:
    // 3x mit-doppelschublade @ 85.00 = 255.00
    // 3x mit-tueren @ 65.00 = 195.00
    // 3x mit-rueckwand @ 42.00 = 126.00
    // 6x offenes-fach @ 29.00 = 174.00
    // Total: 750.00
    price: 750.0,
    features: [
      "5 Ebenen x 3 Spalten (80er)",
      "Doppelschubladen unten",
      "Logischer Aufbau von unten nach oben",
      "Maximaler Stauraum",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 3,
      rows: 5,
      columnWidths: [75, 75, 75] as (75 | 38)[],
      rowHeights: [38, 38, 38, 38, 38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = unten (mit-doppelschublade)
        [
          { id: "cell-0-0", type: "mit-doppelschublade", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-doppelschublade", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-doppelschublade", row: 0, col: 2, color: "weiss" },
        ],
        // Row 1 = 2. Ebene (mit-tueren)
        [
          { id: "cell-1-0", type: "mit-tueren", row: 1, col: 0, color: "weiss" },
          { id: "cell-1-1", type: "mit-tueren", row: 1, col: 1, color: "weiss" },
          { id: "cell-1-2", type: "mit-tueren", row: 1, col: 2, color: "weiss" },
        ],
        // Row 2 = 3. Ebene (mit-rueckwand)
        [
          { id: "cell-2-0", type: "mit-rueckwand", row: 2, col: 0, color: "weiss" },
          { id: "cell-2-1", type: "mit-rueckwand", row: 2, col: 1, color: "weiss" },
          { id: "cell-2-2", type: "mit-rueckwand", row: 2, col: 2, color: "weiss" },
        ],
        // Row 3 = 4. Ebene (offenes-fach)
        [
          { id: "cell-3-0", type: "offenes-fach", row: 3, col: 0, color: "weiss" },
          { id: "cell-3-1", type: "offenes-fach", row: 3, col: 1, color: "weiss" },
          { id: "cell-3-2", type: "offenes-fach", row: 3, col: 2, color: "weiss" },
        ],
        // Row 4 = oben (offenes-fach)
        [
          { id: "cell-4-0", type: "offenes-fach", row: 4, col: 0, color: "weiss" },
          { id: "cell-4-1", type: "offenes-fach", row: 4, col: 1, color: "weiss" },
          { id: "cell-4-2", type: "offenes-fach", row: 4, col: 2, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "das-lowboard-klassik",
    name: "Das Lowboard Klassik",
    description: "Zeitlose Eleganz in ihrer pursten Form. Das Lowboard Klassik bietet eine durchgehend geschlossene Front mit vier Türelementen - ruhig, aufgeräumt und perfekt als TV-Unterschrank, Sideboard oder Flurgarderobe. Ein Klassiker, der nie aus der Mode kommt.",
    subtitle: "Ruhig, geschlossen, zeitlos",
    artNr: "SR-LOWBOARD-KLASSIK-80-1x4",
    width: 80,
    rows: 1,
    cols: 4,
    configuration: [
      ["mit-tueren-80", "mit-tueren-80", "mit-tueren-80", "mit-tueren-80"], // Einzige Ebene
    ],
    // Preis berechnen:
    // 4x mit-tueren @ 65.00 = 260.00
    price: 260.0,
    features: [
      "1 Ebene x 4 Spalten (80er)",
      "Komplett geschlossene Front",
      "Zeitloses Design",
      "Ideal als TV-Lowboard oder Sideboard",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 4,
      rows: 1,
      columnWidths: [75, 75, 75, 75] as (75 | 38)[],
      rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = einzige Ebene (mit-tueren)
        [
          { id: "cell-0-0", type: "mit-tueren", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "mit-tueren", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "mit-tueren", row: 0, col: 2, color: "weiss" },
          { id: "cell-0-3", type: "mit-tueren", row: 0, col: 3, color: "weiss" },
        ],
      ],
    },
  },
  {
    id: "das-medienboard",
    name: "Das Medienboard",
    description: "Das perfekte Board für TV und Technik. Die Rückwände links und rechts schaffen einen stabilen Rahmen und verbergen Kabel elegant, während die offenen Fächer in der Mitte Platz für Receiver, Konsolen und Streaming-Boxen bieten - mit optimaler Belüftung und einfachem Zugang.",
    subtitle: "TV, Technik, Kabel sauber geführt",
    artNr: "SR-MEDIENBOARD-80-1x4",
    width: 80,
    rows: 1,
    cols: 4,
    configuration: [
      ["mit-rueckwand-80", "offenes-fach-80", "offenes-fach-80", "mit-rueckwand-80"], // Einzige Ebene
    ],
    // Preis berechnen:
    // 2x mit-rueckwand @ 42.00 = 84.00
    // 2x offenes-fach @ 29.00 = 58.00
    // Total: 142.00
    price: 142.0,
    features: [
      "1 Ebene x 4 Spalten (80er)",
      "Rückwände aussen für Kabelführung",
      "Offene Mitte für Technik",
      "Optimale Belüftung",
      "Komplett-Set inkl. Leiter & Stangen",
    ],
    // Konfigurator Preset für 3D Preview
    preset: {
      columns: 4,
      rows: 1,
      columnWidths: [75, 75, 75, 75] as (75 | 38)[],
      rowHeights: [38] as (40 | 80 | 120 | 160 | 200)[],
      grid: [
        // Row 0 = einzige Ebene
        [
          { id: "cell-0-0", type: "mit-rueckwand", row: 0, col: 0, color: "weiss" },
          { id: "cell-0-1", type: "offenes-fach", row: 0, col: 1, color: "weiss" },
          { id: "cell-0-2", type: "offenes-fach", row: 0, col: 2, color: "weiss" },
          { id: "cell-0-3", type: "mit-rueckwand", row: 0, col: 3, color: "weiss" },
        ],
      ],
    },
  },
]
