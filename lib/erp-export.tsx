// ERP Export Utilities for various inventory management systems
import type { ShoppingItem, ERPOrder, ERPCartItem, ERPSystem, CustomerData, OrderMetadata } from "./shopping-item"

// Generate unique order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `SC-${timestamp}-${random}`.toUpperCase()
}

// Convert shopping items to ERP format
export function convertToERPItems(items: ShoppingItem[], taxRate = 19): ERPCartItem[] {
  return items.map((item, index) => ({
    ...item,
    lineNumber: index + 1,
    taxRate,
    taxAmount: item.subtotal * (taxRate / 100),
    grossPrice: item.subtotal * (1 + taxRate / 100),
  }))
}

// Create full ERP order
export function createERPOrder(
  items: ShoppingItem[],
  metadata: Partial<OrderMetadata>,
  customerData?: CustomerData,
): ERPOrder {
  const erpItems = convertToERPItems(items)
  const netTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const taxRate = 19
  const taxTotal = netTotal * (taxRate / 100)
  const grossTotal = netTotal + taxTotal

  return {
    orderId: generateOrderId(),
    orderDate: new Date().toISOString(),
    customerData,
    items: erpItems,
    totals: {
      netTotal,
      taxTotal,
      grossTotal,
      currency: "EUR",
      taxRate,
    },
    metadata: {
      configurationId: metadata.configurationId || generateOrderId(),
      createdAt: new Date().toISOString(),
      source: "simpli-connect-configurator",
      version: "1.0.0",
      shelfDimensions: metadata.shelfDimensions,
    },
  }
}

// Format date according to config
function formatDate(date: Date, format: string): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString()

  return format.replace("DD", day).replace("MM", month).replace("YYYY", year)
}

// Format number with decimal separator
function formatNumber(num: number, separator: "," | "."): string {
  return num.toFixed(2).replace(".", separator)
}

// Export to SAP XML format (IDoc-like structure)
export function exportToSAPXML(order: ERPOrder): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ORDERS05>
  <IDOC BEGIN="1">
    <EDI_DC40 SEGMENT="1">
      <DOCNUM>${order.orderId}</DOCNUM>
      <DOCTYP>ORDERS</DOCTYP>
      <MESTYP>ORDERS</MESTYP>
      <CREDAT>${formatDate(new Date(order.orderDate), "YYYYMMDD")}</CREDAT>
      <CRETIM>${new Date().toTimeString().slice(0, 8).replace(/:/g, "")}</CRETIM>
    </EDI_DC40>
    <E1EDK01 SEGMENT="1">
      <BELNR>${order.orderId}</BELNR>
      <BSART>ZOR</BSART>
      <CURCY>${order.totals.currency}</CURCY>
      <WKURS>1.00000</WKURS>
      <ZTERM>0001</ZTERM>
    </E1EDK01>
    ${
      order.customerData
        ? `
    <E1EDKA1 SEGMENT="1">
      <PARVW>AG</PARVW>
      <PARTN>${order.customerData.customerId || "WALK-IN"}</PARTN>
      <NAME1>${order.customerData.companyName || order.customerData.lastName || ""}</NAME1>
      <NAME2>${order.customerData.firstName || ""}</NAME2>
      <STRAS>${order.customerData.address?.street || ""}</STRAS>
      <ORT01>${order.customerData.address?.city || ""}</ORT01>
      <PSTLZ>${order.customerData.address?.postalCode || ""}</PSTLZ>
      <LAND1>${order.customerData.address?.country || "DE"}</LAND1>
      <TELF1>${order.customerData.phone || ""}</TELF1>
    </E1EDKA1>`
        : ""
    }
    ${order.items
      .map(
        (item, idx) => `
    <E1EDP01 SEGMENT="1">
      <POSEX>${String(idx + 1).padStart(6, "0")}</POSEX>
      <MENGE>${item.quantity}.000</MENGE>
      <MENEE>ST</MENEE>
      <WERKS>0001</WERKS>
      <E1EDP02 SEGMENT="1">
        <QUESSION>002</QUESSION>
        <IDTNR>${item.product.artNr}</IDTNR>
        <KTEXT>${item.product.name}</KTEXT>
      </E1EDP02>
      <E1EDP05 SEGMENT="1">
        <KSCHL>PR00</KSCHL>
        <KRATE>${formatNumber(item.product.price, ".")}</KRATE>
        <KOEIN>${order.totals.currency}</KOEIN>
      </E1EDP05>
    </E1EDP01>`,
      )
      .join("")}
    <E1EDS01 SEGMENT="1">
      <SUMID>002</SUMID>
      <SUMME>${formatNumber(order.totals.grossTotal, ".")}</SUMME>
      <WAESSION>${order.totals.currency}</WAESSION>
    </E1EDS01>
  </IDOC>
