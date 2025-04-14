import { useState, useEffect } from 'react';
import { ScanRecord, ScanSetup } from '../types';
import { parseGS1 } from '../utils/gs1Parser';
import { playSound } from '../utils/PlaySound';
import toast from 'react-hot-toast';
import { processScannedItem } from '../utils/scan/scanProcessing';
import { ERPStockRow } from '../components/ERPStockModal';

/**
 * Hook to manage scan processing, CRUD operations, and related state
 */
export function useScanManagement(setupInfo: ScanSetup, erpRefs: Set<string>) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedItem, setLastScannedItem] = useState<ScanRecord | null>(null);

  // Handle scan input
  const handleScan = (input: string) => {
    if (!input.trim()) {
      setError("Please enter a barcode");
      return;
    }

    try {
      const parsedData = parseGS1(input.trim());
      if (!parsedData.gtin) {
        setError("Invalid barcode: No GTIN found");
        return;
      }

      // Process the scan
      setScans((prevScans) => {
        return processScannedItem(parsedData, prevScans, setupInfo, erpRefs, setLastScannedItem);
      });

      setError(null);
    } catch (err) {
      toast.error((err as Error).message);
      setError(err instanceof Error ? err.message : "Invalid barcode format");
      playSound("alert");
    }
  };

  // CRUD operations
  const handleDelete = (scan: ScanRecord) => {
    setScans((prev) => prev.filter((s) => s.timestamp !== scan.timestamp));
  };

  const handleEdit = (updatedScan: ScanRecord) => {
    setScans((prev) =>
      prev.map((scan) =>
        scan.timestamp === updatedScan.timestamp ? updatedScan : scan
      )
    );
  };

  const handleAdd = (manualScan: Partial<ScanRecord>) => {
    // Validate manual entry
    if (!manualScan.batchLot && !manualScan.ref) {
      setError("REF AND LOT is required");
      return false;
    }

    try {
      // Create a data object that matches the format produced by parseGS1
      const parsedData = {
        gtin: manualScan.gtin || "",
        ref: manualScan.ref || "",
        batchLot: manualScan.batchLot || "",
        expirationDate: manualScan.expirationDate || "",
        quantity: manualScan.quantity || 1,
      };

      // Process the scan
      setScans((prevScans) => {
        return processScannedItem(parsedData, prevScans, setupInfo, erpRefs, setLastScannedItem);
      });

      setError(null);
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      setError(err instanceof Error ? err.message : "Invalid manual entry format");
      playSound("alert");
      return false;
    }
  };

  const handleSetChange = (scan: ScanRecord, isSet: boolean) => {
    setScans((prev) =>
      prev.map((s) => (s.timestamp === scan.timestamp ? { ...s, isSet } : s))
    );
  };

  const clearScans = () => {
    if (confirm("Are you sure you want to clear all scans?")) {
      setScans([]);
      setLastScannedItem(null);
    }
  };

  // Add zero count records
  const addZeroCountRecords = (selectedItems: ERPStockRow[]) => {
    const currentTimestamp = new Date().toISOString();
    
    const zeroCountRecords = selectedItems.map((item) => ({
      ref: item.ref,
      gtin: "",
      batchLot: item.lotNumber,
      quantity: 0,
      timestamp: currentTimestamp,
      expirationDate: "",
      storageSite: setupInfo.storageSite,
      location: setupInfo.location,
      movementCode: setupInfo.movementCode,
    }));

    setScans((prevScans) => {
      const newScans = [...prevScans];
      const existingKeys = new Set(
        zeroCountRecords.map(
          (record) => `${record.ref}-${record.batchLot}-${record.location}`
        )
      );

      const filteredScans = newScans.filter(
        (scan) =>
          !existingKeys.has(`${scan.ref}-${scan.batchLot}-${scan.location}`)
      );

      return [...filteredScans, ...zeroCountRecords];
    });

    toast.success(`Added ${zeroCountRecords.length} zero count records`);
  };

  // Navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (scans.length > 0) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [scans.length]);

  return {
    scans,
    error,
    lastScannedItem,
    handleScan,
    handleDelete,
    handleEdit,
    handleAdd,
    handleSetChange,
    clearScans,
    addZeroCountRecords,
    setError,
  };
}
