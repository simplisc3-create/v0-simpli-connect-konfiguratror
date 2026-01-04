;```tsx file="lib/use-configurator.ts"
"use client";

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback } from "react"

import { useCallback, useMemo, useState } from "react";
import type { Config, RuleMessage, BomLine, Derived } from "./rules-types"; // passe Pfad an
import {
  normalizeConfig,
  derive,
  validateConfig,
  generateBOM,
  mapWidthToERP,
} from "./rules-engine"; // passe Pfad an

export type StepId = "size" | "structure" | "material" | "panels" | "modules" | "summary";

export type UseConfiguratorOptions = {
  initialConfig: Config;
};

export type UseConfiguratorReturn = {
  // State
  config: Config;
  step: StepId;

  // Derived
  derived: Derived;
  bom: BomLine[];
  messages: RuleMessage[];
  hasErrors: boolean;

  // Step controls
  setStep: (s: StepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;

  // Config mutators (typed helpers)
  setSize: (patch: Partial<Pick<Config, "width" | "height">>) => void;
  setStructure: (patch: Partial<Pick<Config, "sections" | "levels">>) => void;
  setMaterial: (patch: Partial<Pick<Config, "material" | "finish">>) => void;
  setPanels: (patch: Partial<NonNullable<Config["panels"]>>) => void;
  setModules: (patch: Partial<NonNullable<Config["modules"]>>) => void;

  // Exports
  exportCsv: () => string;
  exportErpJson: () => ErpPayload;

  // Utility
  reset: () => void;
};

export type ErpPayload = {
  meta: {
    version: string;
    createdAt: string; // ISO
    source: "simpli-configurator";
  };
  configuration: {
    widthUI: 38 | 75;
    widthERP: 40 | 80;
    height: Config["height"];
    sections: number;
    levels: number;
    material: Config["material"];
    finish: Config["finish"];
    panels: Required<NonNullable<Config["panels"]>>;
    modules: Required<NonNullable<Config["modules"]>>;
  };
  derived: Derived;
  bom: Array<{
    sku: string;
    name: string;
    qty: number;
    unit: string;
    category: string;
    note?: string;
  }>;
  validation: RuleMessage[];
};

const STEPS: StepId[] = ["size", "structure", "material", "panels", "modules", "summary"];

function stepIndex(step: StepId) {
  return STEPS.indexOf(step);
}

export function useConfigurator(opts: UseConfiguratorOptions): UseConfiguratorReturn {
  const initial = useMemo(() => normalizeConfig(opts.initialConfig), [opts.initialConfig]);

  const [config, setConfig] = useState<Config>(initial);
  const [step, setStep] = useState<StepId>("size");

  const derived = useMemo(() => derive(config), [config]);
  const messages = useMemo(() => validateConfig(config), [config]);
  const hasErrors = useMemo(() => messages.some(m => m.severity === "error"), [messages]);
  const bom = useMemo(() => generateBOM(config), [config]);

  // Step navigation rules:
  // - allow Next if no errors OR if you want soft-block: block only on summary.
  // here: block Next only when there are errors AND user is beyond the step where error belongs.
  // simple: block Next whenever there are errors (strict mode)
  const canGoNext = !hasErrors;

  const nextStep = useCallback(() => {
    const i = stepIndex(step);
    if (i < STEPS.length - 1 && canGoNext) setStep(STEPS[i + 1]);
  }, [step, canGoNext]);

  const prevStep = useCallback(() => {
    const i = stepIndex(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }, [step]);

  const setSize = useCallback((patch: Partial<Pick<Config, "width" | "height">>) => {
    setConfig(prev => normalizeConfig({ ...prev, ...patch }));
  }, []);

  const setStructure = useCallback((patch: Partial<Pick<Config, "sections" | "levels">>) => {
    setConfig(prev => normalizeConfig({ ...prev, ...patch }));
  }, []);

  const setMaterial = useCallback((patch: Partial<Pick<Config, "material" | "finish">>) => {
    setConfig(prev => normalizeConfig({ ...prev, ...patch }));
  }, []);

  const setPanels = useCallback((patch: Partial<NonNullable<Config["panels"]>>) => {
    setConfig(prev => normalizeConfig({ ...prev, panels: { ...(prev.panels ?? {}), ...patch } }));
  }, []);

  const setModules = useCallback((patch: Partial<NonNullable<Config["modules"]>>) => {
    setConfig(prev => normalizeConfig({ ...prev, modules: { ...(prev.modules ?? {}), ...patch } }));
  }, []);

  const reset = useCallback(() => {
    setConfig(initial);
    setStep("size");
  }, [initial]);

  // CSV export (BOM)
  const exportCsv = useCallback(() => {
    const header = ["SKU", "Name", "Quantity", "Unit", "Category", "Note"];
    const rows = bom.map(l => [
      l.sku,
      l.name,
      String(l.qty),
      l.unit,
      l.category,
      l.note ?? "",
    ]);

    // CSV safe escaping
    const esc = (v: string) => \`"${v.replace(/"/g, '""')}"`
return [header, ...rows].map(r => r.map(x => esc(x)).join(",")).join("\n");
\
  }, [bom])

// ERP JSON payload
const exportErpJson = useCallback((): ErpPayload => {
  const panels = {
    shelves: derived.shelvesAuto,
    sideWalls: config.panels?.sideWalls ?? 0,
    backWalls: config.panels?.backWalls ?? 0,
  }

  const modules = {
    doors40: config.modules?.doors40 ?? 0,
    lockableDoors40: config.modules?.lockableDoors40 ?? 0,
    flapDoors: config.modules?.flapDoors ?? 0,
    doubleDrawers80: config.modules?.doubleDrawers80 ?? 0,
    jalousie80: config.modules?.jalousie80 ?? 0,
    functionalWall1: config.modules?.functionalWall1 ?? 0,
    functionalWall2: config.modules?.functionalWall2 ?? 0,
  }

  return {
    meta: {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      source: "simpli-configurator",
    },
    configuration: {
      widthUI: config.width,
      widthERP: mapWidthToERP(config.width),
      height: config.height,
      sections: config.sections,
      levels: config.levels,
      material: config.material,
      finish: config.finish,
      panels,
      modules,
    },
    derived,
    bom: bom.map((b) => ({
      sku: b.sku,
      name: b.name,
      qty: b.qty,
      unit: b.unit,
      category: b.category,
      note: b.note,
    })),
    validation: messages,
  }
}, [bom, config, derived, messages])

return {
    config,
    step,

    derived,
    bom,
    messages,
    hasErrors,

    setStep,
    nextStep,
    prevStep,
    canGoNext,

    setSize,
    setStructure,
    setMaterial,
    setPanels,
    setModules,

    exportCsv,
    exportErpJson,

    reset,
  };
\
}
