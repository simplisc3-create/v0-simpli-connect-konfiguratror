import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Impressum | Simpli Connect',
  description: 'Impressum und Kontaktinformationen von Simpli Connect',
}

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Homepage
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-black">Impressum</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="prose prose-sm sm:prose max-w-none space-y-8">
          {/* Company Information */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Angaben gemäß § 5 TMG</h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold text-black">TBR GmbH & Co. KG</p>
              <address className="not-italic space-y-1">
                <p>Trimburgstraße 10</p>
                <p>36039 Fulda</p>
                <p>Deutschland</p>
              </address>
              <div className="space-y-1">
                <p>
                  <span className="font-semibold text-black">Telefon:</span>{' '}
                  <a
                    href="tel:+49661952503000"
                    className="text-teal-600 hover:text-teal-700 transition"
                  >
                    +49 661 95 250 300
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-black">E-Mail:</span>{' '}
                  <a
                    href="mailto:info@tbr-online.com"
                    className="text-teal-600 hover:text-teal-700 transition"
                  >
                    info@tbr-online.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Representation */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Vertreten durch</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold text-black">Persönlich haftende Gesellschafterin:</span>
              </p>
              <p>TBR Verwaltungs GmbH</p>
              <p className="mt-4">
                <span className="font-semibold text-black">Geschäftsführer:</span>
              </p>
              <p>Boldizsár Tóth M.A., Dipl.-Betriebswirt (FH)</p>
            </div>
          </section>

          {/* Register Information */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Registereintrag</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold text-black">Handelsregister:</span>
                <br />
                Amtsgericht Fulda, HRA 6397
              </p>
              <p>
                <span className="font-semibold text-black">Umsatzsteuer-ID:</span>
                <br />
                DE206218421
              </p>
            </div>
          </section>

          {/* Responsibility */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <div className="space-y-3 text-gray-700">
              <address className="not-italic">
                <p className="font-semibold text-black">Boldizsár Tóth</p>
                <p>Trimburgstraße 10</p>
                <p>36039 Fulda</p>
                <p>Deutschland</p>
              </address>
            </div>
          </section>

          {/* Liability for Content */}
          <section className="border-l-4 border-yellow-400 bg-yellow-50 p-4 sm:p-6 rounded">
            <h2 className="text-2xl font-bold text-black mb-3">Haftung für Inhalte</h2>
            <p className="text-gray-700">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            </p>
          </section>

          {/* Liability for Links */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Haftung für Links</h2>
            <p className="text-gray-700">
              Unsere Website enthält Links zu externen Websites Dritter. Auf deren Inhalte haben
              wir keinen Einfluss. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          {/* Copyright */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Urheberrecht</h2>
            <p className="text-gray-700">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf dieser Website
              unterliegen dem deutschen Urheberrecht. Jegliche Vervielfältigung, Bearbeitung oder
              Verbreitung außerhalb der Grenzen des Urheberrechts bedarf der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          {/* Related Links */}
          <div className="bg-gray-50 p-6 rounded-lg mt-12">
            <h3 className="font-semibold text-black mb-3">Weitere rechtliche Seiten:</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/datenschutz" className="text-teal-600 hover:text-teal-700 transition">
                  → Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-teal-600 hover:text-teal-700 transition">
                  → Allgemeine Geschäftsbedingungen (AGB)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
