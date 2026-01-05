// src/lib/glb/registry.ts
export const GLB_BASE_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com"

export type WidthKey = 40 | 80
export type HeightKey = number

export type ColorKey = "white" | "gray" | "black" | "blue" | "green" | "yellow" | "orange" | "red"

// Globaler Union-Type (weil 40er mehr Module hat)
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
  // shared / 80-family
  "ohne-seitenwaende",
  "ohne-rueckwand",
  "mit-rueckwand",
  "mit-seitenwaenden",
  "mit-tueren",
  "mit-klapptuer",
  "mit-doppelschublade",
  "abschliessbare-tueren",
  // 40-family extras
  "mit-tuere-links",
  "mit-tuere-rechts",
  "abschliessbar-links",
  "abschliessbar-rechts",
]

export const COLOR_KEYS: ColorKey[] = ["white", "gray", "black", "blue", "green", "yellow", "orange", "red"]

// ✅ DEINE MAPPINGS (editierbar in EINER Stelle)
export const MODULE_TO_VARIANT_CODE: Record<WidthKey, Partial<Record<ModuleType, string>>> = {
  80: {
    "ohne-rueckwand": "1-1",
    "ohne-seitenwaende": "1-1", // Fixed: was 1-2, should be 1-1
    "mit-seitenwaenden": "1-3",
    "mit-klapptuer": "1-4",
    "mit-doppelschublade": "1-5",
    "mit-tueren": "1-6",
    "abschliessbare-tueren": "1-7",
    "mit-rueckwand": "1-8",
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

export const SPECIAL_FRAME_URLS: Record<string, string> = {
  "frame-80": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/white80/80x40x40-1-1-white_optimized.glb",
}

export function buildGlbFilename(args: {
  width: WidthKey
  height: HeightKey
  variantCode: string
  color: ColorKey
}) {
  const { width, height, variantCode, color } = args
  // depth ist fix 40
  return `${width}x40x${height}-${variantCode}-${color}_optimized.glb`
}

export function resolveGlbUrl(args: {
  width: WidthKey
  height: HeightKey
  moduleType: ModuleType
  color: ColorKey
}) {
  const { width, height, moduleType, color } = args

  if (moduleType === "ohne-seitenwaende" && width === 80) {
    const filename = `80x40x${height}-1-1-${color}_optimized.glb`
    const url = `${GLB_BASE_URL}/${color}80/${filename}`
    return {
      url,
      filename,
      variantCode: "1-1",
    }
  }

  const variantCode = MODULE_TO_VARIANT_CODE[width]?.[moduleType]

  if (!variantCode) {
    throw new Error(
      `No variantCode mapping for width=${width} moduleType="${moduleType}". Check MODULE_TO_VARIANT_CODE.`,
    )
  }

  const filename = buildGlbFilename({ width, height, variantCode, color })
  const url = `${GLB_BASE_URL}/${filename}`
  return { url, filename, variantCode }
}
