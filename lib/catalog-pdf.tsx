/* eslint-disable jsx-a11y/alt-text */
import { Fragment } from "react"
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import {
  CATALOG_REGALE,
  CATALOG_MODULES,
  CATALOG_COLORS,
  PRIMARY_COLOR,
  SIMPLI_MATERIALS,
  formatPrice,
  type CatalogItem,
  type CatalogManifest,
} from "./catalog-data"

// -----------------------------------------------------------------------------
// Farbpalette des Magazins
// -----------------------------------------------------------------------------
const INK = "#1a1a1a"
const MUTED = "#6b6b6b"
const LINE = "#d8d4cc"
const PAPER = "#f7f5f0"
const ACCENT = "#1f6f4a" // gedämpftes Smaragd, passend zum Markensystem

// -----------------------------------------------------------------------------
// Sektionen + deterministische Seitenzahlen
// -----------------------------------------------------------------------------
interface Section {
  id: string
  title: string
  subtitle: string
  items: CatalogItem[]
}

const SECTIONS: Section[] = [
  {
    id: "regale",
    title: "Die Regale",
    subtitle: "Vorkonfigurierte Komplett-Kompositionen",
    items: CATALOG_REGALE,
  },
  {
    id: "module-80",
    title: "Module 80 cm",
    subtitle: "Die großen Bausteine des Systems",
    items: CATALOG_MODULES.filter((m) => m.width === 80),
  },
  {
    id: "module-40",
    title: "Module 40 cm",
    subtitle: "Schmale Bausteine für jede Lücke",
    items: CATALOG_MODULES.filter((m) => m.width === 40),
  },
]

// Seitennummerierung: Inhaltsseiten beginnen bei 1.
// Reihenfolge: [Sektion-Trenner][Produkt][Produkt]… je Sektion.
interface TocEntry {
  type: "section" | "item"
  title: string
  page: number
}

// Vorspann-Seiten vor dem ersten Inhalt: Cover (1), Editorial (2), Inhalt (3).
const FRONT_MATTER_PAGES = 3

function computeLayout(): { tocEntries: TocEntry[]; itemPages: Record<string, number> } {
  const tocEntries: TocEntry[] = []
  const itemPages: Record<string, number> = {}
  let page = FRONT_MATTER_PAGES + 1
  for (const section of SECTIONS) {
    tocEntries.push({ type: "section", title: section.title, page })
    page += 1 // Trennerseite
    for (const item of section.items) {
      itemPages[item.id] = page
      tocEntries.push({ type: "item", title: item.name, page })
      page += 1
    }
  }
  return { tocEntries, itemPages }
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------
const s = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: "Helvetica",
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: MUTED, letterSpacing: 1 },

  // Cover
  cover: {
    backgroundColor: INK,
    color: PAPER,
    paddingTop: 80,
    paddingBottom: 64,
    paddingHorizontal: 56,
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverKicker: { fontSize: 11, letterSpacing: 4, color: "#bdbdbd", textTransform: "uppercase" },
  coverTitle: { fontFamily: "Times-Roman", fontSize: 62, lineHeight: 1.02, marginTop: 18 },
  coverSub: { fontFamily: "Times-Italic", fontSize: 20, color: "#d9d9d9", marginTop: 18 },
  coverImageWrap: {
    marginTop: 28,
    marginBottom: 28,
    backgroundColor: PAPER,
    borderRadius: 4,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: { height: 280, objectFit: "contain" },
  coverFootRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  coverFootText: { fontSize: 10, color: "#bdbdbd", letterSpacing: 1 },

  // Editorial
  editorialKicker: { fontSize: 10, letterSpacing: 3, color: ACCENT, textTransform: "uppercase" },
  editorialTitle: { fontFamily: "Times-Roman", fontSize: 30, marginTop: 12, marginBottom: 18 },
  editorialBody: { fontSize: 11, lineHeight: 1.7, color: "#33312c", marginBottom: 12 },

  // TOC
  tocTitle: { fontFamily: "Times-Roman", fontSize: 34, marginBottom: 24 },
  tocSectionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginBottom: 4 },
  tocSectionTitle: { fontFamily: "Times-Roman", fontSize: 14, color: ACCENT },
  tocItemRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 6 },
  tocItemTitle: { fontSize: 10.5, color: "#33312c" },
  tocDots: { flexGrow: 1, borderBottomWidth: 0.5, borderBottomColor: LINE, marginHorizontal: 6, marginBottom: 2 },
  tocPage: { fontSize: 10.5, color: MUTED },

  // Section divider
  divider: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
  },
  dividerNum: { fontFamily: "Times-Roman", fontSize: 120, color: LINE, lineHeight: 1 },
  dividerTitle: { fontFamily: "Times-Roman", fontSize: 44, marginTop: 4 },
  dividerSub: { fontFamily: "Times-Italic", fontSize: 16, color: MUTED, marginTop: 10 },
  dividerRule: { width: 60, borderBottomWidth: 2, borderBottomColor: ACCENT, marginTop: 22 },

  // Product page
  prodHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  prodKicker: { fontSize: 9, letterSpacing: 2.5, color: ACCENT, textTransform: "uppercase" },
  prodName: { fontFamily: "Times-Roman", fontSize: 28, marginTop: 6 },
  prodSub: { fontFamily: "Times-Italic", fontSize: 13, color: MUTED, marginTop: 4 },
  prodArt: { fontSize: 8.5, color: MUTED, letterSpacing: 1, marginTop: 6 },
  prodPrice: { fontFamily: "Times-Roman", fontSize: 22, color: INK },
  prodPriceLabel: { fontSize: 8, color: MUTED, textAlign: "right", marginBottom: 2, letterSpacing: 1 },

  heroWrap: {
    marginTop: 16,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: LINE,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: { height: 286, objectFit: "contain" },
  heroCaption: { fontSize: 7, color: MUTED, letterSpacing: 1, marginTop: 6, textTransform: "uppercase" },
  viewLabel: { fontSize: 7, color: MUTED, marginTop: 2, letterSpacing: 0.5 },

  colorChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 4 },
  colorChip: { flexDirection: "row", alignItems: "center" },

  lowerRow: { flexDirection: "row", marginTop: 16, gap: 18 },
  descCol: { flex: 1.4 },
  specCol: { flex: 1 },
  descText: { fontSize: 10, lineHeight: 1.65, color: "#33312c" },
  featureItem: { flexDirection: "row", marginTop: 5, alignItems: "flex-start" },
  featureDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: ACCENT, marginTop: 4, marginRight: 6 },
  featureText: { fontSize: 9, color: "#33312c", flex: 1 },

  specBox: { backgroundColor: "#efece4", borderRadius: 4, padding: 12 },
  specHeading: { fontSize: 8, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 8 },
  specRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  specKey: { fontSize: 9, color: MUTED },
  specVal: { fontSize: 9, color: INK },

  matItem: { fontSize: 8.5, color: "#33312c", marginTop: 3 },

  swatchHeading: { fontSize: 8, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginTop: 14, marginBottom: 8 },
  swatchDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4, borderWidth: 0.5, borderColor: LINE },
  swatchLabel: { fontSize: 7.5, color: MUTED },
})

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>SIMPLI-CONNECT</Text>
      <Text style={s.footerText} render={({ pageNumber }) => `${pageNumber}`} />
      <Text style={s.footerText}>KOLLEKTION 2026</Text>
    </View>
  )
}

