import { ScanRecord } from '../types';

interface LastScannedItemDisplayProps {
  lastScannedItem: ScanRecord | null;
}

/**
 * Component to display the last scanned item
 */
export default function LastScannedItemDisplay({ lastScannedItem }: LastScannedItemDisplayProps) {
  if (!lastScannedItem) return null;
  
  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-md">
      <h3 className="font-medium text-blue-800">Last Scanned Item</h3>
      <div className="grid grid-cols-3 gap-4 mt-2">
        <div>
          <span className="text-sm text-gray-500">REF/GTIN:</span>
          <span className="ml-2 font-medium">
            {lastScannedItem.ref || lastScannedItem.gtin}
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Batch/Lot:</span>
          <span className="ml-2 font-medium">
            {lastScannedItem.batchLot || "N/A"}
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Quantity:</span>
          <span className="ml-2 font-medium">
            {lastScannedItem.quantity || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
