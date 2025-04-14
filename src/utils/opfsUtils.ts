import toast from "react-hot-toast";

/**
 * Loads a file from the Origin Private File System
 * @param filename The name of the file to load
 * @returns The file contents as a string, or null if an error occurs
 */
export async function loadMappingFile(
  filename: string
): Promise<string | null> {
  try {
    // Get the root directory of the origin private file system
    const root = await navigator.storage.getDirectory();
    try {
      // Try to get the file handle for the specified file
      const fileHandle = await root.getFileHandle(filename);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      // File doesn't exist, create it with empty mapping
      const emptyMapping = {
        gtinToRef: {},
        refToGtins: {},
      };
      await saveMappingFile(filename, JSON.stringify(emptyMapping));
      return JSON.stringify(emptyMapping);
    }
  } catch (error) {
    toast.error(
      `Failed to access OPFS: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Saves a file to the Origin Private File System
 * @param filename The name of the file to save
 * @param content The content to save to the file
 * @returns A promise that resolves when the save is complete
 */
export async function saveMappingFile(
  filename: string,
  content: string
): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (error) {
    toast.error(
      `Failed to save file to OPFS: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Represents a stock count item from the ERP system
 */
export interface ERPStockCount {
  ref: string;
  lotNumber: string;
  location: string;
  quantity: number;
}

/**
 * Loads and parses a stock count file from the ERP system
 * @param file The file to load
 * @param location The location to filter by
 * @returns An object with filtered stock counts and all REFs
 */
export async function loadERPStockCount(
  file: File,
  location: string
): Promise<{ stockCounts: ERPStockCount[]; allRefs: Set<string> }> {
  try {
    const text = await file.text();
    const lines = text.split("\n");
    const stockCounts: ERPStockCount[] = [];
    const allRefs = new Set<string>(); // To track all REFs in the file

    // Validate file format using the first non-empty line
    const firstLine = lines.find((line) => line.trim() !== "");
    if (!firstLine) {
      throw new Error("File is empty");
    }

    const parts = firstLine.split(";");
    if (parts.length !== 5 || parts[0] !== "S") {
      throw new Error(
        "Invalid file format. Expected: S;REF;Lot;Location;Quantity"
      );
    }

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      // Format: S;REF;LOT;LOCATION;QUANTITY
      const [indicator, ref, lotNumber, erpLocation, quantityStr] =
        line.split(";");

      // Skip if not a stock line or missing required data
      if (indicator !== "S" || !ref || !erpLocation) {
        console.warn(`Skipping invalid line ${i + 1}: ${line}`);
        continue;
      }

      // Add to allRefs regardless of location
      if (ref.trim()) {
        allRefs.add(ref.trim());
      }

      // Only process items with location containing the specified location
      if (erpLocation.includes(location)) {
        const quantity = Number(quantityStr) || 0;

        stockCounts.push({
          ref: ref.trim(),
          lotNumber: lotNumber?.trim() || "",
          location: erpLocation.trim(),
          quantity,
        });
      }
    }

    if (stockCounts.length === 0) {
      throw new Error("No valid stock counts found in file for this location");
    }

    console.log(
      `Loaded ${stockCounts.length} stock counts and ${allRefs.size} unique REFs`
    );

    // Save both the filtered stock counts and all refs
    await saveERPStockCount("erp-stock.json", JSON.stringify(stockCounts));
    await saveERPStockCount(
      "all-erp-refs.json",
      JSON.stringify(Array.from(allRefs))
    );

    return { stockCounts, allRefs };
  } catch (error) {
    console.error("Failed to load ERP stock count:", error);
    toast.error(
      `Failed to load ERP stock count: ${error instanceof Error ? error.message : String(error)}`
    );
    return { stockCounts: [], allRefs: new Set() };
  }
}

/**
 * Gets all REFs from the ERP database
 * @returns A Set of all REF values from the ERP database
 */
export async function getAllERPRefs(): Promise<Set<string>> {
  try {
    const content = await loadMappingFile("all-erp-refs.json");
    return content ? new Set(JSON.parse(content) as string[]) : new Set();
  } catch (error) {
    console.warn(`No all-erp-refs.json file found: ${error}`);
    return new Set();
  }
}

/**
 * Saves ERP stock count data to a file
 * @param filename The name of the file to save
 * @param content The content to save to the file
 * @returns A promise that resolves when the save is complete
 */
export async function saveERPStockCount(
  filename: string,
  content: string
): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (error) {
    toast.error(
      `Failed to save ERP stock count: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Gets the ERP stock count data from a file
 * @param filename The name of the file to load
 * @returns An array of stock count items
 */
export async function getERPStockCount(
  filename: string = "erp-stock.json"
): Promise<ERPStockCount[]> {
  try {
    const content = await loadMappingFile(filename);
    return content ? (JSON.parse(content) as ERPStockCount[]) : [];
  } catch (error) {
    toast.error(
      `Failed to load ERP stock count: ${error instanceof Error ? error.message : String(error)}`
    );
    return [];
  }
}

/**
 * Deletes an ERP stock count file
 * @param filename The name of the file to delete
 * @returns A promise that resolves when the deletion is complete
 */
export async function deleteERPStockCount(
  filename: string = "erp-stock.json"
): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(filename);
  } catch (error) {
    // Ignore error if file doesn't exist
    console.log("No existing ERP stock count file found");
  }
}