</ORDERS05>`
  return xml
}

// Export to Lexware XML format
export function exportToLexwareXML(order: ERPOrder): string {
  const xml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<LexwareAuftrag version="1.0">
  <Auftrag>
    <Kopf>
      <Auftragsnummer>${order.orderId}</Auftragsnummer>
      <Auftragsdatum>${formatDate(new Date(order.orderDate), "DD.MM.YYYY")}</Auftragsdatum>
      <Lieferdatum>${formatDate(new Date(order.orderDate), "DD.MM.YYYY")}</Lieferdatum>
      <Waehrung>${order.totals.currency}</Waehrung>
      <MwStSatz>${order.totals.taxRate}</MwStSatz>
    </Kopf>
    ${
      order.customerData
        ? `
    <Kunde>
      <Kundennummer>${order.customerData.customerId || ""}</Kundennummer>
      <Firma>${order.customerData.companyName || ""}</Firma>
      <Vorname>${order.customerData.firstName || ""}</Vorname>
      <Nachname>${order.customerData.lastName || ""}</Nachname>
      <Strasse>${order.customerData.address?.street || ""}</Strasse>
      <PLZ>${order.customerData.address?.postalCode || ""}</PLZ>
      <Ort>${order.customerData.address?.city || ""}</Ort>
      <Land>${order.customerData.address?.country || "DE"}</Land>
      <Email>${order.customerData.email || ""}</Email>
      <Telefon>${order.customerData.phone || ""}</Telefon>
    </Kunde>`
        : ""
    }
    <Positionen>
      ${order.items
        .map(
          (item, idx) => `
      <Position>
        <Positionsnummer>${idx + 1}</Positionsnummer>
        <Artikelnummer>${item.product.artNr}</Artikelnummer>
        <Bezeichnung>${item.product.name}</Bezeichnung>
        <Menge>${item.quantity}</Menge>
        <Einheit>Stück</Einheit>
        <Einzelpreis>${formatNumber(item.product.price, ",")}</Einzelpreis>
        <Gesamtpreis>${formatNumber(item.subtotal, ",")}</Gesamtpreis>
        <MwStSatz>${item.taxRate}</MwStSatz>
        ${item.product.color ? `<Farbe>${item.product.color}</Farbe>` : ""}
        ${item.product.size ? `<Groesse>${item.product.size}</Groesse>` : ""}
      </Position>`,
        )
        .join("")}
    </Positionen>
    <Summen>
      <Nettobetrag>${formatNumber(order.totals.netTotal, ",")}</Nettobetrag>
      <MwStBetrag>${formatNumber(order.totals.taxTotal, ",")}</MwStBetrag>
      <Bruttobetrag>${formatNumber(order.totals.grossTotal, ",")}</Bruttobetrag>
    </Summen>
  </Auftrag>
</LexwareAuftrag>`
  return xml
}

// Export to JTL-Wawi XML format
export function exportToJTLXML(order: ERPOrder): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Bestellungen xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Bestellung>
    <Bestellnummer>${order.orderId}</Bestellnummer>
    <Bestelldatum>${order.orderDate}</Bestelldatum>
    <Bestellstatus>offen</Bestellstatus>
    <Waehrung>${order.totals.currency}</Waehrung>
    <Versandart>Standard</Versandart>
    <Zahlungsart>Rechnung</Zahlungsart>
    ${
      order.customerData
        ? `
    <Rechnungsadresse>
      <Firma>${order.customerData.companyName || ""}</Firma>
      <Vorname>${order.customerData.firstName || ""}</Vorname>
      <Nachname>${order.customerData.lastName || ""}</Nachname>
      <Strasse>${order.customerData.address?.street || ""}</Strasse>
      <PLZ>${order.customerData.address?.postalCode || ""}</PLZ>
      <Ort>${order.customerData.address?.city || ""}</Ort>
      <Land>${order.customerData.address?.country || "DE"}</Land>
      <Email>${order.customerData.email || ""}</Email>
      <Telefon>${order.customerData.phone || ""}</Telefon>
    </Rechnungsadresse>`
        : ""
    }
    <Artikelliste>
      ${order.items
        .map(
          (item) => `
      <Artikel>
        <Artikelnummer>${item.product.artNr}</Artikelnummer>
        <Artikelname>${item.product.name}</Artikelname>
        <Kategorie>${item.product.category}</Kategorie>
        <Anzahl>${item.quantity}</Anzahl>
        <Einzelpreis>${formatNumber(item.product.price, ".")}</Einzelpreis>
        <Steuersatz>${item.taxRate}</Steuersatz>
        <Gesamtpreis>${formatNumber(item.subtotal, ".")}</Gesamtpreis>
        ${
          item.product.color
            ? `
        <Variationen>
          <Variation>
            <Name>Farbe</Name>
            <Wert>${item.product.color}</Wert>
          </Variation>
        </Variationen>`
            : ""
        }
      </Artikel>`,
        )
        .join("")}
    </Artikelliste>
    <Gesamtsumme>
      <Netto>${formatNumber(order.totals.netTotal, ".")}</Netto>
      <MwSt>${formatNumber(order.totals.taxTotal, ".")}</MwSt>
      <Brutto>${formatNumber(order.totals.grossTotal, ".")}</Brutto>
    </Gesamtsumme>
    <Metadaten>
      <KonfigurationsID>${order.metadata.configurationId}</KonfigurationsID>
      <Quelle>${order.metadata.source}</Quelle>
      ${
        order.metadata.shelfDimensions
          ? `
      <Regalabmessungen>
        <Breite>${order.metadata.shelfDimensions.width}</Breite>
        <Hoehe>${order.metadata.shelfDimensions.height}</Hoehe>
        <Einheit>${order.metadata.shelfDimensions.unit}</Einheit>
      </Regalabmessungen>`
          : ""
      }
    </Metadaten>
  </Bestellung>
