// Simpli-Connect Complete Product Catalog with Real Prices

export type ProductCategory =
  | "leiter"
  | "stangenset"
  | "metallboden"
  | "glasboden"
  | "holzboden"
  | "schublade"
  | "tuer"
  | "jalousie"
  | "funktionswand"
  | "led"

export type ShelfColor = "schwarz" | "weiss" | "blau" | "orange" | "rot" | "gruen" | "gelb" | "grau"

export interface Product {
  artNr: string
  name: string
  category: ProductCategory
  size: number // in cm
  price: number
  color?: ShelfColor
  variant?: string
}

// Leitern (Ladders/Heights) - vertical frame posts
export const leitern: Product[] = [
  { artNr: "sim001", name: "Leiter 40 cm", category: "leiter", size: 40, price: 13.5 },
  { artNr: "sim002", name: "Leiter 80 cm", category: "leiter", size: 80, price: 20.5 },
  { artNr: "sim003", name: "Leiter 120 cm", category: "leiter", size: 120, price: 27.5 },
  { artNr: "sim004", name: "Leiter 160 cm", category: "leiter", size: 160, price: 33.5 },
  { artNr: "sim005", name: "Leiter 200 cm", category: "leiter", size: 200, price: 41.0 },
]

// Stangensets (Tube sets - 2 pieces per set)
export const stangensets: Product[] = [
  {
    artNr: "sim006",
    name: "Stangenset Metall 40 cm",
    category: "stangenset",
    size: 40,
    price: 6.95,
    variant: "metall",
  },
  {
    artNr: "sim007m",
    name: "Stangenset Metall 80 cm",
    category: "stangenset",
    size: 80,
    price: 10.5,
    variant: "metall",
  },
  { artNr: "sim007g", name: "Stangenset Glas 80 cm", category: "stangenset", size: 80, price: 10.5, variant: "glas" },
]

// Metallböden (Metal shelves - 2 pieces per package)
export const metallboeden: Product[] = [
  // Standard colors
  { artNr: "sim008", name: "Metallboden Schwarz 40", category: "metallboden", size: 40, price: 19.5, color: "schwarz" },
  { artNr: "sim009", name: "Metallboden Schwarz 80", category: "metallboden", size: 80, price: 33.5, color: "schwarz" },
  { artNr: "sim010", name: "Metallboden Weiß 40", category: "metallboden", size: 40, price: 19.5, color: "weiss" },
  { artNr: "sim011", name: "Metallboden Weiß 80", category: "metallboden", size: 80, price: 33.5, color: "weiss" },
  // Special colors - same prices
  { artNr: "sim008-bl", name: "Metallboden Blau 40", category: "metallboden", size: 40, price: 19.5, color: "blau" },
  { artNr: "sim009-bl", name: "Metallboden Blau 80", category: "metallboden", size: 80, price: 33.5, color: "blau" },
  {
    artNr: "sim008-or",
    name: "Metallboden Orange 40",
    category: "metallboden",
    size: 40,
    price: 19.5,
    color: "orange",
  },
  {
    artNr: "sim009-or",
    name: "Metallboden Orange 80",
    category: "metallboden",
    size: 80,
    price: 33.5,
    color: "orange",
  },
  { artNr: "sim008-rt", name: "Metallboden Rot 40", category: "metallboden", size: 40, price: 19.5, color: "rot" },
  { artNr: "sim009-rt", name: "Metallboden Rot 80", category: "metallboden", size: 80, price: 33.5, color: "rot" },
  { artNr: "sim008-gr", name: "Metallboden Grün 40", category: "metallboden", size: 40, price: 19.5, color: "gruen" },
  { artNr: "sim009-gr", name: "Metallboden Grün 80", category: "metallboden", size: 80, price: 33.5, color: "gruen" },
  { artNr: "sim008-ge", name: "Metallboden Gelb 40", category: "metallboden", size: 40, price: 19.5, color: "gelb" },
  { artNr: "sim009-ge", name: "Metallboden Gelb 80", category: "metallboden", size: 80, price: 33.5, color: "gelb" },
  { artNr: "sim008-grau", name: "Metallboden Grau 40", category: "metallboden", size: 40, price: 19.5, color: "grau" },
  { artNr: "sim009-grau", name: "Metallboden Grau 80", category: "metallboden", size: 80, price: 33.5, color: "grau" },
]

