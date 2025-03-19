import { Dialog, DialogTitle, DialogPanel } from "@headlessui/react";
import { Button } from "@headlessui/react";

interface ExportInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportInfoModal({
  isOpen,
  onClose,
}: ExportInfoModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-3xl w-full bg-white rounded-lg shadow-xl p-6">
          <DialogTitle className="text-xl font-medium mb-4">
            Export Complete - Next Steps
          </DialogTitle>

          <div className="space-y-6 text-gray-600">
            <section>
              <h3 className="font-medium text-black mb-2">
                Sage X3 Import Steps:
              </h3>
              <a
                className="text-sm text-blue-600 underline underline-offset-2 mb-2"
                href="http://213.207.99.88:8124/syracuse-main/html/main.html?url=/trans/x3/erp/MMLIVE/$sessions?f%3DGIMPOBJ%252F2%252F%252FM%252F%26profile%3D~(loc~'en-US~role~'57cffaa1-ff5b-4b2e-bdb0-b9870562975c~ep~'1cd0ef0b-195b-4051-b14e-7bf20f0e31bd~appConn~(KEY1~'x3))"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sage X3 Link to Import file (select YFTISMR)
              </a>
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  Navigate to{" "}
                  <span className="font-medium">
                    "Usage &gt; Imports / exports &gt; Imports
                  </span>
                </li>
                <li>
                  Select import template{" "}
                  <span className="font-medium">YFTISMR</span>
                </li>
                <li>Wait for the import to complete and check the log file</li>
                <li>
                  The log file will show the stock receipt session and document
                  numbers
                  <div className="text-sm text-gray-500 ml-6 mt-1">
                    Important: Note the stock count document number (last number
                    in lines 6 and 7)
                  </div>
                </li>
              </ol>
            </section>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">Important Notes:</p>
              <ul className="list-disc ml-5 mt-2 text-blue-700">
                <li>Do not modify the exported file before copying</li>
                <li>
                  The file name format is important - do not rename the file
                </li>
                <li>
                  Keep note of the stock count document number from the log file
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
            >
              Got it
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
