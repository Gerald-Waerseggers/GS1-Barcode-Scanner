import { Button, Dialog, DialogPanel, DialogTitle, Input } from "@headlessui/react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, themeQuartz, CellValueChangedEvent } from "ag-grid-community";
import { Download, Plus, Trash2, Upload } from "lucide-react";
import { gtinRefStore } from "../stores/gtinRefStore";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ScanRecord } from "../types";

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MappingRow {
  gtin: string;
  ref: string;
}

// Add new interface for REF cell renderer
interface CellRendererProps {
  data: ScanRecord;
  node: {
    setDataValue: (field: string, value: string) => void;
  };
}

export default function MappingModal({ isOpen, onClose }: MappingModalProps) {
  const [mappings, setMappings] = useState<MappingRow[]>([]);
  const gridRef = useRef<AgGridReact>(null);


  const columnDefs: ColDef[] = [
    {
      field: "gtin",
      headerName: "GTIN",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      field: "ref",
      headerName: "REF",
      sortable: true,
      filter: true,
      resizable: true,
      editable: true,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: CellRendererProps) => (
        <Button
          onClick={() => onDeleteMapping(params.data.gtin)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
      width: 100,
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

  const onCellValueChanged = (params: CellValueChangedEvent) => {
    const updatedMappings = [...mappings];
    const rowIndex = params.node.rowIndex;
    const field = params.colDef.field as keyof MappingRow;
    updatedMappings[rowIndex][field] = params.newValue;
    setMappings(updatedMappings);
  };

  const onAddMapping = () => {
    setMappings([...mappings, { gtin: "", ref: "" }]);
  };

  const onDeleteMapping = (gtin: string) => {
    const updatedMappings = mappings.filter((mapping) => mapping.gtin !== gtin);
    setMappings(updatedMappings);
  };

  const onSave = async () => {
    try {
      await gtinRefStore.setMappings(mappings);
      onClose();
    } catch (error) {
      toast.error("Error saving mappings: " + error);
    }
  };

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current!.api.setGridOption(
      "quickFilterText",
      (document.getElementById("filter-text-box") as HTMLInputElement).value,
    );
  }, []);

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
                    toast.error("Error importing mappings: " + error);
                  }
                }
              }}
            />
            <Button
              onClick={() => document.getElementById("mappingUpload")?.click()}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              <Download className="w-4 h-4" />
              Import Mapping
            </Button>
            <Button
              onClick={() => gtinRefStore.exportToCSV()}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              <Upload className="w-4 h-4" />
              Export Mapping
            </Button>
            <Button
              onClick={onAddMapping}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              <Plus className="w-4 h-4" />
              Add Mapping
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Quick Filter:</span>
            <Input
              type="text"
              id="filter-text-box"
              placeholder="Filter..."
              onInput={onFilterTextBoxChanged}
              className="border border-gray-300 rounded-md p-2 min-w-96"
            />
          </div>

          <div className="ag-theme-quartz h-96 w-full">
            <AgGridReact
              theme={themeQuartz}
              columnDefs={columnDefs}
              rowData={mappings}
              ref={gridRef}
              defaultColDef={{
                flex: 1,
                resizable: true,
              }}
              onCellValueChanged={onCellValueChanged}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
            >
              Save
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
