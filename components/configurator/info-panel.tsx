"use client"

import type { ShelfElement } from "@/lib/types"
import { AlertCircle, Info, HelpCircle } from "lucide-react"

interface InfoPanelProps {
  selectedElement: ShelfElement | null
  errors: string[]
  hints: string[]
  totalPrice: number
  onAddToCart: () => void
  onShowHelp: () => void
}

export function InfoPanel({ selectedElement, errors, hints, totalPrice, onAddToCart, onShowHelp }: InfoPanelProps) {
  return (
    <div className="bg-[#4a4a4a] text-white">
      <div className="flex items-center justify-between px-4 py-3 bg-[#3d3d3d] border-b border-[#2d2d2d]">
        <h3 className="text-sm font-medium">Hinweise zur Benutzung</h3>
        <button onClick={onShowHelp} className="text-[#aaa] hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        {/* Info section header */}
        <h4 className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3">
          Informationen zum zusammengestellten Regal
        </h4>

        {/* Selected element info */}
        <div className="bg-[#3d3d3d] rounded p-3 mb-4 min-h-[50px]">
          {selectedElement ? (
            <div>
              <p className="font-medium text-white">{selectedElement.name}</p>
              <p className="text-sm text-[#aaa]">{selectedElement.price.toFixed(2)} €</p>
            </div>
          ) : (
            <p className="text-sm text-[#888]">Sie haben derzeit kein Element ausgewählt</p>
          )}
        </div>

        {/* Errors section */}
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-[#e74c3c] uppercase mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Fehler
          </h5>
          <div className="bg-[#3d3d3d] rounded p-2 min-h-[30px]">
            {errors.length > 0 ? (
              errors.map((error, i) => (
                <p key={i} className="text-sm text-[#e74c3c]">
                  {error}
                </p>
              ))
            ) : (
              <p className="text-sm text-[#666]">-</p>
            )}
          </div>
        </div>

        {/* Hints section */}
        <div className="mb-4">
          <h5 className="text-xs font-semibold text-[#f39c12] uppercase mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Hinweis
          </h5>
          <div className="bg-[#3d3d3d] rounded p-2 min-h-[30px]">
            {hints.length > 0 ? (
              hints.map((hint, i) => (
                <p key={i} className="text-sm text-[#f39c12]">
                  {hint}
                </p>
              ))
            ) : (
              <p className="text-sm text-[#666]">-</p>
            )}
          </div>
        </div>

        {/* Price and cart */}
        <div className="border-t border-[#555] pt-4">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-sm text-[#999]">Preis:</span>
            <span className="text-2xl font-bold text-white">{totalPrice.toFixed(2)} €</span>
          </div>

          <button
            onClick={onAddToCart}
            className="w-full bg-[#27ae60] hover:bg-[#219a52] text-white font-medium py-3 px-4 rounded transition-colors"
          >
            In den Warenkorb
          </button>

          <p className="text-xs text-[#777] mt-3 text-center leading-relaxed">
            inkl. Mwst., inkl. Versand (Deutschland),
            <br />
            Lieferzeit auf Anfrage
          </p>
        </div>
      </div>
    </div>
  )
}
