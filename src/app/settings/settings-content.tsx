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
    <div className="settings-panel">
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

      {/* Support action per design spec */}
      <a 
        href="#" 
        className="support-button"
        onClick={(e) => e.preventDefault()}
      >
        <span className="support-button-title">Help spread knowledge...</span>
        <span className="support-button-subtitle">Support Our Mission</span>
      </a>

      {/* Reset action provides one-click return to project defaults. */}
      <div className="settings-actions">
        <button 
          type="button" 
          onClick={resetSettings} 
          className="settings-reset-button"
          style={{ 
            width: "100%", 
            height: "44px", 
            background: "rgba(255,255,255,0.05)", 
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Reset To Defaults
        </button>
      </div>

      {/* Live preview gives immediate feedback on selected typography values. */}
      <section className="settings-preview" aria-label="Typography preview" style={{ marginTop: "12px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 className="settings-preview-title" style={{ fontSize: "0.9rem", marginBottom: "12px", color: "#aab8d4" }}>Live Preview</h2>
        <p className="settings-preview-arabic" style={{ fontFamily: settings.arabicFontFamily, fontSize: `${settings.arabicFontSize}px`, textAlign: "right", direction: "rtl", marginBottom: "12px" }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="settings-preview-translation" style={{ fontSize: `${settings.translationFontSize}px`, color: "#aab8d4" }}>
          In the name of Allah, the Entirely Merciful, the Especially Merciful.
        </p>
      </section>
    </div>
  );
}
