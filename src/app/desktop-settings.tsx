"use client";

import SettingsContent from "./settings/settings-content";

export default function DesktopSettings() {
  return (
    <div className="settings-panel-desktop">
      <div className="settings-panel-header">
        <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Settings</h2>
      </div>
      <div className="settings-panel-content">
        <SettingsContent />
      </div>
    </div>
  );
}
