import { ScanRecord, ScanSetup } from '../../types';
import { playSound } from '../PlaySound';
import toast from 'react-hot-toast';

/**
 * Checks if a date is expired based on the given threshold
 */
export const isDateExpired = (
  dateStr: string | undefined,
  expiryThresholdMonths: number
) => {
  if (!dateStr) return false;
  const date = new Date();
  if (expiryThresholdMonths > 0) {
    date.setMonth(date.getMonth() + expiryThresholdMonths);
  }
  return new Date(dateStr) < date;
};

/**
 * Process a scanned item and update the scans array accordingly
 */
export const processScannedItem = (
  parsedData: Partial<ScanRecord>,
  prevScans: ScanRecord[],
  setupInfo: ScanSetup,
  erpRefs: Set<string>,
  setLastScannedItem: (scan: ScanRecord | null) => void
) => {
  // Helper function to find matching scan
  const findMatchingItem = (location: string) => {
    if (parsedData.ref) {
      return prevScans.findIndex(
        (scan) =>
          scan.ref === parsedData.ref &&
          (scan.batchLot || "") === (parsedData.batchLot || "") &&
          scan.location === location
      );
    } else if (parsedData.gtin) {
      return prevScans.findIndex(
        (scan) =>
          scan.gtin === parsedData.gtin &&
          (scan.batchLot || "") === (parsedData.batchLot || "") &&
          scan.location === location
      );
    }
    return -1;
  };

  // Find existing items - check both current location and MMPER location
  const currentLocationIndex = findMatchingItem(setupInfo.location);
  const mmperLocationIndex = findMatchingItem("MMPER");

  // Check if the item is expired
  const expiryThresholdMonths = setupInfo.expiredTime || 6;
  const isItemExpired = isDateExpired(
    parsedData.expirationDate,
    expiryThresholdMonths
  );

  // Create a copy of scans to update
  const updatedScans = [...prevScans];

  // CASE 1: Item exists in MMPER location (handle expired items that were previously scanned)
  if (mmperLocationIndex >= 0) {
    const mmperScan = updatedScans[mmperLocationIndex];
    const currentQuantity = mmperScan.quantity || 0;

    // Update quantity of MMPER item
    const updatedMmperScan = {
      ...mmperScan,
      quantity: currentQuantity + 1,
    };
    updatedScans[mmperLocationIndex] = updatedMmperScan;

    playSound("expired");
    toast.success(`Updated expired item in MMPER location`);
    setLastScannedItem(updatedMmperScan);
    return updatedScans;
  }

  // CASE 2: Item exists in current location
  if (currentLocationIndex >= 0) {
    const existingScan = updatedScans[currentLocationIndex];
    const currentQuantity = existingScan.quantity || 0;

    // Check if existing item is expired
    const isExistingExpired = isDateExpired(
      existingScan.expirationDate,
      expiryThresholdMonths
    );

    if (isExistingExpired) {
      // Create a new entry with MMPER location
      const mmperScan: ScanRecord = {
        ...existingScan,
        timestamp: new Date().toISOString(),
        location: "MMPER",
        quantity: 1,
      };

      // Set current location quantity to 0 (keeping it for zero count in export)
      updatedScans[currentLocationIndex] = {
        ...existingScan,
        quantity: 0,
      };

      // Add MMPER entry
      updatedScans.push(mmperScan);

      playSound("expired");
      toast.error(`Expired item moved to MMPER location`);

      // Set the MMPER scan as the last scanned item
      setLastScannedItem(mmperScan);
    } else {
      // Normal non-expired item, just increment quantity
      const updatedScan = {
        ...existingScan,
        quantity: currentQuantity + 1,
      };
      updatedScans[currentLocationIndex] = updatedScan;

      toast.success(
        `Incremented quantity for ${existingScan.ref || existingScan.gtin}`
      );
      playSound("success");

      // Set the updated scan as the last scanned item
      setLastScannedItem(updatedScan);
    }

    return updatedScans;
  }

  // CASE 3: New scan
  const newScan: ScanRecord = {
    timestamp: new Date().toISOString(),
    ...parsedData,
    storageSite: setupInfo.storageSite,
    location: isItemExpired ? "MMPER" : setupInfo.location,
    quantity: 1,
    movementCode: setupInfo.movementCode,
    ref: setupInfo.addRefMode && !parsedData.ref ? "" : parsedData.ref,
  };

  // For expired items, show appropriate notification
  if (isItemExpired) {
    playSound("expired");
    toast.error(`Expired item automatically moved to MMPER location`);
  } else {
    // Normal item
    setTimeout(() => {
      if (newScan.ref === "") {
        playSound("alert");
        toast.error("Missing REF - Please enter a REF for this item");
      } else {
        playSound("success");
        toast.success("Item added successfully");
      }
    }, 100);
  }

  // Check if REF exists in ERP when in stock count mode
  if (setupInfo.stockCount && newScan.ref && erpRefs.size > 0) {
    if (!erpRefs.has(newScan.ref)) {
      toast.error(`Warning: REF "${newScan.ref}" not found in ERP system`);
      newScan.notInERP = true;
    }
  }
  
  return [...updatedScans, newScan];
};
