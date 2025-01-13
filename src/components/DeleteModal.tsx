import React from "react";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XIcon } from "lucide-react";
import { ScanRecord } from "../types";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanRecord | null;
  onConfirm: (scan: ScanRecord) => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  scan,
  onConfirm,
}) => {
  const handleConfirm = () => {
    if (scan) {
      onConfirm(scan);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold">
              Confirm Delete
            </DialogTitle>
            <Button
              title="Close"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Are you sure you want to delete this scan?
            </p>
            {scan && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p>
                  <span className="font-medium">GTIN:</span> {scan.gtin}
                </p>
                <p>
                  <span className="font-medium">Batch/Lot:</span>{" "}
                  {scan.batchLot}
                </p>
                <p>
                  <span className="font-medium">Quantity:</span> {scan.quantity}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default DeleteModal;
