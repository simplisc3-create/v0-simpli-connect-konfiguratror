"use client"

import { useState } from "react"
import type { ShelfConfig, GridCell, ColorKey } from "./shelf-configurator"
import { cn } from "@/lib/utils"
import { ShoppingCart, Palette, Box, List, X, Check } from "lucide-react"
import { colorHexMap } from "@/lib/simpli-products"
import { isModuleTypeAvailableForWidth } from "@/lib/glb-registry"
import { useCartStore } from "@/lib/cart-store"
import { motion, AnimatePresence } from "framer-motion"

type MobileTab = "modules" | "colors" | "cart" | null

type Props = {
  config: ShelfConfig
  selectedTool: GridCell["type"] | null
  selectedColor: ColorKey
  onSelectTool: (tool: GridCell["type"] | null) => void
  onSelectColor: (color: ColorKey) => void
  onUpdateConfig: (updates: Partial<ShelfConfig>) => void
  shoppingList: Array<{
    id: string
    name: string
    quantity: number
    pricePerUnit: number
    total: number
  }>
  price: number
}

const allColors = [
  { id: "weiss" as const, label: "Weiß", color: colorHexMap.weiss },
  { id: "schwarz" as const, label: "Schwarz", color: colorHexMap.schwarz },
  { id: "blau" as const, label: "Blau", color: colorHexMap.blau },
  { id: "gruen" as const, label: "Grün", color: colorHexMap.gruen },
  { id: "gelb" as const, label: "Gelb", color: colorHexMap.gelb },
  { id: "orange" as const, label: "Orange", color: colorHexMap.orange },
  { id: "rot" as const, label: "Rot", color: colorHexMap.rot },
]

const moduleTypes: Array<{ id: GridCell["type"]; label: string; icon: string }> = [
  { id: "offenes-fach", label: "Offen", icon: "□" },
  { id: "ohne-seitenwaende", label: "Ohne Seiten", icon: "⊏⊐" },
  { id: "ohne-rueckwand", label: "Ohne Rück", icon: "⊔" },
  { id: "mit-rueckwand", label: "Mit Rück", icon: "▣" },
  { id: "mit-tueren", label: "Türen", icon: "▤" },
  { id: "mit-klapptuer", label: "Klappe", icon: "▥" },
  { id: "mit-klapptuer-oben", label: "Klappe↑", icon: "▦" },
  { id: "mit-doppelschublade", label: "Schubladen", icon: "≡" },
  { id: "mit-einzelschublade", label: "Einzelschubl.", icon: "▭" },
  { id: "abschliessbare-tueren", label: "Abschließ", icon: "🔒" },
  { id: "mit-tuere-links", label: "Tür L", icon: "◧" },
  { id: "mit-tuere-rechts", label: "Tür R", icon: "◨" },
  { id: "abschliessbar-links", label: "Abschl. L", icon: "🔐" },
  { id: "abschliessbar-rechts", label: "Abschl. R", icon: "🔐" },
]

