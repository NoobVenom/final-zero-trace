import { useState, useEffect } from 'react';

// Safe storage interface that works in both Chrome extension and web environments
const getStorage = () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return chrome.storage.local;
  }
  // Fallback to localStorage with Chrome storage-like interface
  return {
    get: (key: string) => {
      try {
        const value = localStorage.getItem(key);
        return Promise.resolve({ [key]: value ? JSON.parse(value) : undefined });
      } catch {
        return Promise.resolve({ [key]: undefined });
      }
    },
    set: (data: Record<string, unknown>) => {
      try {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    }
  };
};

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storage = getStorage();
        const result = await storage.get(key);
        if (result[key] !== undefined) {
          setValue(result[key] as T);
        }
      } catch {
        // Silently handle storage errors
      }
    };

    loadStoredData();
  }, [key]);

  const updateValue = async (newValue: T) => {
    try {
      const storage = getStorage();
      await storage.set({ [key]: newValue });
      setValue(newValue);
    } catch {
      // Silently handle storage errors
    }
  };

  return {
    value,
    updateValue
  };
}

// Legacy hook for backward compatibility
export function useLegacyStorage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-3.5-turbo');

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storage = getStorage();
        const result = await storage.get('apiKey');
        if (result.apiKey) {
          setApiKey(result.apiKey);
        }
        
        const modelResult = await storage.get('model');
        if (modelResult.model) {
          setModel(modelResult.model);
        }
      } catch {
        // Silently handle storage errors
      }
    };

    loadStoredData();
  }, []);

  const saveApiKey = async (key: string) => {
    try {
      const storage = getStorage();
      await storage.set({ apiKey: key });
      setApiKey(key);
    } catch {
      // Silently handle storage errors
    }
  };

  const saveModel = async (selectedModel: string) => {
    try {
      const storage = getStorage();
      await storage.set({ model: selectedModel });
      setModel(selectedModel);
    } catch {
      // Silently handle storage errors
    }
  };

  const clearApiKey = async () => {
    try {
      const storage = getStorage();
      await storage.set({ apiKey: '' });
      setApiKey('');
    } catch {
      // Silently handle storage errors
    }
  };

  return {
    apiKey,
    model,
    saveApiKey,
    saveModel,
    clearApiKey
  };
}