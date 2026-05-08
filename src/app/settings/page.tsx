"use client";

import Link from "next/link";
import SettingsContent from "./settings-content";

export default function SettingsPage() {
  return (
    <div className="surah-detail-page">
      <div className="surah-detail-topbar">
        <Link href="/" className="back-link">
          Back To Surah List
        </Link>
      </div>

      <header className="surah-detail-header surah-detail-header-left">
        <h1 className="surah-detail-title">Reader Settings</h1>
        <p className="settings-subtitle settings-page-subtitle">
          Customize Arabic and translation typography. Preferences are saved in your browser.
        </p>
      </header>

      <SettingsContent />
    </div>
  );
}
