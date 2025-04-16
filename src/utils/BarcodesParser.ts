// Unified barcode parser - handles both GS1 and HIBC formats

import { parseGS1 } from "./gs1Parser";
import { parseHIBC } from "./HIBCParser";

// Common interface for parsed barcode data
export interface ParsedBarcodeData {
  gtin?: string;
  batchLot?: string;
  expirationDate?: string;
  serialNumber?: string;
  ref?: string; // REF field, typically populated from external data
  [key: string]: string | undefined;
}

// Barcode Type Enumeration
export enum BarcodeType {
  GS1 = "GS1",
  HIBC = "HIBC",
  UNKNOWN = "UNKNOWN"
}

// Function to detect barcode type
export function detectBarcodeType(barcode: string): BarcodeType {
  // Clean barcode of common prefixes/suffixes for detection
  const cleanBarcode = barcode.replace(/^\*|\*$/g, "");
  
  // HIBC barcodes start with a +
  if (cleanBarcode.startsWith("+")) {
    return BarcodeType.HIBC;
  }
  
  // GS1 barcodes typically start with specific prefixes or symbology identifiers
  if (cleanBarcode.startsWith("]") || 
      cleanBarcode.startsWith("C1") || 
      cleanBarcode.startsWith("d2")) {
    return BarcodeType.GS1;
  }
  
  // Look for common patterns in GS1 barcodes (starting with Application Identifiers)
  // AI (01) GTIN pattern - common in GS1 barcodes
  if (/^\(?01\)?/.test(cleanBarcode)) {
    return BarcodeType.GS1;
  }
  
  // Default to UNKNOWN if no specific pattern is detected
  return BarcodeType.UNKNOWN;
}

// Parse barcode with automatic type detection
export function parseBarcode(barcode: string): ParsedBarcodeData {
  // Detect barcode type
  const barcodeType = detectBarcodeType(barcode);
  
  try {
    switch (barcodeType) {
      case BarcodeType.GS1:
        return parseGS1(barcode);
        
      case BarcodeType.HIBC:
        return parseHIBC(barcode);
        
      case BarcodeType.UNKNOWN:
        // For unknown types, try GS1 first (it's more common)
        try {
          return parseGS1(barcode);
        } catch (e) {
          // If GS1 parsing fails, try HIBC as a fallback
          try {
            return parseHIBC(barcode);
          } catch (hibcError) {
            // If both fail, throw the original GS1 error
            throw e;
          }
        }
        
      default:
        throw new Error("Unsupported barcode type");
    }
  } catch (error) {
    throw new Error(`Barcode parsing failed: ${error}`);
  }
}