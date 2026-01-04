import type { ErpPayload } from "./use-configurator"

export function validatePayloadMinimal(payload: ErpPayload): string[] {
  const errors: string[] = []

  if (!payload.configuration) {
    errors.push("Missing configuration")
    return errors
  }

  const { configuration } = payload

  // Required fields
  if (!configuration.widthUI || ![38, 75].includes(configuration.widthUI)) {
    errors.push("Invalid widthUI: must be 38 or 75")
  }

  if (!configuration.height || ![40, 80, 120, 160, 200].includes(configuration.height)) {
    errors.push("Invalid height: must be 40, 80, 120, 160, or 200")
  }

  if (!configuration.sections || configuration.sections < 1) {
    errors.push("Invalid sections: must be >= 1")
  }

  if (!configuration.levels || configuration.levels < 1) {
    errors.push("Invalid levels: must be >= 1")
  }

  if (!configuration.material || !["metal", "glass"].includes(configuration.material)) {
    errors.push("Invalid material: must be 'metal' or 'glass'")
  }

  if (!configuration.finish) {
    errors.push("Missing finish")
  }

  if (!payload.bom || payload.bom.length === 0) {
    errors.push("BOM is empty")
  }

  return errors
}
