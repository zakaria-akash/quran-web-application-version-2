"use client";

import Link from "next/link";
import SettingsContent from "./settings-content";

// This page allows users to personalize reading typography and persist it locally.
export default function SettingsPage() {
  return (
    <main className="settings-page">
      {/* Top navigation keeps settings page connected to core reading routes. */}
      <div className="settings-topbar">
        <Link href="/" className="back-link">
          Back To Surah List
        </Link>
      </div>

      {/* Header communicates scope and persistence behavior clearly. */}
      <header className="settings-header">
        <h1 className="settings-title">Reader Settings</h1>
        <p className="settings-subtitle">
          Customize Arabic and translation typography. Preferences are saved in your browser.
        </p>
      </header>

      <SettingsContent />
    </main>
  );
}
