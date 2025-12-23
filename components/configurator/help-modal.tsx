"use client"

import { X } from "lucide-react"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-[#4a4a4a] text-white rounded-lg shadow-2xl max-w-xl w-full mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#3d3d3d] border-b border-[#2d2d2d]">
          <h2 className="text-lg font-semibold">Hinweise zur Benutzung</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#555] rounded transition-colors">
            <X className="w-5 h-5 text-[#999]" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(85vh-60px)]">
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#0066b3] rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-[#ddd] leading-relaxed">
                Klicken Sie ein Element an um dieses auszuwählen und zu öffnen.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#0066b3] rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-[#ddd] leading-relaxed">
                Um ein Element hinzuzufügen, können Sie dieses auf der rechten Seite anklicken und an den gewünschten
                Ort ziehen.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#0066b3] rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-[#ddd] leading-relaxed">
                Um ein Element neu zu positionieren, können Sie dieses einfach anklicken und an den gewünschten Ort
                ziehen.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#0066b3] rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-[#ddd] leading-relaxed">
                Um ein Element vom Regal zu entfernen, können Sie dieses einfach anklicken und vom Regal wegziehen.
              </span>
            </li>
          </ul>

          {/* YouTube video embed */}
          <div className="mb-5">
            <a
              href="https://www.youtube.com/watch?v=-uofZHfPGcw"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src="https://img.youtube.com/vi/-uofZHfPGcw/0.jpg"
                alt="Video-Anleitung"
                className="w-full rounded-lg hover:opacity-90 transition-opacity"
              />
            </a>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#0066b3] hover:bg-[#0055a0] text-white font-medium py-2 px-6 rounded transition-colors"
            >
              Verstanden
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
