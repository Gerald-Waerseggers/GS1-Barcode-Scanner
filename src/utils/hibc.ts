/**
 * HIBC Decoder
 *
 * Provides functionality to decode HIBC barcodes
 */

// Define interfaces for type safety
interface DecodedHIBC {
  barcode?: string;
  error?: number;
  type?: number;
  labelerId?: string;
  product?: string;
  uom?: number;
  check?: string;
  link?: string;
  date?: Date;
  lot?: string;
  serial?: string;
  quantity?: number;
}

export const HIBCError = {
  BarcodeNotAString: 1,
  EmptyBarcode: 2,
  BarcodeNotHIBC: 3,
  InvalidBarcode: 4,
  InvalidDate: 5,
  EmptyCheckCharacter: 6,
  EmptyLinkCharacter: 7,
  InvalidQuantity: 8,
  InvalidLine1: 9,
} as const;

export const HIBCType = {
  Concatenated: 1,
  Line1: 2,
  Line2: 3,
} as const;

/**
 * Decodes a HIBC barcode
 * @param barcode The HIBC barcode to decode
 * @returns Decoded HIBC data
 */
export function decode(barcode: unknown): DecodedHIBC {
  let decoded: DecodedHIBC = {};

  // Safety check for string
  if (typeof barcode !== "string") {
    return { error: HIBCError.BarcodeNotAString };
  }

  // Clone the barcode
  let barcodeStr = barcode as string;
  decoded.barcode = barcodeStr;

  // Remove leading *
  if (barcodeStr.charAt(0) === "*") {
    barcodeStr = barcodeStr.substring(1);
    if (!barcodeStr) {
      decoded.error = HIBCError.EmptyBarcode;
      return decoded;
    }
  }

  // Remove trailing *
  if (barcodeStr.charAt(barcodeStr.length - 1) === "*") {
    barcodeStr = barcodeStr.substring(0, barcodeStr.length - 1);
    if (!barcodeStr) {
      decoded.error = HIBCError.EmptyBarcode;
      return decoded;
    }
  }

  // Check for + character
  if (barcodeStr.charAt(0) !== "+") {
    decoded.error = HIBCError.BarcodeNotHIBC;
    return decoded;
  } else {
    barcodeStr = barcodeStr.substring(1);
  }

  // Minimum barcode length
  if (barcodeStr.length < 4) {
    decoded.error = HIBCError.InvalidBarcode;
    return decoded;
  }

  // Check and Link characters can contain a "/" so remove them to not affect the split
  const potentialCheckAndLinkCharacters = barcodeStr.substring(
    barcodeStr.length - 2
  );
  barcodeStr = barcodeStr.substring(0, barcodeStr.length - 2);

  const array = barcodeStr.split("/");
  if (array.length === 1) {
    if (matchesLetters(array[0].charAt(0))) {
      decoded = processLine1(
        decoded,
        HIBCType.Line1,
        array[0] + potentialCheckAndLinkCharacters
      );
    } else {
      decoded = processLine2(
        decoded,
        HIBCType.Line2,
        array[0] + potentialCheckAndLinkCharacters
      );
    }
    return decoded;
  } else if (array.length === 2) {
    decoded = processLine1(decoded, HIBCType.Concatenated, array[0]);
    const line2 = processLine2(
      {},
      HIBCType.Concatenated,
      array[1] + potentialCheckAndLinkCharacters
    );
    // Merge properties
    decoded = { ...decoded, ...line2 };
    return decoded;
  } else {
    decoded.error = HIBCError.InvalidBarcode;
    return decoded;
  }
}

function processLine1(
  decoded: DecodedHIBC,
  t: number,
  barcode: string
): DecodedHIBC {
  decoded.type = t;
  if (barcode.length < 4) {
    decoded.error = HIBCError.InvalidLine1;
    return decoded;
  }

  decoded.labelerId = barcode.substring(0, 4);
  barcode = barcode.substring(4);

  if (!barcode) {
    decoded.error = HIBCError.InvalidLine1;
    return decoded;
  }

  // If Concatenated the check char is in the second part of the barcode
  if (decoded.type !== HIBCType.Concatenated) {
    decoded.check = barcode.charAt(barcode.length - 1);
    barcode = barcode.substring(0, barcode.length - 1);
    if (!barcode) {
      decoded.error = HIBCError.InvalidLine1;
      return decoded;
    }
  }

  decoded.uom = parseInt(barcode.charAt(barcode.length - 1), 10);
  barcode = barcode.substring(0, barcode.length - 1);
  if (!barcode) {
    decoded.error = HIBCError.InvalidLine1;
    return decoded;
  }
  decoded.product = barcode;
  return decoded;
}

