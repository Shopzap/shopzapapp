
import { useState, useCallback } from 'react';

interface UseSmartRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: () => void;
}

export const useSmartRetry = (options: UseSmartRetryOptions = {}) => {
  const { maxRetries = 2, retryDelay = 1000, onRetry } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      return false;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      if (onRetry) {
        await onRetry();
      }
      return true;
    } catch (error) {
      console.error('Retry failed:', error);
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, retryDelay, onRetry]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  const canRetry = retryCount < maxRetries;

  return {
    retry,
    reset,
    canRetry,
    isRetrying,
    retryCount,
    maxRetries
  };
};
