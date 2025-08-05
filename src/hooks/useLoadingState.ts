import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingStateReturn {
  isLoading: boolean;
  loadingStates: LoadingState;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  clearAllLoading: () => void;
  isLoadingKey: (key: string) => boolean;
}

export const useLoadingState = (): UseLoadingStateReturn => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isLoadingKey = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isLoading = Object.values(loadingStates).some(loading => loading);

  return {
    isLoading,
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    clearAllLoading,
    isLoadingKey,
  };
};

export default useLoadingState;