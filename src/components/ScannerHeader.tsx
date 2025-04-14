import { Button } from "@headlessui/react";
import { ScanLine, Upload, Trash2, Database } from "lucide-react";
import { ScanSetup } from '../types';

interface ScannerHeaderProps {
  setupInfo: ScanSetup;
  onSetupChange: () => void;
  onMappingOpen: () => void;
  onExport: () => void;
  onClear: () => void;
  onERPStockOpen: () => void;
  scanCount: number;
}

/**
 * Component for the scanner header section
 */
export default function ScannerHeader({
  setupInfo,
  onSetupChange,
  onMappingOpen,
  onExport,
  onClear,
  onERPStockOpen,
  scanCount
}: ScannerHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex gap-4">
          <div>
            <span className="text-sm text-gray-500">Movement Code:</span>
            <span className="ml-2 font-medium">
              {setupInfo.movementCode}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Location:</span>
            <span className="ml-2 font-medium">{setupInfo.location}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Add Ref Mode:</span>
            <span className="ml-2 font-medium">
              {setupInfo.addRefMode ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Expiration:</span>
            <span className="ml-2 font-medium">
              {setupInfo.expiredTime} months
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onMappingOpen}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            <Database className="w-4 h-4" />
            Manage Mappings
          </Button>
          <Button
            onClick={onSetupChange}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Change Setup
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Barcode Scanner:{" "}
            {setupInfo.stockCount ? "Stock Count" : "Stock Receipt"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!setupInfo.stockCount}
            onClick={onERPStockOpen}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Zero Count Items
          </Button>
          <Button
            onClick={onExport}
            disabled={scanCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={onClear}
            disabled={scanCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>
    </>
  );
}
