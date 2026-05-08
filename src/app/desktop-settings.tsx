"use client";

import SettingsContent from "./settings/settings-content";

export default function DesktopSettings() {
  return (
    <div className="settings-panel-desktop">
      <div className="settings-panel-header">
        <h2 className="settings-panel-heading">Settings</h2>
      </div>
      <div className="settings-panel-content">
        <SettingsContent />
      </div>
    </div>
  );
}
