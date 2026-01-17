"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Phone, X, Minus, Maximize2, Minimize2 } from "lucide-react"

export function SosFloatingSphere() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 200 })
  const [size, setSize] = useState({ width: 280, height: 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number }>({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  })
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number }>({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  })

  useEffect(() => {
    setPosition({ x: 20, y: window.innerHeight - 520 })
  }, [])

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragRef.current.startX
        const deltaY = e.clientY - dragRef.current.startY
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, dragRef.current.startPosX + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, dragRef.current.startPosY + deltaY)),
        })
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeRef.current.startX
        const deltaY = e.clientY - resizeRef.current.startY
        setSize({
          width: Math.max(240, Math.min(400, resizeRef.current.startWidth + deltaX)),
          height: Math.max(400, Math.min(700, resizeRef.current.startHeight + deltaY)),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, size.width, size.height])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-600 shadow-lg flex items-center justify-center animate-pulse hover:scale-110 transition-transform ${isOpen ? "hidden" : ""}`}
        aria-label="SOS Hotline öffnen"
      >
        <div className="relative">
          <Phone className="w-5 h-5 text-white" />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-red-800 px-1 py-0.5 rounded">
            SOS
          </span>
        </div>
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
      </button>

      {isOpen && (
        <div
          className="fixed z-50 flex flex-col bg-black rounded-[2rem] shadow-2xl overflow-hidden"
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: isMinimized ? 50 : size.height,
          }}
        >
          {/* Phone notch/header - draggable */}
          <div
            onMouseDown={handleDragStart}
            className="flex items-center justify-between px-3 py-2 bg-black cursor-move select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-white">SOS Hotline</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label={isMinimized ? "Maximieren" : "Minimieren"}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3 text-white" /> : <Minus className="w-3 h-3 text-white" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Schließen"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          {/* Phone screen */}
          {!isMinimized && (
            <>
              <div className="flex-1 bg-white mx-1 mb-1 rounded-b-[1.5rem] overflow-hidden relative">
                <iframe
                  src="https://simpli-connect-voice-agent-373433007851.us-west1.run.app"
                  className="w-full h-full border-0"
                  allow="microphone"
                  title="Simpli Connect Voice Agent"
                />
              </div>
              {/* Resize handle */}
              <div
                onMouseDown={handleResizeStart}
                className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-center justify-center"
              >
                <Minimize2 className="w-3 h-3 text-white/50 rotate-90" />
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
