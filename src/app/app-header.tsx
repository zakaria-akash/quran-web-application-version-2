"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Surah } from "@/lib/quran";
import SurahSidebar from "./surah-sidebar";
import SettingsContent from "./settings/settings-content";
import { ThemeMode, useReaderSettings } from "./settings-provider";

const HEADER_SEARCH_DEBOUNCE_MS = 300;

interface SearchResult {
  surahId: number;
  ayahNumber: number;
  text: string;
  surahNameEnglish: string;
  surahNameArabic: string;
}

interface AppHeaderProps {
  surahs: Surah[];
}

// The header search only needs a focused subset of ayah result fields, so this
// shape stays smaller and easier to reason about than a full backend model.
function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeSearchText(value: string | null | undefined): string {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, "") : "";
}

function getEditDistance(leftText: string, rightText: string): number {
  const left = normalizeSearchText(leftText);
  const right = normalizeSearchText(rightText);

  if (!left || !right) {
    return Number.POSITIVE_INFINITY;
  }

  const row = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previousDiagonal = row[0];
    row[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const savedValue = row[rightIndex];
      if (left[leftIndex - 1] === right[rightIndex - 1]) {
        row[rightIndex] = previousDiagonal;
      } else {
        row[rightIndex] = Math.min(previousDiagonal, row[rightIndex], row[rightIndex - 1]) + 1;
      }
      previousDiagonal = savedValue;
    }
  }

  return row[right.length];
}

function matchSurahQuery(query: string, surah: Surah): boolean {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedEnglishName = normalizeSearchText(surah.nameEnglish);
  const normalizedArabicName = normalizeSearchText(surah.nameArabic);

  if (!normalizedQuery) {
    return false;
  }

  if (normalizedEnglishName.includes(normalizedQuery) || normalizedArabicName.includes(normalizedQuery)) {
    return true;
  }

  return getEditDistance(normalizedQuery, normalizedEnglishName) <= 2;
}

