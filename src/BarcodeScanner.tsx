import { useState } from "react";
import { parseGS1 } from "./utils/gs1Parser";
import { Download, Trash2, ScanLine } from "lucide-react";

import EditModal from "./components/EditModal";
import SetupForm from "./components/SetupForm";
import ScanInputForm from "./components/ScanInputForm";
import ScansGrid from "./components/ScansGrid";
import { ScanSetup, ScanRecord } from "./types";

export default function BarcodeScanner() {
  const [isSetup, setIsSetup] = useState(false);
  const [setupInfo, setSetupInfo] = useState<ScanSetup>({
    location: "",
    supplier: "",
  });
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanRecord | null>(null);

  const handleSetupComplete = (setupInfo: ScanSetup) => {
    setSetupInfo(setupInfo);
    setIsSetup(true);
  };

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

      const newScan: ScanRecord = {
        timestamp: new Date().toISOString(),
        ...parsedData,
        ...setupInfo,
      };
      setScans((prev) => [...prev, newScan]);
      setError(null);
    } catch (err) {
      console.error("Scan error:", err);
      setError(err instanceof Error ? err.message : "Invalid barcode format");
    }
  };

  const handleDelete = (scan: ScanRecord) => {
    if (confirm("Are you sure you want to delete this scan?")) {
      setScans((prev) => prev.filter((s) => s.timestamp !== scan.timestamp));
    }
  };

  const handleEdit = (scan: ScanRecord) => {
    setEditingScan(scan);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedScan: ScanRecord) => {
    setScans((prev) =>
      prev.map((scan) =>
        scan.timestamp === updatedScan.timestamp ? updatedScan : scan
      )
    );
    setIsEditModalOpen(false);
    setEditingScan(null);
  };

  const downloadCSV = () => {
    if (scans.length === 0) return;

    const headers = ["Timestamp", "GTIN", "Batch/Lot", "Expiration Date"];
    const csvContent = [
      headers.join(","),
      ...scans.map((scan) =>
        [
          scan.timestamp,
          scan.gtin || "",
          scan.batchLot || "",
          scan.expirationDate || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gs1_barcode_scans_${setupInfo.location}_${
      setupInfo.supplier
    }_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearScans = () => {
    if (confirm("Are you sure you want to clear all scans?")) {
      setScans([]);
    }
  };

  if (!isSetup) {
    return <SetupForm onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-gray-500">Location:</span>
                <span className="ml-2 font-medium">{setupInfo.location}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Supplier:</span>
                <span className="ml-2 font-medium">{setupInfo.supplier}</span>
              </div>
            </div>
            <button
              onClick={() => setIsSetup(false)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Change Setup
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-blue-600" />

              <h1 className="text-2xl font-bold text-gray-800">
                GS1 Barcode Scanner
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                disabled={scans.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={clearScans}
                disabled={scans.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          <ScanInputForm onScan={handleScan} error={error} />

          <ScansGrid
            scans={scans}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingScan(null);
        }}
        scan={editingScan}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
