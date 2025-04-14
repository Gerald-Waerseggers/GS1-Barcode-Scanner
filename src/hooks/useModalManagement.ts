import { useState } from 'react';
import { ScanRecord } from '../types';

/**
 * Hook to manage all modal-related state
 */
export function useModalManagement() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingScan, setDeletingScan] = useState<ScanRecord | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isERPStockModalOpen, setIsERPStockModalOpen] = useState(false);
  const [showExportInfo, setShowExportInfo] = useState(false);
  const [showStockReceiptExportInfo, setShowStockReceiptExportInfo] = useState(false);

  const openEditModal = (scan: ScanRecord) => {
    setEditingScan(scan);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingScan(null);
  };

  const openDeleteModal = (scan: ScanRecord) => {
    setDeletingScan(scan);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingScan(null);
  };

  return {
    // Modal states
    isEditModalOpen,
    editingScan,
    isAddModalOpen,
    isDeleteModalOpen,
    deletingScan,
    isMappingModalOpen,
    isERPStockModalOpen,
    showExportInfo,
    showStockReceiptExportInfo,
    
    // Modal actions
    setIsEditModalOpen,
    setEditingScan,
    setIsAddModalOpen,
    setIsDeleteModalOpen,
    setDeletingScan,
    setIsMappingModalOpen,
    setIsERPStockModalOpen,
    setShowExportInfo,
    setShowStockReceiptExportInfo,
    
    // Convenience methods
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  };
}
