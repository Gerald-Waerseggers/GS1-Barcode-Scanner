// components/ScansGrid.tsx
import React, { useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ScanRecord } from "../types";
import { Pencil, Trash2 } from "lucide-react";
import { ColDef, themeQuartz } from "ag-grid-community";
import { Button } from "@headlessui/react";
import { gtinRefStore } from "../stores/gtinRefStore";

interface ScansGridProps {
  scans: ScanRecord[];
  onEdit: (scan: ScanRecord) => void;
  onDelete: (scan: ScanRecord) => void;
  erpRefs: Set<string>;
  allERPRefs: Set<string>;
  isStockCount?: boolean;
  expiredTime?: number;
  onSetChange?: (scan: ScanRecord, value: boolean) => void;
}

// Define the ActionCellRenderer component.
interface ActionCellRendererProps {
  data: ScanRecord;
  onEdit: (scan: ScanRecord) => void;
  onDelete: (scan: ScanRecord) => void;
}

interface QuantityCellRendererProps {
  data: ScanRecord;
  node: {
    setDataValue: (field: string, value: number) => void;
  };
}

// Add new interface for REF cell renderer
interface RefCellRendererProps {
  data: ScanRecord;
  node: {
    setDataValue: (field: string, value: string) => void;
  };
}

// Add new interface for Set checkbox cell renderer
interface SetCheckboxRendererProps {
  data: ScanRecord;
  onSetChange: (scan: ScanRecord, value: boolean) => void;
}

const ActionCellRenderer: React.FC<ActionCellRendererProps> = (props) => {
  const { data, onEdit, onDelete } = props;
  return (
    <div className="flex justify-center align-middle items-center h-full gap-2">
      <Button
        onClick={() => onEdit(data)}
        className="p-1 text-blue-600 hover:text-blue-800"
        title="Edit"
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => onDelete(data)}
        className="p-1 text-red-600 hover:text-red-800"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const QuantityCellRenderer: React.FC<QuantityCellRendererProps> = (props) => {
  const { data } = props;
  return data.quantity || 0;
};

const SetCheckboxRenderer: React.FC<SetCheckboxRendererProps> = (props) => {
  const { data, onSetChange } = props;
  return (
    <input
      type="checkbox"
      checked={data.isSet || false}
      onChange={(e) => onSetChange(data, e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      title="Mark item for set"
    />
  );
};

const RefCellRenderer: React.FC<RefCellRendererProps> = (props) => {
  const { data } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  // Try to get existing REF for this GTIN
  useEffect(() => {
    async function lookupRef() {
      if (!data.ref && data.gtin) {
        const existingRef = await gtinRefStore.getRefForGtin(data.gtin);
        if (existingRef) {
          // Replace dots with dashes when setting REF
          props.node.setDataValue("ref", existingRef.replace(/\./g, "-"));

          // After auto-filling REF, return focus to scan input
          setTimeout(() => {
            const scanInput = document.querySelector(
              'input[placeholder="Scan or type GS1 barcode..."]'
            );
            if (scanInput instanceof HTMLElement) {
              scanInput.focus();
            }
          }, 50);
        }
      }
    }
    lookupRef();
  }, [data.gtin, data.ref, props.node]);

  useEffect(() => {
    if (!data.ref) {
      inputRef.current?.focus();
    }
  }, [data.ref]);

  if (!data.ref) {
    return (
      <input
        placeholder="REF"
        ref={inputRef}
        type="text"
        className="w-full h-full px-2 border rounded"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const newValue = (e.target as HTMLInputElement).value;
            if (newValue && data.gtin) {
              // Replace dots with dashes before saving
              const formattedRef = newValue.replace(/\./g, "-");
              gtinRefStore.addMapping(data.gtin, formattedRef);
              props.node.setDataValue("ref", formattedRef);

              // Return focus to scan input after filling REF - THIS IS THE KEY CHANGE
              setTimeout(() => {
                const scanInput = document.querySelector(
                  'input[placeholder="Scan or type GS1 barcode..."]'
                );
                if (scanInput instanceof HTMLElement) {
                  scanInput.focus();
                }
              }, 50);
            }
          }
        }}
        // Add onBlur handler as a backup to return focus to scan input
        onBlur={(e) => {
          // Only if there's a valid value and user didn't click elsewhere
          if (e.target.value && !e.relatedTarget) {
            const scanInput = document.querySelector(
              'input[placeholder="Scan or type GS1 barcode..."]'
            );
            if (scanInput instanceof HTMLElement) {
              setTimeout(() => {
                scanInput.focus();
              }, 50);
            }
          }
        }}
      />
    );
  }
  return data.ref;
};