function img(manifest: CatalogManifest, jobId: string): string | undefined {
  return manifest.images[jobId]
}

function dims(item: CatalogItem): string {
  const d = item.dimensions
  return `${d.width} × ${d.height} × ${d.depth} cm`
}

function ProductPage({ item, manifest }: { item: CatalogItem; manifest: CatalogManifest }) {
  const hero = img(manifest, `${item.id}__perspective__${PRIMARY_COLOR.key}`)
  const kicker = item.kind === "regal" ? "Komplett-Regal" : item.width === 80 ? "Modul · 80 cm" : "Modul · 40 cm"

  return (
    <Page size="A4" style={s.page} wrap={false}>
      <View style={s.prodHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.prodKicker}>{kicker}</Text>
          <Text style={s.prodName}>{item.name}</Text>
          <Text style={s.prodSub}>{item.subtitle}</Text>
          <Text style={s.prodArt}>{item.kind === "regal" ? `ART-NR. ${item.artNr}` : item.id.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={s.prodPriceLabel}>AB</Text>
          <Text style={s.prodPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={s.heroWrap}>
        {hero ? <Image style={s.heroImage} src={hero} /> : <Text style={s.viewLabel}>Abbildung folgt</Text>}
        <Text style={s.heroCaption}>Ansicht · Perspektive · {PRIMARY_COLOR.label}</Text>
      </View>

      {/* Beschreibung + Spezifikationen */}
      <View style={s.lowerRow}>
        <View style={s.descCol}>
          <Text style={s.descText}>{item.description}</Text>
          {item.features.map((f, i) => (
            <View key={i} style={s.featureItem}>
              <View style={s.featureDot} />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>
        <View style={s.specCol}>
          <View style={s.specBox}>
            <Text style={s.specHeading}>Spezifikation</Text>
            <View style={s.specRow}>
              <Text style={s.specKey}>Maße (B×H×T)</Text>
              <Text style={s.specVal}>{dims(item)}</Text>
            </View>
            <View style={s.specRow}>
              <Text style={s.specKey}>Kategorie</Text>
              <Text style={s.specVal}>{item.kind === "regal" ? "Regal-Set" : "Einzelmodul"}</Text>
            </View>
            <View style={s.specRow}>
              <Text style={s.specKey}>Farbvarianten</Text>
              <Text style={s.specVal}>{CATALOG_COLORS.length}</Text>
            </View>
            <Text style={[s.specHeading, { marginTop: 10 }]}>Material</Text>
            {SIMPLI_MATERIALS.map((m, i) => (
              <Text key={i} style={s.matItem}>
                · {m}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Farbhinweis */}
      <Text style={s.swatchHeading}>Erhältlich in {CATALOG_COLORS.length} Farben</Text>
      <View style={s.colorChipRow}>
        {CATALOG_COLORS.map((c) => (
          <View key={c.key} style={s.colorChip}>
            <View style={[s.swatchDot, { backgroundColor: c.hex }]} />
            <Text style={s.swatchLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Footer />
    </Page>
  )
}

export function CatalogDocument({ manifest }: { manifest: CatalogManifest }) {
  const { tocEntries, itemPages } = computeLayout()
  const coverHero =
    img(manifest, `${CATALOG_REGALE[0]?.id}__perspective__${PRIMARY_COLOR.key}`) ?? undefined
  const totalProducts = SECTIONS.reduce((sum, sec) => sum + sec.items.length, 0)

  return (
    <Document title="Simpli-Connect Kollektion 2026" author="Simpli-Connect">
      {/* COVER */}
      <Page size="A4" style={s.cover}>
        <View>
          <Text style={s.coverKicker}>Modulares Möbelsystem</Text>
          <Text style={s.coverTitle}>Simpli{"\n"}Connect</Text>
          <Text style={s.coverSub}>Die Kollektion 2026 — {totalProducts} Modelle, fünf Farben, unendliche Kombinationen.</Text>
        </View>
        {coverHero ? (
          <View style={s.coverImageWrap}>
            <Image style={s.coverImage} src={coverHero} />
          </View>
        ) : (
          <View style={s.coverImageWrap} />
        )}
        <View style={s.coverFootRow}>
          <Text style={s.coverFootText}>PRODUKTKATALOG &amp; MAGAZIN</Text>
          <Text style={s.coverFootText}>AUSGABE 01</Text>
        </View>
      </Page>

      {/* EDITORIAL */}
      <Page size="A4" style={s.page}>
        <Text style={s.editorialKicker}>Editorial</Text>
        <Text style={s.editorialTitle}>Ordnung, die sich Ihrem Leben anpasst.</Text>
        <Text style={s.editorialBody}>
          Simpli-Connect ist die Antwort auf eine einfache Frage: Warum sollte sich der Mensch an seine Möbel anpassen –
          und nicht umgekehrt? Aus einem verchromten Stahlrohr-Gestell und pulverbeschichteten Paneelen entsteht ein
          System, das mitwächst, sich umstellt und neu zusammensetzt, so oft das Leben es verlangt.
        </Text>
        <Text style={s.editorialBody}>
          Jedes Modul folgt demselben klaren Raster. Offene Fächer treffen auf Türen, Schubladen und abschließbare Boxen
          – werkzeuglos verbunden über die charakteristische Steck-Klick-Mechanik. Was als Lowboard beginnt, wird zum
          raumhohen Regal, zum Raumteiler, zum Sideboard. Ganz ohne Werkzeug, ganz ohne Kompromisse.
        </Text>
        <Text style={s.editorialBody}>
          Auf den folgenden Seiten finden Sie unsere vorkonfigurierten Kompositionen sowie sämtliche Einzelmodule – jedes
          als sorgfältig gerendertes Studio-Porträt, ergänzt um Maße, Materialien und alle fünf Farben des Systems.
          Lassen Sie sich inspirieren.
        </Text>
        <Footer />
      </Page>

      {/* INHALTSVERZEICHNIS */}
      <Page size="A4" style={s.page}>
        <Text style={s.tocTitle}>Inhalt</Text>
        {tocEntries.map((e, i) =>
          e.type === "section" ? (
            <View key={i} style={s.tocSectionRow}>
              <Text style={s.tocSectionTitle}>{e.title}</Text>
              <Text style={s.tocPage}>{e.page}</Text>
            </View>
          ) : (
            <View key={i} style={s.tocItemRow}>
              <Text style={s.tocItemTitle}>{e.title}</Text>
              <View style={s.tocDots} />
              <Text style={s.tocPage}>{e.page}</Text>
            </View>
          ),
        )}
        <Footer />
      </Page>

      {/* SEKTIONEN: Trennerseite gefolgt von den Produktseiten – in genau dieser
          Reihenfolge, damit die Seitenzahlen im Inhaltsverzeichnis exakt stimmen. */}
      {SECTIONS.map((section, idx) => (
        <Fragment key={section.id}>
          <Page size="A4" style={s.page}>
            <View style={s.divider}>
              <Text style={s.dividerNum}>{String(idx + 1).padStart(2, "0")}</Text>
              <Text style={s.dividerTitle}>{section.title}</Text>
              <Text style={s.dividerSub}>{section.subtitle}</Text>
              <View style={s.dividerRule} />
            </View>
            <Footer />
          </Page>
          {section.items.map((item) => (
            <ProductPage key={item.id} item={item} manifest={manifest} />
          ))}
        </Fragment>
      ))}
    </Document>
  )
}

export { computeLayout, SECTIONS }
