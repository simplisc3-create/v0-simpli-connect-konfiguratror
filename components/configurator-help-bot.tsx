"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

const FAQ_RESPONSES: Record<string, string> = {
  // Adding modules
  "add module":
    "Um ein Modul hinzuzufügen, klicken Sie auf eine leere Zelle (mit + Symbol) im Regal. Ein Menü erscheint mit verschiedenen Modultypen zur Auswahl.",
  hinzufügen:
    "Um ein Modul hinzuzufügen, klicken Sie auf eine leere Zelle (mit + Symbol) im Regal. Ein Menü erscheint mit verschiedenen Modultypen zur Auswahl.",

  // Colors
  farbe:
    "Um die Farbe zu ändern, wählen Sie zuerst ein Modul aus und klicken Sie dann auf 'Farbe ändern' im Kontextmenü. Sie können aus Weiß, Schwarz, Blau, Grün, Gelb, Orange und Rot wählen.",
  color:
    "Um die Farbe zu ändern, wählen Sie zuerst ein Modul aus und klicken Sie dann auf 'Farbe ändern' im Kontextmenü. Sie können aus Weiß, Schwarz, Blau, Grün, Gelb, Orange und Rot wählen.",

  // Size
  größe:
    "Die Größe des Regals können Sie über die Breiten- und Höheneinstellungen im linken Panel anpassen. Klicken Sie auf die Spalten- oder Reihenköpfe um einzelne Dimensionen zu ändern.",
  size: "Die Größe des Regals können Sie über die Breiten- und Höheneinstellungen im linken Panel anpassen. Klicken Sie auf die Spalten- oder Reihenköpfe um einzelne Dimensionen zu ändern.",
  breite: "Klicken Sie auf einen Spaltenkopf (oben), um die Breite dieser Spalte zwischen 38cm und 75cm zu wechseln.",
  höhe: "Klicken Sie auf einen Reihenkopf (links), um die Höhe dieser Reihe anzupassen.",

  // Delete
  löschen:
    "Um ein Modul zu löschen, klicken Sie darauf und wählen Sie 'Löschen' aus dem Kontextmenü. Alternativ können Sie auch das gesamte Regal zurücksetzen mit dem Reset-Button.",
  delete: "Um ein Modul zu löschen, klicken Sie darauf und wählen Sie 'Löschen' aus dem Kontextmenü.",
  entfernen: "Um ein Modul zu entfernen, klicken Sie darauf und wählen Sie 'Löschen' aus dem Kontextmenü.",

  // Undo/Redo
  undo: "Verwenden Sie die Rückgängig/Wiederholen Buttons oben links (Pfeile) um Änderungen rückgängig zu machen oder wiederherzustellen.",
  rückgängig:
    "Verwenden Sie die Rückgängig/Wiederholen Buttons oben links (Pfeile) um Änderungen rückgängig zu machen oder wiederherzustellen.",

  // Price
  preis:
    "Der aktuelle Preis wird in der Zusammenfassung im linken Panel angezeigt. Er aktualisiert sich automatisch bei jeder Änderung.",
  price:
    "Der aktuelle Preis wird in der Zusammenfassung im linken Panel angezeigt. Er aktualisiert sich automatisch bei jeder Änderung.",
  kosten:
    "Die Kosten werden automatisch berechnet basierend auf den gewählten Modulen und Materialien. Siehe Zusammenfassung links.",

  // Order
  bestellen:
    "Wenn Sie mit Ihrer Konfiguration zufrieden sind, klicken Sie auf 'In den Warenkorb' um Ihr Regal zu bestellen.",
  warenkorb: "Klicken Sie auf 'In den Warenkorb' im linken Panel um Ihre Konfiguration hinzuzufügen.",

  // Module types
  modul:
    "Verfügbare Module: Offenes Fach, Mit Rückwand, Schublade, Türen (links/rechts), Klapptür, und abschließbare Varianten.",
  türen:
    "Türen gibt es als einzelne Tür (links oder rechts öffnend) oder als abschließbare Variante. Wählen Sie beim Hinzufügen den gewünschten Typ.",
  schublade:
    "Schubladen sind als Doppelschubladen verfügbar. Klicken Sie auf ein leeres Fach und wählen Sie 'Doppelschublade'.",

  // Navigation
  drehen:
    "Sie können das 3D-Modell mit der Maus drehen: Klicken und ziehen Sie um zu rotieren, scrollen Sie zum Zoomen.",
  zoom: "Verwenden Sie das Mausrad zum Zoomen oder die Touch-Gesten auf mobilen Geräten.",
  ansicht: "Klicken Sie auf 'Ansicht zurücksetzen' um zur Standardansicht zurückzukehren.",

  // Help
  hilfe:
    "Ich kann Ihnen bei Fragen zur Bedienung des Konfigurators helfen. Fragen Sie mich nach Modulen, Farben, Größen oder der Bestellung!",
  help: "Ich kann Ihnen bei Fragen zur Bedienung des Konfigurators helfen. Fragen Sie mich nach Modulen, Farben, Größen oder der Bestellung!",
}

const DEFAULT_RESPONSE =
  "Entschuldigung, ich verstehe die Frage nicht ganz. Versuchen Sie es mit Begriffen wie: 'Modul hinzufügen', 'Farbe ändern', 'Größe anpassen', 'Preis' oder 'Bestellen'. Oder kontaktieren Sie unseren Support für weitere Hilfe."

const GREETING =
  "Hallo! Ich bin Ihr Konfigurator-Assistent. Wie kann ich Ihnen helfen? Sie können mich nach Modulen, Farben, Größen oder dem Bestellvorgang fragen."

function findResponse(query: string): string {
  const lowerQuery = query.toLowerCase()

  for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
    if (lowerQuery.includes(keyword)) {
      return response
    }
  }

  return DEFAULT_RESPONSE
}

export function ConfiguratorHelpBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: "greeting", role: "assistant", content: GREETING }])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const response = findResponse(userMessage.content)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, assistantMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Button */}
      null

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[450px] w-[350px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-medium">Konfigurator Hilfe</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 transition-colors hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-2">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ihre Frage..."
                className="flex-1 rounded-full border bg-muted/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
