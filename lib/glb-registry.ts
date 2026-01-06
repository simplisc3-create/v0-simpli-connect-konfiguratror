// =============================================================================
// SIMPLI-CONNECT GLB REGISTRY - SINGLE SOURCE OF TRUTH
// =============================================================================
//
// WICHTIG: Jedes Modul hat NUR EINE zugeordnete GLB-Datei!
//
// 80cm Varianten (1-X):
//   1-1 = offenes-fach (leeres Fach, keine Wände, keine Rückwand)
//   1-2 = ohne-seitenwaende (hat Rückwand, keine Seitenwände)
//   1-3 = mit-rueckwand (hat Rückwand)
//   1-4 = mit-klapptuer
//   1-5 = mit-doppelschublade
//   1-6 = mit-tueren
//   1-7 = abschliessbare-tueren
//   1-8 = ohne-rueckwand (hat Seitenwände, KEINE Rückwand)
//
// 40cm Varianten (2-X):
//   2-1 = offenes-fach (leeres Fach)
//   2-2 = mit-rueckwand
//   2-3 = mit-seitenwaenden
//   2-4 = mit-tuere-rechts
//   2-5 = mit-tuere-links
//   2-6 = abschliessbar-links
//   2-7 = abschliessbar-rechts
// =============================================================================

export type WidthKey = 40 | 80
export type HeightKey = number
export type ColorKey =
  | "white"
  | "gray"
  | "black"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "anthrazit"
  | "beige"

export type ModuleType =
  | "offenes-fach" // 1-1 / 2-1 = leeres Fach (empty open shelf)
  | "ohne-seitenwaende" // 1-2 = hat Rückwand, keine Seitenwände
  | "mit-rueckwand" // 1-3 / 2-2 = mit Rückwand
  | "mit-klapptuer" // 1-4
  | "mit-doppelschublade" // 1-5
  | "mit-tueren" // 1-6
  | "abschliessbare-tueren" // 1-7
  | "ohne-rueckwand" // 1-8 = hat Seitenwände, KEINE Rückwand (mit-seitenwaenden)
  | "mit-seitenwaenden" // 2-3
  | "mit-tuere-links" // 2-5
  | "mit-tuere-rechts" // 2-4
  | "abschliessbar-links" // 2-6
  | "abschliessbar-rechts" // 2-7

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

// 1-1 = offenes-fach (leeres Fach)
// 1-8 = ohne-rueckwand (hat Seitenwände aber KEINE Rückwand)
export const MODULE_TO_VARIANT_CODE: Record<WidthKey, Partial<Record<ModuleType, string>>> = {
  80: {
    "offenes-fach": "1-1", // leeres Fach (empty open shelf)
    "ohne-seitenwaende": "1-2", // hat Rückwand, keine Seitenwände
    "mit-rueckwand": "1-3", // mit Rückwand
    "mit-klapptuer": "1-4", // mit Klapptür
    "mit-doppelschublade": "1-5", // Doppelschublade
    "mit-tueren": "1-6", // mit Türen
    "abschliessbare-tueren": "1-7", // abschließbare Türen
    "ohne-rueckwand": "1-8", // hat Seitenwände, KEINE Rückwand
  },
  40: {
    "offenes-fach": "2-1", // leeres Fach
    "mit-rueckwand": "2-2", // mit Rückwand
    "mit-seitenwaenden": "2-3", // mit Seitenwänden
    "mit-tuere-rechts": "2-4", // Tür rechts
    "mit-tuere-links": "2-5", // Tür links
    "abschliessbar-links": "2-6", // abschließbar links
    "abschliessbar-rechts": "2-7", // abschließbar rechts
  },
}

export const COLOR_KEYS: ColorKey[] = [
  "white",
  "gray",
  "black",
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "anthrazit",
  "beige",
]

const GLB_BASE_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com"
const HEBBKX_BASE_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com"

