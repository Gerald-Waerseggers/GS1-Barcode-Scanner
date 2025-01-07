import React, { useState, useEffect, useRef } from "react";
import { parseGS1 } from "../utils/gs1Parser";
import { Pencil, Download, Trash2, ScanLine, XIcon } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface ScanSetup {
  location: string;
  supplier: string;
  // Add any other fields you need
}

interface ScanRecord {
  timestamp: string;
  gtin?: string;
  batchLot?: string;
  expirationDate?: string;
  // Add setup info to each scan
  location: string;
  supplier: string;
}

const EditModal = ({
  isOpen,
  onClose,
  scan,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanRecord | null;
  onSave: (scan: ScanRecord) => void;
}) => {
  const [editedScan, setEditedScan] = useState<ScanRecord | null>(scan);

  useEffect(() => {
    setEditedScan(scan);
  }, [scan]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editedScan) {
      onSave(editedScan);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold">Edit Scan</DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GTIN
                </label>
                <input
                  type="text"
                  value={editedScan?.gtin || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev ? { ...prev, gtin: e.target.value } : prev
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Batch/Lot
                </label>
                <input
                  type="text"
                  value={editedScan?.batchLot || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev ? { ...prev, batchLot: e.target.value } : prev
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={editedScan?.expirationDate || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev ? { ...prev, expirationDate: e.target.value } : prev
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default function BarcodeScanner() {
  const [isSetup, setIsSetup] = useState(false);
  const [setupInfo, setSetupInfo] = useState<ScanSetup>({
    location: "",
    supplier: "",
  });
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanRecord | null>(null);

  useEffect(() => {
    // Focus input on mount and after each scan
    inputRef.current?.focus();
  }, [scans]);

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

  const handleSetupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (setupInfo.location && setupInfo.supplier) {
      setIsSetup(true);
    }
  };

  const handleScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setInput("");
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

  const actionCellRenderer = (params: any) => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleEdit(params.data)}
          className="p-1 text-blue-600 hover:text-blue-800"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(params.data)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Scan Setup
            </h1>
            <form onSubmit={handleSetupSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={setupInfo.location}
                    onChange={(e) =>
                      setSetupInfo((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={setupInfo.supplier}
                    onChange={(e) =>
                      setSetupInfo((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Scanning
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const columnDefs = [
    {
      field: "timestamp",
      headerName: "Time",
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleTimeString(),
    },
    { field: "location", headerName: "Location" },
    { field: "supplier", headerName: "Supplier" },
    { field: "gtin", headerName: "GTIN" },
    { field: "batchLot", headerName: "Batch/Lot" },
    { field: "expirationDate", headerName: "Expiration Date" },
    {
      headerName: "Actions",
      cellRenderer: actionCellRenderer,
      sortable: false,
      filter: false,
      width: 100,
    },
  ];
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const autoSizeStrategy = {
    type: "fitGridWidth",
    defaultMinWidth: 10,
  };

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

          <form onSubmit={handleScan} className="mb-6">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scan or type GS1 barcode..."
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Scan
              </button>
            </div>
            {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          </form>

          <div className="overflow-x-auto">
            <div className="h-[600px] w-full">
              {/* Set explicit height for grid */}
              <AgGridReact<ScanRecord>
                theme={themeQuartz}
                rowData={scans}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                autoSizeStrategy={autoSizeStrategy}
                rowSelection="multiple"
                suppressCellFocus={true}
                domLayout="autoHeight"
                noRowsOverlayComponent={() => (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No scans yet. Start scanning barcodes to see them here.
                  </div>
                )}
              />
            </div>
          </div>
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
