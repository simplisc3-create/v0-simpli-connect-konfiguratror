import type { Config, RuleMessage } from "./bom-types"
import { normalizeConfig } from "./config-utils"
import { derive } from "./derive"

export function validateConfig(configRaw: Config): RuleMessage[] {
  const cfg = normalizeConfig(configRaw)
  const d = derive(cfg)

  const msgs: RuleMessage[] = []

  // Basisvalidierung
  if (cfg.sections < 1) {
    msgs.push({ code: "SECTIONS_MIN", severity: "error", message: "Mindestens 1 Sektion erforderlich." })
  }
  if (cfg.levels < 1) {
    msgs.push({ code: "LEVELS_MIN", severity: "error", message: "Mindestens 1 Ebene erforderlich." })
  }

  // Panels paarweise
  if (d.totalPanels > 0 && d.totalPanels % 2 !== 0) {
    msgs.push({
      code: "PANELS_PACKING",
      severity: "info",
      message: `Flächen werden paarweise geliefert. Benötigt: ${d.totalPanels} → geliefert: ${d.panelPacks * 2}.`,
    })
  }

  // Finish-Logik: satin nur sinnvoll bei Glas
  if (cfg.finish === "satin" && cfg.material !== "glass") {
    msgs.push({
      code: "FINISH_SATIN_GLASS_ONLY",
      severity: "warning",
      message: "Satiniert ist nur für Glasflächen sinnvoll. Bitte Material Glas wählen oder Finish ändern.",
    })
  }

  // Frontmodule <= Fächer
  const m = cfg.modules ?? {}
  const frontsTotal =
    (m.doors40 ?? 0) + (m.lockableDoors40 ?? 0) + (m.flapDoors ?? 0) + (m.doubleDrawers80 ?? 0) + (m.jalousie80 ?? 0)

  if (frontsTotal > d.compartments) {
    msgs.push({
      code: "FRONTS_TOO_MANY",
      severity: "error",
      message: `Zu viele Frontmodule. Maximal ${d.compartments} (Sektionen ${cfg.sections} × Ebenen ${cfg.levels}).`,
    })
  }

  // Türen 40 typischerweise paarweise
  if ((m.doors40 ?? 0) % 2 !== 0) {
    msgs.push({
      code: "DOORS40_ODD",
      severity: "warning",
      message: "Türmodule 40 cm werden üblicherweise paarweise eingesetzt (gerade Stückzahl empfohlen).",
    })
  }

  // Glas-Zubehör Hinweise (info)
  if (cfg.material === "glass") {
    msgs.push({
      code: "GLASS_ACCESSORIES",
      severity: "info",
      message: `Glasflächen: Eckschutz wird automatisch ergänzt (${d.cornerProtectorsQty} Stück).`,
    })
    if (cfg.width === 75) {
      msgs.push({
        code: "GLASS_STAB_80",
        severity: "info",
        message: `Bei Breite 75/80 wird pro Fach+Ebene ein Stabilisierungstab ergänzt (${d.stabilizerRodQty} Stück).`,
      })
    }
  }

  return msgs
}
