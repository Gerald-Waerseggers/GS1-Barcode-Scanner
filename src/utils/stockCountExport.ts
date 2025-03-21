
// New export function for comparison report
// Modified exportStockComparisonReport function
import { ScanRecord, ScanSetup } from "../types";
import { getERPStockCount } from "./opfsUtils";
import ExcelJS from 'exceljs';

// New interface for comparison results
interface StockComparisonItem {
  ref: string;
  lotNumber: string;
  location: string;
  erpQuantity: number;
  scannedQuantity: number;
  difference: number;
  status: 'missing' | 'surplus' | 'match' | 'partial';
}

// Modified exportStockComparisonReport function to use ExcelJS
export async function exportStockComparisonReport(
  scans: ScanRecord[],
  setupInfo: ScanSetup
) {
  // Load ERP stock count data
  const erpStock = await getERPStockCount();
  
  // Get unique REFs that were scanned
  const scannedRefs = new Set(
    scans.filter(scan => scan.ref).map(scan => scan.ref)
  );
  
  // Filter ERP stock to only include items with REFs that were scanned
  const relevantErpStock = erpStock.filter(item => 
    scannedRefs.has(item.ref)
  );
  
  // Create a map of ERP stock for quick lookup
  const erpStockMap = new Map(
    relevantErpStock.map((item) => [
      `${item.ref}-${item.lotNumber}-${item.location}`,
      item,
    ])
  );
  
  // Create a map of scanned items for quick lookup
  const scannedItemsMap = new Map<string, number>();
  scans.forEach(scan => {
    if (scan.ref) {
      const key = `${scan.ref}-${scan.batchLot || ''}-${scan.location || setupInfo.location}`;
      scannedItemsMap.set(key, (scannedItemsMap.get(key) || 0) + (scan.quantity || 0));
    }
  });
  
  // Compare ERP with scanned items
  const comparisonResults: StockComparisonItem[] = [];
  
  // First, check all relevant ERP items
  relevantErpStock.forEach(item => {
    const key = `${item.ref}-${item.lotNumber}-${item.location}`;
    const scannedQty = scannedItemsMap.get(key) || 0;
    const difference = scannedQty - item.quantity;
    
    let status: 'missing' | 'surplus' | 'match' | 'partial';
    if (scannedQty === 0) {
      status = 'missing'; // Item in ERP but not scanned
    } else if (scannedQty === item.quantity) {
      status = 'match';   // Quantities match exactly
    } else {
      status = difference < 0 ? 'partial' : 'surplus';
    }
    
    comparisonResults.push({
      ref: item.ref,
      lotNumber: item.lotNumber,
      location: item.location,
      erpQuantity: item.quantity,
      scannedQuantity: scannedQty,
      difference,
      status
    });
    
    // Remove from scanned map to track what's left (surplus items)
    scannedItemsMap.delete(key);
  });
  
  // Add items that were scanned but not in ERP (surplus items) for the scanned REFs
  scannedItemsMap.forEach((quantity, key) => {
    const [ref, lotNumber, location] = key.split('-');
    
    // Only include if the REF was scanned
    if (scannedRefs.has(ref)) {
      comparisonResults.push({
        ref,
        lotNumber,
        location,
        erpQuantity: 0,
        scannedQuantity: quantity,
        difference: quantity, // All surplus
        status: 'surplus'
      });
    }
  });
  
  // Sort results by status and then by REF
  comparisonResults.sort((a, b) => {
    // Order by status: missing, partial, surplus, match
    const statusOrder = { 'missing': 0, 'partial': 1, 'surplus': 2, 'match': 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // Then by REF
    return a.ref.localeCompare(b.ref);
  });
  
  // Summary statistics
  const summary = {
    missing: comparisonResults.filter(item => item.status === 'missing').length,
    partial: comparisonResults.filter(item => item.status === 'partial').length,
    surplus: comparisonResults.filter(item => item.status === 'surplus').length,
    match: comparisonResults.filter(item => item.status === 'match').length,
    total: comparisonResults.length
  };
  
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  
  // Add metadata
  workbook.creator = 'Stock Count App';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Add worksheet
  const worksheet = workbook.addWorksheet('Stock Comparison');
  
  // Set column widths
  worksheet.columns = [
    { header: 'Status', key: 'status', width: 12 },
    { header: 'REF', key: 'ref', width: 15 },
    { header: 'Lot/Batch', key: 'lotNumber', width: 15 },
    { header: 'Location', key: 'location', width: 15 },
    { header: 'ERP Qty', key: 'erpQuantity', width: 10 },
    { header: 'Scanned Qty', key: 'scannedQuantity', width: 12 },
    { header: 'Difference', key: 'difference', width: 12 }
  ];
  
  // Add header rows
  worksheet.spliceRows(1, 0, 
    [`Stock Comparison Report for ${setupInfo.movementCode || 'Report'} - ${new Date().toLocaleDateString()}`],
    [`Location: ${setupInfo.location}, Storage Site: ${setupInfo.storageSite}`],
    [`Summary: ${summary.total} items (${summary.match} match, ${summary.missing} missing, ${summary.partial} partial, ${summary.surplus} surplus)`],
    [] // Empty row
  );
  
  // Merge header cells
  worksheet.mergeCells('A1:G1');
  worksheet.mergeCells('A2:G2');
  worksheet.mergeCells('A3:G3');
  
  // Style the header rows
  ['A1', 'A2', 'A3'].forEach(cell => {
    worksheet.getCell(cell).font = {
      size: 13,
      bold: true
    };
    worksheet.getCell(cell).alignment = {
      horizontal: 'center'
    };
  });
  
  // Style the column headers (now at row 6 after adding 4 rows above)
  worksheet.getRow(6).font = {
    bold: true
  };
  worksheet.getRow(6).alignment = {
    horizontal: 'center'
  };
  
  // Add data with styling
  comparisonResults.forEach((item, index) => {
    const rowNumber = index + 7; // Adjust for header rows
    
    worksheet.addRow({
      status: item.status,
      ref: item.ref,
      lotNumber: item.lotNumber,
      location: item.location,
      erpQuantity: item.erpQuantity,
      scannedQuantity: item.scannedQuantity,
      difference: item.difference
    });
    
    // Apply status-based styling to the row 
    const statusColors = {
      'missing': 'FFFF9999', // Light red
      'partial': 'FFFFCC99', // Light orange
      'surplus': 'FF99CCFF', // Light blue
      'match': 'FF99FF99'   // Light green
    };
    
    // Color the status cell
    const statusCell = worksheet.getCell(`A${rowNumber}`);
    statusCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: statusColors[item.status] }
    };
    
    // Style the difference cell based on value
    const differenceCell = worksheet.getCell(`G${rowNumber}`);
    if (item.difference < 0) {
      differenceCell.font = { color: { argb: 'FFFF0000' } }; // Red for negative
    } else if (item.difference > 0) {
      differenceCell.font = { color: { argb: 'FF0000FF' } }; // Blue for positive
    }
    
    // Format numbers to show as integers (no decimals)
    ['E', 'F', 'G'].forEach(col => {
      const cell = worksheet.getCell(`${col}${rowNumber}`);
      cell.numFmt = '0';
    });
  });
  
  // Add total row
  const totalRow = worksheet.addRow({
    status: 'TOTAL',
    erpQuantity: comparisonResults.reduce((sum, item) => sum + item.erpQuantity, 0),
    scannedQuantity: comparisonResults.reduce((sum, item) => sum + item.scannedQuantity, 0),
    difference: comparisonResults.reduce((sum, item) => sum + item.difference, 0)
  });
  
  // Style the total row
  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    if (cell.value) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' } // Light gray
      };
    }
  });
  
  // Generate filename
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const filename = `stock_comparison_${setupInfo.movementCode || 'report'}_${today}.xlsx`;
  
  // Write the file and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  // Return the results and summary for potential display in UI
  return {
    items: comparisonResults,
    summary
  };
}

// Existing exportStockCountCSV function
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