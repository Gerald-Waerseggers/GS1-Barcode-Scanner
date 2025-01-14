import { ScanRecord, ScanSetup } from "../types";

export function exportScansToCSV(scans: ScanRecord[], setupInfo: ScanSetup) {
  if (scans.length === 0) return;

  const headers = [
    "Timestamp",
    "Storage Site",
    "Supplier",
    "GTIN",
    "Ref",
    "Batch/Lot",
    "Expiration Date",
    "Quantity",
  ];

  const csvContent = [
    headers.join(","),
    ...scans.map((scan) =>
      [
        scan.timestamp,
        scan.storageSite || "",
        scan.supplier || "",
        scan.gtin || "",
        scan.ref || "",
        scan.batchLot || "",
        scan.expirationDate || "",
        scan.quantity || "",
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gs1_barcode_scans_${setupInfo.storageSite}_${
    setupInfo.supplier
  }_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
