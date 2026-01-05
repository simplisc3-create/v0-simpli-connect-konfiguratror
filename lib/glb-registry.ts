// src/lib/glb/registry.ts
export const GLB_BASE_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com"

export type SizeKey = "40x40x40" | "80x40x40"
export type WidthKey = 40 | 80
export type HeightKey = number

export type ColorKey = "white" | "gray" | "black" | "blue" | "green" | "yellow" | "orange" | "red"

// Global union type for all module types
export type ModuleType =
  | "ohne-seitenwaende"
  | "ohne-rueckwand"
  | "mit-rueckwand"
  | "mit-seitenwaenden"
  | "mit-tueren"
  | "mit-klapptuer"
  | "mit-doppelschublade"
  | "abschliessbare-tueren"
  | "abschliessbar"
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
  "abschliessbar",
  "mit-tuere-links",
  "mit-tuere-rechts",
  "abschliessbar-links",
  "abschliessbar-rechts",
]

export const COLOR_KEYS: ColorKey[] = ["white", "gray", "black", "blue", "green", "yellow", "orange", "red"]

// 80x40x40: "80x40x40-1-{code}-{color}_optimized.glb"
// 40x40x40: "40x40x40-2-{code}-{color}_optimized.glb"
export const MODULE_TO_CODE: Record<SizeKey, Partial<Record<ModuleType, string>>> = {
  "80x40x40": {
    "ohne-rueckwand": "1",
    "ohne-seitenwaende": "2",
    "mit-seitenwaenden": "3",
    "mit-klapptuer": "4",
    "mit-doppelschublade": "5",
    "mit-tueren": "6",
    "abschliessbare-tueren": "7",
    abschliessbar: "7",
    "mit-rueckwand": "8",
  },
  "40x40x40": {
    "ohne-rueckwand": "1",
    "mit-rueckwand": "2",
    "mit-seitenwaenden": "3",
    "mit-tuere-rechts": "4",
    "mit-tuere-links": "5",
    "abschliessbar-links": "6",
    "abschliessbar-rechts": "7",
  },
}

// These are known working URLs that bypass the folder structure
export const DIRECT_URL_MAPPINGS: Record<string, string> = {
  // Orange 80cm modules
  "80x40x40-ohne-rueckwand-orange": `${GLB_BASE_URL}/ohne-rueckwand-orange80.glb?v=${Date.now()}`,

  // Frame80 (ohne-seitenwaende) - legacy URL
  "80x40x40-ohne-seitenwaende-white": `${GLB_BASE_URL}/frame80.glb`,
  "80x40x40-ohne-seitenwaende-black": `${GLB_BASE_URL}/frame80.glb`,
  "80x40x40-ohne-seitenwaende-gray": `${GLB_BASE_URL}/frame80.glb`,
  "80x40x40-ohne-seitenwaende-blue": `${GLB_BASE_URL}/frame80.glb`,
  "80x40x40-ohne-seitenwaende-green": `${GLB_BASE_URL}/frame80.glb`,
  "80x40x40-ohne-seitenwaende-yellow": `${GLB_BASE_URL}/frame80.glb`,
  "80x40x40-ohne-seitenwaende-orange": `${GLB_BASE_URL}/frame80.glb`,
  "80x40x40-ohne-seitenwaende-red": `${GLB_BASE_URL}/frame80.glb`,
}

// Fallback module type if requested module is not available
const FALLBACK_MODULE: ModuleType = "ohne-seitenwaende"

// Track logged warnings to only log once per missing combination
const loggedWarnings = new Set<string>()

/**
 * Builds the GLB filename based on the new naming convention
 * 80x40x40: "80x40x40-1-{code}-{color}_optimized.glb"
 * 40x40x40: "40x40x40-2-{code}-{color}_optimized.glb"
 */
export function buildGlbFilename(args: {
  size: SizeKey
  code: string
  color: ColorKey
}): string {
  const { size, code, color } = args
  const prefix = size === "40x40x40" ? "2" : "1"
  return `${size}-${prefix}-${code}-${color}_optimized.glb`
}

/**
 * Builds the folder path based on color and size family
 * folder = `${color}${family}` where family = "40" or "80"
 */
export function buildFolderPath(args: {
  size: SizeKey
  color: ColorKey
}): string {
  const { size, color } = args
  const family = size === "40x40x40" ? "40" : "80"
  return `${color}${family}`
}

/**
 * Main resolver function for GLB URLs
 * Returns the correct GLB URL based on size, moduleType, and color
 */
export function resolveGlbUrl(args: {
  size: SizeKey
  moduleType: ModuleType
  color: ColorKey
}): { url: string; filename: string; code: string; isDirect?: boolean }

export function resolveGlbUrl(args: {
  width: WidthKey
  height: HeightKey
  moduleType: ModuleType
  color: ColorKey
}): { url: string; filename: string; variantCode: string; isDirect?: boolean }

export function resolveGlbUrl(args: {
  size?: SizeKey
  width?: WidthKey
  height?: HeightKey
  moduleType: ModuleType
  color: ColorKey
}): { url: string; filename: string; code?: string; variantCode?: string; isDirect?: boolean } {
  // Determine size from width if not provided directly
  let size: SizeKey
  if (args.size) {
    size = args.size
  } else if (args.width) {
    size = args.width >= 80 ? "80x40x40" : "40x40x40"
  } else {
    size = "80x40x40" // default
  }

  const { moduleType, color } = args

  const directKey = `${size}-${moduleType}-${color}`
  if (DIRECT_URL_MAPPINGS[directKey]) {
    const directUrl = DIRECT_URL_MAPPINGS[directKey]
    const filename = directUrl.split("/").pop()?.split("?")[0] || "direct.glb"
    console.log(`[v0] Using direct URL mapping for ${directKey}`)
    return {
      url: directUrl,
      filename,
      code: MODULE_TO_CODE[size]?.[moduleType] || "1",
      variantCode: MODULE_TO_CODE[size]?.[moduleType] || "1",
      isDirect: true,
    }
  }

  // Get the code for this module type and size
  let code = MODULE_TO_CODE[size]?.[moduleType]
  let usedFallback = false

  // Fallback handling if module type not found
  if (!code) {
    const warningKey = `${size}-${moduleType}-${color}`
    if (!loggedWarnings.has(warningKey)) {
      console.warn(
        `[GLB Registry] No code mapping for size=${size} moduleType="${moduleType}". Falling back to "${FALLBACK_MODULE}".`,
      )
      loggedWarnings.add(warningKey)
    }
    code = MODULE_TO_CODE[size]?.[FALLBACK_MODULE] || "2"
    usedFallback = true
  }

  if (usedFallback) {
    const fallbackKey = `${size}-${FALLBACK_MODULE}-${color}`
    if (DIRECT_URL_MAPPINGS[fallbackKey]) {
      const directUrl = DIRECT_URL_MAPPINGS[fallbackKey]
      const filename = directUrl.split("/").pop()?.split("?")[0] || "fallback.glb"
      return {
        url: directUrl,
        filename,
        code,
        variantCode: code,
        isDirect: true,
      }
    }
  }

  const folder = buildFolderPath({ size, color })
  const filename = buildGlbFilename({ size, code, color })
  const url = `${GLB_BASE_URL}/${folder}/${filename}`

  return {
    url,
    filename,
    code,
    variantCode: code,
    isDirect: false,
  }
}

// Legacy export for backward compatibility
export const MODULE_TO_VARIANT_CODE = MODULE_TO_CODE
