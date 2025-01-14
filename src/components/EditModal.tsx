import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XIcon } from "lucide-react";
import { ScanRecord } from "../types";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanRecord | null;
  onSave: (scan: ScanRecord) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  scan,
  onSave,
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
            <Button
              title="Close"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GTIN
                </label>
                <input
                  placeholder="GTIN"
                  type="text"
                  value={editedScan?.gtin || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev ? { ...prev, gtin: e.target.value } : prev,
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  REF
                </label>
                <input
                  placeholder="REF"
                  type="text"
                  value={editedScan?.ref || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev ? { ...prev, ref: e.target.value } : prev,
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
                  placeholder="Batch/Lot"
                  type="text"
                  value={editedScan?.batchLot || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev ? { ...prev, batchLot: e.target.value } : prev,
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  placeholder="Quantity"
                  type="number"
                  value={editedScan?.quantity || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev
                        ? { ...prev, quantity: parseInt(e.target.value) || 0 }
                        : prev,
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
                  placeholder="Expiration Date"
                  type="date"
                  value={editedScan?.expirationDate || ""}
                  onChange={(e) =>
                    setEditedScan((prev) =>
                      prev ? { ...prev, expirationDate: e.target.value } : prev,
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default EditModal;
