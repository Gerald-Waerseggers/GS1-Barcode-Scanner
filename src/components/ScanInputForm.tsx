import { Button } from "@headlessui/react";
import React, { useRef, useEffect } from "react";

interface ScanInputFormProps {
  onScan: (input: string) => void;
  error: string | null;
}

const ScanInputForm: React.FC<
  ScanInputFormProps & { onAddManual: () => void }
> = ({ onScan, error, onAddManual }) => {
  const [input, setInput] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onScan(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleScan} className="mb-6">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Scan or type GS1 barcode..."
          autoFocus
        />
        <Button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Scan
        </Button>
        <Button
          type="button"
          onClick={onAddManual}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Manual Entry
        </Button>
      </div>
      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </form>
    
  );
};

export default ScanInputForm;
