import { ScanRecord, ScanSetup } from "../types";

export function exportStockCountCSV(scans: ScanRecord[], setupInfo: ScanSetup) {
  if (scans.length === 0) return;

 /*  // Prepare the header lines
  const headerLines = [
    "E;Stock count session;Description;Stock count type;Processing selection;Products without stock;Count sort;Global;Storage site;;;;;",
    "L;Stock count session;Count worksheet;Status;Storage site;;;;;;;;;;",
    "S;Stock count session;Count worksheet;Product rank;Storage site;Counted stock PAC;Counted STK stock;Zero stock;Product;Lot;Location;Stock status;Unit;PAC-STK conv.",
  ]; */

  // Line 4: E line with data
  const line4 = [
    "E",
    "", // Stock count session
    setupInfo.movementCode || "Stock Count Session import", // Description
    "1", // Stock count type
    setupInfo.storageSite, // Processing selection
    "",
    "",
    "",
    setupInfo.storageSite, // Storage site
    "",
    "",
    "",
    "",
  ].join(";");

  // Line 5: L line with data
  const line5 = [
    "L",
    "",
    "",
    "5", // Status
    setupInfo.storageSite,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ].join(";");

  // Then, for each scan, build an 'S' line
  const scanLines = scans.map((scan) => {
    const zeroStock = scan.quantity === 0 ? "2" : "1";
    const countedQuantity = scan.quantity || 0;
    const unit = "UN";
    const conversionFactor = "1";
    const stockStatus = "A";

    return [
      "S",
      "",
      "",
      "",
      setupInfo.storageSite,
      countedQuantity, // Counted stock PAC
      countedQuantity, // Counted STK stock
      zeroStock, // Zero stock
      scan.ref, // Product
      scan.batchLot, // Lot
      scan.location || setupInfo.location || "", // Location
      stockStatus, // Stock status
      unit, // Unit
      conversionFactor,
    ].join(";");
  });

  const csvContent = [line4, line5, ...scanLines].join("\n");

  // Generate filename
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stock_count_${setupInfo.movementCode}_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
