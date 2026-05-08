"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  getDefaultSettings,
  mergeSettingsWithDefaults,
  saveSettingsToStorage,
  readSettingsFromStorage,
  Settings,
} from "@/lib/settings";

export type ThemeMode = "dark" | "light";

interface ReaderSettingsContextValue {
  settings: Settings;
  theme: ThemeMode;
  updateSettings: (partialUpdate: Partial<Settings>) => void;
  resetSettings: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "qwa-theme-mode";

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

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
}

// This hook gives consumer components typed access to settings state and actions.
export function useReaderSettings() {
  const contextValue = useContext(ReaderSettingsContext);
  if (!contextValue) {
    throw new Error("useReaderSettings must be used inside ReaderSettingsProvider.");
  }
  return contextValue;
}

// This provider centralizes settings persistence, theme persistence, and global CSS variables.
export function ReaderSettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = useSyncExternalStore(
    subscribeToSettingsStore,
    getSettingsClientSnapshot,
    getSettingsServerSnapshot,
  );
  const [theme, setThemeState] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    hydrateSettingsStoreFromStorage();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const updateSettings = useCallback((partialUpdate: Partial<Settings>) => {
    const mergedSettings = mergeSettingsWithDefaults({ ...currentSettingsSnapshot, ...partialUpdate });
    saveSettingsToStorage(mergedSettings);
    currentSettingsSnapshot = mergedSettings;
    emitSettingsStoreChange();
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    saveSettingsToStorage(defaultSettings);
    currentSettingsSnapshot = defaultSettings;
    emitSettingsStoreChange();
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  const cssVariables = useMemo(() => ({
    "--qwa-arabic-font-family": `"${settings.arabicFontFamily}", serif`,
    "--qwa-arabic-font-size": `${settings.arabicFontSize}px`,
    "--qwa-translation-font-size": `${settings.translationFontSize}px`,
  } as React.CSSProperties), [settings]);

  const contextValue = useMemo(() => ({
    settings,
    theme,
    updateSettings,
    resetSettings,
    setTheme,
    toggleTheme,
  }), [resetSettings, setTheme, settings, theme, toggleTheme, updateSettings]);

  return (
    <ReaderSettingsContext.Provider value={contextValue}>
      <div className="reader-settings-scope" style={cssVariables}>
        {children}
      </div>
    </ReaderSettingsContext.Provider>
  );
}
