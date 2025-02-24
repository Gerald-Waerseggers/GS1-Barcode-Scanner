import { Dialog, DialogPanel, DialogTitle, Input } from "@headlessui/react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, themeQuartz } from "ag-grid-community";
import "ag-grid-enterprise"; // Import enterprise features
import { Button } from "@headlessui/react";
import { getERPStockCount } from "../utils/opfsUtils";
import { useCallback, useEffect, useRef, useState } from "react";

interface ERPStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZeroCount: (items: ERPStockRow[]) => void;
  existingScans?: Array<{
    ref: string;
    batchLot: string;
    location: string;
    quantity: number;
  }>;
}

interface ERPStockRow {
  ref: string;
  lotNumber: string;
  location: string;
  quantity: number;
}

export default function ERPStockModal({
  isOpen,
  onClose,
  onSelectZeroCount,
  existingScans = [],
}: ERPStockModalProps) {
  const gridRef = useRef<AgGridReact>(null);

  const [erpStock, setErpStock] = useState<ERPStockRow[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);

  const columnDefs: ColDef[] = [
    {
      field: "ref",
      headerName: "REF",
      sortable: true,
      filter: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      rowGroup: true, // Enable row grouping
      showRowGroup: false,
    },
    { field: "lotNumber", headerName: "Lot", sortable: true, filter: true },
    { field: "location", headerName: "Location", sortable: true, filter: true },
    {
      field: "quantity",
      headerName: "ERP Quantity",
      sortable: true,
      filter: true,
      aggFunc: "sum", // Sum quantities for grouped rows
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadERPStock();
    } else {
      setErpStock([]);
      setSelectedNodes([]);
    }
  }, [isOpen]);

  // Pre-select zero count items when data is loaded
  useEffect(() => {
    if (gridRef.current && erpStock.length > 0 && existingScans.length > 0) {
      const api = gridRef.current.api;

      // Create a Set of keys for quick lookup
      const zeroCountKeys = new Set(
        existingScans
          .filter((scan) => scan.quantity === 0)
          .map((scan) => `${scan.ref}-${scan.batchLot}-${scan.location}`),
      );

      // Select nodes that match existing zero count scans
      api.forEachNode((node) => {
        if (!node.group && node.data) {
          const key = `${node.data.ref}-${node.data.lotNumber}-${node.data.location}`;
          if (zeroCountKeys.has(key)) {
            node.setSelected(true);
          }
        }
      });
    }
  }, [erpStock, existingScans]);

  const handleSelectionChanged = (event: any) => {
    const selected = event.api.getSelectedNodes();
    console.log("Selected nodes:", selected);
    setSelectedNodes(selected);
  };

  const handleConfirm = () => {
    // Get the actual selected items from the nodes
    const selectedItems = selectedNodes
      .filter((node) => !node.group) // Only get leaf nodes (actual items, not groups)
      .map((node) => node.data);

    console.log("Selected items for zero count:", selectedItems);

    if (selectedItems.length > 0) {
      onSelectZeroCount(selectedItems);
      onClose();
    } else {
      console.warn("No items selected");
    }
  };

  const loadERPStock = async () => {
    const stock = await getERPStockCount();
    console.log("Loaded ERP stock:", stock);
    setErpStock(stock);
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
            Select REFs for Zero Count
          </DialogTitle>
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

          <div className="h-96 w-full mb-4">
            <AgGridReact
              theme={themeQuartz}
              columnDefs={columnDefs}
              rowData={erpStock}
              ref={gridRef}
              defaultColDef={{
                flex: 1,
                resizable: true,
              }}
              groupSelectsChildren={true}
              rowSelection="multiple"
              onSelectionChanged={handleSelectionChanged}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
              disabled={selectedNodes.length === 0}
            >
              Add Zero Count
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
