import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, themeQuartz } from "ag-grid-community";
import { Button } from "@headlessui/react";
import { Download, Upload } from "lucide-react";
import { gtinRefStore } from "../stores/gtinRefStore";
import { useEffect, useState } from "react";

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MappingRow {
  gtin: string;
  ref: string;
}

export default function MappingModal({ isOpen, onClose }: MappingModalProps) {
  const [mappings, setMappings] = useState<MappingRow[]>([]);

  const columnDefs: ColDef[] = [
    { field: "gtin", headerName: "GTIN", sortable: true, filter: true },
    {
      field: "ref",
      headerName: "REF",
      sortable: true,
      filter: true,
      resizable: true,
    },
  ];

  const loadMappings = async () => {
    const gtinToRef = await gtinRefStore.getAllMappings();
    setMappings(gtinToRef.map(({ gtin, ref }) => ({ gtin, ref })));
  };

  useEffect(() => {
    if (isOpen) {
      loadMappings();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl p-6">
          <DialogTitle className="text-lg font-medium mb-4">
            GTIN-REF Mappings
          </DialogTitle>

          <div className="flex gap-2 mb-4">
            <input
              title="Import CSV"
              type="file"
              id="mappingUpload"
              className="hidden"
              accept=".csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    await gtinRefStore.importFromCSV(file);
                    await loadMappings();
                    // Clear the input value to allow importing the same file again
                    e.target.value = "";
                  } catch (error) {
                    console.error("Error importing mappings:", error);
                  }
                }
              }}
            />
            <Button
              onClick={() => document.getElementById("mappingUpload")?.click()}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              <Upload className="w-4 h-4" />
              Import Mapping
            </Button>
            <Button
              onClick={() => gtinRefStore.exportToCSV()}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              <Download className="w-4 h-4" />
              Export Mapping
            </Button>
          </div>

          <div className="ag-theme-quartz h-96 w-full">
            <AgGridReact
              theme={themeQuartz}
              columnDefs={columnDefs}
              rowData={mappings}
              defaultColDef={{
                flex: 1,
                resizable: true,
              }}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Close
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
