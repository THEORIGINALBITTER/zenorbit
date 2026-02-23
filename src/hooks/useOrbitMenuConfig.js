import { useState, useMemo, useEffect, useCallback } from 'react';
import orbitMenuConfig, { orbitMenuPresets } from '../config/orbitMenuConfig';

// Storage key for localStorage
const STORAGE_KEY = 'orbitMenuConfig_v2';

// Load initial config from localStorage
const loadConfigFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    const colors = parsed?.visual?.colors;
    if (colors) {
      const values = Object.values(colors);
      const hasOrange = values.includes("#f97316") || values.includes("#ea580c");
      if (hasOrange) {
        delete parsed.visual.colors;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load config from localStorage:', error);
    return {};
  }
};

// Save config to localStorage
const saveConfigToStorage = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
};

// Global state to share config across all hook instances
let globalConfigOverrides = loadConfigFromStorage();
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

/**
 * Hook to manage OrbitMenu configuration with live customization support
 * Allows runtime override of config values for Visual Customizer
 * Uses global state to sync across all components
 */
export const useOrbitMenuConfig = () => {
  const [updateCounter, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(prev => prev + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  // Merge base config with global overrides
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => {
    const merged = deepMerge(orbitMenuConfig, globalConfigOverrides);
    console.log('📦 Config recomputed:', merged.visual.radius, 'Counter:', updateCounter);
    return merged;
  }, [updateCounter]);

  // Update specific config value
  const updateConfig = useCallback((path, value) => {
    const newOverrides = { ...globalConfigOverrides };
    setNestedValue(newOverrides, path, value);
    globalConfigOverrides = newOverrides;
    saveConfigToStorage(newOverrides); // Save to localStorage
    console.log(`🔄 Config updated: ${path} = ${value}`, `Listeners: ${listeners.size}`);
    notifyListeners();
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetName) => {
    const preset = orbitMenuPresets[presetName];
    if (preset) {
      globalConfigOverrides = deepMerge(globalConfigOverrides, preset);
      saveConfigToStorage(globalConfigOverrides); // Save to localStorage
      notifyListeners();
    }
  }, []);

  // Reset to default
  const resetConfig = useCallback(() => {
    globalConfigOverrides = {};
    saveConfigToStorage(globalConfigOverrides); // Clear localStorage
    notifyListeners();
  }, []);

  // Export current config as JSON
  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  return {
    config,
    updateConfig,
    applyPreset,
    resetConfig,
    exportConfig,
    configOverrides: globalConfigOverrides,
  };
};

// Helper: Deep merge objects
function deepMerge(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

// Helper: Check if value is object
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Helper: Set nested value by path string (e.g., "visual.radius")
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const nested = keys.reduce((o, k) => {
    if (!o[k]) o[k] = {};
    return o[k];
  }, obj);
  nested[lastKey] = value;
}

export default useOrbitMenuConfig;
