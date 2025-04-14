import { ScanRecord, ScanSetup } from "./types";
import { handleExport } from "./utils/scan/exportUtils";
import ScanInputForm from "./components/ScanInputForm";
import ScansGrid from "./components/ScansGrid";
import ScannerHeader from "./components/ScannerHeader";
import LastScannedItemDisplay from "./components/LastScannedItemDisplay";
import ModalContainer from "./components/ModalContainer";
import SetupForm from "./components/SetupForm";

// Custom hooks
import { useSetup } from "./hooks/useSetup";
import { useScanManagement } from "./hooks/useScanManagement";
import { useERPIntegration } from "./hooks/useERPIntegration";
import { useModalManagement } from "./hooks/useModalManagement";

/**
 * Main BarcodeScanner component
 */
export default function BarcodeScanner() {
  // Initialize setup with default values
  const initialSetup: ScanSetup = {
    stockCount: true,
    storageSite: "MM001",
    movementCode: "",
    location: "",
    addRefMode: true,
    expiredTime: 6,
  };

  // Use custom hooks to manage different aspects of the application
  const { isSetup, setupInfo, setIsSetup, handleSetupComplete } = useSetup(initialSetup);
  const { erpRefs, allERPRefs } = useERPIntegration(setupInfo.stockCount);
  const {
    scans,
    error,
    lastScannedItem,
    handleScan,
    handleDelete,
    handleEdit,
    handleAdd,
    handleSetChange,
    clearScans,
    addZeroCountRecords,
  } = useScanManagement(setupInfo, erpRefs);
  const modalState = useModalManagement();

  // Handle modal actions
  const handleEditClick = (scan: ScanRecord) => {
    modalState.openEditModal(scan);
  };

  const handleDeleteClick = (scan: ScanRecord) => {
    modalState.openDeleteModal(scan);
  };

  const handleConfirmDelete = (scan: ScanRecord) => {
    handleDelete(scan);
    modalState.closeDeleteModal();
  };

  const handleSaveEdit = (updatedScan: ScanRecord) => {
    handleEdit(updatedScan);
    modalState.closeEditModal();
  };

  const handleSaveAdd = (manualScan: Partial<ScanRecord>) => {
    const success = handleAdd(manualScan);
    if (success) {
      modalState.setIsAddModalOpen(false);
    }
  };

  // Handle export
  const handleExportClick = async () => {
    await handleExport(
      scans,
      setupInfo,
      () => modalState.setShowExportInfo(true),
      () => modalState.setShowStockReceiptExportInfo(true)
    );
  };

  // If setup is not complete, show setup form
  if (!isSetup) {
    return (
      <SetupForm
        onSetupComplete={handleSetupComplete}
        initialValues={setupInfo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 h-fit">
          {/* Header section */}
          <ScannerHeader
            setupInfo={setupInfo}
            onSetupChange={() => setIsSetup(false)}
            onMappingOpen={() => modalState.setIsMappingModalOpen(true)}
            onExport={handleExportClick}
            onClear={clearScans}
            onERPStockOpen={() => modalState.setIsERPStockModalOpen(true)}
            scanCount={scans.length}
          />

          {/* Scan input form */}
          <ScanInputForm
            onScan={handleScan}
            error={error}
            onAddManual={() => modalState.setIsAddModalOpen(true)}
            addRefMode={setupInfo.addRefMode}
          />

          {/* Last scanned item display */}
          <LastScannedItemDisplay lastScannedItem={lastScannedItem} />

          {/* Scans grid */}
          <ScansGrid
            scans={scans}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            erpRefs={erpRefs}
            allERPRefs={allERPRefs}
            isStockCount={setupInfo.stockCount}
            expiredTime={setupInfo.expiredTime}
            onSetChange={handleSetChange}
          />
        </div>
      </div>

      {/* Modals */}
      <ModalContainer
        modals={{
          isEditModalOpen: modalState.isEditModalOpen,
          editingScan: modalState.editingScan,
          isAddModalOpen: modalState.isAddModalOpen,
          isDeleteModalOpen: modalState.isDeleteModalOpen,
          deletingScan: modalState.deletingScan,
          isMappingModalOpen: modalState.isMappingModalOpen,
          isERPStockModalOpen: modalState.isERPStockModalOpen,
          showExportInfo: modalState.showExportInfo,
          showStockReceiptExportInfo: modalState.showStockReceiptExportInfo,
        }}
        handlers={{
          closeEditModal: modalState.closeEditModal,
          closeAddModal: () => modalState.setIsAddModalOpen(false),
          closeDeleteModal: modalState.closeDeleteModal,
          closeMappingModal: () => modalState.setIsMappingModalOpen(false),
          closeERPStockModal: () => modalState.setIsERPStockModalOpen(false),
          closeExportInfo: () => modalState.setShowExportInfo(false),
          closeStockReceiptExportInfo: () => modalState.setShowStockReceiptExportInfo(false),
          handleSaveEdit,
          handleSaveAdd,
          handleConfirmDelete,
          handleZeroCountSelection: addZeroCountRecords,
        }}
        setupInfo={setupInfo}
        existingScans={scans}
      />
    </div>
  );
}
