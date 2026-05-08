"use client";

import { settingsConstraints } from "@/lib/settings";
import { useReaderSettings } from "@/app/settings-provider";

// This constant defines available Arabic font choices required by the workflow.
const ARABIC_FONT_OPTIONS = [
  "Amiri",
  "Scheherazade New",
  "Noto Naskh Arabic",
];

// This component renders the settings controls and live preview in a reusable block.
export default function SettingsContent() {
  // Shared settings state and actions come from the top-level provider.
  const { settings, updateSettings, resetSettings } = useReaderSettings();

  return (
    <>
      {/* Settings form groups all personalization controls in one accessible region. */}
      <section className="settings-panel" aria-label="Reader settings controls">
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

        {/* Reset action provides one-click return to project defaults. */}
        <div className="settings-actions">
          <button type="button" onClick={resetSettings} className="settings-reset-button">
            Reset To Defaults
          </button>
        </div>
      </section>

      {/* Live preview gives immediate feedback on selected typography values. */}
      <section className="settings-preview" aria-label="Typography preview">
        <h2 className="settings-preview-title">Live Preview</h2>
        <p className="settings-preview-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="settings-preview-translation">
          In the name of Allah, the Entirely Merciful, the Especially Merciful.
        </p>
      </section>
    </>
  );
}