// =============================================================================
// DIRECT URL MAP - EINE URL PRO MODUL/FARBE KOMBINATION
// =============================================================================
const DIRECT_URL_MAP: Record<string, string> = {
  // ===========================================================================
  // WHITE 80cm - Alle 8 Varianten
  // ===========================================================================
  "80x40x40-1-1-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-1-white-optimized.glb`,
  "80x40x40-1-2-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-2-white-optimized.glb`,
  "80x40x40-1-3-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-3-white-optimized.glb`,
  "80x40x40-1-4-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-4-white-optimized.glb`,
  "80x40x40-1-5-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-5-white-optimized.glb`,
  "80x40x40-1-6-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-6-white-optimized.glb`,
  "80x40x40-1-7-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-7-white-optimized.glb`,
  "80x40x40-1-8-white-optimized.glb": `${GLB_BASE_URL}/white80/80x40x40-1-8-white-optimized.glb`,

  // ===========================================================================
  // WHITE 40cm - Alle 7 Varianten
  // ===========================================================================
  "40x40x40-2-1-white-optimized.glb": `${HEBBKX_BASE_URL}/40x40x40-2-1-white_optimized-wl1xlV3BtsJMl5XuAvFjuaL4cFraRF.glb`,
  "40x40x40-2-2-white-optimized.glb": `${HEBBKX_BASE_URL}/40x40x40-2-2-white_optimized-eUyKrDSaeIlg6V9j1OYmyqwKIx0V8v.glb`,
  "40x40x40-2-3-white-optimized.glb": `${HEBBKX_BASE_URL}/40x40x40-2-3-white_optimized-EfXL1zmDhl1jBELSV6ZvOwTIJ8cqng.glb`,
  "40x40x40-2-4-white-optimized.glb": `${HEBBKX_BASE_URL}/40x40x40-2-4-white_optimized-Q8XQy73ZtoXpAPlBKgN1J2O0KpXr74.glb`,
  "40x40x40-2-5-white-optimized.glb": `${HEBBKX_BASE_URL}/40x40x40-2-5-white_optimized-4KTnjXMNppAJpLCvaJb9FsB6MQhC4P.glb`,
  "40x40x40-2-6-white-optimized.glb": `${HEBBKX_BASE_URL}/40x40x40-2-6-white_optimized-ngpH8G24jzVhgDOz1b3WEjqXhnCNy4.glb`,
  "40x40x40-2-7-white-optimized.glb": `${HEBBKX_BASE_URL}/40x40x40-2-7-white_optimized-9LscBaHqIkQTq2tt39oRwvQIJepMpA.glb`,

  // ===========================================================================
  // YELLOW 80cm - Verfügbare Varianten
  // ===========================================================================
  "80x40x40-1-1-yellow-optimized.glb": `${GLB_BASE_URL}/80x40x40-1-1-yellow_optimized-opt.glb`,
  "80x40x40-1-2-yellow-optimized.glb": `${HEBBKX_BASE_URL}/80x40x40-1-2-yellow_optimized-opt%20%281%29-opt-iMMuFgJrMamhZVnMaa8jW5uAeiTBnD.glb`,
  "80x40x40-1-3-yellow-optimized.glb": `${GLB_BASE_URL}/no%20shadows/80x40x40-1-3-yellow_optimized-opt.glb`,

  // ===========================================================================
  // YELLOW 40cm - Verfügbare Varianten
  // ===========================================================================
  "40x40x40-2-1-yellow-optimized.glb": `${GLB_BASE_URL}/yellow40/40x40x40-2-1-yellow-opt.glb`,

  // ===========================================================================
  // RED 80cm - Verfügbare Varianten
  // ===========================================================================
  "80x40x40-1-2-red-optimized.glb": `${HEBBKX_BASE_URL}/80x40x40-1-2-red_optimized-opt-hmR8AQhXtr8lAplbglJMehFFJHOa59.glb`,
  "80x40x40-1-8-red-optimized.glb": `${GLB_BASE_URL}/80x40x40-1-8-red_optimized.glb`,
}

// Files stored at blob root without folder structure
const ROOT_LEVEL_FILES: Set<string> = new Set([
  "40x40x40-2-1-blue-optimized.glb",
  "40x40x40-2-2-blue-optimized.glb",
  "40x40x40-2-3-blue-optimized.glb",
  "40x40x40-2-4-blue-optimized.glb",
  "40x40x40-2-5-blue-optimized.glb",
  "40x40x40-2-6-blue-optimized.glb",
  "40x40x40-2-7-blue-optimized.glb",
])

export function buildGlbFilename(args: { width: WidthKey; variantCode: string; color: ColorKey }): string {
  const { width, variantCode, color } = args
  return `${width}x40x40-${variantCode}-${color}-optimized.glb`
}

export function buildFolderPath(color: ColorKey, width: WidthKey): string {
  return `${color}${width}`
}

export function resolveGlbUrl(args: {
  width: WidthKey
  height: HeightKey
  moduleType: ModuleType
  color: ColorKey
}): { url: string; filename: string; variantCode: string } {
  const { width, moduleType, color } = args

  if (width !== 40 && width !== 80) {
    throw new Error(`[GLB Registry] Invalid width: ${width}. Must be 40 or 80.`)
  }

  if (!COLOR_KEYS.includes(color)) {
    throw new Error(`[GLB Registry] Invalid color: "${color}". Valid colors: ${COLOR_KEYS.join(", ")}`)
  }

  const variantCode = MODULE_TO_VARIANT_CODE[width]?.[moduleType]

  if (!variantCode) {
    throw new Error(
      `[GLB Registry] No variant code mapping for width=${width}, moduleType="${moduleType}". Available module types for width ${width}: ${Object.keys(MODULE_TO_VARIANT_CODE[width] || {}).join(", ")}`,
    )
  }

  const filename = buildGlbFilename({ width, variantCode, color })

  let url: string

  // Priority 1: Direct URL mapping
  if (DIRECT_URL_MAP[filename]) {
    url = DIRECT_URL_MAP[filename]
  }
  // Priority 2: Root level files
  else if (ROOT_LEVEL_FILES.has(filename)) {
    url = `${GLB_BASE_URL}/${filename}`
  }
  // Priority 3: Fallback to WHITE
  else {
    const whiteFilename = buildGlbFilename({ width, variantCode, color: "white" })
    if (DIRECT_URL_MAP[whiteFilename]) {
      console.warn(`[GLB Registry] Color "${color}" not available for ${filename}, falling back to white`)
      url = DIRECT_URL_MAP[whiteFilename]
    } else {
      // Priority 4: Try folder structure
      const folder = buildFolderPath(color, width)
      url = `${GLB_BASE_URL}/${folder}/${filename}`
    }
  }

  if (!url.startsWith("https://")) {
    throw new Error(`[GLB Registry] URL must start with https://. Got: ${url}`)
  }

  return { url, filename, variantCode }
}
