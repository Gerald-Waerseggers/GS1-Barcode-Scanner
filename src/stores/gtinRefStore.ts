import { loadMappingFile, saveMappingFile } from "../utils/opfsUtils";

interface GTINRefMapping {
  gtinToRef: Map<string, string>;
  refToGtins: Map<string, Set<string>>;
}

class GTINRefStore {
  private static instance: GTINRefStore;
  private mapping: GTINRefMapping;
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
      refToGtins: Object.fromEntries(
        Array.from(this.mapping.refToGtins.entries()).map(([ref, gtins]) => [
          ref,
          Array.from(gtins),
        ]),
      ),
    };
    const jsonData = JSON.stringify(data);
    await saveMappingFile(this.FILENAME, jsonData);
  }

  async addMapping(gtin: string, ref: string, shouldSave = true) {
    // Remove GTIN from its previous REF mapping if it exists
    const oldRef = this.mapping.gtinToRef.get(gtin);
    if (oldRef && oldRef !== ref) {
      this.mapping.refToGtins.get(oldRef)?.delete(gtin);
      // Clean up empty sets
      if (this.mapping.refToGtins.get(oldRef)?.size === 0) {
        this.mapping.refToGtins.delete(oldRef);
      }
    }

    // Add new mappings
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

  async importFromCSV(file: File): Promise<void> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n");

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const [gtin, ref] = lines[i].split(",");
          if (gtin && ref) {
            await this.addMapping(gtin.trim(), ref.trim(), true);
          }
        }
        resolve();
      };
      reader.readAsText(file);
    });
  }

  async getAllMappings(): Promise<{ gtin: string; ref: string }[]> {
    return Array.from(this.mapping.gtinToRef.entries()).map(([gtin, ref]) => ({
      gtin,
      ref,
    }));
  }
}

export const gtinRefStore = GTINRefStore.getInstance();
