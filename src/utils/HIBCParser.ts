// HIBC Health Industry Bar Code parser

interface ParsedHIBCData {
    gtin?: string;
    batchLot?: string;
    expirationDate?: string;
    serialNumber?: string;
    product?: string;
    labelerId?: string;
    [key: string]: string | undefined;
  }
  
  export function parseHIBC(barcode: string): ParsedHIBCData {
    try {
      // Check if this is a HIBC barcode
      if (!isHIBCBarcode(barcode)) {
        throw new Error("Not a HIBC barcode");
      }
  
      // Normalize barcode - remove leading/trailing asterisks and the + prefix
      barcode = normalizeHIBCBarcode(barcode);
  
      // Split barcode into primary and secondary parts if applicable
      const parts = barcode.split("/");
      const result: ParsedHIBCData = {};
  
      // Parse primary part (always available)
      if (parts.length >= 1) {
        const primaryPart = parts[0];
        parseHIBCPrimaryPart(primaryPart, result);
      }
  
      // Parse secondary part if available
      if (parts.length >= 2) {
        const secondaryPart = parts[1];
        parseHIBCSecondaryPart(secondaryPart, result);
      }
  
      if (Object.keys(result).length === 0) {
        throw new Error("Failed to parse HIBC barcode");
      }
  
      return result;
    } catch (error) {
      throw new Error(`Invalid HIBC barcode format: ${error}`);
    }
  }
  
  // Helper function to check if a barcode is HIBC format
  function isHIBCBarcode(barcode: string): boolean {
    // Remove leading/trailing * characters
    const cleanBarcode = barcode.replace(/^\*|\*$/g, "");
    
    // HIBC barcodes start with +
    return cleanBarcode.startsWith("+");
  }
  
  // Helper function to normalize HIBC barcode
  function normalizeHIBCBarcode(barcode: string): string {
    // Remove leading/trailing * characters (used in some barcode formats)
    let cleanBarcode = barcode.replace(/^\*|\*$/g, "");
    
    // Remove the + at the beginning
    if (cleanBarcode.startsWith("+")) {
      cleanBarcode = cleanBarcode.substring(1);
    }
    
    return cleanBarcode;
  }
  
  // Parse the primary part of HIBC barcode
  function parseHIBCPrimaryPart(primaryCode: string, result: ParsedHIBCData): void {
    // HIBC primary part is structured as: LLLLPPPPC
    // Where LLLL is the labeler ID, PPPP is the product/catalog number, C is a check character
    
    // Minimum length should be 5 (4 char labeler ID + at least 1 for product/check)
    if (primaryCode.length < 5) {
      throw new Error("Invalid HIBC primary code - too short");
    }
    
    // Extract labeler ID (first 4 characters)
    result.labelerId = primaryCode.substring(0, 4);
    
    // Get last character (check character)
    const checkCharacter = primaryCode.charAt(primaryCode.length - 1);
    
    // Get product code (between labeler ID and check character)
    result.product = primaryCode.substring(4, primaryCode.length - 1);
    
    // Set a GTIN-like field for compatibility with GS1
    result.gtin = `HIBC:${result.labelerId}${result.product}`;
  }
  
  // Parse the secondary part of HIBC barcode
  function parseHIBCSecondaryPart(secondaryCode: string, result: ParsedHIBCData): void {
    // The secondary part can have various formats for lot number, expiration date, etc.
    // Common formats include:
    // - Just a lot number
    // - YYDDD (Julian date) + lot number
    // - $$ prefix + date code + lot number
    
    // Check for Julian date format at the beginning (YYDDD)
    if (secondaryCode.length >= 5 && /^\d{5}/.test(secondaryCode)) {
      const julianDate = secondaryCode.substring(0, 5);
      result.expirationDate = convertJulianDateToISO(julianDate);
      
      // The rest is the lot number
      if (secondaryCode.length > 5) {
        result.batchLot = secondaryCode.substring(5);
      }
      return;
    }
    
    // Check for lot number with $ prefix
    if (secondaryCode.startsWith("$") && secondaryCode.length > 1) {
      result.batchLot = secondaryCode.substring(1);
      return;
    }
    
    // Check for serial number with $+ prefix
    if (secondaryCode.startsWith("$+") && secondaryCode.length > 2) {
      result.serialNumber = secondaryCode.substring(2);
      return;
    }
    
    // Check for lot with embedded date - $$ format
    if (secondaryCode.startsWith("$$") && secondaryCode.length > 3) {
      const dateFormatCode = secondaryCode.charAt(2);
      const dateValue = extractDateFromHIBCSecondary(secondaryCode.substring(2));
      
      if (dateValue) {
        result.expirationDate = dateValue.dateString;
        result.batchLot = dateValue.remainingText;
      } else {
        // If no valid date found, treat as regular lot number
        result.batchLot = secondaryCode.substring(2);
      }
      return;
    }
    
    // Default - treat as lot number
    result.batchLot = secondaryCode;
  }
  
  // Helper function to convert Julian date format YYDDD to ISO format
  function convertJulianDateToISO(julianDate: string): string {
    try {
      const year = parseInt(julianDate.substring(0, 2), 10);
      const dayOfYear = parseInt(julianDate.substring(2, 5), 10);
      
      // Convert 2-digit year to 4-digit year
      const fullYear = year + (year >= 50 ? 1900 : 2000);
      
      // Create date from year and day of year
      const date = new Date(fullYear, 0); // January 1st of the year
      date.setDate(dayOfYear); // Add days
      
      // Format as ISO date string YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      return ""; // Return empty string on parsing error
    }
  }
  
  // Helper to extract date from HIBC secondary part
  function extractDateFromHIBCSecondary(text: string): { dateString: string, remainingText: string } | null {
    if (text.length < 2) return null;
    
    const formatIndicator = text.charAt(0);
    let format = "";
    let dateLength = 0;
    
    // Determine date format based on indicator
    switch (formatIndicator) {
      case "0":
      case "1":
        format = "MMYY";
        dateLength = 4;
        break;
      case "2":
        format = "MMDDYY";
        dateLength = 6;
        break;
      case "3":
        format = "YYMMDD";
        dateLength = 6;
        break;
      case "4":
        format = "YYMMDDHH";
        dateLength = 8;
        break;
      case "5":
        format = "YYDDD";
        dateLength = 5;
        break;
      case "6":
        format = "YYDDDHH";
        dateLength = 7;
        break;
      default:
        return null; // Unrecognized format
    }
    
    // Check if there's enough characters for the date
    if (text.length <= dateLength) return null;
    
    const dateText = text.substring(1, dateLength + 1);
    const remainingText = text.substring(dateLength + 1);
    
    // Convert the date based on its format
    let dateString = "";
    
    try {
      // Extract date components based on format
      let year, month, day;
      
      switch (format) {
        case "MMYY":
          month = parseInt(dateText.substring(0, 2), 10) - 1; // JS months are 0-indexed
          year = parseInt(dateText.substring(2, 4), 10);
          year = year + (year >= 50 ? 1900 : 2000); // Y2K logic
          
          // Create date (15th of the month as default day)
          const date1 = new Date(year, month, 15);
          dateString = date1.toISOString().split('T')[0];
          break;
          
        case "MMDDYY":
          month = parseInt(dateText.substring(0, 2), 10) - 1;
          day = parseInt(dateText.substring(2, 4), 10);
          year = parseInt(dateText.substring(4, 6), 10);
          year = year + (year >= 50 ? 1900 : 2000);
          
          const date2 = new Date(year, month, day);
          dateString = date2.toISOString().split('T')[0];
          break;
          
        case "YYMMDD":
          year = parseInt(dateText.substring(0, 2), 10);
          year = year + (year >= 50 ? 1900 : 2000);
          month = parseInt(dateText.substring(2, 4), 10) - 1;
          day = parseInt(dateText.substring(4, 6), 10);
          
          const date3 = new Date(year, month, day);
          dateString = date3.toISOString().split('T')[0];
          break;
          
        case "YYDDD":
          return { 
            dateString: convertJulianDateToISO(dateText), 
            remainingText 
          };
          
        default:
          // For other formats, we'll need a more sophisticated approach
          // For now, we'll return a simple date string
          dateString = "2000-01-01"; // Placeholder
      }
      
      return { dateString, remainingText };
    } catch (error) {
      return null; // Return null on date parsing error
    }
  }