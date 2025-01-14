import React, { useState } from "react";
import { ScanSetup } from "../types";
import { Button, Checkbox } from "@headlessui/react";
import { Check } from "lucide-react";

interface SetupFormProps {
  onSetupComplete: (setupInfo: ScanSetup) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSetupComplete }) => {
  const [storageSite, setStorageSite] = useState("");
  const [supplier, setSupplier] = useState("");
  const [addRefMode, setAddRefMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete({
      storageSite,
      supplier,
      addRefMode,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Scan Setup</h1>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Storage Site
                </label>
                <input
                  placeholder="Storage Site"
                  type="text"
                  value={storageSite}
                  onChange={(e) => setStorageSite(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supplier
                </label>
                <input
                  placeholder="Supplier"
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center space-x-2 ml-1">
                  <input
                    type="checkbox"
                    checked={addRefMode}
                    onChange={(e) => setAddRefMode(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Enable REF input mode</span>
                </label>
              </div>
              
              <Button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Start Scanning
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupForm;
