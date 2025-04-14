import { useState } from 'react';
import { ScanSetup } from '../types';

/**
 * Hook to manage setup-related state and logic
 */
export function useSetup(initialValues: ScanSetup) {
  const [isSetup, setIsSetup] = useState(false);
  const [setupInfo, setSetupInfo] = useState<ScanSetup>(initialValues);

  const handleSetupComplete = (newSetupInfo: ScanSetup) => {
    setSetupInfo((prevSetup) => ({
      ...prevSetup,
      ...newSetupInfo,
    }));
    setIsSetup(true);
  };

  return {
    isSetup,
    setupInfo,
    setIsSetup,
    handleSetupComplete,
  };
}
