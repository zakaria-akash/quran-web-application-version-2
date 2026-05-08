import type { Metadata } from "next";
import "./globals.css";
import { ReaderSettingsProvider } from "./settings-provider";
import AppHeader from "./app-header";
import SurahSidebar from "./surah-sidebar";
import DesktopSettings from "./desktop-settings";

export const metadata: Metadata = {
  title: "Quran Mazid",
  description: "Read, Study, and Learn The Quran",
  icons: {
    icon: "/green-leaf.svg",
    shortcut: "/green-leaf.svg",
    apple: "/green-leaf.svg",
  },
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
            <main className="app-main-content">
              {/* Left Sidebar (Desktop only) */}
              <aside className="app-main-content-sidebar">
                <SurahSidebar />
              </aside>

              {/* Center Content */}
              <div className="app-main-content-center">
                {children}
                
                {/* Minimal footer provides a stable endpoint for each page. */}
                <footer className="app-footer">
                  © 2026 Quran Mazid - Read, Study, and Learn The Quran
                </footer>
              </div>

              {/* Right Settings Panel (Desktop only) */}
              <aside className="app-main-content-settings">
                <DesktopSettings />
              </aside>
            </main>
          </div>
        </ReaderSettingsProvider>
      </body>
    </html>
  );
}
