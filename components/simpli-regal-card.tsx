"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Package, Check, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SimpliRegalProduct } from "@/lib/simpli-products"
import { SimpliRegal3DPreview } from "./simpli-regal-3d-preview"
import { calculatePresetPrice } from "@/lib/price-calculator"

interface SimpliRegalCardProps {
  regal: SimpliRegalProduct
}

export function SimpliRegalCard({ regal }: SimpliRegalCardProps) {
  // Calculate price dynamically from preset configuration
  const calculatedPrice = useMemo(() => {
    if (regal.preset) {
      return calculatePresetPrice(regal.preset)
    }
    return regal.price // Fallback to static price if no preset
  }, [regal.preset, regal.price])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: 3D Preview */}
        <div className="relative h-[400px] md:h-auto min-h-[350px]">
          <SimpliRegal3DPreview regal={regal} className="w-full h-full" />
          
          {/* 3D Badge */}
          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            3D Vorschau
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="p-8 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-100">
                <Package className="w-3 h-3 mr-1" />
                Komplett-Set
              </Badge>
              <span className="text-sm text-gray-500">{regal.artNr}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{regal.name}</h2>
            <p className="text-lg text-teal-600 font-medium">{regal.subtitle}</p>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm">{regal.description}</p>

          {/* Configuration Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Konfiguration:</p>
            <p className="text-sm text-gray-600">
              {regal.rows} Ebenen × {regal.cols} Spalten ({regal.width}cm Module)
            </p>
          </div>

          {/* Features */}
          {regal.features && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Im Set enthalten:</h3>
              <ul className="grid grid-cols-2 gap-2">
                {regal.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price & CTA */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Komplett-Preis</p>
                <p className="text-3xl font-bold text-gray-900">{calculatedPrice.toFixed(2)} €</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/konfigurator?preset=${regal.id}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2 bg-transparent" size="lg">
                  Im Konfigurator öffnen
                </Button>
              </Link>
              <Link href={`/shop/${regal.id}`} className="flex-1">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2" size="lg">
                  Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
