// GLB model URLs from Vercel Blob storage
// These are the original uploaded files

export const GLB_BLOB_URLS = {
  // Drawer model (code 5) - gray base, will be color-adjusted
  drawer: "/images/80x40x40-1-5-gray-opt-20-282-29.glb",

  // Door model (code 6) - green base, will be color-adjusted
  door: "/images/80x40x40-1-6-green-opt-20-281-29.glb",
}

// Color hex values for special colors
export const SPECIAL_COLOR_HEX: Record<string, string> = {
  weiss: "#ffffff",
  schwarz: "#333333",
  blau: "#2563eb",
  gruen: "#16a34a",
  orange: "#ea580c",
  rot: "#dc2626",
  gelb: "#eab308",
  grau: "#6b7280",
}

// Map German color names to file codes
export const COLOR_TO_FILE_CODE: Record<string, string> = {
  weiss: "white",
  schwarz: "gray",
  blau: "blue",
  gruen: "green",
  orange: "orange",
  rot: "red",
  gelb: "yellow",
  grau: "gray",
}
