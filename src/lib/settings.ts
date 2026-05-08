// This key name is centralized so all settings reads/writes use one storage slot.
const SETTINGS_STORAGE_KEY = "qwa-reader-settings";

export interface Settings {
  arabicFontFamily: string;
  arabicFontSize: number;
  translationFontSize: number;
}

export interface SettingsBounds {
  min: number;
  max: number;
}

export interface ProjectSettingsConstraints {
  storageKey: string;
  defaults: Settings;
  bounds: {
    arabic: SettingsBounds;
    translation: SettingsBounds;
  };
}

// These defaults define the baseline reading experience when no saved settings exist.
const DEFAULT_SETTINGS: Settings = {
  arabicFontFamily: "Amiri",
  arabicFontSize: 36,
  translationFontSize: 18,
};

// These bounds keep user-controlled sizes readable and prevent extreme values.
const SIZE_BOUNDS: { arabic: SettingsBounds; translation: SettingsBounds } = {
  arabic: { min: 20, max: 72 },
  translation: { min: 12, max: 36 },
};

// This helper verifies browser context so server rendering never touches localStorage.
function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// This helper clamps numeric size values into safe bounds.
function clampSize(value: any, min: number, max: number, fallback: number): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

// This helper converts unknown input into a trimmed string with fallback support.
function sanitizeString(value: any, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

// This function returns a fresh default object so callers cannot mutate module state.
export function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}

// This function normalizes an unknown object into a valid settings payload.
export function sanitizeSettings(inputSettings: any): Settings {
  const safeInput = inputSettings && typeof inputSettings === "object" ? inputSettings : {};
  const defaults = getDefaultSettings();

  return {
    arabicFontFamily: sanitizeString(safeInput.arabicFontFamily, defaults.arabicFontFamily),
    arabicFontSize: clampSize(
      safeInput.arabicFontSize,
      SIZE_BOUNDS.arabic.min,
      SIZE_BOUNDS.arabic.max,
      defaults.arabicFontSize,
    ),
    translationFontSize: clampSize(
      safeInput.translationFontSize,
      SIZE_BOUNDS.translation.min,
      SIZE_BOUNDS.translation.max,
      defaults.translationFontSize,
    ),
  };
}

// This function merges partial overrides over defaults and then validates everything.
export function mergeSettingsWithDefaults(partialSettings: Partial<Settings> | null | undefined): Settings {
  const merged = {
    ...getDefaultSettings(),
    ...(partialSettings && typeof partialSettings === "object" ? partialSettings : {}),
  };

  return sanitizeSettings(merged);
}

// This function reads settings from localStorage and returns validated values.
export function readSettingsFromStorage(): Settings {
  if (!isBrowserEnvironment()) {
    return getDefaultSettings();
  }

  try {
    const rawStoredValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!rawStoredValue) {
      return getDefaultSettings();
    }

    const parsedValue = JSON.parse(rawStoredValue);
    return mergeSettingsWithDefaults(parsedValue);
  } catch {
    // Parsing or access errors fall back to defaults for resilient startup.
    return getDefaultSettings();
  }
}

// This function saves validated settings into localStorage and returns saved payload.
export function saveSettingsToStorage(inputSettings: Partial<Settings>): Settings {
  const normalizedSettings = mergeSettingsWithDefaults(inputSettings);

  if (!isBrowserEnvironment()) {
    return normalizedSettings;
  }

  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizedSettings));
  } catch {
    // Write failures should not break UI flows; return the normalized value regardless.
  }

  return normalizedSettings;
}

// This export exposes constants for UI components that build settings controls.
export const settingsConstraints: ProjectSettingsConstraints = {
  storageKey: SETTINGS_STORAGE_KEY,
  defaults: getDefaultSettings(),
  bounds: {
    arabic: { ...SIZE_BOUNDS.arabic },
    translation: { ...SIZE_BOUNDS.translation },
  },
};
