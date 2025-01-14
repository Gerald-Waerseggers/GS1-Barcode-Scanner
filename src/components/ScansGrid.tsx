// components/ScansGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import { ScanRecord } from "../types";
import { Pencil, Trash2 } from "lucide-react";
import { ColDef, themeQuartz } from "ag-grid-community";
import { Button } from "@headlessui/react";

interface ScansGridProps {
  scans: ScanRecord[];
  onEdit: (scan: ScanRecord) => void;
  onDelete: (scan: ScanRecord) => void;
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
  if (!data.quantity && data.quantity !== 0) {
    return (
      <input
        aria-label="Quantity"
        type="number"
        min="0"
        className="w-full h-full px-2 border rounded"
        onBlur={(e) => {
          const newValue = parseInt(e.target.value) || 0;
          props.node.setDataValue("quantity", newValue);
        }}
      />
    );
  }
  return data.quantity;
};

const ScansGrid: React.FC<ScansGridProps> = ({ scans, onEdit, onDelete }) => {
  const columnDefs = [
    {
      field: "timestamp",
      headerName: "Time",
      valueFormatter: (params: { value: Date }) =>
        new Date(params.value).toLocaleTimeString(),
    },
    { field: "location", headerName: "Location" },
    { field: "supplier", headerName: "Supplier" },
    { field: "gtin", headerName: "GTIN" },
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
      <div className=" w-full">
        <AgGridReact<ScanRecord>
          theme={themeQuartz}
          loadThemeGoogleFonts={true}
          rowData={scans}
          columnDefs={columnDefs as ColDef<ScanRecord>[]}
          defaultColDef={defaultColDef}
          autoSizeStrategy={autoSizeStrategy}
          components={{
            ActionCellRenderer: ActionCellRenderer,
          }}
          animateRows={true}
          suppressCellFocus={true}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default ScansGrid;
