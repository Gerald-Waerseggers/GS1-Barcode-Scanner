import { exportScansToCSV } from '../exportScans';
import { exportStockCountCSV } from '../stockCountExport';
import { ScanRecord, ScanSetup } from '../../types';
import toast from 'react-hot-toast';

/**
 * Handles exporting scans to CSV based on the setup configuration
 */
export const handleExport = async (
  scans: ScanRecord[], 
  setupInfo: ScanSetup,
  onExportInfoShow: () => void,
  onStockReceiptExportInfoShow: () => void
) => {
  try {
    if (setupInfo.stockCount) {
      await exportStockCountCSV(scans, setupInfo);
      onExportInfoShow();
    } else {
      await exportScansToCSV(scans, setupInfo);
      onStockReceiptExportInfoShow();
    }
    toast.success("Export completed successfully");
    return true;
  } catch (error) {
    console.error("Export failed:", error);
    toast.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};
