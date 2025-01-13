export interface ScanSetup {
    location: string;
    supplier: string;
  }
  
  export interface ScanRecord {
  timestamp: string;
  gtin?: string;
  batchLot?: string;
  quantity?: number;
  expirationDate?: string;
  location: string;
  supplier: string;
  }