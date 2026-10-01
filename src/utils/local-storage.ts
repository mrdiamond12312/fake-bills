export const CATALOG_STORAGE_KEY = 'receipt-lab.catalog';

/** localStorage can be missing (private mode) or full; never let that break the page. */
export const readLocalStorage = <T>(key: string): T | undefined => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

export const writeLocalStorage = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(
      'Could not save to localStorage (probably full). Try a smaller file or clear old imports.',
    );
  }
};

export const removeLocalStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
