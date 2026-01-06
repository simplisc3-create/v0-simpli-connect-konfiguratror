// =============================================================================
// SIMPLI-CONNECT GLB REGISTRY - 100% DETERMINISTISCH
// =============================================================================
//
// KEINE FALLBACKS - Wenn ein File fehlt → ERROR
// Alle URLs werden dynamisch generiert nach dem Muster:
// ${BASE_URL}/${color}${width}/${dimensions}-${variant}-${color}${separator}optimized.glb
//
// VERFÜGBARE ORDNER (vollständig):
// - white80, white40
// - green80, green40
// - yellow80, yellow40
// - red80, red40
// - blue80, blue40
//
// KORREKTE Varianten-Codes:
//
// 80cm Varianten (1-X):
//   1-1 = offenes-fach (komplett offen - KEINE Seitenwände, KEINE Rückwand)
//   1-2 = ohne-seitenwaende (KEINE Seitenwände, HAT Rückwand)
//   1-3 = mit-rueckwand (HAT Seitenwände, HAT Rückwand)
//   1-4 = mit-klapptuer
//   1-5 = mit-doppelschublade
//   1-6 = mit-tueren
//   1-7 = abschliessbare-tueren
//   1-8 = ohne-rueckwand (HAT Seitenwände, KEINE Rückwand)
//
// 40cm Varianten (2-X):
//   2-1 = offenes-fach (komplett offen - KEINE Seitenwände, KEINE Rückwand)
//   2-2 = ohne-seitenwaende (KEINE Seitenwände, HAT Rückwand)
//   2-3 = mit-rueckwand (HAT Seitenwände, HAT Rückwand)
//   2-4 = mit-tuere-rechts
//   2-5 = mit-tuere-links
//   2-6 = abschliessbar-links
//   2-7 = abschliessbar-rechts
// =============================================================================

export type WidthKey = 40 | 80
export type HeightKey = number

export type ColorKey = "white" | "green" | "yellow" | "red" | "blue"

export type ModuleType =
  | "offenes-fach"
  | "ohne-seitenwaende"
  | "mit-rueckwand"
  | "mit-klapptuer"
  | "mit-doppelschublade"
  | "mit-tueren"
  | "abschliessbare-tueren"
  | "ohne-rueckwand"
  | "mit-seitenwaenden"
  | "mit-tuere-links"
  | "mit-tuere-rechts"
  | "abschliessbar-links"
  | "abschliessbar-rechts"

export const MODULE_TYPES: ModuleType[] = [
  "offenes-fach",
  "ohne-seitenwaende",
  "mit-rueckwand",
  "mit-klapptuer",
  "mit-doppelschublade",
  "mit-tueren",
  "abschliessbare-tueren",
  "ohne-rueckwand",
  "mit-seitenwaenden",
  "mit-tuere-links",
  "mit-tuere-rechts",
  "abschliessbar-links",
  "abschliessbar-rechts",
]

export const MODULE_TO_VARIANT_CODE_80: Record<ModuleType, string> = {
  "offenes-fach": "1-1",
  "ohne-seitenwaende": "1-2",
  "mit-rueckwand": "1-3",
  "mit-klapptuer": "1-4",
  "mit-doppelschublade": "1-5",
  "mit-tueren": "1-6",
  "abschliessbare-tueren": "1-7",
  "ohne-rueckwand": "1-8",
  // Diese existieren nicht bei 80cm - werden unten als ERROR behandelt
  "mit-seitenwaenden": "",
  "mit-tuere-links": "",
  "mit-tuere-rechts": "",
  "abschliessbar-links": "",
  "abschliessbar-rechts": "",
}

export const MODULE_TO_VARIANT_CODE_40: Record<ModuleType, string> = {
  "offenes-fach": "2-1",
  "ohne-seitenwaende": "2-2",
  "mit-rueckwand": "2-3",
  "mit-tuere-rechts": "2-4",
  "mit-tuere-links": "2-5",
  "abschliessbar-links": "2-6",
  "abschliessbar-rechts": "2-7",
  // Diese existieren nicht bei 40cm - werden unten als ERROR behandelt
  "mit-seitenwaenden": "",
  "mit-klapptuer": "",
  "mit-doppelschublade": "",
  "mit-tueren": "",
  "abschliessbare-tueren": "",
  "ohne-rueckwand": "",
}

export const COLOR_KEYS: ColorKey[] = ["white", "green", "yellow", "red", "blue"]

const GLB_BASE_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com"

function buildGlbUrl(color: ColorKey, width: WidthKey, variantCode: string): string {
  const folder = `${color}${width}`
  const dimensions = width === 80 ? "80x40x40" : "40x40x40"

  const separator = color === "white" && width === 80 ? "-" : "_"

  const filename = `${dimensions}-${variantCode}-${color}${separator}optimized.glb`

  return `${GLB_BASE_URL}/${folder}/${filename}`
}

export function resolveGlbUrl(args: {
  width: WidthKey
  height: HeightKey
  moduleType: ModuleType
  color: ColorKey
}): { url: string; variantCode: string } {
  const { width, moduleType, color } = args

  // Validiere Farbe
  if (!COLOR_KEYS.includes(color)) {
    throw new Error(`[GLB Registry] Farbe "${color}" nicht verfügbar. Verfügbar: ${COLOR_KEYS.join(", ")}`)
  }

  // Hole Varianten-Code basierend auf Breite
  const variantCode = width === 80 ? MODULE_TO_VARIANT_CODE_80[moduleType] : MODULE_TO_VARIANT_CODE_40[moduleType]

  if (!variantCode) {
    throw new Error(
      `[GLB Registry] ModuleType "${moduleType}" existiert nicht für ${width}cm. ` +
        `Verfügbare Typen für ${width}cm: ${
          width === 80
            ? Object.entries(MODULE_TO_VARIANT_CODE_80)
                .filter(([_, v]) => v)
                .map(([k]) => k)
                .join(", ")
            : Object.entries(MODULE_TO_VARIANT_CODE_40)
                .filter(([_, v]) => v)
                .map(([k]) => k)
                .join(", ")
        }`,
    )
  }

  const url = buildGlbUrl(color, width, variantCode)

  return { url, variantCode }
}

export function isModuleTypeAvailableForWidth(moduleType: ModuleType, width: WidthKey): boolean {
  const variantCode = width === 80 ? MODULE_TO_VARIANT_CODE_80[moduleType] : MODULE_TO_VARIANT_CODE_40[moduleType]
  return !!variantCode
}

export function getAvailableModuleTypesForWidth(width: WidthKey): ModuleType[] {
  const map = width === 80 ? MODULE_TO_VARIANT_CODE_80 : MODULE_TO_VARIANT_CODE_40
  return Object.entries(map)
    .filter(([_, code]) => !!code)
    .map(([type]) => type as ModuleType)
}
