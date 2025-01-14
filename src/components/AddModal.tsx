import React, { useState } from "react";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XIcon } from "lucide-react";
import { ScanRecord, ScanSetup } from "../types";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  setupInfo: ScanSetup;
  onSave: (scan: ScanRecord) => void;
}

const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  setupInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ScanRecord>>({
    gtin: "",
    batchLot: "",
    quantity: undefined,
    expirationDate: "",
    ref: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newScan: ScanRecord = {
      timestamp: new Date().toISOString(),
      ...setupInfo,
      ...formData,
    };
    onSave(newScan);

    // Reset form data after submission
    setFormData({
      gtin: "",
      batchLot: "",
      quantity: undefined,
      expirationDate: "",
      ref: "",
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold">
              Add New Scan
            </DialogTitle>
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
                  value={formData.gtin || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gtin: e.target.value }))
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
                  value={formData.ref || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ref: e.target.value }))
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
                  value={formData.batchLot || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      batchLot: e.target.value,
                    }))
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
                  min="0"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || undefined,
                    }))
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
                  value={formData.expirationDate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expirationDate: e.target.value,
                    }))
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
                Add
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

export default AddModal;
