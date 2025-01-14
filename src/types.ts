export interface ScanSetup {
  storageSite: string;
  movementCode: string;
  location: string;
  supplier: string;
  addRefMode: boolean;
}

export interface ScanRecord {
  timestamp: string;
  gtin?: string;
  batchLot?: string;
  quantity?: number;
  expirationDate?: string;
  storageSite: string;
  movementCode: string;
  location: string;
  supplier: string;
  ref?: string;
}