// These icon helpers keep the large header component readable while ensuring
// every control uses the same theme-aware SVG sizing and wrapper treatment.
function HeaderIcon({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <span className="header-icon-shell" aria-hidden="true" title={label}>
      {children}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="header-icon-svg" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="header-icon-svg" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="header-icon-svg" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="header-icon-svg" aria-hidden="true">
      <path
        d="M12 3.4l1.2 2.1 2.4.4.6 2.3 2 1.4-.8 2.3.8 2.3-2 1.4-.6 2.3-2.4.4L12 20.6l-1.2-2.1-2.4-.4-.6-2.3-2-1.4.8-2.3-.8-2.3 2-1.4.6-2.3 2.4-.4L12 3.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ThemeToggleIcon({ theme }: { theme: ThemeMode }) {
  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" className="header-icon-svg" aria-hidden="true">
        <path
          d="M21 12.8A9 9 0 1 1 11.2 3a7.2 7.2 0 0 0 9.8 9.8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="header-icon-svg" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AppHeader({ surahs }: AppHeaderProps) {
  // Theme state is global, but the header is the primary place where users
  // switch between dark and light modes.
  const { theme, toggleTheme } = useReaderSettings();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [surahMatches, setSurahMatches] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchShellRef = useRef<HTMLDivElement>(null);
  const trimmedQuery = useMemo(() => query.trim(), [query]);
  // Search work is deferred so text input remains responsive while results update.
  const deferredQuery = useDeferredValue(trimmedQuery);

  // Closing search also clears transient UI state so each new open starts fresh.
  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery("");
    setResults([]);
    setSurahMatches([]);
    setErrorMessage("");
    setIsLoading(false);
    setIsFocused(false);
  };

  useEffect(() => {
    // Clicking outside the search shell should hide the result panel without
    // forcing the entire search modal to close immediately.
    function handlePointerDown(event: PointerEvent) {
      const shell = searchShellRef.current;
      if (!shell || shell.contains(event.target as Node)) {
        return;
      }
      setIsFocused(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    // Search modal, navigation drawer, and settings drawer all lock background
    // scrolling and share Escape-key dismissal for consistent overlay behavior.
    if (!isSearchOpen && !isNavDrawerOpen && !isSettingsDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
        setIsNavDrawerOpen(false);
        setIsSettingsDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isNavDrawerOpen, isSearchOpen, isSettingsDrawerOpen]);

  useEffect(() => {
    // Surah-name matching is instant and local, while translation search stays
    // debounced so the API is not called on every keystroke.
    if (!deferredQuery) {
      setResults([]);
      setSurahMatches([]);
      setIsLoading(false);
      setErrorMessage("");
      return;
    }

    const matchedSurahs = surahs.filter((surah) => matchSurahQuery(deferredQuery, surah)).slice(0, 8);
    setSurahMatches(matchedSurahs);

    const controller = new AbortController();
    const timerId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: deferredQuery }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(typeof payload?.error === "string" ? payload.error : "Search failed.");
        }

        const payload = await response.json();
        setResults(toArray<SearchResult>(payload?.results).slice(0, 8));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResults([]);
        setErrorMessage(error instanceof Error ? error.message : "Search failed.");
      } finally {
        setIsLoading(false);
      }
    }, HEADER_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [deferredQuery, surahs]);

  const handleResultSelection = () => {
    closeSearch();
  };

  return (
    <>
      {/* The persistent header is the global control surface for search, theme,
          and mobile-only navigation/settings actions. */}
      <header className="app-header">
        <div className="app-header-left">
          <button
            type="button"
            className="app-header-hamburger"
            onClick={() => setIsNavDrawerOpen((currentOpen) => !currentOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isNavDrawerOpen}
          >
            <HeaderIcon label="Menu">
              <MenuIcon />
            </HeaderIcon>
          </button>

          <Link href="/" className="app-header-brand">
            <img src="/green-leaf.svg" alt="Quran Mazid logo" className="app-header-logo" />
            Quran Mazid
          </Link>
        </div>

        <div className="app-header-right">
          {/* Search opens a dedicated overlay so the compact header layout stays uncluttered. */}
          <button
            type="button"
            onClick={() => (isSearchOpen ? closeSearch() : setIsSearchOpen(true))}
            className="app-header-settings-icon"
            aria-label="Search Quran"
            title="Search Quran"
          >
            <HeaderIcon label="Search">
              <SearchIcon />
            </HeaderIcon>
          </button>

          <button
            type="button"
            className="app-header-settings-icon"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            <HeaderIcon label="Theme">
              <ThemeToggleIcon theme={theme} />
            </HeaderIcon>
          </button>

          {/* On smaller screens the settings UI moves into a drawer to preserve reader space. */}
          <button
            type="button"
            className="app-header-settings-icon app-header-mobile-settings"
            onClick={() => setIsSettingsDrawerOpen(true)}
            aria-label="Reader settings"
            title="Reader settings"
          >
            <HeaderIcon label="Settings">
              <SettingsIcon />
            </HeaderIcon>
          </button>
        </div>
      </header>

      {isSearchOpen ? (
        // The search overlay combines local Surah matches with API-backed ayah
        // matches so readers can jump to either level from one workflow.
        <div className="settings-modal-backdrop app-search-backdrop" onClick={closeSearch}>
          <section
            className="settings-modal app-search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search Quran"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="app-search-modal-header">
              <h2 className="app-search-modal-title">Search Quran</h2>
              <button
                type="button"
                className="app-search-modal-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="app-search-modal-body">
              <div className="app-header-search-shell app-search-shell-full" ref={searchShellRef}>
                <input
                  id="global-header-search"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="Search Surah or translation..."
                  className="app-header-search-input"
                  autoFocus
                />

                <div
                  className={`app-header-search-panel app-header-search-panel-inline ${isFocused ? "is-open" : ""}`}
                  role="listbox"
                  aria-label="Search results"
                >
                  {isLoading ? <p className="app-header-search-status">Searching...</p> : null}

                  {errorMessage ? <p className="app-header-search-error">{errorMessage}</p> : null}

                  {!isLoading && !errorMessage && !deferredQuery ? (
                    <p className="app-header-search-status">Type a keyword to search Surahs and ayahs.</p>
                  ) : null}

                  {!isLoading && !errorMessage && deferredQuery && surahMatches.length > 0 ? (
                    <div className="app-header-search-group">
                      <p className="app-header-search-group-title">Surahs</p>
                      {surahMatches.map((surah) => (
                        <Link
                          key={surah.id}
                          href={`/surah/${surah.id}`}
                          className="app-header-search-result"
                          onClick={handleResultSelection}
                        >
                          <span className="app-header-search-result-meta">
                            Surah {surah.id} | {surah.nameEnglish}
                          </span>
                          <span className="app-header-search-result-text">{surah.nameArabic}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {!isLoading && !errorMessage && deferredQuery && results.length > 0 ? (
                    <div className="app-header-search-group">
                      <p className="app-header-search-group-title">Ayah Matches</p>
                      {results.map((result) => (
                        <Link
                          key={`${result.surahId}-${result.ayahNumber}`}
                          href={`/surah/${result.surahId}?ayah=${result.ayahNumber}`}
                          className="app-header-search-result"
                          onClick={handleResultSelection}
                        >
                          <span className="app-header-search-result-meta">
                            Surah {result.surahId} | Ayah {result.ayahNumber}
                          </span>
                          <span className="app-header-search-result-text">{result.text}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {!isLoading && !errorMessage && deferredQuery && surahMatches.length === 0 && results.length === 0 ? (
                    <p className="app-header-search-status">No matches found.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <div
        className={`drawer-backdrop ${isNavDrawerOpen ? "open" : ""}`}
        onClick={() => setIsNavDrawerOpen(false)}
      />

      <nav className={`drawer ${isNavDrawerOpen ? "open" : ""}`} aria-hidden={!isNavDrawerOpen}>
        {/* The mobile navigation drawer reuses the same sidebar component as desktop
            so Surah browsing stays behaviorally identical across breakpoints. */}
        <div className="drawer-header">
          <Link href="/" className="app-header-brand" onClick={() => setIsNavDrawerOpen(false)}>
            <img src="/green-leaf.svg" alt="Quran Mazid logo" className="app-header-logo" />
            Quran Mazid
          </Link>
          <button
            type="button"
            className="drawer-close-button"
            onClick={() => setIsNavDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="drawer-content">
          <SurahSidebar surahs={surahs} onItemClick={() => setIsNavDrawerOpen(false)} />
        </div>
      </nav>

      <div
        className={`drawer-backdrop ${isSettingsDrawerOpen ? "open" : ""}`}
        onClick={() => setIsSettingsDrawerOpen(false)}
      />

      <aside className={`settings-drawer ${isSettingsDrawerOpen ? "open" : ""}`} aria-hidden={!isSettingsDrawerOpen}>
        {/* The mobile settings drawer renders the same settings content as the
            desktop panel, only within a mobile-friendly shell. */}
        <div className="drawer-header">
          <div className="app-header-brand">
            <img src="/green-leaf.svg" alt="Quran Mazid logo" className="app-header-logo" />
            Settings
          </div>
          <button
            type="button"
            className="drawer-close-button"
            onClick={() => setIsSettingsDrawerOpen(false)}
            aria-label="Close settings panel"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="drawer-content">
          <div className="settings-panel-content">
            <SettingsContent />
          </div>
        </div>
      </aside>
    </>
  );
}
