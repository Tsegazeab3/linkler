/**
 * A safe wrapper for localStorage to handle SecurityErrors
 * (e.g., when third-party cookies/storage are blocked).
 */
export const storage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`Storage: Failed to get item "${key}"`, e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Storage: Failed to set item "${key}"`, e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Storage: Failed to remove item "${key}"`, e);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Storage: Failed to clear', e);
    }
  }
};

export default storage;
