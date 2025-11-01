import { useState, useEffect } from 'react';

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      // If a value exists, parse it. Otherwise, return the default.
      if (storedValue) {
        return JSON.parse(storedValue);
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      // Don't store the default value if it's what we started with.
      // This keeps localStorage cleaner.
      if (state !== defaultValue) {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state, defaultValue]);

  return [state, setState];
}

export default usePersistentState;