</Bestellungen>`
  return xml
}

// Export to DATEV format (accounting software)
export function exportToDATEV(order: ERPOrder): string {
  const lines: string[] = []
  const date = new Date(order.orderDate)
  const dateStr = formatDate(date, "DDMMYYYY")

  // DATEV header
  lines.push(`"EXTF";510;21;Buchungsstapel;7;${dateStr};;"Simpli-Connect";"";"";;${order.orderId};;;;;;;;;;;;;;`)

  // Column headers
  lines.push(
    `"Umsatz (ohne Soll/Haben-Kz)";"Soll/Haben-Kennzeichen";"WKZ Umsatz";"Kurs";"Basis-Umsatz";"WKZ Basis-Umsatz";"Konto";"Gegenkonto (ohne BU-Schlüssel)";"BU-Schlüssel";"Belegdatum";"Belegfeld 1";"Belegfeld 2";"Skonto";"Buchungstext"`,
  )

  // Transaction lines
  order.items.forEach((item, idx) => {
    const amount = formatNumber(item.grossPrice, ",")
    const text = `${item.product.name} (${item.product.artNr})`
    lines.push(
      `${amount};"S";"EUR";"1,0000";"${amount}";"EUR";"8400";"1200";"3";"${formatDate(date, "DDMM")}";"${order.orderId}";"Pos ${idx + 1}";"0,00";"${text}"`,
    )
  })

  return lines.join("\n")
}

// Export to weclapp JSON format
export function exportToWeclappJSON(order: ERPOrder): object {
  return {
    salesOrderNumber: order.orderId,
    orderDate: Math.floor(new Date(order.orderDate).getTime()),
    customerId: order.customerData?.customerId || null,
    deliveryAddress: order.customerData?.address
      ? {
          street1: order.customerData.address.street,
          city: order.customerData.address.city,
          zipcode: order.customerData.address.postalCode,
          countryCode: order.customerData.address.country || "DE",
        }
      : null,
    salesOrderItems: order.items.map((item, idx) => ({
      positionNumber: idx + 1,
      articleNumber: item.product.artNr,
      articleId: null,
      title: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      taxId: null,
      taxRate: item.taxRate,
      discountPercentage: 0,
    })),
    netAmount: order.totals.netTotal,
    grossAmount: order.totals.grossTotal,
    currencyCode: order.totals.currency,
    customAttributes: [
      { attributeDefinitionId: "configId", stringValue: order.metadata.configurationId },
      { attributeDefinitionId: "source", stringValue: order.metadata.source },
    ],
  }
}

// Export to Billbee JSON format
export function exportToBillbeeJSON(order: ERPOrder): object {
  return {
    OrderNumber: order.orderId,
    State: 1, // New order
    VatMode: 0, // Gross prices
    CreatedAt: order.orderDate,
    ShippedAt: null,
    PayedAt: null,
    Currency: order.totals.currency,
    TotalCost: order.totals.grossTotal,
    Customer: order.customerData
      ? {
          Id: order.customerData.customerId,
          Name: `${order.customerData.firstName || ""} ${order.customerData.lastName || ""}`.trim(),
          Email: order.customerData.email,
          Tel1: order.customerData.phone,
          BillToAddress: {
            FirstName: order.customerData.firstName,
            LastName: order.customerData.lastName,
            Company: order.customerData.companyName,
            Street: order.customerData.address?.street,
            City: order.customerData.address?.city,
            Zip: order.customerData.address?.postalCode,
            CountryISO2: order.customerData.address?.country || "DE",
          },
        }
      : null,
    OrderItems: order.items.map((item) => ({
      Product: {
        SKU: item.product.artNr,
        Title: item.product.name,
        Category: item.product.category,
      },
      Quantity: item.quantity,
      TotalPrice: item.grossPrice,
      UnrebatedTotalPrice: item.grossPrice,
      TaxAmount: item.taxAmount,
      TaxIndex: 1,
      Attributes: [
        ...(item.product.color ? [{ Name: "Farbe", Value: item.product.color }] : []),
        ...(item.product.size ? [{ Name: "Größe", Value: `${item.product.size} cm` }] : []),
      ],
    })),
    Comments: [
      {
        Text: `Konfigurations-ID: ${order.metadata.configurationId}`,
        DateAdded: order.orderDate,
      },
    ],
  }
}

// Export to Xentral XML format
export function exportToXentralXML(order: ERPOrder): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<auftrag>
  <auftragsnummer>${order.orderId}</auftragsnummer>
  <datum>${formatDate(new Date(order.orderDate), "YYYY-MM-DD")}</datum>
  <status>angelegt</status>
  <waehrung>${order.totals.currency}</waehrung>
  ${
    order.customerData
      ? `
  <adresse>
    <typ>rechnung</typ>
    <firma>${order.customerData.companyName || ""}</firma>
    <vorname>${order.customerData.firstName || ""}</vorname>
    <name>${order.customerData.lastName || ""}</name>
    <strasse>${order.customerData.address?.street || ""}</strasse>
    <plz>${order.customerData.address?.postalCode || ""}</plz>
    <ort>${order.customerData.address?.city || ""}</ort>
    <land>${order.customerData.address?.country || "DE"}</land>
    <email>${order.customerData.email || ""}</email>
    <telefon>${order.customerData.phone || ""}</telefon>
  </adresse>`
      : ""
  }
  <positionen>
    ${order.items
      .map(
        (item, idx) => `
    <position>
      <nummer>${idx + 1}</nummer>
      <artikel>${item.product.artNr}</artikel>
      <bezeichnung>${item.product.name}</bezeichnung>
      <menge>${item.quantity}</menge>
      <preis>${formatNumber(item.product.price, ".")}</preis>
      <steuer>${item.taxRate}</steuer>
      <eigenschaften>
        ${item.product.color ? `<eigenschaft name="farbe">${item.product.color}</eigenschaft>` : ""}
        ${item.product.size ? `<eigenschaft name="groesse">${item.product.size}</eigenschaft>` : ""}
        ${item.product.variant ? `<eigenschaft name="variante">${item.product.variant}</eigenschaft>` : ""}
      </eigenschaften>
    </position>`,
      )
      .join("")}
  </positionen>
  <summen>
    <netto>${formatNumber(order.totals.netTotal, ".")}</netto>
    <ust>${formatNumber(order.totals.taxTotal, ".")}</ust>
    <gesamt>${formatNumber(order.totals.grossTotal, ".")}</gesamt>
  </summen>
  <freifelder>
    <feld name="konfiguration_id">${order.metadata.configurationId}</feld>
    <feld name="quelle">${order.metadata.source}</feld>
  </freifelder>
</auftrag>`
  return xml
}

// Generic export function
export function exportOrder(
  order: ERPOrder,
  system: ERPSystem,
): { content: string; mimeType: string; extension: string } {
  switch (system) {
    case "sap":
      return { content: exportToSAPXML(order), mimeType: "application/xml", extension: "xml" }
    case "lexware":
      return { content: exportToLexwareXML(order), mimeType: "application/xml", extension: "xml" }
    case "jtl":
      return { content: exportToJTLXML(order), mimeType: "application/xml", extension: "xml" }
    case "datev":
      return { content: exportToDATEV(order), mimeType: "text/csv", extension: "csv" }
    case "weclapp":
      return {
        content: JSON.stringify(exportToWeclappJSON(order), null, 2),
        mimeType: "application/json",
        extension: "json",
      }
    case "billbee":
      return {
        content: JSON.stringify(exportToBillbeeJSON(order), null, 2),
        mimeType: "application/json",
        extension: "json",
      }
    case "xentral":
      return { content: exportToXentralXML(order), mimeType: "application/xml", extension: "xml" }
    case "custom-api":
      return { content: JSON.stringify(order, null, 2), mimeType: "application/json", extension: "json" }
    default:
      return { content: JSON.stringify(order, null, 2), mimeType: "application/json", extension: "json" }
  }
}
