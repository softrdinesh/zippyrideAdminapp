// src/utils/mmkvStorage.ts
import {MMKV} from 'react-native-mmkv';

// Initialize MMKV storage
export const storage = new MMKV();

export const setItem = (key: string, value: string): void => {
  try {
    storage.set(key, value);
  } catch (error) {
    console.error('Error saving data to MMKV', error);
  }
};

export const getItem = (key: string): string | null => {
  try {
    return storage.getString(key) || null;
  } catch (error) {
    console.error('Error retrieving data from MMKV', error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error('Error removing data from MMKV', error);
  }
};
