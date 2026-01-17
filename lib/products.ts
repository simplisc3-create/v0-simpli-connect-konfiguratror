export type ProductColor = "weiss" | "anthrazit" | "eiche" | "nussbaum"

export type ProductVariant = {
  color: string
  artNr: string
  image: string | null
  name: string
}

export type Product = {
  id: string
  name: string
  artNr: string
  description: string
  price: number
  category: string
  image: string | null
  width?: number | null
  height?: number | null
  colors?: string[]
  variants?: ProductVariant[]
}

export const products: Product[] = [
  {
    id: "leiter-40",
    name: "Leiter 40",
    artNr: "SIM001",
    description:
      "Vertikaler Rahmen 40cm - Perfekt als Seitenrahmen für kompakte Regale. Robuste Stahlkonstruktion mit langlebiger Chrom-Beschichtung.",
    price: 13.5,
    category: "rahmen",
    image: "/placeholder.svg?height=400&width=400",
    width: 40,
    height: null,
  },
  {
    id: "leiter-80",
    name: "Leiter 80",
    artNr: "SIM002",
    description:
      "Vertikaler Rahmen 80cm - Ideal für mittelhohe Regalkonstruktionen. Stabile Verbindungspunkte für sichere Montage.",
    price: 20.5,
    category: "rahmen",
    image: "/placeholder.svg?height=400&width=400",
    width: 80,
    height: null,
  },
  {
    id: "leiter-120",
    name: "Leiter 120",
    artNr: "SIM003",
    description: "Vertikaler Rahmen 120cm - Für höhere Regaleinheiten. Premium Qualität mit präziser Verarbeitung.",
    price: 27.5,
    category: "rahmen",
    image: "/placeholder.svg?height=400&width=400",
    width: 120,
    height: null,
  },
  {
    id: "leiter-160",
    name: "Leiter 160",
    artNr: "SIM004",
    description:
      "Vertikaler Rahmen 160cm - Große Regalwände leicht gemacht. Maximale Stabilität durch verstärkte Konstruktion.",
    price: 33.5,
    category: "rahmen",
    image: "/placeholder.svg?height=400&width=400",
    width: 160,
    height: null,
  },
  {
    id: "leiter-200",
    name: "Leiter 200",
    artNr: "SIM005",
    description: "Vertikaler Rahmen 200cm - Für raumhohe Regalsysteme. Höchste Tragkraft und Langlebigkeit.",
    price: 41.0,
    category: "rahmen",
    image: "/placeholder.svg?height=400&width=400",
    width: 200,
    height: null,
  },
  {
    id: "stangenset-40",
    name: "Stangenset 40",
    artNr: "SIM006",
    description: "Horizontale Stangen 40cm (2er Set) - Verbinden die vertikalen Rahmen und definieren die Regaltiefe.",
    price: 8.0,
    category: "rahmen",
    image: "/placeholder.svg?height=400&width=400",
    width: 40,
    height: null,
  },
  {
    id: "stangenset-80",
    name: "Stangenset 80",
    artNr: "SIM007",
    description: "Horizontale Stangen 80cm (2er Set) - Für breitere Regalfächer mit mehr Stellfläche.",
    price: 12.0,
    category: "rahmen",
    image: "/placeholder.svg?height=400&width=400",
    width: 80,
    height: null,
  },
  {
    id: "flaechenset-40",
    name: "Flächenset 40",
    artNr: "SIM009/SIM010",
    description:
      "Regalböden 40cm (9 Stück) - Hochwertige MDF-Platten mit strapazierfähiger Melaminbeschichtung. Verfügbar in Weiß und Schwarz für jeden Einrichtungsstil.",
    price: 15.0,
    category: "flaechen",
    image: "/placeholder.svg?height=400&width=400",
    width: 40,
    height: null,
    colors: ["weiss", "anthrazit"],
    variants: [
      { color: "weiss", artNr: "SIM010", image: "/placeholder.svg?height=400&width=400", name: "Flächenset 40 Weiß" },
      {
        color: "anthrazit",
        artNr: "SIM009",
        image: "/placeholder.svg?height=400&width=400",
        name: "Flächenset 40 Schwarz",
      },
    ],
  },
  {
    id: "flaechenset-80",
    name: "Flächenset 80",
    artNr: "SIM011/SIM012",
    description:
      "Regalböden 80cm (11 Stück) - Mehr Fläche für größere Regale. Einfache Montage ohne Werkzeug. Verfügbar in Weiß und Schwarz.",
    price: 22.0,
    category: "flaechen",
    image: "/placeholder.svg?height=400&width=400",
    width: 80,
    height: null,
    colors: ["weiss", "anthrazit"],
    variants: [
      { color: "weiss", artNr: "SIM011", image: "/placeholder.svg?height=400&width=400", name: "Flächenset 80 Weiß" },
      {
        color: "anthrazit",
        artNr: "SIM012",
        image: "/placeholder.svg?height=400&width=400",
        name: "Flächenset 80 Schwarz",
      },
    ],
  },
  {
    id: "doppelschublade-weiss",
    name: "Doppelschublade Weiß",
    artNr: "SIM018",
    description:
      "Schubladenmodul mit 2 Schubladen - Praktischer Stauraum für Kleinteile. Sanft schließende Vollauszüge.",
    price: 85.0,
    category: "module",
    image: "/images/schublade.jpg",
    width: 40,
    height: 36,
    colors: ["weiss"],
  },
  {
    id: "tuer-40-weiss",
    name: "Tür 40cm Weiß",
    artNr: "SIM019-white",
    description: "Türmodul 40cm weiß - Verbergen Sie den Inhalt stilvoll. Push-to-open Mechanismus inklusive.",
    price: 45.0,
    category: "module",
    image: "/placeholder.svg?height=400&width=400",
    width: 40,
    height: 36,
    colors: ["weiss"],
  },
  {
    id: "klapptuer-weiss",
    name: "Klapptür Weiß",
    artNr: "SIM032-white",
    description: "Klapptürmodul weiß - Nach oben öffnende Tür mit Soft-Close. Modern und platzsparend.",
    price: 55.0,
    category: "module",
    image: "/placeholder.svg?height=400&width=400",
    width: 40,
    height: 36,
    colors: ["weiss"],
  },
  {
    id: "funktionswand-edelstahl",
    name: "Funktionswand Edelstahl",
    artNr: "SIM023",
    description: "Rückwand Edelstahl - Magnetische Oberfläche für flexible Nutzung. Rostfrei und pflegeleicht.",
    price: 35.0,
    category: "zubehoer",
    image: "/images/product-shot-all-white-20-2814-29.jpeg",
    width: 40,
    height: 36,
  },
  {
    id: "schloss-typ-a",
    name: "Schloss Typ A",
    artNr: "SIM1000a",
    description: "Abschließbares Schloss - Sichern Sie wertvolle Gegenstände. Zwei Schlüssel inklusive.",
    price: 25.0,
    category: "zubehoer",
    image: "/placeholder.svg?height=400&width=400",
    width: null,
    height: null,
  },
]

export const categories = [
  { id: "alle", name: "Alle Produkte" },
  { id: "rahmen", name: "Rahmen & Stangen" },
  { id: "flaechen", name: "Flächensets" },
  { id: "module", name: "Module" },
  { id: "zubehoer", name: "Zubehör" },
]

export const categoryLabels: Record<string, string> = {
  rahmen: "Rahmen & Stangen",
  flaechen: "Flächensets",
  module: "Module",
  zubehoer: "Zubehör",
}

export function getColorHex(color: ProductColor): string {
  const colorMap: Record<ProductColor, string> = {
    weiss: "#FFFFFF",
    anthrazit: "#3D3D3D",
    eiche: "#C4A77D",
    nussbaum: "#5D4037",
  }
  return colorMap[color] || "#CCCCCC"
}

export const colorLabels: Record<ProductColor, string> = {
  weiss: "Weiß",
  anthrazit: "Anthrazit",
  eiche: "Eiche",
  nussbaum: "Nussbaum",
}
