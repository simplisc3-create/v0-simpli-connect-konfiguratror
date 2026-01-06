// Simpli-Connect Complete Product Catalog with Official SKUs

export type ProductCategory =
  | "leiter"
  | "stangenset"
  | "metallboden"
  | "glasboden"
  | "holzboden"
  | "schublade"
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

export interface Product {
  artNr: string // Official SKU
  name: string
  category: ProductCategory
  size: number // in cm
  price: number
  color?: ShelfColor
  variant?: string
}

export type ShelfColor = "schwarz" | "weiss" | "blau" | "orange" | "rot" | "gruen" | "gelb"

// Leitern (Ladders/Heights) - vertical frame posts
export const leitern: Product[] = [
  { artNr: "SIM-L-40", name: "Leiter 40", category: "leiter", size: 40, price: 13.5 },
  { artNr: "SIM-L-80", name: "Leiter 80", category: "leiter", size: 80, price: 20.5 },
  { artNr: "SIM-L-120", name: "Leiter 120", category: "leiter", size: 120, price: 27.5 },
  { artNr: "SIM-L-160", name: "Leiter 160", category: "leiter", size: 160, price: 33.5 },
  { artNr: "SIM-L-200", name: "Leiter 200", category: "leiter", size: 200, price: 41.0 },
]

// Stangensets (Tube sets - 2 pieces per set)
export const stangensets: Product[] = [
  {
    artNr: "SIM-S-40-M",
    name: "Stangenset 40 Metall",
    category: "stangenset",
    size: 40,
    price: 6.95,
    variant: "metall",
  },
  {
    artNr: "SIM-S-80-M",
    name: "Stangenset 80 Metall",
    category: "stangenset",
    size: 80,
    price: 10.5,
    variant: "metall",
  },
  { artNr: "SIM-S-80-G", name: "Stangenset 80 Glas", category: "stangenset", size: 80, price: 10.5, variant: "glas" },
]

// Metallböden (Metal shelves - 2 pieces per package)
export const metallboeden: Product[] = [
  // Standard colors
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
  // Special colors - same prices
  {
    artNr: "SIM-B-M-40-C-BL",
    name: "Boden Metall 40 Blau",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "blau",
  },
  {
    artNr: "SIM-B-M-80-C-BL",
    name: "Boden Metall 80 Blau",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "blau",
  },
  {
    artNr: "SIM-B-M-40-C-OR",
    name: "Boden Metall 40 Orange",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "orange",
  },
  {
    artNr: "SIM-B-M-80-C-OR",
    name: "Boden Metall 80 Orange",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "orange",
  },
  {
    artNr: "SIM-B-M-40-C-RT",
    name: "Boden Metall 40 Rot",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "rot",
  },
  {
    artNr: "SIM-B-M-80-C-RT",
    name: "Boden Metall 80 Rot",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "rot",
  },
  {
    artNr: "SIM-B-M-40-C-GR",
    name: "Boden Metall 40 Grün",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "gruen",
  },
  {
    artNr: "SIM-B-M-80-C-GR",
    name: "Boden Metall 80 Grün",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "gruen",
  },
  {
    artNr: "SIM-B-M-40-C-GE",
    name: "Boden Metall 40 Gelb",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "gelb",
  },
  {
    artNr: "SIM-B-M-80-C-GE",
    name: "Boden Metall 80 Gelb",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "gelb",
  },
]

// Glasböden (Glass shelves - 2 pieces per package)
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

// Holzböden (Wood shelves - 2 pieces per package)
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

