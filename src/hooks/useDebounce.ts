import { useEffect, useState } from 'react';

/**
 * useDebounce Hook
 * ----------------
 * Delays updating the debounced value until after `delay` milliseconds have elapsed
 * since the last time the input value changed.
 *
 * Prevents rapid API requests on every single keystroke during search input.
 *
 * @param value The reactive input value (e.g. search query)
 * @param delay Milliseconds delay (default: 400ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update debounced value after specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer if value changes again before delay expires (cleanup phase)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
