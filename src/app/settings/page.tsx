"use client";

import Link from "next/link";
import SettingsContent from "./settings-content";

// This standalone route mirrors the same settings available in the desktop
// panel and mobile drawer, giving users a dedicated full-page fallback.
export default function SettingsPage() {
  return (
    <div className="surah-detail-page">
      {/* Route-local navigation keeps this utility page tied to the main reader flow. */}
      <div className="surah-detail-topbar">
        <Link href="/" className="back-link">
          Back To Surah List
        </Link>
      </div>

      {/* Reusing the Surah page header style keeps auxiliary pages visually cohesive. */}
      <header className="surah-detail-header surah-detail-header-left">
        <h1 className="surah-detail-title">Reader Settings</h1>
        <p className="settings-subtitle settings-page-subtitle">
          Customize Arabic and translation typography. Preferences are saved in your browser.
        </p>
      </header>

      {/* Shared settings content ensures all settings entry points stay synchronized. */}
      <SettingsContent />
    </div>
  );
}
