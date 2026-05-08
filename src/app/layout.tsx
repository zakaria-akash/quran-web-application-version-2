import type { Metadata } from "next";
import "./globals.css";
import { ReaderSettingsProvider } from "./settings-provider";
import AppHeader from "./app-header";
import SurahSidebar from "./surah-sidebar";
import DesktopSettings from "./desktop-settings";
import { getSurahList } from "@/lib/quran";

export const metadata: Metadata = {
  title: "Quran Mazid",
  description: "Read, Study, and Learn The Quran",
  icons: {
    icon: "/green-leaf.svg",
    shortcut: "/green-leaf.svg",
    apple: "/green-leaf.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const surahs = await getSurahList();

  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: "dark" }}>
      <body suppressHydrationWarning>
        <ReaderSettingsProvider>
          <div className="app-shell">
            <AppHeader surahs={surahs} />

            <main className="app-main-content">
              <aside className="app-main-content-sidebar">
                <SurahSidebar surahs={surahs} />
              </aside>

              <div className="app-main-content-center">
                {children}

                <footer className="app-footer">
                  © 2026 Quran Mazid - Read, Study, and Learn The Quran | Zakaria Ibrahim | zakaria.93@yahoo.com
                </footer>
              </div>

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
