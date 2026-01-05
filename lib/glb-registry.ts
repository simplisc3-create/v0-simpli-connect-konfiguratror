// src/lib/glb/registry.ts
// SINGLE SOURCE OF TRUTH for GLB model resolution
// Uses direct URL mappings for uploaded files with hash suffixes

export type WidthKey = 40 | 80
export type HeightKey = number

export type ColorKey = "white" | "gray" | "black" | "blue" | "green" | "yellow" | "orange" | "red"

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

export const COLOR_KEYS: ColorKey[] = ["white", "gray", "black", "blue", "green", "yellow", "orange", "red"]

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

// Key format: "{width}x40x{height}-{variantCode}-{color}"
const UPLOADED_MODEL_URLS: Record<string, string> = {
  // White 80cm models (height 40) - REAL Blob Storage URLs with hash suffixes
  "80x40x40-1-1-white": "/images/80x40x40-1-1-white-optimized.glb",
  "80x40x40-1-2-white": "/images/ohne-seitenwaendeweiss80.glb",
  "80x40x40-1-3-white": "/images/80x40x40-1-3-white-optimized.glb",
  "80x40x40-1-4-white": "/images/80x40x40-1-4-white-optimized.glb",
  "80x40x40-1-5-white": "/images/80x40x40-1-5-white-optimized.glb",
  "80x40x40-1-6-white": "/images/80x40x40-1-6-white-optimized.glb",
  "80x40x40-1-7-white": "/images/80x40x40-1-7-white-optimized.glb",
  "80x40x40-1-8-white": "/images/80x40x40-1-8-white-optimized.glb",
}

export function buildModelKey(args: {
  width: WidthKey
  height: HeightKey
  variantCode: string
  color: ColorKey
}): string {
  const { width, height, variantCode, color } = args
  return `${width}x40x${height}-${variantCode}-${color}`
}

export function resolveGlbUrl(args: {
  width: WidthKey
  height: HeightKey
  moduleType: ModuleType
  color: ColorKey
}): { url: string; filename: string; variantCode: string } {
  const { width, height, moduleType, color } = args

  // Validate width
  if (width !== 40 && width !== 80) {
    throw new Error(`[GLB Registry] Invalid width: ${width}. Must be 40 or 80.`)
  }

  // Validate color
  if (!COLOR_KEYS.includes(color)) {
    throw new Error(`[GLB Registry] Invalid color: "${color}". Valid colors: ${COLOR_KEYS.join(", ")}`)
  }

  // Get variant code from mapping
  const variantCode = MODULE_TO_VARIANT_CODE[width]?.[moduleType]

  if (!variantCode) {
    throw new Error(
      `[GLB Registry] No variant code mapping for width=${width}, moduleType="${moduleType}". ` +
        `Available module types for width ${width}: ${Object.keys(MODULE_TO_VARIANT_CODE[width] || {}).join(", ")}`,
    )
  }

  // Build key for lookup
  const modelKey = buildModelKey({ width, height, variantCode, color })

  // Look up URL in uploaded models
  const url = UPLOADED_MODEL_URLS[modelKey]

  if (!url) {
    throw new Error(
      `[GLB Registry] No uploaded model URL for key="${modelKey}". ` +
        `Available models: ${Object.keys(UPLOADED_MODEL_URLS).join(", ")}`,
    )
  }

  if (!url.startsWith("https://")) {
    throw new Error(`[GLB Registry] CRITICAL: URL must be a full Blob URL starting with https://. Got: ${url}`)
  }

  // Extract filename from URL for logging
  const filename = url.split("/").pop() || modelKey

  return {
    url,
    filename,
    variantCode,
  }
}