// Glasböden (Glass shelves - 2 pieces per package)
export const glasboeden: Product[] = [
  { artNr: "sim012", name: "Glas Schwarz 40", category: "glasboden", size: 40, price: 26.0, color: "glas-schwarz" },
  { artNr: "sim013", name: "Glas Schwarz 80", category: "glasboden", size: 80, price: 35.0, color: "glas-schwarz" },
  {
    artNr: "sim014",
    name: "Glas Satiniert 40",
    category: "glasboden",
    size: 40,
    price: 26.0,
    variant: "satiniert",
  },
  {
    artNr: "sim015",
    name: "Glas Satiniert 80",
    category: "glasboden",
    size: 80,
    price: 35.0,
    variant: "satiniert",
  },
]

// Holzböden (Wood shelves - Makassar - 2 pieces per package)
export const holzboeden: Product[] = [
  { artNr: "sim016", name: "Makassar 40", category: "holzboden", size: 40, price: 26.0, variant: "makassar" },
  { artNr: "sim017", name: "Makassar 80", category: "holzboden", size: 80, price: 35.0, variant: "makassar" },
]

// Schubladen & Türen (Drawers & Doors)
export const schubladenTueren: Product[] = [
  {
    artNr: "sim018s",
    name: "Doppelschublade 80 Schwarz",
    category: "schublade",
    size: 80,
    price: 88.5,
    color: "schwarz",
  },
  { artNr: "sim018w", name: "Doppelschublade 80 Weiß", category: "schublade", size: 80, price: 88.5, color: "weiss" },
  { artNr: "sim019s", name: "Tür 40 Schwarz", category: "tuer", size: 40, price: 32.5, color: "schwarz" },
  { artNr: "sim019w", name: "Tür 40 Weiß", category: "tuer", size: 40, price: 32.5, color: "weiss" },
  { artNr: "sim020c", name: "Jalousie 80 Chrom", category: "jalousie", size: 80, price: 68.0, variant: "chrom" },
  {
    artNr: "sim030s",
    name: "Tür Links 40 Schwarz",
    category: "tuer",
    size: 40,
    price: 45.0,
    color: "schwarz",
    variant: "links",
  },
  {
    artNr: "sim030w",
    name: "Tür Links 40 Weiß",
    category: "tuer",
    size: 40,
    price: 45.0,
    color: "weiss",
    variant: "links",
  },
  {
    artNr: "sim031s",
    name: "Tür Rechts 40 Schwarz",
    category: "tuer",
    size: 40,
    price: 45.0,
    color: "schwarz",
    variant: "rechts",
  },
  {
    artNr: "sim031w",
    name: "Tür Rechts 40 Weiß",
    category: "tuer",
    size: 40,
    price: 45.0,
    color: "weiss",
    variant: "rechts",
  },
  {
    artNr: "sim032s",
    name: "Abschließbare Tür Links 40 Schwarz",
    category: "tuer",
    size: 40,
    price: 65.0,
    color: "schwarz",
    variant: "links-abschliessbar",
  },
  {
    artNr: "sim032w",
    name: "Abschließbare Tür Links 40 Weiß",
    category: "tuer",
    size: 40,
    price: 65.0,
    color: "weiss",
    variant: "links-abschliessbar",
  },
  // Color variants for door modules
  {
    artNr: "sim030bl",
    name: "Tür Links 40 Blau",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "blau",
    variant: "links",
  },
  {
    artNr: "sim031bl",
    name: "Tür Rechts 40 Blau",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "blau",
    variant: "rechts",
  },
  {
    artNr: "sim030or",
    name: "Tür Links 40 Orange",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "orange",
    variant: "links",
  },
  {
    artNr: "sim031or",
    name: "Tür Rechts 40 Orange",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "orange",
    variant: "rechts",
  },
  {
    artNr: "sim030rt",
    name: "Tür Links 40 Rot",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "rot",
    variant: "links",
  },
  {
    artNr: "sim031rt",
    name: "Tür Rechts 40 Rot",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "rot",
    variant: "rechts",
  },
  {
    artNr: "sim030gr",
    name: "Tür Links 40 Grün",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "gruen",
    variant: "links",
  },
  {
    artNr: "sim031gr",
    name: "Tür Rechts 40 Grün",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "gruen",
    variant: "rechts",
  },
  {
    artNr: "sim030ge",
    name: "Tür Links 40 Gelb",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "gelb",
    variant: "links",
  },
  {
    artNr: "sim031ge",
    name: "Tür Rechts 40 Gelb",
    category: "tuer",
    size: 40,
    price: 52.0,
    color: "gelb",
    variant: "rechts",
  },
]