function processLine2(
  decoded: DecodedHIBC,
  t: number,
  barcode: string
): DecodedHIBC {
  decoded.type = t;
  if (barcode.length > 0 && !isNaN(Number(barcode.charAt(0)))) {
    if (barcode.length < 5) {
      decoded.error = HIBCError.InvalidDate;
      return decoded;
    }
    const dateStr = barcode.substring(0, 5);
    const year = 2000 + parseInt(dateStr.substring(0, 2), 10);
    const day = parseInt(dateStr.substring(2, 5), 10);

    // Create a date from year and day of year
    const date = new Date(year, 0);
    date.setDate(day);
    decoded.date = date;

    return {
      ...decoded,
      ...decodeLotSerialCheckLink(barcode.substring(5), t, "lot"),
    };
  } else if (
    barcode.length > 2 &&
    barcode.charAt(0) === "$" &&
    !isNaN(Number(barcode.charAt(1)))
  ) {
    return {
      ...decoded,
      ...decodeLotSerialCheckLink(barcode.substring(1), t, "lot"),
    };
  } else if (
    barcode.length > 3 &&
    barcode.substring(0, 2) === "$+" &&
    !isNaN(Number(barcode.charAt(2)))
  ) {
    return {
      ...decoded,
      ...decodeLotSerialCheckLink(barcode.substring(2), t, "serial"),
    };
  } else if (
    barcode.length > 3 &&
    barcode.substring(0, 2) === "$$" &&
    !isNaN(Number(barcode.charAt(2)))
  ) {
    const result = {
      ...decoded,
      ...decodeLotSerialCheckLink(barcode.substring(2), t, "lot"),
    };
    if (!result.error) {
      extractDateFromString(result, "lot", "date");
    }
    return result;
  } else if (barcode.length > 3 && barcode.substring(0, 3) === "$$+") {
    const result = {
      ...decoded,
      ...decodeLotSerialCheckLink(barcode.substring(3), t, "serial"),
    };
    if (!result.error) {
      extractDateFromString(result, "serial", "date");
    }
    return result;
  } else {
    decoded.error = HIBCError.InvalidBarcode;
    return decoded;
  }
}

function decodeLotSerialCheckLink(
  str: string,
  barcodeType: number,
  propertyName: "lot" | "serial"
): DecodedHIBC {
  if (!str) {
    return {
      error: HIBCError.EmptyCheckCharacter,
    };
  }

  const decoded: DecodedHIBC = {};

  decoded.lot = str;
  str = extractQuantityFromString(decoded, str, "quantity");

  // Check character
  decoded.check = str.substring(str.length - 1);
  str = str.substring(0, str.length - 1);

  // LotOrSerial and LinkCharacter
  if (barcodeType === HIBCType.Line2) {
    if (!str) {
      return {
        error: HIBCError.EmptyLinkCharacter,
      };
    }
    decoded.link = str.substring(str.length - 1);
    decoded[propertyName] = str.substring(0, str.length - 1);
  } else {
    decoded[propertyName] = str;
  }

  return decoded;
}

