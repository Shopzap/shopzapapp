
import { useState, useEffect } from 'react';

interface UseDelayedLoadingOptions {
  delay?: number;
  timeout?: number;
}

export const useDelayedLoading = (
  isLoading: boolean, 
  options: UseDelayedLoadingOptions = {}
) => {
  const { delay = 300, timeout = 10000 } = options;
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    if (isLoading) {
      // Show loading after delay
      delayTimer = setTimeout(() => {
        setShouldShowLoading(true);
      }, delay);

      // Set timeout
      timeoutTimer = setTimeout(() => {
        setHasTimedOut(true);
      }, timeout);
    } else {
      // Hide loading immediately when done
      setShouldShowLoading(false);
      setHasTimedOut(false);
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading, delay, timeout]);

  return {
    shouldShowLoading,
    hasTimedOut
  };
};