// Funktionswände (Function walls / Back panels)
export const funktionswaende: Product[] = [
  {
    artNr: "sim023s",
    name: "Funktionswand 1-seitig Schwarz",
    category: "funktionswand",
    size: 1,
    price: 12.5,
    color: "schwarz",
    variant: "1-seitig",
  },
  {
    artNr: "sim023w",
    name: "Funktionswand 1-seitig Weiß",
    category: "funktionswand",
    size: 1,
    price: 12.5,
    color: "weiss",
    variant: "1-seitig",
  },
  {
    artNr: "sim024s",
    name: "Funktionswand 2-seitig Schwarz",
    category: "funktionswand",
    size: 2,
    price: 14.5,
    color: "schwarz",
    variant: "2-seitig",
  },
  {
    artNr: "sim024w",
    name: "Funktionswand 2-seitig Weiß",
    category: "funktionswand",
    size: 2,
    price: 14.5,
    color: "weiss",
    variant: "2-seitig",
  },
]

// LED-Units
export const ledUnits: Product[] = [
  { artNr: "sim021", name: "LED Unit 2 Stripes", category: "led", size: 2, price: 75.0 },
  { artNr: "sim022", name: "LED Unit 4 Stripes", category: "led", size: 4, price: 99.5 },
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
  ...ledUnits,
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

export function getMetallbodenPrice(width: number, color?: ShelfColor): number {
  // All colors same price, just check by size
  return width === 40 ? 19.5 : width === 80 ? 33.5 : 0
}

export function getGlasbodenPrice(width: number): number {
  return width === 40 ? 26.0 : width === 80 ? 35.0 : 0
}

export function getHolzbodenPrice(width: number): number {
  return width === 40 ? 26.0 : width === 80 ? 35.0 : 0
}

export function getSchubladePrice(): number {
  return 88.5 // Doppelschublade 80
}

export function getTuerPrice(width: number, variant?: string): number {
  if (variant === "links" || variant === "rechts") {
    return width === 40 ? getTuerLinksRechtsPrice() : 0
  }
  if (variant === "links-abschliessbar") {
    return width === 40 ? getAbschliessbareTuerPrice() : 0
  }
  return width === 40 ? 32.5 : 32.5 // Only 40 cm available
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

// Helper functions for door prices
export function getTuerLinksRechtsPrice(color?: ShelfColor): number {
  // Base colors (schwarz/weiss) are 45€, special colors are 52€
  if (!color || color === "schwarz" || color === "weiss") {
    return 45.0
  }
  return 52.0
}

export function getAbschliessbareTuerPrice(color?: ShelfColor): number {
  // Lockable doors: base colors 65€, special colors 72€
  if (!color || color === "schwarz" || color === "weiss") {
    return 65.0
  }
  return 72.0
}

// Color hex values for rendering
export const colorHexMap: Record<ShelfColor | "satiniert" | "makassar" | "glas-klar" | "glas-schwarz", string> = {
  schwarz: "#1a1a1a",
  weiss: "#f5f5f5",
  blau: "#0277A0", // Teal/petrol blue from product image
  orange: "#F57C00", // Warm orange from product image
  rot: "#C62828", // Deep red from product image
  gruen: "#00896F", // Emerald green from product image
  gelb: "#F9D71C", // Bright yellow from product image
  grau: "#5A5A5A", // Dark gunmetal gray (schwarzgrau) from product image
  satiniert: "#e8e8e0",
  makassar: "#3d2817",
  "glas-klar": "#e8f4f8",
  "glas-schwarz": "#1a1a1a",
}