function extractDateFromString(
  object: DecodedHIBC,
  stringProperty: "lot" | "serial",
  dateProperty: "date"
): void {
  const str = object[stringProperty];
  if (typeof str !== "string" || !str) {
    return;
  }

  const hibcDateFormat = parseInt(str.substring(0, 1), 10);
  if (isNaN(hibcDateFormat)) {
    object.error = HIBCError.InvalidDate;
    return;
  }

  const fullStr = str.substring(1);
  let dateStr: string;

  switch (hibcDateFormat) {
    case 0:
    case 1: {
      if (fullStr.length < 4) {
        object.error = HIBCError.InvalidDate;
        return;
      }
      dateStr = fullStr.substring(0, 4);

      // Parse MMYY
      const month = parseInt(dateStr.substring(0, 2), 10) - 1; // 0-based month
      const year = 2000 + parseInt(dateStr.substring(2, 4), 10);
      object[dateProperty] = new Date(year, month, 1);
      break;
    }

    case 2: {
      if (fullStr.length < 6) {
        object.error = HIBCError.InvalidDate;
        return;
      }
      dateStr = fullStr.substring(0, 6);

      // Parse MMDDYY
      const month2 = parseInt(dateStr.substring(0, 2), 10) - 1;
      const day2 = parseInt(dateStr.substring(2, 4), 10);
      const year2 = 2000 + parseInt(dateStr.substring(4, 6), 10);
      object[dateProperty] = new Date(year2, month2, day2);
      break;
    }

    case 3: {
      if (fullStr.length < 6) {
        object.error = HIBCError.InvalidDate;
        return;
      }
      dateStr = fullStr.substring(0, 6);

      // Parse YYMMDD
      const year3 = 2000 + parseInt(dateStr.substring(0, 2), 10);
      const month3 = parseInt(dateStr.substring(2, 4), 10) - 1;
      const day3 = parseInt(dateStr.substring(4, 6), 10);
      object[dateProperty] = new Date(year3, month3, day3);
      break;
    }

    case 4: {
      if (fullStr.length < 8) {
        object.error = HIBCError.InvalidDate;
        return;
      }
      dateStr = fullStr.substring(0, 8);

      // Parse YYMMDDHH
      const year4 = 2000 + parseInt(dateStr.substring(0, 2), 10);
      const month4 = parseInt(dateStr.substring(2, 4), 10) - 1;
      const day4 = parseInt(dateStr.substring(4, 6), 10);
      const hour4 = parseInt(dateStr.substring(6, 8), 10);
      const date4 = new Date(year4, month4, day4);
      date4.setHours(hour4);
      object[dateProperty] = date4;
      break;
    }

    case 5: {
      if (fullStr.length < 5) {
        object.error = HIBCError.InvalidDate;
        return;
      }
      dateStr = fullStr.substring(0, 5);

      // Parse YYDDD (Julian date)
      const year5 = 2000 + parseInt(dateStr.substring(0, 2), 10);
      const dayOfYear = parseInt(dateStr.substring(2, 5), 10);
      const date5 = new Date(year5, 0, 1);
      date5.setDate(dayOfYear);
      object[dateProperty] = date5;
      break;
    }

    case 6: {
      if (fullStr.length < 7) {
        object.error = HIBCError.InvalidDate;
        return;
      }
      dateStr = fullStr.substring(0, 7);

      // Parse YYDDDHH (Julian date with hour)
      const year6 = 2000 + parseInt(dateStr.substring(0, 2), 10);
      const dayOfYear6 = parseInt(dateStr.substring(2, 5), 10);
      const hour6 = parseInt(dateStr.substring(5, 7), 10);
      const date6 = new Date(year6, 0, 1);
      date6.setDate(dayOfYear6);
      date6.setHours(hour6);
      object[dateProperty] = date6;
      break;
    }

    case 7:
      // No date following the 7
      object[stringProperty] = fullStr;
      return;

    default:
      // No date char
      return;
  }

  // Update the string property to remove the date part
  if (fullStr.length > dateStr.length) {
    object[stringProperty] = fullStr.substring(dateStr.length);
  } else {
    object[stringProperty] = "";
  }
}

function extractQuantityFromString(
  object: DecodedHIBC,
  str: string,
  quantityProperty: "quantity"
): string {
  const i = parseInt(str.charAt(0), 10);
  if (isNaN(i)) {
    return str;
  }

  let length: number;
  switch (i) {
    case 8:
      length = 2;
      break;
    case 9:
      length = 5;
      break;
    default:
      // No qty
      return str;
  }

  str = str.substring(1);
  if (str.length < length) {
    object.error = HIBCError.InvalidQuantity;
    return str;
  }

  const quantity = parseInt(str.substring(0, length), 10);
  str = str.substring(length);

  if (isNaN(quantity)) {
    object.error = HIBCError.InvalidQuantity;
    return str;
  }

  object[quantityProperty] = quantity;

  return str;
}

/**
 * Checks if two HIBC parts (Line1 and Line2) match
 * @param line1 First decoded HIBC part
 * @param line2 Second decoded HIBC part
 * @returns True if the parts match
 */
export function isMatch(line1: DecodedHIBC, line2: DecodedHIBC): boolean {
  if (
    !line1 ||
    !line2 ||
    line1.type !== HIBCType.Line1 ||
    line2.type !== HIBCType.Line2
  ) {
    return false;
  }

  return line1.check === line2.link;
}

function matchesLetters(character: string): boolean {
  const letters = /^[a-zA-Z]+$/;
  return letters.test(character);
}

/**
 * Used for internal validation. Currently not used externally.
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function matchesNumbers(character: string): boolean {
  const numbers = /^[0-9]+$/;
  return numbers.test(character);
}

// Export the HIBC module
export const HIBC = {
  decode,
  isMatch,
  type: HIBCType,
  errors: HIBCError,
};

export default HIBC;
