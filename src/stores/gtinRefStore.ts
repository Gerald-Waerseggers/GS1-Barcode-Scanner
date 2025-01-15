import { loadMappingFile, saveMappingFile } from "../utils/opfsUtils";

interface GTINRefMapping {
  gtinToRef: Map<string, string>;
  refToGtins: Map<string, Set<string>>;
}

class GTINRefStore {
  private static instance: GTINRefStore;
  private mapping: GTINRefMapping;
  private readonly STORAGE_KEY = "gtin-ref-mapping";
  private readonly FILENAME = "gtin-ref-mapping.json";

  private constructor() {
    this.mapping = {
      gtinToRef: new Map(),
      refToGtins: new Map(),
    };
    this.loadFromOPFS();
  }

  static getInstance(): GTINRefStore {
    if (!GTINRefStore.instance) {
      GTINRefStore.instance = new GTINRefStore();
    }
    return GTINRefStore.instance;
  }

  private async loadFromOPFS() {
    const contents = await loadMappingFile(this.FILENAME);
    if (contents) {
      const data = JSON.parse(contents);
      Object.entries(data.gtinToRef).forEach(([gtin, ref]) => {
        this.addMapping(gtin, ref as string, false);
      });
    }
  }

  private async saveToOPFS() {
    const data = {
      gtinToRef: Object.fromEntries(this.mapping.gtinToRef),
    };
    const jsonData = JSON.stringify(data);
    await saveMappingFile(this.FILENAME, jsonData);
  }

  /* private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data.gtinToRef).forEach(([gtin, ref]) => {
          this.addMapping(gtin, ref as string, false);
        });
      }
    } catch (error) {
      console.warn("Failed to load GTIN-REF mapping from localStorage:", error);
    }
  }

  private saveToLocalStorage() {
    try {
      const data = {
        gtinToRef: Object.fromEntries(this.mapping.gtinToRef),
        refToGtins: Object.fromEntries(
          Array.from(this.mapping.refToGtins.entries()).map(([ref, gtins]) => [
            ref,
            Array.from(gtins),
          ])
        ),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save GTIN-REF mapping to localStorage:", error);
    }
  } */

  exportToCSV() {
    const csvContent = [
      "GTIN,REF",
      ...Array.from(this.mapping.gtinToRef.entries()).map(
        ([gtin, ref]) => `${gtin},${ref}`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gtin-ref-mapping.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  importFromCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");

      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const [gtin, ref] = lines[i].split(",");
        if (gtin && ref) {
          this.addMapping(gtin.trim(), ref.trim(), true);
        }
      }
    };
    reader.readAsText(file);
  }

  async addMapping(gtin: string, ref: string, shouldSave = true) {
    this.mapping.gtinToRef.set(gtin, ref);

    if (!this.mapping.refToGtins.has(ref)) {
      this.mapping.refToGtins.set(ref, new Set());
    }
    this.mapping.refToGtins.get(ref)?.add(gtin);

    if (shouldSave) {
      await this.saveToOPFS();
    }
  }

  async getRefForGtin(gtin: string): Promise<string | undefined> {
    return this.mapping.gtinToRef.get(gtin);
  }

  async getGtinsForRef(ref: string): Promise<string[]> {
    return Array.from(this.mapping.refToGtins.get(ref) || []);
  }
}

export const gtinRefStore = GTINRefStore.getInstance();
