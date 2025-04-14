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

  // Get unique REFs that were scanned, normalized to lowercase, and exclude those with zero quantity
  const scannedRefs = new Set(
    scans
      .filter((scan) => scan.quantity !== 0) // Exclude scans with zero quantity
      .map((scan) => scan.ref?.toLowerCase()),
  );

  // Process scans and compare with ERP data
  const scanLines: string[] = [];

  scans.forEach((scan) => {
    const countedQuantity = scan.quantity || 0;
    const zeroStock = countedQuantity === 0 ? "2" : "1";

    // Determine location based on Set flag or if location is MMPER
    let location = scan.location || setupInfo.location || "";
    let originalLocation = location;
    let needsZeroCount = false;

    // Handle Set items and MMPER items the same way - in the export, not in the UI
    if (scan.isSet && countedQuantity > 0) {
      location = "MMSET";
      needsZeroCount = true;
    } else if (location === "MMPER" && countedQuantity > 0) {
      // Keep MMPER location but add zero count for original location
      // We need to get the original location from setupInfo since MMPER items
      // don't store their original location
      originalLocation = setupInfo.location;
      needsZeroCount = true;
    }

    // Add the regular scan line
    scanLines.push(
      [
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
        location,
        "A",
        "UN",
        "1",
        scan.expirationDate ? scan.expirationDate.replace(/-/g, "") : "",
      ].join(";"),
    );

    // For items marked as "Set" or items in MMPER, add a zero count line for the original location
    if (needsZeroCount && originalLocation !== location) {
      scanLines.push(
        [
          "S",
          "",
          "",
          "",
          setupInfo.storageSite,
          "0", // Zero quantity
          "0",
          "2", // Zero stock indicator
          scan.ref,
          scan.batchLot,
          originalLocation, // Original location
          "A",
          "UN",
          "1",
          scan.expirationDate ? scan.expirationDate.replace(/-/g, "") : "",
        ].join(";"),
      );
    }
  });

  // Add unscanned lots only for REFs that were scanned
  erpStock.forEach((item) => {
    // Only process if this REF was scanned at least once
    if (scannedRefs.has(item.ref.toLowerCase())) {
      const key = `${item.ref.toLowerCase()}-${item.lotNumber.toLowerCase()}-${item.location}`;
      if (
        !scans.some(
          (scan) =>
            `${scan.ref?.toLowerCase()}-${scan.batchLot?.toLowerCase()}-${scan.location || setupInfo.location}` ===
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