// Schubladen & Türen (Drawers & Doors)
export const schubladenTueren: Product[] = [
  { artNr: "SIM-D-40-B", name: "Tür 40 Schwarz", category: "tuer", size: 40, price: 32.5, color: "schwarz" },
  { artNr: "SIM-D-40-W", name: "Tür 40 Weiß", category: "tuer", size: 40, price: 32.5, color: "weiss" },
  {
    artNr: "SIM-D-40-L",
    name: "Tür 40 Abschließbar",
    category: "tuer",
    size: 40,
    price: 42.5,
    variant: "abschliessbar",
  },
  { artNr: "SIM-F-40", name: "Klapptür 40", category: "klapptuer", size: 40, price: 38.0 },
  { artNr: "SIM-F-80", name: "Klapptür 80", category: "klapptuer", size: 80, price: 52.0 },
  {
    artNr: "SIM-DS-80-B",
    name: "Doppelschublade 80 Schwarz",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "schwarz",
  },
  {
    artNr: "SIM-DS-80-W",
    name: "Doppelschublade 80 Weiß",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "weiss",
  },
  { artNr: "SIM-J-80", name: "Jalousie 80", category: "jalousie", size: 80, price: 68.0 },
]

// Funktionswände (Function walls / Back panels)
export const funktionswaende: Product[] = [
  {
    artNr: "SIM-FW-1-B",
    name: "Funktionswand 1-seitig Schwarz",
    category: "funktionswand",
    size: 1,
    price: 12.5,
    color: "schwarz",
    variant: "1-seitig",
  },
  {
    artNr: "SIM-FW-1-W",
    name: "Funktionswand 1-seitig Weiß",
    category: "funktionswand",
    size: 1,
    price: 12.5,
    color: "weiss",
    variant: "1-seitig",
  },
  {
    artNr: "SIM-FW-2-B",
    name: "Funktionswand 2-seitig Schwarz",
    category: "funktionswand",
    size: 2,
    price: 14.5,
    color: "schwarz",
    variant: "2-seitig",
  },
  {
    artNr: "SIM-FW-2-W",
    name: "Funktionswand 2-seitig Weiß",
    category: "funktionswand",
    size: 2,
    price: 14.5,
    color: "weiss",
    variant: "2-seitig",
  },
]

// Seitenwände (Side walls)
export const seitenwaende: Product[] = [
  // 40cm side walls
  {
    artNr: "SIM-SW-40-B",
    name: "Seitenwand 40 Schwarz",
    category: "seitenwand",
    size: 40,
    price: 15.5,
    color: "schwarz",
  },
  { artNr: "SIM-SW-40-W", name: "Seitenwand 40 Weiß", category: "seitenwand", size: 40, price: 15.5, color: "weiss" },
  { artNr: "SIM-SW-40-C-BL", name: "Seitenwand 40 Blau", category: "seitenwand", size: 40, price: 15.5, color: "blau" },
  {
    artNr: "SIM-SW-40-C-OR",
    name: "Seitenwand 40 Orange",
    category: "seitenwand",
    size: 40,
    price: 15.5,
    color: "orange",
  },
  { artNr: "SIM-SW-40-C-RT", name: "Seitenwand 40 Rot", category: "seitenwand", size: 40, price: 15.5, color: "rot" },
  {
    artNr: "SIM-SW-40-C-GR",
    name: "Seitenwand 40 Grün",
    category: "seitenwand",
    size: 40,
    price: 15.5,
    color: "gruen",
  },
  { artNr: "SIM-SW-40-C-GE", name: "Seitenwand 40 Gelb", category: "seitenwand", size: 40, price: 15.5, color: "gelb" },
  // 80cm side walls
  {
    artNr: "SIM-SW-80-B",
    name: "Seitenwand 80 Schwarz",
    category: "seitenwand",
    size: 80,
    price: 22.5,
    color: "schwarz",
  },
  { artNr: "SIM-SW-80-W", name: "Seitenwand 80 Weiß", category: "seitenwand", size: 80, price: 22.5, color: "weiss" },
  { artNr: "SIM-SW-80-C-BL", name: "Seitenwand 80 Blau", category: "seitenwand", size: 80, price: 22.5, color: "blau" },
  {
    artNr: "SIM-SW-80-C-OR",
    name: "Seitenwand 80 Orange",
    category: "seitenwand",
    size: 80,
    price: 22.5,
    color: "orange",
  },
  { artNr: "SIM-SW-80-C-RT", name: "Seitenwand 80 Rot", category: "seitenwand", size: 80, price: 22.5, color: "rot" },
  {
    artNr: "SIM-SW-80-C-GR",
    name: "Seitenwand 80 Grün",
    category: "seitenwand",
    size: 80,
    price: 22.5,
    color: "gruen",
  },
  { artNr: "SIM-SW-80-C-GE", name: "Seitenwand 80 Gelb", category: "seitenwand", size: 80, price: 22.5, color: "gelb" },
]

