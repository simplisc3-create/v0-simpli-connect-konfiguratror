// Centralized utility functions for module labels and colors
import type { GridCell } from "@/components/shelf-configurator"

export const getModuleLabel = (type: GridCell["type"]): string => {
  const labels: Record<GridCell["type"], string> = {
    empty: "Leer",
    ghost: "Geisterzelle",
    "offenes-fach": "Offenes Fach",
    "ohne-seitenwaende": "Ohne Seitenwände",
    "ohne-rueckwand": "Ohne Rückwand",
    "mit-rueckwand": "Mit Rückwand",
    "mit-tueren": "Mit Türen",
    "mit-klapptuer": "Mit Klapptür",
    "mit-klapptuer-oben": "Klapptür (nach oben)",
    "mit-doppelschublade": "Mit Schubladen",
    "mit-einzelschublade": "Einzelschublade",
    "abschliessbare-tueren": "Abschließbar",
    "mit-tuere-links": "Mit Türe Links",
    "mit-tuere-rechts": "Mit Türe Rechts",
    "abschliessbar-links": "Abschließbar Links",
    "abschliessbar-rechts": "Abschließbar Rechts",
    klapptuer: "Klapptür",
  }
  return labels[type] || type
}

export const getModuleShortLabel = (type: GridCell["type"]): string => {
  const labels: Record<GridCell["type"], string> = {
    empty: "",
    ghost: "",
    "offenes-fach": "Offen",
    "ohne-seitenwaende": "o.SW",
    "ohne-rueckwand": "o.RW",
    "mit-rueckwand": "m.RW",
    "mit-tueren": "Türen",
    "mit-klapptuer": "Klapp",
    "mit-klapptuer-oben": "Klapp↑",
    "mit-doppelschublade": "Schubl.",
    "mit-einzelschublade": "ESchubl.",
    "abschliessbare-tueren": "Abschl.",
    "mit-tuere-links": "Türe L",
    "mit-tuere-rechts": "Türe R",
    "abschliessbar-links": "Abschl. L",
    "abschliessbar-rechts": "Abschl. R",
    klapptuer: "Klapp",
  }
  return labels[type] || ""
}

export type ColorKey = GridCell["color"]

export const COLOR_HEX_MAP: Record<NonNullable<ColorKey>, string> = {
  weiss: "#FFFFFF",
  grau: "#9E9E9E",
  schwarz: "#111111",
  blau: "#1E5EFF",
  gruen: "#2FAE5D",
  gelb: "#FFEA00", // Brighter, more saturated yellow
  orange: "#FF8A00",
  red: "#E53935",
}

export const COLOR_LABEL_MAP: Record<NonNullable<ColorKey>, string> = {
  weiss: "Weiß",
  schwarz: "Schwarz",
  blau: "Blau",
  gruen: "Grün",
  gelb: "Gelb",
  orange: "Orange",
  red: "Rot",
}

export const getColorHex = (color: ColorKey | undefined): string => {
  return COLOR_HEX_MAP[color || "weiss"] || COLOR_HEX_MAP.weiss
}

export const getColorLabel = (color: ColorKey | undefined): string => {
  return COLOR_LABEL_MAP[color || "weiss"] || COLOR_LABEL_MAP.weiss
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(price)
}
