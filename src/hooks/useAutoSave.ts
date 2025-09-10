import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => void;
  delay?: number;
  enabled?: boolean;
  key?: string;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  key
}: UseAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>(data);
  const keyRef = useRef(key);

  // Clear localStorage when key changes or component unmounts
  useEffect(() => {
    return () => {
      if (keyRef.current && typeof window !== 'undefined') {
        try {
          localStorage.removeItem(keyRef.current);
        } catch {
          // Ignore storage errors
        }
      }
    };
  }, []);

  // Save to localStorage immediately when data changes
  useEffect(() => {
    if (!enabled || !key || typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }, [data, enabled, key]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data has actually changed
    const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(data);
    if (!hasChanged) return;

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSave(data);
      lastDataRef.current = data;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSave(data);
    lastDataRef.current = data;
  }, [data, onSave]);

  // Clear saved data function
  const clearSaved = useCallback(() => {
    if (key && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    }
  }, [key]);

  return { saveNow, clearSaved };
}