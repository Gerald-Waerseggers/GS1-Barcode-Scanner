import { useState, useEffect, useRef } from 'react';
import { getERPStockCount, getAllERPRefs } from '../utils/opfsUtils';
import toast from 'react-hot-toast';

/**
 * Hook to manage ERP data loading and integration
 */
export function useERPIntegration(isStockCountMode: boolean) {
  const [erpRefs, setErpRefs] = useState<Set<string>>(new Set());
  const erpRefsLoaded = useRef(false);
  const [allERPRefs, setAllERPRefs] = useState<Set<string>>(new Set());
  const allERPRefsLoaded = useRef(false);

  // Load ERP REFs when in stock count mode
  useEffect(() => {
    if (isStockCountMode) {
      if (!erpRefsLoaded.current) {
        loadERPRefs();
      }
      if (!allERPRefsLoaded.current) {
        loadAllERPRefs();
      }
    }
  }, [isStockCountMode]);

  const loadERPRefs = async () => {
    try {
      const erpStock = await getERPStockCount();
      const refSet = new Set(erpStock.map((item) => item.ref));
      setErpRefs(refSet);
      erpRefsLoaded.current = true;
      console.log(`Loaded ${refSet.size} REFs from ERP`);
    } catch (error) {
      console.error("Failed to load ERP REFs:", error);
      toast.error("Failed to load ERP reference data");
    }
  };

  const loadAllERPRefs = async () => {
    try {
      const allRefs = await getAllERPRefs();
      setAllERPRefs(allRefs);
      allERPRefsLoaded.current = true;
      console.log(`Loaded ${allRefs.size} total REFs from ERP`);
    } catch (error) {
      console.error("Failed to load all ERP REFs:", error);
    }
  };

  return {
    erpRefs,
    allERPRefs,
    loadERPRefs,
    loadAllERPRefs,
  };
}
