import { useState, useCallback } from 'react';
import { AppError } from '../types';

interface UseErrorHandlerReturn {
  error: AppError | null;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
  retry: (() => void) | null;
  setRetry: (retryFn: (() => void) | null) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<AppError | null>(null);
  const [retry, setRetry] = useState<(() => void) | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setRetry(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error('Error occurred:', error);
    
    if (error instanceof Error) {
      setError({
        message: error.message,
        code: 'UNKNOWN_ERROR',
        details: error.stack ? { stack: error.stack } : undefined,
      });
    } else if (typeof error === 'string') {
      setError({
        message: error,
        code: 'UNKNOWN_ERROR',
      });
    } else {
      setError({
        message: '发生未知错误',
        code: 'UNKNOWN_ERROR',
        details: { originalError: error },
      });
    }
  }, []);

  return {
    error,
    setError,
    clearError,
    handleError,
    retry,
    setRetry,
  };
};

export default useErrorHandler;