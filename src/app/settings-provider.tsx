"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  getDefaultSettings,
  mergeSettingsWithDefaults,
  saveSettingsToStorage,
  readSettingsFromStorage,
  Settings,
} from "@/lib/settings";

interface ReaderSettingsContextValue {
  settings: Settings;
  updateSettings: (partialUpdate: Partial<Settings>) => void;
  resetSettings: () => void;
}

// This context carries reader settings and mutators to any client component in the app tree.
const ReaderSettingsContext = createContext<ReaderSettingsContextValue | null>(null);

// This default snapshot stays stable across server renders and initial hydration.
const defaultSettingsSnapshot = Object.freeze(getDefaultSettings());

// This mutable snapshot is the single source of truth for the client-side settings store.
let currentSettingsSnapshot = defaultSettingsSnapshot;

// This guard ensures localStorage hydration happens once per client runtime.
let hasHydratedFromStorage = false;

// This listener registry powers a small local settings store for subscription updates.
const settingsStoreListeners = new Set<() => void>();

// This helper notifies all subscribers after settings changes.
function emitSettingsStoreChange() {
  settingsStoreListeners.forEach((listener) => listener());
}

// This subscribe hook is used by useSyncExternalStore for safe hydration behavior.
function subscribeToSettingsStore(listener: () => void) {
  settingsStoreListeners.add(listener);
  return () => {
    settingsStoreListeners.delete(listener);
  };
}

// This server snapshot guarantees deterministic values during SSR and hydration.
function getSettingsServerSnapshot() {
  return defaultSettingsSnapshot;
}

// This client snapshot returns a stable object reference unless an explicit store update occurs.
function getSettingsClientSnapshot() {
  return currentSettingsSnapshot;
}

// This one-time hydrator imports persisted settings and updates subscribers when needed.
function hydrateSettingsStoreFromStorage() {
  if (typeof window === "undefined" || hasHydratedFromStorage) {
    return;
  }

  hasHydratedFromStorage = true;
  const hydratedSettings = mergeSettingsWithDefaults(readSettingsFromStorage());

  if (JSON.stringify(hydratedSettings) !== JSON.stringify(currentSettingsSnapshot)) {
    currentSettingsSnapshot = hydratedSettings;
    emitSettingsStoreChange();
  }
}

// This hook gives consumer components typed access to settings state and actions.
export function useReaderSettings() {
  const contextValue = useContext(ReaderSettingsContext);
  if (!contextValue) {
    throw new Error("useReaderSettings must be used inside ReaderSettingsProvider.");
  }
  return contextValue;
}

// This provider centralizes settings persistence and applies CSS variables for global styling.
export function ReaderSettingsProvider({ children }: { children: React.ReactNode }) {
  // External-store hydration keeps first client render aligned with server-rendered markup.
  const settings = useSyncExternalStore(
    subscribeToSettingsStore,
    getSettingsClientSnapshot,
    getSettingsServerSnapshot,
  );

  // Hydrate persisted settings after mount so SSR and initial hydration remain deterministic.
  useEffect(() => {
    hydrateSettingsStoreFromStorage();
  }, []);

  // This callback merges updates, persists them, and updates state in one path.
  const updateSettings = useCallback((partialUpdate: Partial<Settings>) => {
    const mergedSettings = mergeSettingsWithDefaults({ ...currentSettingsSnapshot, ...partialUpdate });
    saveSettingsToStorage(mergedSettings);

    // Store snapshot is updated before notification so subscribers read the latest values.
    currentSettingsSnapshot = mergedSettings;
    emitSettingsStoreChange();
  }, []);

  // This callback restores defaults and persists the reset immediately.
  const resetSettings = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    saveSettingsToStorage(defaultSettings);

    // Reset updates store snapshot and triggers a re-render for subscribed components.
    currentSettingsSnapshot = defaultSettings;
    emitSettingsStoreChange();
  }, []);

  // These CSS variables apply reader preferences to all descendant pages consistently.
  const cssVariables = useMemo(() => ({
    "--qwa-arabic-font-family": `"${settings.arabicFontFamily}", serif`,
    "--qwa-arabic-font-size": `${settings.arabicFontSize}px`,
    "--qwa-translation-font-size": `${settings.translationFontSize}px`,
  } as React.CSSProperties), [settings]);

  // The memoized context value prevents avoidable downstream re-renders.
  const contextValue = useMemo(() => ({
    settings,
    updateSettings,
    resetSettings,
  }), [resetSettings, settings, updateSettings]);

  return (
    <ReaderSettingsContext.Provider value={contextValue}>
      {/* This wrapper injects CSS variables so server and client views share typography settings. */}
      <div className="reader-settings-scope" style={cssVariables}>
        {children}
      </div>
    </ReaderSettingsContext.Provider>
  );
}
