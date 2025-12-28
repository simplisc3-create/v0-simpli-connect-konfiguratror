// Shopping Item Type Definition for Cart System
import type { Product } from "./simpli-products"

export interface ShoppingItem {
  product: Product
  quantity: number
  subtotal: number // price * quantity
}

// Extended cart item with additional metadata for ERP systems
export interface ERPCartItem extends ShoppingItem {
  lineNumber: number
  taxRate: number
  taxAmount: number
  grossPrice: number
  discountPercent?: number
  discountAmount?: number
  warehouseCode?: string
  deliveryDate?: string
}

// Order structure for ERP export
export interface ERPOrder {
  orderId: string
  orderDate: string
  customerData?: CustomerData
  items: ERPCartItem[]
  totals: OrderTotals
  metadata: OrderMetadata
}

export interface CustomerData {
  customerId?: string
  companyName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
}

export interface OrderTotals {
  netTotal: number
  taxTotal: number
  grossTotal: number
  currency: string
  taxRate: number
}

export interface OrderMetadata {
  configurationId: string
  createdAt: string
  source: string
  version: string
  shelfDimensions?: {
    width: number
    height: number
    depth: number
    unit: string
  }
}

// Supported ERP/Inventory Systems
export type ERPSystem = "sap" | "lexware" | "jtl" | "datev" | "weclapp" | "billbee" | "xentral" | "custom-api"

// Export format configurations
export interface ExportConfig {
  system: ERPSystem
  format: "json" | "xml" | "csv" | "datev"
  includeCustomerData: boolean
  includeMetadata: boolean
  dateFormat: string
  decimalSeparator: "," | "."
  encoding: "utf-8" | "iso-8859-1"
}

// Default export configurations per system
export const defaultExportConfigs: Record<ERPSystem, ExportConfig> = {
  sap: {
    system: "sap",
    format: "xml",
    includeCustomerData: true,
    includeMetadata: true,
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    encoding: "utf-8",
  },
  lexware: {
    system: "lexware",
    format: "xml",
    includeCustomerData: true,
    includeMetadata: true,
    dateFormat: "DD.MM.YYYY",
    decimalSeparator: ",",
    encoding: "iso-8859-1",
  },
  jtl: {
    system: "jtl",
    format: "xml",
    includeCustomerData: true,
    includeMetadata: true,
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    encoding: "utf-8",
  },
  datev: {
    system: "datev",
    format: "datev",
    includeCustomerData: true,
    includeMetadata: false,
    dateFormat: "DDMMYYYY",
    decimalSeparator: ",",
    encoding: "iso-8859-1",
  },
  weclapp: {
    system: "weclapp",
    format: "json",
    includeCustomerData: true,
    includeMetadata: true,
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    encoding: "utf-8",
  },
  billbee: {
    system: "billbee",
    format: "json",
    includeCustomerData: true,
    includeMetadata: true,
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    encoding: "utf-8",
  },
  xentral: {
    system: "xentral",
    format: "xml",
    includeCustomerData: true,
    includeMetadata: true,
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    encoding: "utf-8",
  },
  "custom-api": {
    system: "custom-api",
    format: "json",
    includeCustomerData: true,
    includeMetadata: true,
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    encoding: "utf-8",
  },
}
