export interface ScanSetup {
  stockCount: boolean;
  storageSite: string;
  movementCode: string;
  location: string;
  addRefMode: boolean;
  expiredTime: number;
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
  ref?: string;
  notInERP?: boolean;
}
