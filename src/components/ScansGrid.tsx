// components/ScansGrid.tsx
import React from "react";
import { AgGridReact } from "ag-grid-react";
import { ScanRecord } from "../types";
import { Pencil, Trash2 } from "lucide-react";
import { ColDef, themeQuartz } from "ag-grid-community";

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

const ActionCellRenderer: React.FC<ActionCellRendererProps> = (props) => {
  const { data, onEdit, onDelete } = props;
  return (
    <div className="flex justify-center align-middle items-center h-full gap-2">
      <button
        onClick={() => onEdit(data)}
        className="p-1 text-blue-600 hover:text-blue-800"
        title="Edit"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(data)}
        className="p-1 text-red-600 hover:text-red-800"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
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
    { field: "expirationDate", headerName: "Expiration Date" },
    {
      headerName: "Actions",
      field: "actions",
      cellClass: "h-full",
      className: "flex justify-center align-middle items-center h-full",
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
      <div className="h-[600px] w-full">
        <AgGridReact<ScanRecord>
          theme={themeQuartz}
          rowData={scans}
          columnDefs={columnDefs as ColDef<ScanRecord>[]}
          defaultColDef={defaultColDef}
          autoSizeStrategy={autoSizeStrategy}
          components={{
            ActionCellRenderer: ActionCellRenderer,
          }}
          animateRows={true}
          rowSelection="multiple"
          suppressCellFocus={true}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default ScansGrid;
