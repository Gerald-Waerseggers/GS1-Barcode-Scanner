import { useState, useEffect } from "react";
import { parseGS1 } from "./utils/gs1Parser";
import { Trash2, ScanLine, Database, Upload } from "lucide-react";
import { exportScansToCSV } from "./utils/exportScans";

import EditModal from "./components/EditModal";
import SetupForm from "./components/SetupForm";
import ScanInputForm from "./components/ScanInputForm";
import ScansGrid from "./components/ScansGrid";
import { ScanSetup, ScanRecord } from "./types";
import AddModal from "./components/AddModal";
import DeleteModal from "./components/DeleteModal";
import { Button } from "@headlessui/react";
import MappingModal from "./components/MappingModal";
import { exportStockCountCSV } from "./utils/stockCountExport";
import toast from "react-hot-toast";
import ERPStockModal from "./components/ERPStockModal";
import ExportInfoModal from "./components/ExportInfoModal";
import StockReceiptExportInfoModal from "./components/StockReceiptExportInfoModal";

export default function BarcodeScanner() {
  const [isSetup, setIsSetup] = useState(false);
  const [setupInfo, setSetupInfo] = useState<ScanSetup>({
    stockCount: false,
    storageSite: "",
    movementCode: "",
    location: "",
    addRefMode: true,
  });
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingScan, setDeletingScan] = useState<ScanRecord | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isERPStockModalOpen, setIsERPStockModalOpen] = useState(false);
  const [showExportInfo, setShowExportInfo] = useState(false);
  const [showStockReceiptExportInfo, setShowStockReceiptExportInfo] =
    useState(false);

  const handleSetupComplete = (newSetupInfo: ScanSetup) => {
    setSetupInfo((prevSetup) => ({
      ...prevSetup,
      ...newSetupInfo,
    }));
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
        ref: setupInfo.addRefMode ? "" : undefined,
      };
      setScans((prev) => [...prev, newScan]);
      setError(null);
    } catch (err) {
      toast.error((err as Error).message);
      setError(err instanceof Error ? err.message : "Invalid barcode format");
    }
  };

  const handleDelete = (scan: ScanRecord) => {
    setDeletingScan(scan);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (scan: ScanRecord) => {
    setScans((prev) => prev.filter((s) => s.timestamp !== scan.timestamp));
    setIsDeleteModalOpen(false);
    setDeletingScan(null);
  };

  const handleEdit = (scan: ScanRecord) => {
    setEditingScan(scan);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedScan: ScanRecord) => {
    setScans((prev) =>
      prev.map((scan) =>
        scan.timestamp === updatedScan.timestamp ? updatedScan : scan,
      ),
    );
    setIsEditModalOpen(false);
    setEditingScan(null);
  };

  const downloadCSV = async () => {
    if (setupInfo.stockCount) {
      await exportStockCountCSV(scans, setupInfo);
      toast.success("Export completed successfully");
    } else {
      await exportScansToCSV(scans, setupInfo);
      toast.success("Export completed successfully");
    }
  };

  const clearScans = () => {
    if (confirm("Are you sure you want to clear all scans?")) {
      setScans([]);
    }
  };

  const handleAddManual = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (newScan: ScanRecord) => {
    setScans((prev) => [...prev, newScan]);
    setIsAddModalOpen(false);
  };

  const handleZeroCountSelection = async (selectedItems: ERPStockRow[]) => {
    // Get current timestamp in the correct format
    const currentTimestamp = new Date().toISOString();

    // Create zero count records from selected items
    const zeroCountRecords = selectedItems.map((item) => ({
      ref: item.ref,
      gtin: "", // Empty GTIN for zero count records
      batchLot: item.lotNumber,
      quantity: 0, // Set quantity to 0
      timestamp: currentTimestamp, // Use timestamp instead of scannedAt
      expirationDate: "", // Empty expiration date for zero count records
      ...setupInfo, // Include setup info for consistency
    }));

    console.log("Creating zero count records:", zeroCountRecords);

    // Add zero count records to scans, ensuring no duplicates
    setScans((prevScans) => {
      const newScans = [...prevScans];

      // Create a set of existing keys to avoid duplicates
      const existingKeys = new Set(
        zeroCountRecords.map(
          (record) => `${record.ref}-${record.batchLot}-${record.location}`,
        ),
      );

      // Filter out any existing scans that match the zero count records
      const filteredScans = newScans.filter(
        (scan) =>
          !existingKeys.has(`${scan.ref}-${scan.batchLot}-${scan.location}`),
      );

      // Combine the filtered scans with the new zero count records
      const finalScans = [...filteredScans, ...zeroCountRecords];
      console.log("Updated scans:", finalScans);
      return finalScans;
    });

    toast.success(`Added ${zeroCountRecords.length} zero count records`);
  };

  const handleExport = async () => {
    try {
      downloadCSV();
      if (setupInfo.stockCount) {
        setShowExportInfo(true);
      } else {
        setShowStockReceiptExportInfo(true);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed: " + error);
    }
  };

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

  if (!isSetup) {
    return (
      <SetupForm
        onSetupComplete={handleSetupComplete}
        initialValues={setupInfo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 h-fit">
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-gray-500">Storage Site:</span>
                <span className="ml-2 font-medium">
                  {setupInfo.storageSite}
                </span>
              </div>
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
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsMappingModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                <Database className="w-4 h-4" />
                Manage Mappings
              </Button>
              <Button
                onClick={() => setIsSetup(false)}
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
                onClick={() => setIsERPStockModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Zero Count Items
              </Button>
              <Button
                onClick={handleExport}
                disabled={scans.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={clearScans}
                disabled={scans.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>

          <ScanInputForm
            onScan={handleScan}
            error={error}
            onAddManual={handleAddManual}
          />

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
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        setupInfo={setupInfo}
        onSave={handleSaveAdd}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingScan(null);
        }}
        scan={deletingScan}
        onConfirm={handleConfirmDelete}
      />
      <MappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
      />
      <ERPStockModal
        isOpen={isERPStockModalOpen}
        onClose={() => setIsERPStockModalOpen(false)}
        onSelectZeroCount={handleZeroCountSelection} // Correctly passing the function
        existingScans={scans}
      />
      <ExportInfoModal
        isOpen={showExportInfo}
        onClose={() => setShowExportInfo(false)}
      />
      <StockReceiptExportInfoModal
        isOpen={showStockReceiptExportInfo}
        onClose={() => setShowStockReceiptExportInfo(false)}
      />
    </div>
  );
}
