import { ScanRecord, ScanSetup } from "../types";

export function exportScansToCSV(scans: ScanRecord[], setupInfo: ScanSetup) {
  if (scans.length === 0) return;

  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

  const csvContent = [
    "H;E;;;;L;;;;S;;;;;END",
    "C;;Storage site;Allocation date;Movement code;;Product;unit;quantity;;Supplier lot;lot;location;status;expiration date",
    ...scans.map((scan) =>
      [
        "", // Empty column
        "E", // Fixed value
        scan.storageSite, // Storage site
        today, // Allocation date (today)
        "", // Fixed movement code
        "L", // Fixed value
        scan.ref, // Product (REF)
        "UN", // Fixed unit
        scan.quantity || 1, // Quantity
        "S", // Fixed value
        scan.batchLot, // Supplier lot
        scan.batchLot, // lot (same as supplier lot)
        "", // Fixed location
        "A", // Fixed status
        scan.expirationDate?.replace(/-/g, "") || "", // Expiration date without dashes
      ].join(";")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gs1_barcode_scans_${setupInfo.storageSite}_${
    setupInfo.supplier
  }_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
