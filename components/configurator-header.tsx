"use client"

import Link from "next/link"
import { X, HelpCircle, Check } from "lucide-react"
import { useState } from "react"

interface ConfiguratorHeaderProps {
  onShowTutorial?: () => void
  onSave?: () => Promise<void>
  onShare?: () => Promise<void>
}

export function ConfiguratorHeader({ onShowTutorial, onSave, onShare }: ConfiguratorHeaderProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [sharedSuccess, setSharedSuccess] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave?.()
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await onShare?.()
      setSharedSuccess(true)
      setTimeout(() => setSharedSuccess(false), 2000)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-[#f5f5f5] px-3 sm:px-5 py-2 overflow-hidden shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] text-white transition-colors hover:bg-[#333]"
          title="Konfigurator verlassen"
        >
          <X className="h-4 w-4" />
        </Link>
        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a]">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="hidden md:inline text-xs font-semibold tracking-widest uppercase text-[#1a1a1a]/60 ml-1">
          Konfigurator
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {onShowTutorial && (
          <button 
            onClick={onShowTutorial}
            className="flex items-center gap-1.5 rounded-lg border border-[#1a1a1a]/20 px-3 py-1.5 text-xs font-medium text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a]/10"
            title="Tutorial anzeigen"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hilfe</span>
          </button>
        )}
        {onSave && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#1a1a1a]/20 px-3 py-1.5 text-xs font-medium text-[#1a1a1a] transition-all hover:bg-[#1a1a1a]/10 disabled:opacity-60"
            title="Konfiguration speichern"
          >
            {savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Gespeichert</span>
              </>
            ) : (
              <span>{isSaving ? "Wird gespeichert..." : "Speichern"}</span>
            )}
          </button>
        )}
        {onShare && (
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className="hidden sm:flex rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#333] disabled:opacity-60"
            title="Konfiguration teilen"
          >
            {sharedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                <span>Kopiert</span>
              </>
            ) : (
              <span>{isSharing ? "Wird vorbereitet..." : "Teilen"}</span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
