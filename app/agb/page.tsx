import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AGB | Simpli Connect",
  description: "Allgemeine Geschäftsbedingungen von Simpli Connect",
}

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-sm text-gray-600 mb-8">Gültig ab 1. Januar 2024</p>

        <div className="prose prose-sm sm:prose max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">1. GELTUNGSBEREICH</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über den Online-Shop der TBR GmbH & Co.
              KG.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">2. VERTRAGSPARTNER</h2>
            <p>Der Kaufvertrag kommt zustande mit:</p>
            <div className="bg-gray-50 p-4 rounded-lg my-3 text-sm">
              <p className="font-semibold mb-2">TBR GmbH & Co. KG</p>
              <p>Trimburgstraße 10</p>
              <p>36039 Fulda</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">3. ANGEBOT UND VERTRAGSSCHLUSS</h2>
            <p>
              Die Darstellung der Produkte und Konfigurationen im Online-Shop stellt kein rechtlich bindendes Angebot
              dar, sondern eine unverbindliche Aufforderung zur Bestellung.
            </p>
            <p>
              Durch Abschluss des Bestellvorgangs gibt der Kunde ein verbindliches Angebot zum Kauf der im Warenkorb
              enthaltenen Produkte ab.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">4. PRODUKTKONFIGURATION</h2>
            <p>
              Die dargestellten Möbel-Konfigurationen dienen der Visualisierung. Farben, Materialien und Maße können
              technisch bedingt geringfügig abweichen.
            </p>
            <p>
              Automatisch generierte Preise und Stücklisten basieren auf den vom Nutzer gewählten Konfigurationen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">5. PREISE</h2>
            <p>
              Alle angegebenen Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer zzgl. Versandkosten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">6. ZAHLUNG</h2>
            <p>Die Zahlung erfolgt über die im Checkout angebotenen Zahlungsmethoden.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">7. LIEFERUNG</h2>
            <p>Die Lieferung erfolgt innerhalb Deutschlands sowie in ausgewählte EU-Länder.</p>
            <p>
              Die Lieferzeit beträgt abhängig von Produkt und Konfiguration in der Regel zwischen 2 und 6 Wochen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">8. EIGENTUMSVORBEHALT</h2>
            <p>Die Ware bleibt bis zur vollständigen Bezahlung Eigentum der TBR GmbH & Co. KG.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">9. GEWÄHRLEISTUNG</h2>
            <p>Es gelten die gesetzlichen Gewährleistungsrechte.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">10. WIDERRUFSRECHT</h2>
            <p>Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu.</p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg my-3 text-sm">
              <p className="font-semibold mb-2">Hinweis:</p>
              <p>
                Individuell konfigurierte oder maßgefertigte Möbelstücke sind gemäß § 312g Abs. 2 Nr. 1 BGB vom
                Widerrufsrecht ausgeschlossen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">11. HAFTUNG</h2>
            <p>Die Haftung auf Schadensersatz ist ausgeschlossen, soweit gesetzlich zulässig.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">12. DATENSCHUTZ</h2>
            <p>
              Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{" "}
              <a href="/datenschutz" className="text-teal-600 hover:text-teal-700 underline">
                Datenschutzerklärung
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mt-8 mb-3">13. SCHLUSSBESTIMMUNGEN</h2>
            <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.</p>
            <p>
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen
              Bestimmungen unberührt.
            </p>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Bei Fragen zu diesen AGB kontaktieren Sie uns bitte unter:{" "}
              <a href="mailto:info@tbrgroup.de" className="text-teal-600 hover:text-teal-700 underline">
                info@tbrgroup.de
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
