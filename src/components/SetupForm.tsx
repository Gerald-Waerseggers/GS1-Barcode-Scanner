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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete({
      stockCount,
      storageSite,
      addRefMode,
      movementCode,
      location,
    });
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
