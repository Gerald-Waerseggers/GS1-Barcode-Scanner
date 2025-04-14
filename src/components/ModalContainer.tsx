import { ScanRecord, ScanSetup } from '../types';
import EditModal from './EditModal';
import AddModal from './AddModal';
import DeleteModal from './DeleteModal';
import MappingModal from './MappingModal';
import ERPStockModal, { ERPStockRow } from './ERPStockModal';
import ExportInfoModal from './ExportInfoModal';
import StockReceiptExportInfoModal from './StockReceiptExportInfoModal';

interface ModalContainerProps {
  modals: {
    isEditModalOpen: boolean;
    editingScan: ScanRecord | null;
    isAddModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deletingScan: ScanRecord | null;
    isMappingModalOpen: boolean;
    isERPStockModalOpen: boolean;
    showExportInfo: boolean;
    showStockReceiptExportInfo: boolean;
  };
  handlers: {
    closeEditModal: () => void;
    closeAddModal: () => void;
    closeDeleteModal: () => void;
    closeMappingModal: () => void;
    closeERPStockModal: () => void;
    closeExportInfo: () => void;
    closeStockReceiptExportInfo: () => void;
    handleSaveEdit: (scan: ScanRecord) => void;
    handleSaveAdd: (scan: Partial<ScanRecord>) => void;
    handleConfirmDelete: (scan: ScanRecord) => void;
    handleZeroCountSelection: (items: ERPStockRow[]) => void;
  };
  setupInfo: ScanSetup;
  existingScans: ScanRecord[];
}

/**
 * Container component for all modals
 */
export default function ModalContainer({
  modals,
  handlers,
  setupInfo,
  existingScans
}: ModalContainerProps) {
  return (
    <>
      <EditModal
        isOpen={modals.isEditModalOpen}
        onClose={handlers.closeEditModal}
        scan={modals.editingScan}
        onSave={handlers.handleSaveEdit}
      />
      <AddModal
        isOpen={modals.isAddModalOpen}
        onClose={handlers.closeAddModal}
        setupInfo={setupInfo}
        onSave={handlers.handleSaveAdd}
      />
      <DeleteModal
        isOpen={modals.isDeleteModalOpen}
        onClose={handlers.closeDeleteModal}
        scan={modals.deletingScan}
        onConfirm={handlers.handleConfirmDelete}
      />
      <MappingModal
        isOpen={modals.isMappingModalOpen}
        onClose={handlers.closeMappingModal}
      />
      <ERPStockModal
        isOpen={modals.isERPStockModalOpen}
        onClose={handlers.closeERPStockModal}
        onSelectZeroCount={handlers.handleZeroCountSelection}
        existingScans={existingScans}
      />
      <ExportInfoModal
        isOpen={modals.showExportInfo}
        onClose={handlers.closeExportInfo}
      />
      <StockReceiptExportInfoModal
        isOpen={modals.showStockReceiptExportInfo}
        onClose={handlers.closeStockReceiptExportInfo}
      />
    </>
  );
}
