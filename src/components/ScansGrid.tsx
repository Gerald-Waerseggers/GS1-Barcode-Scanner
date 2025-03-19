// components/ScansGrid.tsx
import React, { useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ScanRecord } from "../types";
import { Pencil, Trash2 } from "lucide-react";
import { ColDef, ITooltipParams, themeQuartz } from "ag-grid-community";
import { Button } from "@headlessui/react";
import { gtinRefStore } from "../stores/gtinRefStore";

interface ScansGridProps {
  scans: ScanRecord[];
  onEdit: (scan: ScanRecord) => void;
  onDelete: (scan: ScanRecord) => void;
  erpRefs: Set<string>;
  isStockCount?: boolean;
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
  erpRefs = new Set(),
  isStockCount = false,
}) => {
  const columnDefs = [
    {
      field: "timestamp",
      headerName: "Time",
      valueFormatter: (params: { value: Date }) =>
        new Date(params.value).toLocaleTimeString(),
    },
    { field: "storageSite", headerName: "Storage Site" },
    { field: "gtin", headerName: "GTIN" },

    {
      field: "ref",
      headerName: "REF",
      cellRenderer: RefCellRenderer,
      cellClass: (params: { value: string }) => {
        // Add light red background for REFs not in ERP
        if (isStockCount && params.value && !erpRefs.has(params.value)) {
          return "bg-red-100";
        }
        return "";
      },
      // Add tooltip for REFs not in ERP
      tooltipValueGetter: (params: { value: string }) => {
        if (isStockCount && params.value && !erpRefs.has(params.value)) {
          return "This REF is not found in the ERP system";
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
    },
    { field: "expirationDate", headerName: "Expiration Date" },
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
