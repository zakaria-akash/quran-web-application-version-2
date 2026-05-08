import type { Metadata } from "next";
import "./globals.css";
import { ReaderSettingsProvider } from "./settings-provider";
import AppHeader from "./app-header";
import SurahSidebar from "./surah-sidebar";
import DesktopSettings from "./desktop-settings";

export const metadata: Metadata = {
  title: "Quran Mazid",
  description: "Read, Study, and Learn The Quran",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* Global provider makes settings available across all client views. */}
        <ReaderSettingsProvider>
          {/* The app shell keeps header/footer consistent across all routes. */}
          <div className="app-shell">
            <AppHeader />

            {/* Main content area with responsive layout */}
            <div className="app-main-content">
              {/* Sidebar (desktop only) */}
              <div className="app-main-content-sidebar">
                <SurahSidebar />
              </div>

              {/* Center content */}
              <div className="app-main-content-center">{children}</div>

              {/* Settings panel (desktop only) */}
              <div className="app-main-content-settings">
                <DesktopSettings />
              </div>
            </div>

            {/* Minimal footer provides a stable endpoint for each page. */}
            <footer className="app-footer">© 2025 Quran Mazid - Read, Study, and Learn The Quran</footer>
          </div>
        </ReaderSettingsProvider>
      </body>
    </html>
  );
}
