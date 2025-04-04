import { useState, useEffect, useRef } from "react";
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
import ERPStockModal, { ERPStockRow } from "./components/ERPStockModal";
import ExportInfoModal from "./components/ExportInfoModal";
import StockReceiptExportInfoModal from "./components/StockReceiptExportInfoModal";
import { getERPStockCount, getAllERPRefs } from "./utils/opfsUtils";
import { playSound } from "./utils/PlaySound";

export default function BarcodeScanner() {
  const [isSetup, setIsSetup] = useState(false);
  const [setupInfo, setSetupInfo] = useState<ScanSetup>({
    stockCount: true,
    storageSite: "MM001",
    movementCode: "",
    location: "",
    addRefMode: true,
    expiredTime: 6,
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
  const [erpRefs, setErpRefs] = useState<Set<string>>(new Set());
  const erpRefsLoaded = useRef(false);
  const [allERPRefs, setAllERPRefs] = useState<Set<string>>(new Set());
  const allERPRefsLoaded = useRef(false);

  // Load ERP REFs when in stock count mode
  useEffect(() => {
    if (setupInfo.stockCount) {
      if (!erpRefsLoaded.current) {
        loadERPRefs();
      }
      if (!allERPRefsLoaded.current) {
        loadAllERPRefs();
      }
    }
  }, [setupInfo.stockCount]);

  const loadERPRefs = async () => {
    try {
      const erpStock = await getERPStockCount();
      const refSet = new Set(erpStock.map((item) => item.ref));
      setErpRefs(refSet);
      erpRefsLoaded.current = true;
      console.log(`Loaded ${refSet.size} REFs from ERP`);
    } catch (error) {
      console.error("Failed to load ERP REFs:", error);
      toast.error("Failed to load ERP reference data");
    }
  };

  const loadAllERPRefs = async () => {
    try {
      const allRefs = await getAllERPRefs();
      setAllERPRefs(allRefs);
      allERPRefsLoaded.current = true;
      console.log(`Loaded ${allRefs.size} total REFs from ERP`);
    } catch (error) {
      console.error("Failed to load all ERP REFs:", error);
    }
  };

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

      setScans((prevScans) => {
        // First, try to find a match by direct comparison
        let existingIndex = -1;

        // If we have a REF, match by REF + batch/lot + location
        if (parsedData.ref) {
          existingIndex = prevScans.findIndex(
            (scan) =>
              scan.ref === parsedData.ref &&
              (scan.batchLot || "") === (parsedData.batchLot || "") &&
              scan.location === setupInfo.location,
          );
        }

        // If no match by REF or no REF available, try matching by GTIN + batch/lot + location
        if (existingIndex === -1 && parsedData.gtin) {
          existingIndex = prevScans.findIndex(
            (scan) =>
              scan.gtin === parsedData.gtin &&
              (scan.batchLot || "") === (parsedData.batchLot || "") &&
              scan.location === setupInfo.location,
          );
        }

        // Debug logging
        console.log("Parsed data:", parsedData);
        console.log("Matching index:", existingIndex);

        if (existingIndex >= 0) {
          // If exists, increment quantity
          const updatedScans = [...prevScans];
          const currentQuantity = updatedScans[existingIndex].quantity || 0;
          updatedScans[existingIndex] = {
            ...updatedScans[existingIndex],
            quantity: currentQuantity + 1,
          };

          // Check if the existing item is expired
          const existingScan = updatedScans[existingIndex];

          const expiryThresholdMonths = setupInfo.expiredTime || 6; // Use the configured threshold
          // Check if item is expired
          const date = new Date();

          const isExpired = existingScan.expirationDate
            ? new Date(existingScan.expirationDate) <
              new Date(date.setMonth(date.getMonth() + expiryThresholdMonths))
            : false;

          toast.success(
            `Incremented quantity for ${existingScan.ref || existingScan.gtin}`,
          );

          // Play appropriate sound based on expiration status
          if (isExpired) {
            playSound("expired");
            toast.error(
              `Warning: Item is expired (${existingScan.expirationDate})`,
            );
          } else {
            playSound("success");
          }

          return updatedScans;
        } else {
          // If new, add with quantity 1
          const newScan: ScanRecord = {
            timestamp: new Date().toISOString(),
            ...parsedData,
            storageSite: setupInfo.storageSite,
            location: setupInfo.location,
            quantity: 1,
            movementCode: setupInfo.movementCode,
          };

          // If in addRefMode and no REF, leave it empty for manual entry
          if (setupInfo.addRefMode && !newScan.ref) {
            newScan.ref = "";
          }
          const expiryThresholdMonths = setupInfo.expiredTime || 6; // Use the configured threshold
          // Check if item is expired
          const date = new Date();

          const isExpired = newScan.expirationDate
            ? new Date(newScan.expirationDate) <
              new Date(date.setMonth(date.getMonth() + expiryThresholdMonths))
            : false;

          // Play alert sound for missing REF
          setTimeout(() => {
            if (newScan.ref === "") {
              playSound("alert");
              // Also show a toast notification
              toast.error("Missing REF - Please enter a REF for this item");
            } else if (isExpired) {
              playSound("expired");
              toast.error(
                `Warning: Item is expired (${newScan.expirationDate})`,
              );
            } else {
              playSound("success");
              toast.success("Item added successfully");
            }
          }, 100);

          // Check if REF exists in ERP when in stock count mode
          if (setupInfo.stockCount && newScan.ref && erpRefs.size > 0) {
            if (!erpRefs.has(newScan.ref)) {
              toast.error(
                `Warning: REF "${newScan.ref}" not found in ERP system`,
              );
              newScan.notInERP = true;
            }
          }

          return [...prevScans, newScan];
        }
      });

      setError(null);
    } catch (err) {
      toast.error((err as Error).message);
      setError(err instanceof Error ? err.message : "Invalid barcode format");

      // Play error sound
      playSound("alert");
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
            addRefMode={setupInfo.addRefMode}
          />
          {scans.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h3 className="font-medium text-blue-800">Last Scanned Item</h3>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <span className="text-sm text-gray-500">REF/GTIN:</span>
                  <span className="ml-2 font-medium">
                    {scans[scans.length - 1].ref ||
                      scans[scans.length - 1].gtin}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Batch/Lot:</span>
                  <span className="ml-2 font-medium">
                    {scans[scans.length - 1].batchLot || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Quantity:</span>
                  <span className="ml-2 font-medium">
                    {scans[scans.length - 1].quantity || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          <ScansGrid
            scans={scans}
            onEdit={handleEdit}
            onDelete={handleDelete}
            erpRefs={erpRefs}
            allERPRefs={allERPRefs}
            isStockCount={setupInfo.stockCount}
            expiredTime={setupInfo.expiredTime}
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
