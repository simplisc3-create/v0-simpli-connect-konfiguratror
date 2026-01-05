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

// Track logged warnings to only log once per missing combination
const loggedWarnings = new Set<string>()

export const LEGACY_URLS: Record<string, string> = {
  // Known working URLs - frame80 works for ohne-seitenwaende
  frame80: `${GLB_BASE_URL}/frame80.glb`,
  "ohne-rueckwand-orange-80": `${GLB_BASE_URL}/ohne-rueckwand-orange80.glb?v=${Date.now()}`,
}

// Only these combinations are verified to exist
const VERIFIED_NEW_URLS: Set<string> = new Set([
  // Add verified URLs here as they become available
  // Format: "color-size-moduleType"
  "orange-80-ohne-rueckwand",
])

const verifiedUrls = new Set<string>()
const failedUrls = new Set<string>()

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
  return `glbgrande/${color}${family}`
}

const FALLBACK_MODULE = "ohne-seitenwaende" // Declare the FALLBACK_MODULE variable

/**
 * Main resolver function for GLB URLs
 * Returns the correct GLB URL based on size, moduleType, and color
 */
export function resolveGlbUrl(args: {
  size?: SizeKey
  width?: WidthKey
  height?: HeightKey
  moduleType: ModuleType
  color: ColorKey
}): { url: string; filename: string; code?: string; variantCode?: string; isLegacy?: boolean } {
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
  const family = size === "40x40x40" ? "40" : "80"

  const legacyKey = `${moduleType}-${color}-${family}`
  if (LEGACY_URLS[legacyKey]) {
    return {
      url: LEGACY_URLS[legacyKey],
      filename: `${moduleType}-${color}${family}.glb`,
      code: "legacy",
      variantCode: "legacy",
      isLegacy: true,
    }
  }

  // This is the most common case and we know frame80.glb exists
  if (moduleType === "ohne-seitenwaende" && size === "80x40x40") {
    return {
      url: LEGACY_URLS["frame80"],
      filename: `frame80.glb`,
      code: "2",
      variantCode: "2",
      isLegacy: true,
    }
  }

  const verifyKey = `${color}-${family}-${moduleType}`
  const useNewUrl = VERIFIED_NEW_URLS.has(verifyKey)

  // Get the code for this module type and size
  let code = MODULE_TO_CODE[size]?.[moduleType]

  // Fallback handling if module type not found
  if (!code) {
    const warningKey = `${size}-${moduleType}-${color}`
    if (!loggedWarnings.has(warningKey)) {
      console.warn(
        `[GLB Registry] No code mapping for size=${size} moduleType="${moduleType}". Falling back to "${FALLBACK_MODULE}".`,
      )
      loggedWarnings.add(warningKey)
    }
    code = MODULE_TO_CODE[size]?.[FALLBACK_MODULE] || "1"
  }

  if (!useNewUrl) {
    // For ohne-rueckwand with orange, use the known working URL
    if (moduleType === "ohne-rueckwand" && color === "orange" && size === "80x40x40") {
      return {
        url: LEGACY_URLS["ohne-rueckwand-orange-80"],
        filename: `ohne-rueckwand-orange80.glb`,
        code: "1",
        variantCode: "1",
        isLegacy: true,
      }
    }

    // For other cases, fallback to frame80 for 80cm modules
    if (size === "80x40x40") {
      return {
        url: LEGACY_URLS["frame80"],
        filename: `frame80.glb`,
        code: code,
        variantCode: code,
        isLegacy: true,
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
    isLegacy: false,
  }
}

// Legacy export for backward compatibility
export const MODULE_TO_VARIANT_CODE = MODULE_TO_CODE
