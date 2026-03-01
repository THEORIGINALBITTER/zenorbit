import { useState, useMemo, useEffect, useCallback } from 'react';
import orbitMenuConfig, { orbitMenuPresets } from '../config/orbitMenuConfig';

const STORAGE_KEY = 'orbitMenuConfig_v2';
const STORAGE_SCHEMA_VERSION = 2;
const MERGE_BY_ID_KEYS = new Set(['items', 'menuItems']);

const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

function mergeItemsById(baseItems, patchItems) {
  const map = new Map(baseItems.map((item) => [item?.id, { ...item }]));

  patchItems.forEach((patch) => {
    const id = patch?.id;
    if (id === undefined || id === null) {
      map.set(Symbol('item-without-id'), { ...patch });
      return;
    }
    const current = map.get(id) ?? { id };
    map.set(id, { ...current, ...patch });
  });

  return Array.from(map.values()).filter(Boolean);
}

function deepMerge(target, source, key = '') {
  if (Array.isArray(target) && Array.isArray(source)) {
    if (MERGE_BY_ID_KEYS.has(key)) {
      return mergeItemsById(target, source);
    }
    return [...source];
  }

  if (!isObject(source)) return source;
  if (!isObject(target)) return { ...source };

  const output = { ...target };
  Object.keys(source).forEach((nextKey) => {
    output[nextKey] = deepMerge(target[nextKey], source[nextKey], nextKey);
  });
  return output;
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const nested = keys.reduce((acc, key) => {
    if (!isObject(acc[key])) acc[key] = {};
    return acc[key];
  }, obj);
  nested[lastKey] = value;
}

function normalizeStoredPayload(raw) {
  if (isObject(raw) && isObject(raw.overrides)) {
    return {
      version: typeof raw.version === 'number' ? raw.version : 1,
      overrides: raw.overrides,
    };
  }

  if (isObject(raw)) {
    return {
      version: 1,
      overrides: raw,
    };
  }

  return {
    version: STORAGE_SCHEMA_VERSION,
    overrides: {},
  };
}

function migrateOverrides(overrides, fromVersion) {
  let next = isObject(overrides) ? { ...overrides } : {};
  let version = fromVersion;

  if (version < 2) {
    // Placeholder for legacy migration steps.
    version = 2;
  }

  return {
    version,
    overrides: next,
  };
}

const saveConfigToStorage = (overrides) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_SCHEMA_VERSION,
        overrides,
      })
    );
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
};

const loadConfigFromStorage = () => {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    const normalized = normalizeStoredPayload(parsed);
    const migrated = migrateOverrides(normalized.overrides, normalized.version);

    if (
      migrated.version !== normalized.version ||
      JSON.stringify(migrated.overrides) !== JSON.stringify(normalized.overrides)
    ) {
      saveConfigToStorage(migrated.overrides);
    }

    return migrated.overrides;
  } catch (error) {
    console.error('Failed to load config from localStorage:', error);
    return {};
  }
};

let globalConfigOverrides = loadConfigFromStorage();
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const useOrbitMenuConfig = () => {
  const [configOverridesState, setConfigOverridesState] = useState(globalConfigOverrides);

  useEffect(() => {
    const listener = () => setConfigOverridesState(globalConfigOverrides);
    listeners.add(listener);

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      globalConfigOverrides = loadConfigFromStorage();
      notifyListeners();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  const config = useMemo(() => {
    return deepMerge(orbitMenuConfig, configOverridesState);
  }, [configOverridesState]);

  const updateConfig = useCallback((path, value) => {
    const nextOverrides = { ...globalConfigOverrides };
    setNestedValue(nextOverrides, path, value);
    globalConfigOverrides = nextOverrides;
    saveConfigToStorage(nextOverrides);
    notifyListeners();
  }, []);

  const updateMany = useCallback((patchObject) => {
    if (!isObject(patchObject)) return;
    const nextOverrides = deepMerge(globalConfigOverrides, patchObject);
    globalConfigOverrides = nextOverrides;
    saveConfigToStorage(nextOverrides);
    notifyListeners();
  }, []);

  const applyPreset = useCallback((presetName, mode = 'full') => {
    const preset = orbitMenuPresets[presetName];
    if (!preset) return;

    let nextOverrides;

    if (mode === 'style') {
      const styleOnly = {};
      if (preset.visual) styleOnly.visual = preset.visual;
      if (preset.animation) styleOnly.animation = preset.animation;
      if (preset.tooltip) styleOnly.tooltip = preset.tooltip;
      nextOverrides = deepMerge(globalConfigOverrides, styleOnly);
    } else {
      // full: template/preset replaces current overrides baseline
      nextOverrides = deepMerge({}, preset);
    }

    globalConfigOverrides = nextOverrides;
    saveConfigToStorage(nextOverrides);
    notifyListeners();
  }, []);

  const resetConfig = useCallback(() => {
    globalConfigOverrides = {};
    saveConfigToStorage(globalConfigOverrides);
    notifyListeners();
  }, []);

  const exportOverrides = useCallback(() => {
    return JSON.stringify(globalConfigOverrides, null, 2);
  }, []);

  const exportFullConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  // Backward-compatible alias
  const exportConfig = exportFullConfig;

  return {
    config,
    configOverrides: configOverridesState,
    updateConfig,
    updateMany,
    applyPreset,
    resetConfig,
    exportConfig,
    exportOverrides,
    exportFullConfig,
  };
};

export default useOrbitMenuConfig;
