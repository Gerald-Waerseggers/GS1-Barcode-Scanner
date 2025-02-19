import toast from "react-hot-toast";

export async function loadMappingFile(
  filename: string
): Promise<string | null> {
  try {
    const root = await navigator.storage.getDirectory();
    try {
      const fileHandle = await root.getFileHandle(filename);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch {
      // File doesn't exist, create it with empty mapping
      const emptyMapping = {
        gtinToRef: {},
        refToGtins: {},
      };
      await saveMappingFile(filename, JSON.stringify(emptyMapping));
      return JSON.stringify(emptyMapping);
    }
  } catch (error) {
    toast.error("Failed to access OPFS: " + error);
    return null;
  }
}

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
    toast.error("Failed to save file to OPFS: " + error);
  }
}

interface ERPStockCount {
  ref: string;
  lotNumber: string;
  location: string;
  quantity: number;
}

export async function loadERPStockCount(file: File): Promise<ERPStockCount[]> {
  try {
    const text = await file.text();
    const lines = text.split("\n");
    const stockCounts: ERPStockCount[] = [];

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
      const [indicator, ref, lotNumber, location, quantity] = line.split(";");

      // Skip if not a stock line or missing required data
      if (indicator !== "S" || !ref || !location) {
        console.warn(`Skipping invalid line ${i + 1}: ${line}`);
        continue;
      }

      // Only process items with location containing 'MM001'
      if (location.includes("MM001")) {
        stockCounts.push({
          ref: ref.trim(),
          lotNumber: lotNumber?.trim() || "",
          location: location.trim(),
          quantity: Number(quantity) || 0,
        });
      }
    }

    if (stockCounts.length === 0) {
      throw new Error("No valid stock counts found in file");
    }

    console.log("Loaded stock counts:", stockCounts); // Debug log
    await saveERPStockCount("erp-stock.json", JSON.stringify(stockCounts));
    return stockCounts;
  } catch (error) {
    console.error("Failed to load ERP stock count:", error); // Debug log
    toast.error("Failed to load ERP stock count: " + error);
    return [];
  }
}

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
    toast.error("Failed to save ERP stock count: " + error);
  }
}

export async function getERPStockCount(
  filename: string = "erp-stock.json"
): Promise<ERPStockCount[]> {
  try {
    const content = await loadMappingFile(filename);
    return content ? JSON.parse(content) : [];
  } catch (error) {
    toast.error("Failed to load ERP stock count: " + error);
    return [];
  }
}

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
