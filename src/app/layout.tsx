import type { Metadata } from "next";
import "./globals.css";
import { ReaderSettingsProvider } from "./settings-provider";
import AppHeader from "./app-header";
import SurahSidebar from "./surah-sidebar";
import DesktopSettings from "./desktop-settings";
import { getSurahList } from "@/lib/quran";

// Metadata is defined in the root layout so every route inherits a consistent
// title, description, and icon set without repeating those values per page.
export const metadata: Metadata = {
  title: "Quran Mazid",
  description: "Read, Study, and Learn The Quran",
  icons: {
    icon: "/green-leaf.svg",
    shortcut: "/green-leaf.svg",
    apple: "/green-leaf.svg",
  },
};

// The root layout preloads shared Surah data on the server so navigation and
// header search can render immediately instead of waiting for client fetches.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The Surah list is reused by multiple persistent shell regions, so loading
  // it here prevents duplicate work and improves first-paint completeness.
  const surahs = await getSurahList();

  return (
    // Dark mode is stamped into the root HTML so hard reloads never flash a
    // light theme before the client-side preference store hydrates.
    <html lang="en" data-theme="dark" style={{ colorScheme: "dark" }}>
      <body suppressHydrationWarning>
        {/* Global theme and reader settings state are provided to the whole app tree. */}
        <ReaderSettingsProvider>
          {/* The persistent shell keeps navigation, content, and settings in one shared frame. */}
          <div className="app-shell">
            {/* Header receives the server-loaded Surah list for fast search and drawer rendering. */}
            <AppHeader surahs={surahs} />

            {/* Desktop layout is sidebar | reader | settings, while mobile collapses to one column. */}
            <main className="app-main-content">
              {/* Desktop Surah navigation reuses the same dataset as the mobile navigation drawer. */}
              <aside className="app-main-content-sidebar">
                <SurahSidebar surahs={surahs} />
              </aside>

              {/* Route content lives in the center column so all pages share one reading surface. */}
              <div className="app-main-content-center">
                {children}

                {/* Footer remains global because it belongs to the persistent application shell. */}
                <footer className="app-footer">
                  © 2026 Quran Mazid - Read, Study, and Learn The Quran | Zakaria Ibrahim | zakaria.93@yahoo.com
                </footer>
              </div>

              {/* Desktop settings stay mounted for quick reader customization while reading. */}
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
