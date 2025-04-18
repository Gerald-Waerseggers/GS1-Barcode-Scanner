import { Button } from "@headlessui/react";
import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { ScanRecord } from "../types";

interface ScanInputFormProps {
  onScan: (input: string) => void;
  error: string | null;
  addRefMode: boolean;
  onAddManual: () => void;
  pendingScan: {
    data: Partial<ScanRecord>;
    needsInfo: string[];
  } | null;
  onCancelPendingScan: () => void;
}

const ScanInputForm: React.FC<ScanInputFormProps> = ({
  onScan,
  error,
  addRefMode,
  onAddManual,
  pendingScan,
  onCancelPendingScan,
}) => {
  const [input, setInput] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Refocus after scan
  useEffect(() => {
    if (input === "") {
      // This will refocus after a scan is processed and input is cleared
      inputRef.current?.focus();
    }
  }, [input]);

  const handleScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onScan(input);
      setInput("");
      if (!addRefMode) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 10);
      }
    }
  };

  return (
    <div className="mb-6">
      {pendingScan && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-yellow-800">
              Pending Multi-Part Scan
            </h3>
            <Button
              type="button"
              onClick={onCancelPendingScan}
              className="p-1 text-yellow-700 hover:text-yellow-900"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Please scan a second barcode to complete missing information:
            <span className="font-medium">
              {pendingScan.needsInfo.join(", ")}
            </span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-yellow-800">
            {pendingScan.data.gtin && (
              <div>
                <span className="font-medium">GTIN:</span>{" "}
                {pendingScan.data.gtin}
              </div>
            )}
            {pendingScan.data.batchLot && (
              <div>
                <span className="font-medium">Batch/Lot:</span>{" "}
                {pendingScan.data.batchLot}
              </div>
            )}
            {pendingScan.data.expirationDate && (
              <div>
                <span className="font-medium">Expiry:</span>{" "}
                {pendingScan.data.expirationDate}
              </div>
            )}
            {pendingScan.data.ref && (
              <div>
                <span className="font-medium">REF:</span> {pendingScan.data.ref}
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleScan}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              pendingScan
                ? `Scan barcode for ${pendingScan.needsInfo.join(", ")}...`
                : "Scan or type GS1 barcode..."
            }
            autoFocus
          />
          <Button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Scan
          </Button>
          <Button
            type="button"
            onClick={onAddManual}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Manual Entry
          </Button>
        </div>
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default ScanInputForm;
