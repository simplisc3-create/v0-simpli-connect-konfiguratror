"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground">Kontakt</h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Hast du Fragen zu unseren Produkten oder benötigst Beratung? Wir sind für dich da.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-muted rounded-2xl p-8">
              <h2 className="text-xl font-semibold mb-6 text-foreground">Schreib uns</h2>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input id="email" type="email" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Betreff</Label>
                  <Input id="subject" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Nachricht</Label>
                  <Textarea id="message" rows={5} className="mt-1" />
                </div>
                <Button type="submit" className="w-full bg-foreground hover:bg-foreground/90 text-background">
                  Nachricht senden
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-6 text-foreground">Kontaktdaten</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">E-Mail</p>
                      <p className="text-muted-foreground">info@simpli-connect.de</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Telefon</p>
                      <p className="text-muted-foreground">+49 (0) 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Adresse</p>
                      <p className="text-muted-foreground">
                        Simpli Connect GmbH
                        <br />
                        Musterstraße 123
                        <br />
                        12345 Berlin
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Öffnungszeiten</h3>
                <p className="text-muted-foreground">
                  Mo - Fr: 9:00 - 18:00 Uhr
                  <br />
                  Sa: 10:00 - 14:00 Uhr
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