// LED-Units
export const ledUnits: Product[] = [
  { artNr: "SIM-LED-2", name: "LED Unit 2 Stripes", category: "led", size: 2, price: 75.0 },
  { artNr: "SIM-LED-4", name: "LED Unit 4 Stripes", category: "led", size: 4, price: 99.5 },
]

// Zubehör & Montageteile (Accessories & Mounting Parts)
// Adapter (zwischen Leiter & Stange)
export const adapter: Product[] = [{ artNr: "SIM-AD", name: "Adapter", category: "adapter", size: 1, price: 2.5 }]

// Schrauben (Screws)
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
  {
    artNr: "SIM-SCR-MB-80",
    name: "Schrauben Metallboden 80 (4er)",
    category: "schraube",
    size: 80,
    price: 1.5,
    variant: "metallboden",
  },
  {
    artNr: "SIM-SCR-MB-40",
    name: "Schrauben Metallboden 40 (4er)",
    category: "schraube",
    size: 40,
    price: 1.5,
    variant: "metallboden",
  },
]

// Metallstab für Glasböden
export const metallstaebe: Product[] = [
  { artNr: "SIM-MS-80", name: "Metallstab Glasboden 80", category: "metallstab", size: 80, price: 4.5 },
  { artNr: "SIM-MS-40", name: "Metallstab Glasboden 40", category: "metallstab", size: 40, price: 3.5 },
]

// Eckschutz für Glasböden (4 Stück pro Set)
export const eckschutz: Product[] = [
  { artNr: "SIM-CP-G", name: "Eckschutz Glas (4er)", category: "eckschutz", size: 1, price: 2.0 },
]

// All products combined
export const allProducts: Product[] = [
  ...leitern,
  ...stangensets,
  ...metallboeden,
  ...glasboeden,
  ...holzboeden,
  ...schubladenTueren,
  ...funktionswaende,
  ...seitenwaende,
  ...ledUnits,
  ...adapter,
  ...schrauben,
  ...metallstaebe,
  ...eckschutz,
]

// Price lookup helpers
export function getLeiterPrice(height: number): number {
  const leiter = leitern.find((l) => l.size === height)
  return leiter?.price ?? 0
}

export function getStangensetPrice(width: number, variant: "metall" | "glas" = "metall"): number {
  const stange = stangensets.find((s) => s.size === width && s.variant === variant)
  return stange?.price ?? 0
}

export function getMetallbodenPrice(width: number): number {
  // All colors same price, just check by size
  return width === 40 ? 19.5 : width === 80 ? 33.5 : 0
}

export function getGlasbodenPrice(width: number): number {
  return width === 40 ? 26.0 : width === 80 ? 35.0 : 0
}

export function getHolzbodenPrice(width: number): number {
  return width === 40 ? 32.0 : width === 80 ? 45.0 : 0
}

export function getSchubladePrice(): number {
  return 88.5 // Doppelschublade 80
}

export function getTuerPrice(width: number): number {
  return width === 40 ? 32.5 : 32.5 // Only 40 cm available
}

export function getKlapptuerPrice(width: number): number {
  return width === 40 ? 38.0 : width === 80 ? 52.0 : 0
}

export function getJalousiePrice(): number {
  return 68.0
}

export function getFunktionswandPrice(variant: "1-seitig" | "2-seitig"): number {
  return variant === "1-seitig" ? 12.5 : 14.5
}

export function getLedPrice(stripes: 2 | 4): number {
  return stripes === 2 ? 75.0 : 99.5
}

// Color hex values for rendering
export const colorHexMap: Record<ShelfColor | "satiniert" | "gelb", string> = {
  schwarz: "#1a1a1a",
  weiss: "#f5f5f5",
  blau: "#00b4d8",
  orange: "#f97316",
  rot: "#dc2626",
  gruen: "#228B22",
  gelb: "#eab308",
  satiniert: "#e8e8e8",
}
