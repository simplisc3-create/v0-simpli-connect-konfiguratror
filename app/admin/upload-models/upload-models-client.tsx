"use client"

import dynamic from "next/dynamic"

const UploadModelsContent = dynamic(() => import("@/components/upload-models-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 p-8 flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  ),
})

export default function UploadModelsClient() {
  return <UploadModelsContent />
}
