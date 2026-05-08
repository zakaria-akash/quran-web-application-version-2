import type { Metadata } from "next";
import "./globals.css";
import { ReaderSettingsProvider } from "./settings-provider";
import AppHeader from "./app-header";

export const metadata: Metadata = {
  title: "Quran Web Application",
  description: "Quran Web Application",
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

            {/* Main content area renders route-specific page content. */}
            <div className="app-main-content">{children}</div>

            {/* Minimal footer provides a stable endpoint for each page. */}
            <footer className="app-footer">Quran Web Application</footer>
          </div>
        </ReaderSettingsProvider>
      </body>
    </html>
  );
}
