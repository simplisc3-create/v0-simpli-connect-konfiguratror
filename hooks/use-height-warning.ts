"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"

interface UseHeightWarningReturn {
  showHeightWarning: boolean
  setShowHeightWarning: React.Dispatch<React.SetStateAction<boolean>>
  heightWarningShown: boolean
  setHeightWarningShown: React.Dispatch<React.SetStateAction<boolean>>
  playDingSound: () => void
}

export function useHeightWarning(totalHeightCm: number): UseHeightWarningReturn {
  const [showHeightWarning, setShowHeightWarning] = useState(false)
  const [heightWarningShown, setHeightWarningShown] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playDingSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current

      // Create oscillator for ding sound
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Bell-like ding sound
      oscillator.frequency.setValueAtTime(830, ctx.currentTime) // High pitch
      oscillator.type = "sine"

      // Quick fade out for ding effect
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (e) {
      // Audio not supported
    }
  }, [])

  return {
    showHeightWarning,
    setShowHeightWarning,
    heightWarningShown,
    setHeightWarningShown,
    playDingSound,
  }
}
