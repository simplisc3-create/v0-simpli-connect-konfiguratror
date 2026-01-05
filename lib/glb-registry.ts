// src/lib/glb/registry.ts
export const GLB_BASE_URL = "/images"

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
    "ohne-seitenwaende": "1-1", // Open frame
    "ohne-rueckwand": "1-2", // Without back panel
    "mit-seitenwaenden": "1-3", // With side panels
    "mit-klapptuer": "1-4", // With flap door
    "mit-doppelschublade": "1-5", // With double drawer
    "mit-tueren": "1-6", // With doors
    "abschliessbare-tueren": "1-7", // Lockable doors
    "mit-rueckwand": "1-8", // With back panel
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

export const UPLOADED_MODELS: Record<string, string> = {
  // White 80cm modules - using hebbkx1anhila5yf storage
  "80x40x40-1-2-white_optimized.glb": "/images/80x40x40-1-2-white-optimized.glb",
  "80x40x40-1-7-white_optimized.glb": "/images/80x40x40-1-7-white-optimized.glb",

  // Using xo2a99j1qyph0ija storage for remaining variants
  "80x40x40-1-1-white_optimized.glb":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/white80/80x40x40-1-1-white_optimized.glb",
  "80x40x40-1-3-white_optimized.glb":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/white80/80x40x40-1-3-white_optimized.glb",
  "80x40x40-1-4-white_optimized.glb":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/white80/80x40x40-1-4-white_optimized.glb",
  "80x40x40-1-5-white_optimized.glb":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/white80/80x40x40-1-5-white_optimized.glb",
  "80x40x40-1-6-white_optimized.glb":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/white80/80x40x40-1-6-white_optimized.glb",
  "80x40x40-1-8-white_optimized.glb":
    "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/white80/80x40x40-1-8-white_optimized.glb",
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

  const variantCode = MODULE_TO_VARIANT_CODE[width]?.[moduleType]

  if (!variantCode) {
    console.warn(`No variantCode mapping for width=${width} moduleType="${moduleType}". Using fallback.`)
    return {
      url: "/images/80x40x40-1-7-white-optimized.glb",
      filename: "80x40x40-1-7-white_optimized.glb",
      variantCode: "1-7-fallback",
    }
  }

  const filename = buildGlbFilename({ width, height, variantCode, color })

  if (UPLOADED_MODELS[filename]) {
    return {
      url: UPLOADED_MODELS[filename],
      filename,
      variantCode,
    }
  }

  console.warn(`No uploaded model found for ${filename}, using fallback`)
  return {
    url: "/images/80x40x40-1-7-white-optimized.glb",
    filename: "80x40x40-1-7-white_optimized.glb",
    variantCode: "1-7-fallback",
  }
}
