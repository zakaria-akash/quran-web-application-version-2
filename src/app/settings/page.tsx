"use client";

import Link from "next/link";
import SettingsContent from "./settings-content";

// This page allows users to personalize reading typography and persist it locally.
export default function SettingsPage() {
  return (
    <div className="surah-detail-page">
      {/* Top navigation keeps settings page connected to core reading routes. */}
      <div className="surah-detail-topbar">
        <Link href="/" className="back-link">
          ← Back To Surah List
        </Link>
      </div>

      {/* Header communicates scope and persistence behavior clearly. */}
      <header className="surah-detail-header" style={{ textAlign: "left" }}>
        <h1 className="surah-detail-title">Reader Settings</h1>
        <p className="settings-subtitle" style={{ color: "#aab8d4", marginTop: "8px" }}>
          Customize Arabic and translation typography. Preferences are saved in your browser.
        </p>
      </header>

      <SettingsContent />
    </div>
  );
}
