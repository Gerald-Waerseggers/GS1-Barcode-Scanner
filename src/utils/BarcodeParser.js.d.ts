export interface ParsedElement {
  ai: string;
  dataTitle: string;
  data: string | number | Date;
  unit: string;
  raw: string;
}

export interface ParsedBarcode {
  codeName: string;
  parsedCodeItems: ParsedElement[];
}

export function parseBarcode(barcode: string): ParsedBarcode;
