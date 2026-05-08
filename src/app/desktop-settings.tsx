"use client";

import { useState } from "react";
import SettingsContent from "./settings/settings-content";

export default function DesktopSettings() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="settings-panel-desktop">
      <div className="settings-panel-header">
        <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Settings</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="settings-panel-toggle"
          aria-label="Toggle settings panel"
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>
      {isExpanded && (
        <div className="settings-panel-content">
          <SettingsContent />
        </div>
      )}
    </div>
  );
}