const ScansGrid: React.FC<ScansGridProps> = ({
  scans,
  onEdit,
  onDelete,
  onSetChange,
  erpRefs = new Set(),
  allERPRefs = new Set(),
  isStockCount = false,
  expiredTime,
}) => {
  const columnDefs = [
    {
      field: "timestamp",
      headerName: "Time",
      valueFormatter: (params: { value: Date }) =>
        new Date(params.value).toLocaleTimeString(),
      sort: "desc",
    },
    { field: "location", headerName: "Location" },
    { field: "gtin", headerName: "GTIN" },

    {
      field: "ref",
      headerName: "REF",
      cellRenderer: RefCellRenderer,
      cellClass: (params: { value: string }) => {
        if (isStockCount && params.value) {
          // Not in location but in full ERP database
          if (!erpRefs.has(params.value) && allERPRefs.has(params.value)) {
            return "bg-yellow-100"; // Yellow for "exists in ERP but not in this location"
          }
          // Not in any ERP database
          if (!erpRefs.has(params.value) && !allERPRefs.has(params.value)) {
            return "bg-red-100"; // Red for "not in any ERP database"
          }
        }
        return "";
      },
      // Add tooltip for REFs not in ERP
      tooltipValueGetter: (params: { value: string }) => {
        if (isStockCount && params.value) {
          if (!erpRefs.has(params.value) && allERPRefs.has(params.value)) {
            return "This REF exists in ERP but not in this location";
          }
          if (!erpRefs.has(params.value) && !allERPRefs.has(params.value)) {
            return "This REF is not found in any ERP system";
          }
        }
        return "";
      },
    },
    { field: "batchLot", headerName: "Batch/Lot" },
    {
      field: "quantity",
      headerName: "Quantity",
      type: "numericColumn",
      cellRenderer: QuantityCellRenderer,
      editable: true,
    },
    {
      field: "expirationDate",
      headerName: "Expiration Date",
      cellClass: (params: { value: string; data: ScanRecord }) => {
        // Add light red background for expired items
        const date = new Date();
        const expiryThresholdMonths = expiredTime || 6; // Use the configured threshold

        if (params.value && new Date(params.value) < new Date()) {
          return "bg-red-100";
        } else if (
          params.value &&
          new Date(params.value) <
            new Date(date.setMonth(date.getMonth() + expiryThresholdMonths))
        ) {
          return "bg-orange-100";
        }
        return "";
      },
      // Update tooltip as well
      tooltipValueGetter: (params: { value: string; data: ScanRecord }) => {
        const date = new Date();
        const expiryThresholdMonths = expiredTime || 6; // Use the configured threshold

        if (params.value && new Date(params.value) < new Date()) {
          return "This product has expired";
        } else if (
          params.value &&
          new Date(params.value) <
            new Date(date.setMonth(date.getMonth() + expiryThresholdMonths))
        ) {
          return `This product will expire within ${expiryThresholdMonths} months`;
        }
        return "";
      },
    },
    {
      headerName: "Set",
      field: "isSet",
      cellRenderer: SetCheckboxRenderer,
      cellRendererParams: {
        onSetChange: onSetChange,
      },
      width: 80,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellClass: "h-full",
      cellRenderer: ActionCellRenderer,
      cellRendererParams: {
        onEdit,
        onDelete,
      },
      sortable: false,
      filter: false,
    },
  ];

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const autoSizeStrategy = {
    type: "fitGridWidth" as const,
    defaultMinWidth: 100,
  };

  return (
    <div className="overflow-x-auto">
      <div className="w-full">
        <AgGridReact<ScanRecord>
          theme={themeQuartz}
          loadThemeGoogleFonts={true}
          rowData={scans}
          columnDefs={columnDefs as ColDef<ScanRecord>[]}
          defaultColDef={defaultColDef}
          autoSizeStrategy={autoSizeStrategy}
          tooltipShowDelay={50}
          components={{
            ActionCellRenderer: ActionCellRenderer,
          }}
          animateRows={true}
          sortingOrder={["desc", "asc", null]}
          suppressCellFocus={true}
          domLayout="autoHeight"
        />

        <h3 className="mt-2 text-center">Total Scanned: {scans.length}</h3>
      </div>
    </div>
  );
};

export default ScansGrid;
