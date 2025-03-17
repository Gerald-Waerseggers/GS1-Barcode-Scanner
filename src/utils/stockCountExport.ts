import { ScanRecord, ScanSetup } from "../types";
import { getERPStockCount } from "./opfsUtils";

export async function exportStockCountCSV(
  scans: ScanRecord[],
  setupInfo: ScanSetup,
) {
  if (scans.length === 0) return;

  /*  // Prepare the header lines
  const headerLines = [
    "E;Stock count session;Description;Stock count type;Processing selection;Products without stock;Count sort;Global;Storage site;;;;;",
    "L;Stock count session;Count worksheet;Status;Storage site;;;;;;;;;;",
    "S;Stock count session;Count worksheet;Product rank;Storage site;Counted stock PAC;Counted STK stock;Zero stock;Product;Lot;Location;Stock status;Unit;PAC-STK conv.",
  ]; */

  // Load ERP stock count data
  const erpStock = await getERPStockCount();

  // Create a map for quick lookup
  const erpStockMap = new Map(
    erpStock.map((item) => [
      `${item.ref}-${item.lotNumber}-${item.location}`,
      item,
    ]),
  );

  // Get unique REFs that were scanned
  const scannedRefs = new Set(scans.map((scan) => scan.ref));

  // Process scans and compare with ERP data
  const scanLines = scans.map((scan) => {
    const key = `${scan.ref}-${scan.batchLot}-${scan.location || setupInfo.location}`;
    const erpItem = erpStockMap.get(key);

    const countedQuantity = scan.quantity || 0;
    const zeroStock = countedQuantity === 0 ? "2" : "1";

    return [
      "S",
      "",
      "",
      "",
      setupInfo.storageSite,
      countedQuantity,
      countedQuantity,
      zeroStock,
      scan.ref,
      scan.batchLot,
      scan.location || setupInfo.location || "",
      "A",
      "UN",
      "1",
      scan.expirationDate ? scan.expirationDate.replace(/-/g, "") : "",
    ].join(";");
  });

  // Add unscanned lots only for REFs that were scanned
  erpStock.forEach((item) => {
    // Only process if this REF was scanned at least once
    if (scannedRefs.has(item.ref)) {
      const key = `${item.ref}-${item.lotNumber}-${item.location}`;
      if (
        !scans.some(
          (scan) =>
            `${scan.ref}-${scan.batchLot}-${scan.location || setupInfo.location}` ===
            key,
        )
      ) {
        scanLines.push(
          [
            "S",
            "",
            "",
            "",
            setupInfo.storageSite,
            "0",
            "0",
            "2", // Zero stock
            item.ref,
            item.lotNumber,
            item.location,
            "A",
            "UN",
            "1",
            "",
          ].join(";"),
        );
      }
    }
  });

  const csvContent = [
    `E;;${setupInfo.movementCode || "Stock Count"};1;${setupInfo.storageSite};;;;${setupInfo.storageSite};;;;;;`,
    `L;;;5;${setupInfo.storageSite};;;;;;;;;;`,
    ...scanLines,
    "",
  ].join("\r\n");

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
