// GS1 Application Identifier parser
interface ParsedGS1Data {
  gtin?: string;
  batchLot?: string;
  expirationDate?: string;
  serialNumber?: string;
  [key: string]: string | undefined;
}

export function parseGS1(barcode: string): ParsedGS1Data {
  const result: ParsedGS1Data = {};

  // Check if the barcode uses parentheses format
  if (barcode.includes("(")) {
    // Handle parentheses format
    const aiPattern = /\((\d{2})\)([^(]+)/g;
    let match;

    while ((match = aiPattern.exec(barcode)) !== null) {
      const [, ai, value] = match;
      handleAI(ai, value, result);
    }
  } else {
    // Handle format without parentheses
    let position = 0;
    while (position < barcode.length) {
      const ai = barcode.substring(position, position + 2);
      position += 2;

      switch (ai) {
        case "01": {
          const gtin = barcode.substring(position, position + 14);
          handleAI(ai, gtin, result);
          position += 14;
          break;
        }
        case "10": {
          const batchEnd = barcode.indexOf("\x1D", position);
          const batchValue = barcode.substring(
            position,
            batchEnd > -1 ? batchEnd : undefined
          );
          handleAI(ai, batchValue, result);
          position += batchValue.length;
          break;
        }
        case "17": {
          const expiry = barcode.substring(position, position + 6);
          handleAI(ai, expiry, result);
          position += 6;
          break;
        }
        case "21": {
          const serialEnd = barcode.indexOf("\x1D", position);
          const serialValue = barcode.substring(
            position,
            serialEnd > -1 ? serialEnd : undefined
          );
          handleAI(ai, serialValue, result);
          position += serialValue.length;
          break;
        }
      }

      if (position < barcode.length && barcode[position] === "\x1D") {
        position++;
      }
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("Invalid GS1 barcode format");
  }

  return result;
}

function handleAI(ai: string, value: string, result: ParsedGS1Data) {
  switch (ai) {
    case "01": // GTIN
      result.gtin = value;
      break;
    case "10": // Batch/Lot
      result.batchLot = value;
      break;
    case "17": {
      // Expiration Date
      const year = value.slice(0, 2);
      const month = value.slice(2, 4);
      const day = value.slice(4, 6);
      result.expirationDate = `20${year}-${month}-${day}`;
      break;
    }
    case "21": // Serial Number
      result.serialNumber = value;
      break;
  }
}
