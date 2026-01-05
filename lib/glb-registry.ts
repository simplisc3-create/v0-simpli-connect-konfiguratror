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
  | "ohne-seitenwaende"
  | "ohne-rueckwand"
  | "mit-rueckwand"
  | "mit-seitenwaenden"
  | "mit-tueren"
  | "mit-klapptuer"
  | "mit-doppelschublade"
  | "abschliessbare-tueren"
  | "mit-tuere-links"
  | "mit-tuere-rechts"
  | "abschliessbar-links"
  | "abschliessbar-rechts"

export const MODULE_TYPES: ModuleType[] = [
  "ohne-seitenwaende",
  "ohne-rueckwand",
  "mit-rueckwand",
  "mit-seitenwaenden",
  "mit-tueren",
  "mit-klapptuer",
  "mit-doppelschublade",
  "abschliessbare-tueren",
  "mit-tuere-links",
  "mit-tuere-rechts",
  "abschliessbar-links",
  "abschliessbar-rechts",
]

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

export const MODULE_TO_VARIANT_CODE: Record<WidthKey, Partial<Record<ModuleType, string>>> = {
  80: {
    "mit-seitenwaenden": "1-8",
    "abschliessbare-tueren": "1-7",
    "mit-tueren": "1-6",
    "mit-doppelschublade": "1-5",
    "mit-klapptuer": "1-4",
    "mit-rueckwand": "1-3",
    "ohne-seitenwaende": "1-2",
    "ohne-rueckwand": "1-1",
  },
  40: {
    "ohne-rueckwand": "2-1",
    "mit-rueckwand": "2-2",
    "mit-seitenwaenden": "2-3",
    "mit-tuere-rechts": "2-4",
    "mit-tuere-links": "2-5",
    "abschliessbar-links": "2-6",
    "abschliessbar-rechts": "2-7",
  },
}

const GLB_BASE_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com"

// Format: "{width}x40x40-{variantCode}-{color}_optimized.glb" -> full URL
const DIRECT_URL_MAP: Record<string, string> = {
  // Orange 80cm - ohne Rückwand (variant 1-1) - shadow-free version
  "80x40x40-1-1-orange_optimized.glb": "/images/ohne-rueckwand-orange80.glb",
  // Orange 80cm - other variants (using Orns files)
  "80x40x40-1-2-orange_optimized.glb": "/images/80x40x40-1-2-orns.glb",
  "80x40x40-1-3-orange_optimized.glb": "/images/80x40x40-1-3-orns.glb",
  "80x40x40-1-4-orange_optimized.glb": "/images/80x40x40-1-4-orns.glb",
  "80x40x40-1-5-orange_optimized.glb": "/images/80x40x40-1-5-orns.glb",
  "80x40x40-1-6-orange_optimized.glb": "/images/80x40x40-1-6-orns.glb",
  "80x40x40-1-7-orange_optimized.glb": "/images/80x40x40-1-7-orns.glb",
  "80x40x40-1-8-orange_optimized.glb": "/images/80x40x40-1-8-orns.glb",
}

const ROOT_LEVEL_FILES: Set<string> = new Set([
  // Blue 40cm modules - stored at root, not in blue40/ folder
  "40x40x40-2-1-blue_optimized.glb",
  "40x40x40-2-2-blue_optimized.glb",
  "40x40x40-2-3-blue_optimized.glb",
  "40x40x40-2-4-blue_optimized.glb",
  "40x40x40-2-5-blue_optimized.glb",
  "40x40x40-2-6-blue_optimized.glb",
  "40x40x40-2-7-blue_optimized.glb",
])

/**
 * HOW TO ADD NEW GLB FILES / COLORS:
 *
 * Option 1 - Files stored in folders (standard):
 * Upload files to Vercel Blob Storage in this folder structure:
 * - {color}{width}/{width}x40x40-{variantCode}-{color}_optimized.glb
 * Example: white80/80x40x40-1-1-white_optimized.glb
 *         red80/80x40x40-1-1-red_optimized.glb
 *
 * Option 2 - Files stored at root level:
 * Upload files to root and add filename to ROOT_LEVEL_FILES set below
 * Example: "80x40x40-1-1-anthrazit_optimized.glb"
 *
 * Available variant codes:
 * 80cm width: 1-1 to 1-8 (ohne-rueckwand to mit-seitenwaenden)
 * 40cm width: 2-1 to 2-7 (ohne-rueckwand to abschliessbar-rechts)
 */

export function buildGlbFilename(args: { width: WidthKey; variantCode: string; color: ColorKey }): string {
  const { width, variantCode, color } = args
  return `${width}x40x40-${variantCode}-${color}_optimized.glb`
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

  if (DIRECT_URL_MAP[filename]) {
    url = DIRECT_URL_MAP[filename]
  } else if (ROOT_LEVEL_FILES.has(filename)) {
    // Files stored at root level (no folder)
    url = `${GLB_BASE_URL}/${filename}`
  } else {
    // Standard folder structure: {color}{width}/{filename}
    const folder = buildFolderPath(color, width)
    url = `${GLB_BASE_URL}/${folder}/${filename}`
  }

  if (url.startsWith("/")) {
    throw new Error(`[GLB Registry] CRITICAL: URL must be absolute. Got: ${url}`)
  }

  if (!url.startsWith("https://")) {
    throw new Error(`[GLB Registry] CRITICAL: URL must start with https://. Got: ${url}`)
  }

  return { url, filename, variantCode }
}
