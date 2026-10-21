export const setLocalStorage = (key: string, value: unknown): void => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Local storage set error:", error);
      }
    }
  };
  
  export const getLocalStorage = <T>(key: string): T | null => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch (error) {
        console.error("Local storage get error:", error);
        return null;
      }
    }
    return null;
  };
  
  export const removeLocalStorage = (key: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  };
  
  export const clearLocalStorage = (): void => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  };