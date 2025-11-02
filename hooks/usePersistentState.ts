/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// Fix: Imported Dispatch and SetStateAction to correctly type the hook's return value.
function usePersistentState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
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