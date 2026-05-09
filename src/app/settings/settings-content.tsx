"use client";

import { settingsConstraints } from "@/lib/settings";
import { useReaderSettings } from "@/app/settings-provider";

// Font options are centralized so every settings surface shows the same reader choices.
const ARABIC_FONT_OPTIONS = [
  "Amiri",
  "Scheherazade New",
  "Noto Naskh Arabic",
];

// This shared form powers every settings surface so typography behavior stays
// identical whether users open desktop, mobile, or dedicated route UI.
export default function SettingsContent() {
  const { settings, updateSettings, resetSettings } = useReaderSettings();

  return (
    <div className="settings-panel">
      {/* Global Arabic font selection updates the main Quran text rendering face. */}
      <div className="settings-field">
        <label htmlFor="arabic-font-family" className="settings-label">
          Arabic Font Family
        </label>
        <select
          id="arabic-font-family"
          value={settings.arabicFontFamily}
          onChange={(event) => updateSettings({ arabicFontFamily: event.target.value })}
          className="settings-select"
        >
          {ARABIC_FONT_OPTIONS.map((fontName) => (
            <option key={fontName} value={fontName}>
              {fontName}
            </option>
          ))}
        </select>
      </div>

      {/* Arabic font size is isolated because script legibility needs a larger scale range. */}
      <div className="settings-field">
        <label htmlFor="arabic-font-size" className="settings-label">
          Arabic Font Size ({settings.arabicFontSize}px)
        </label>
        <input
          id="arabic-font-size"
          type="range"
          min={settingsConstraints.bounds.arabic.min}
          max={settingsConstraints.bounds.arabic.max}
          value={settings.arabicFontSize}
          onChange={(event) => updateSettings({ arabicFontSize: Number(event.target.value) })}
          className="settings-range"
        />
      </div>

      {/* Translation size is separate so readers can tune density independently. */}
      <div className="settings-field">
        <label htmlFor="translation-font-size" className="settings-label">
          Translation Font Size ({settings.translationFontSize}px)
        </label>
        <input
          id="translation-font-size"
          type="range"
          min={settingsConstraints.bounds.translation.min}
          max={settingsConstraints.bounds.translation.max}
          value={settings.translationFontSize}
          onChange={(event) => updateSettings({ translationFontSize: Number(event.target.value) })}
          className="settings-range"
        />
      </div>

      {/* The support CTA is currently a non-navigating placeholder styled to match the design system. */}
      <a href="#" className="support-button" onClick={(event) => event.preventDefault()}>
        <span className="support-button-title">Help spread knowledge...</span>
        <span className="support-button-subtitle">Support Our Mission</span>
      </a>

      {/* Reset provides a one-click escape hatch back to known-good defaults. */}
      <div className="settings-actions">
        <button type="button" onClick={resetSettings} className="settings-reset-button">
          Reset To Defaults
        </button>
      </div>

      {/* Live preview gives immediate feedback before readers return to the Surah content. */}
      <section className="settings-preview" aria-label="Typography preview">
        <h2 className="settings-preview-title">Live Preview</h2>
        <p
          className="settings-preview-arabic"
          style={{
            fontFamily: settings.arabicFontFamily,
            fontSize: `${settings.arabicFontSize}px`,
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p
          className="settings-preview-translation"
          style={{
            fontSize: `${settings.translationFontSize}px`,
          }}
        >
          In the name of Allah, the Entirely Merciful, the Especially Merciful.
        </p>
      </section>
    </div>
  );
}
