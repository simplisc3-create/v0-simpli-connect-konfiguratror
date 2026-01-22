"use client"

import { Product3DPreview } from "@/components/product-3d-preview"

interface Product3DPreviewWrapperProps {
  glbModule: {
    moduleType: string
    color: string
    width: 40 | 80
  }
}

export function Product3DPreviewWrapper({ glbModule }: Product3DPreviewWrapperProps) {
  return (
    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50">
      <Product3DPreview
        moduleType={glbModule.moduleType}
        color={glbModule.color}
        width={glbModule.width}
        autoRotate={true}
      />
    </div>
  )
}
