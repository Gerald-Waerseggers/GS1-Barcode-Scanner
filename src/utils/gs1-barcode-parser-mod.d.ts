declare module "gs1-barcode-parser-mod" {
  export class GS1BarcodeParser {
    parse(barcode: string): {
      gtin?: string;
      batchNumber?: string;
      expirationDate?: string;
      serialNumber?: string;
      [key: string]: string | undefined;
    };
  }
}
