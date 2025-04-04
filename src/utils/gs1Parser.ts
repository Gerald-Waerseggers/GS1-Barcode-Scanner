// GS1 Application Identifier parser

import { parseBarcode } from "./BarcodeParser";

interface ParsedGS1Data {
  gtin?: string;
  batchLot?: string;
  expirationDate?: string;
  serialNumber?: string;
  [key: string]: string | undefined;
}

export function parseGS1(barcode: string): ParsedGS1Data {
  try {
    // Handle different symbology identifiers
    if (!barcode.startsWith("]")) {
      // If it doesn't start with ], check for common prefixes
      if (barcode.startsWith("C1")) {
        // GS1-128 format without ]
        barcode = "]" + barcode;
      } else if (barcode.startsWith("d2")) {
        // QR code format without ]
        barcode = "]" + barcode;
      } else {
        // No recognizable prefix, assume GS1-128
        barcode = "]C1" + barcode;
      }
    } else if (
      barcode.startsWith("]") &&
      !barcode.startsWith("]C1") &&
      !barcode.startsWith("]d2")
    ) {
      // Has ] but missing the format indicator
      if (barcode.substring(1).startsWith("C1")) {
        // Already has C1 after ]
        // No change needed
      } else if (barcode.substring(1).startsWith("d2")) {
        // Already has D2 after ]
        // No change needed
      } else {
        // Only has ], assume GS1-128
        barcode = "]C1" + barcode.substring(1);
      }
    }

    barcode = barcode.replace(/§/g, "-");
    // Replace parentheses with nothing
    barcode = barcode.replace(/\(/g, "").replace(/\)/g, "");

    // Use the existing parser to get detailed parsing
    const parsed = parseBarcode(barcode);
    const result: ParsedGS1Data = {};

    // Map the parsed elements to our simplified format
    for (const item of parsed.parsedCodeItems) {
      switch (item.ai) {
        case "01": // GTIN
          result.gtin = item.raw;
          break;
        case "10": // Batch/Lot
          result.batchLot = item.raw;
          break;
        case "17": {
          // Expiration Date
          if (item.data instanceof Date) {
            const date = item.data;
            const year = date.getFullYear().toString().padStart(4, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            result.expirationDate = `${year}-${month}-${day}`;
          }
          break;
        }
        case "21": // Serial Number
          result.serialNumber = item.raw;
          break;
        default: {
          // Handle any other AIs by using their AI number as the key
          const key = `ai${item.ai}`;
          result[key] =
            typeof item.data === "object" ? item.raw : item.data.toString();
        }
      }
    }

    if (Object.keys(result).length === 0) {
      throw new Error("No valid GS1 elements found");
    }

    return result;
  } catch (error) {
    throw new Error(`Invalid GS1 barcode format: ${error}`);
  }
}