export function MobileConfiguratorNav({
  config,
  selectedTool,
  selectedColor,
  onSelectTool,
  onSelectColor,
  onUpdateConfig,
  shoppingList,
  price,
}: Props) {
  const [activeTab, setActiveTab] = useState<MobileTab>(null)
  const { addItem } = useCartStore()
  const [addedToCart, setAddedToCart] = useState(false)

  const usedWidths = Array.from(new Set(config.columnWidths))
  const allModulesAvailable = usedWidths.length === 0

  const handleAddToCart = () => {
    if (shoppingList.length === 0) return
    for (const item of shoppingList) {
      addItem(
        {
          id: item.id,
          name: item.name,
          artNr: item.id,
          price: item.pricePerUnit || 0,
        },
        item.quantity,
      )
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const toggleTab = (tab: MobileTab) => {
    setActiveTab(activeTab === tab ? null : tab)
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Sheet Content */}
        <AnimatePresence>
          {activeTab && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-16 left-0 right-0 max-h-[60vh] overflow-y-auto rounded-t-3xl bg-neutral-900 shadow-2xl"
            >
              {/* Handle */}
              <div className="sticky top-0 z-10 flex justify-center bg-neutral-900 pb-2 pt-3">
                <div className="h-1 w-12 rounded-full bg-neutral-600" />
              </div>

              {/* Modules Tab */}
              {activeTab === "modules" && (
                <div className="px-4 pb-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Modultyp wählen</h3>
                    <button
                      onClick={() => setActiveTab(null)}
                      className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {!allModulesAvailable && (
                    <p className="mb-4 rounded-lg bg-teal-900/30 px-3 py-2 text-xs text-teal-300">
                      {usedWidths.length === 1
                        ? `Module für ${usedWidths[0] === 75 ? "80" : "40"}cm verfügbar`
                        : "40cm und 80cm Module verfügbar"}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {moduleTypes.map((moduleType) => {
                      const isAvailable =
                        allModulesAvailable ||
                        usedWidths.some((width) => isModuleTypeAvailableForWidth(moduleType.id, width === 75 ? 80 : 40))

                      return (
                        <button
                          key={moduleType.id}
                          onClick={() => {
                            if (isAvailable) {
                              onSelectTool(selectedTool === moduleType.id ? null : moduleType.id)
                              setActiveTab(null)
                            }
                          }}
                          disabled={!isAvailable}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl p-3 transition-all",
                            !isAvailable && "opacity-30",
                            selectedTool === moduleType.id
                              ? "bg-teal-600 text-white ring-2 ring-teal-400"
                              : isAvailable
                                ? "bg-neutral-800 text-neutral-200 active:bg-neutral-700"
                                : "bg-neutral-800/50 text-neutral-500",
                          )}
                        >
                          <span className="text-xl">{moduleType.icon}</span>
                          <span className="text-[10px] font-medium leading-tight text-center">{moduleType.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === "colors" && (
                <div className="px-4 pb-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Farbe wählen</h3>
                    <button
                      onClick={() => setActiveTab(null)}
                      className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="mb-3 text-sm text-neutral-400">Standard</p>
                    <div className="flex gap-3">
                      {allColors.slice(0, 2).map((color) => (
                        <button
                          key={color.id}
                          onClick={() => {
                            onSelectColor(color.id)
                            setActiveTab(null)
                          }}
                          className={cn(
                            "relative h-14 w-14 rounded-xl transition-all",
                            selectedColor === color.id
                              ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-900"
                              : "ring-1 ring-neutral-700",
                          )}
                          style={{ backgroundColor: color.color }}
                        >
                          {selectedColor === color.id && (
                            <Check
                              className={cn(
                                "absolute inset-0 m-auto h-6 w-6",
                                color.id === "weiss" ? "text-neutral-800" : "text-white",
                              )}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm text-neutral-400">Sonderfarben</p>
                    <div className="flex flex-wrap gap-3">
                      {allColors.slice(2).map((color) => (
                        <button
                          key={color.id}
                          onClick={() => {
                            onSelectColor(color.id)
                            setActiveTab(null)
                          }}
                          className={cn(
                            "relative h-14 w-14 rounded-xl transition-all",
                            selectedColor === color.id
                              ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-900"
                              : "ring-1 ring-neutral-700",
                          )}
                          style={{ backgroundColor: color.color }}
                        >
                          {selectedColor === color.id && (
                            <Check className="absolute inset-0 m-auto h-6 w-6 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material Selection */}
                  <div className="mt-6">
                    <p className="mb-3 text-sm text-neutral-400">Bodenmaterial</p>
                    <div className="flex gap-2">
                      {["metall", "glas"].map((mat) => (
                        <button
                          key={mat}
                          onClick={() => onUpdateConfig({ shelfMaterial: mat as "metall" | "glas" })}
                          className={cn(
                            "flex-1 rounded-xl py-3 text-sm font-medium transition-all",
                            config.shelfMaterial === mat ? "bg-teal-600 text-white" : "bg-neutral-800 text-neutral-300",
                          )}
                        >
                          {mat === "metall" ? "Metall" : "Glas"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Tab */}
              {activeTab === "cart" && (
                <div className="px-4 pb-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Einkaufsliste ({shoppingList.length})</h3>
                    <button
                      onClick={() => setActiveTab(null)}
                      className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {shoppingList.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-neutral-600" />
                      <p className="text-neutral-400">Noch keine Module hinzugefügt</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shoppingList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl bg-neutral-800 px-3 py-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-neutral-400">
                              {item.quantity}x à {item.pricePerUnit.toFixed(2)} €
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-teal-400">{item.total.toFixed(2)} €</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/95 px-2 py-2 backdrop-blur-lg">
          {/* Tab Buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => toggleTab("modules")}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all",
                activeTab === "modules" ? "bg-teal-600 text-white" : "text-neutral-400 active:bg-neutral-800",
              )}
            >
              <Box className="h-5 w-5" />
              <span className="text-[10px]">Module</span>
            </button>

            <button
              onClick={() => toggleTab("colors")}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all",
                activeTab === "colors" ? "bg-teal-600 text-white" : "text-neutral-400 active:bg-neutral-800",
              )}
            >
              <Palette className="h-5 w-5" />
              <span className="text-[10px]">Farbe</span>
            </button>

            <button
              onClick={() => toggleTab("cart")}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all",
                activeTab === "cart" ? "bg-teal-600 text-white" : "text-neutral-400 active:bg-neutral-800",
              )}
            >
              <List className="h-5 w-5" />
              <span className="text-[10px]">Liste</span>
              {shoppingList.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-white">
                  {shoppingList.length}
                </span>
              )}
            </button>
          </div>

          {/* Price & Cart Button */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] text-neutral-400">Gesamt</p>
              <p className="text-lg font-bold text-white">{price.toFixed(2)} €</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={shoppingList.length === 0}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all",
                addedToCart
                  ? "bg-green-600 text-white"
                  : shoppingList.length === 0
                    ? "bg-neutral-700 text-neutral-500"
                    : "bg-teal-600 text-white active:bg-teal-700",
              )}
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  <span className="hidden sm:inline">Hinzugefügt</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span className="hidden sm:inline">Warenkorb</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Selected Tool Indicator (floating) */}
      {selectedTool && (
        <div className="fixed left-4 top-20 z-40 md:hidden">
          <div className="flex items-center gap-2 rounded-full bg-teal-600 px-3 py-2 shadow-lg">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: colorHexMap[selectedColor] }} />
            <span className="text-xs font-medium text-white">
              {moduleTypes.find((m) => m.id === selectedTool)?.label || selectedTool}
            </span>
            <button onClick={() => onSelectTool(null)} className="ml-1 rounded-full p-0.5 hover:bg-teal-500">
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
