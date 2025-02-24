import React, { useState } from "react";
import { ScanSetup } from "../types";
import {
  Button,
  Fieldset,
  Field,
  Input,
  Label,
  Select,
} from "@headlessui/react";
import { loadERPStockCount, deleteERPStockCount } from "../utils/opfsUtils";
import { toast } from "react-hot-toast";

interface SetupFormProps {
  onSetupComplete: (setupInfo: ScanSetup) => void;
  initialValues: ScanSetup;
}

const SetupForm: React.FC<SetupFormProps> = ({
  onSetupComplete,
  initialValues,
}) => {
  const [storageSite, setStorageSite] = useState(initialValues.storageSite);
  const [movementCode, setMovementCode] = useState(initialValues.movementCode);
  const [location, setLocation] = useState(initialValues.location);
  const [stockCount, setStockCount] = useState(initialValues.stockCount);
  const [addRefMode, setAddRefMode] = useState(initialValues.addRefMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete({
      stockCount,
      storageSite,
      addRefMode,
      movementCode,
      location,
    });
  };

  const handleERPFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Delete existing ERP stock count before loading new one
      await deleteERPStockCount();
      const result = await loadERPStockCount(file);
      if (result.length > 0) {
        toast.success(
          `ERP stock count successfully loaded ${result.length} items`,
        );
      } else {
        toast.error("Failed to load ERP stock count");
        // Clear the input value to allow uploading the same file again
        e.target.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Scan Setup</h1>
          <form onSubmit={handleSubmit}>
            <Fieldset className="space-y-4">
              <Field>
                <Label className="block text-sm font-medium text-gray-700">
                  Scan Type
                </Label>

                <Select
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={stockCount ? "true" : "false"}
                  onChange={(e) => setStockCount(e.target.value === "true")}
                >
                  <option value="false">Stock Receipt</option>
                  <option value="true">Stock Count</option>
                </Select>
              </Field>
              <Field>
                <Label className="block text-sm font-medium text-gray-700">
                  Storage Site
                </Label>
                <Input
                  placeholder="Storage Site"
                  type="text"
                  value={storageSite}
                  onChange={(e) => setStorageSite(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </Field>
              <Field>
                <Label className="block text-sm font-medium text-gray-700">
                  Movement Code
                </Label>
                <Input
                  placeholder="Movement Code"
                  type="text"
                  value={movementCode}
                  onChange={(e) => setMovementCode(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </Field>
              <Field>
                <Label className="block text-sm font-medium text-gray-700">
                  Location
                </Label>
                <Input
                  placeholder="Location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </Field>
              <Field className="mb-4">
                <Label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={addRefMode}
                    onChange={(e) => setAddRefMode(e.target.checked)}
                    className=" h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Enable REF input mode</span>
                </Label>
              </Field>

              {stockCount && (
                <Field>
                  <Label className="block text-sm font-medium text-gray-700">
                    ERP (Sage X3) Stock Count File
                  </Label>
                  <a
                    className="text-sm text-blue-600"
                    href="http://213.207.99.88:8124/syracuse-main/html/main.html?url=/trans/x3/erp/MMLIVE/$sessions?f%3DGEXPOBJ%252F2%252F%252FM%252F%26profile%3D~(loc~'en-US~role~'57cffaa1-ff5b-4b2e-bdb0-b9870562975c~ep~'1cd0ef0b-195b-4051-b14e-7bf20f0e31bd~appConn~(KEY1~'x3))"
                  >
                    Sage X3 Link to Extract file
                  </a>
                  <Input
                    type="file"
                    onChange={handleERPFileUpload}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <span className="text-xs text-gray-500">
                    Upload ERP stock count file (S;REF;Lot;Location;Quantity)
                  </span>
                </Field>
              )}

              <Button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Start Scanning
              </Button>
            </Fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupForm;
