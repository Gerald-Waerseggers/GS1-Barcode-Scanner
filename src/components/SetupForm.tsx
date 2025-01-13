import React, { useState } from "react";
import { ScanSetup } from "../types";
import { Button } from "@headlessui/react";

interface SetupFormProps {
  onSetupComplete: (setupInfo: ScanSetup) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSetupComplete }) => {
  const [setupInfo, setSetupInfo] = useState<ScanSetup>({
    location: "",
    supplier: "",
  });

  const handleSetupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (setupInfo.location && setupInfo.supplier) {
      onSetupComplete(setupInfo);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Scan Setup</h1>
          <form onSubmit={handleSetupSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  placeholder="Location"
                  type="text"
                  value={setupInfo.location}
                  onChange={(e) =>
                    setSetupInfo((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
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
                  value={setupInfo.supplier}
                  onChange={(e) =>
                    setSetupInfo((prev) => ({
                      ...prev,
                      supplier: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
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
