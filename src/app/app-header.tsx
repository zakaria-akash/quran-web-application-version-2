"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Surah, Translation } from "@/lib/quran";
import SurahSidebar from "./surah-sidebar";
import SettingsContent from "./settings/settings-content";

const HEADER_SEARCH_DEBOUNCE_MS = 300;

function toArray<T>(value: any): T[] {
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

export default function AppHeader() {
  const [query, setQuery] = useState("");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [results, setResults] = useState<Translation[]>([]);
  const [surahMatches, setSurahMatches] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchShellRef = useRef<HTMLDivElement>(null);
  const trimmedQuery = useMemo(() => query.trim(), [query]);

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
    const controller = new AbortController();

    async function loadSurahList() {
      try {
        const response = await fetch("/api/quran", { signal: controller.signal });
        if (!response.ok) return;

        const payload = await response.json();
        setSurahs(toArray<Surah>(payload?.surahs));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    loadSurahList();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const shell = searchShellRef.current;
      if (!shell || shell.contains(event.target as Node)) return;
      setIsFocused(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setSurahMatches([]);
      setIsLoading(false);
      setErrorMessage("");
      return;
    }

    const matchedSurahs = surahs.filter((surah) => matchSurahQuery(trimmedQuery, surah)).slice(0, 8);
    setSurahMatches(matchedSurahs);

    const controller = new AbortController();
    const timerId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmedQuery }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(typeof payload?.error === "string" ? payload.error : "Search failed.");
        }

        const payload = await response.json();
        setResults(toArray<Translation>(payload?.results).slice(0, 8));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
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
  }, [surahs, trimmedQuery]);

  const showPanel = isFocused && (isLoading || errorMessage || trimmedQuery || results.length > 0 || surahMatches.length > 0);

  const handleResultSelection = () => {
    closeSearch();
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <button
            className="app-header-hamburger"
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isNavDrawerOpen}
          >
            ☰
          </button>

          <Link href="/" className="app-header-brand">
            <img src="/green-leaf.svg" alt="Quran Mazid logo" className="app-header-logo" />
            Quran Mazid
          </Link>
        </div>

        <div className="app-header-right">
          <button
            onClick={() => (isSearchOpen ? closeSearch() : setIsSearchOpen(true))}
            className="app-header-settings-icon"
            aria-label="Search"
          >
            🔍
          </button>

          <button className="app-header-settings-icon" aria-label="Toggle theme">
            🌙
          </button>

          <button
            type="button"
            className="app-header-settings-icon app-header-mobile-settings"
            onClick={() => setIsSettingsDrawerOpen(true)}
            aria-label="Reader settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="settings-modal-backdrop app-search-backdrop" onClick={closeSearch}>
          <section
            className="settings-modal app-search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search Quran"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="app-search-modal-header">
              <h2 className="app-search-modal-title">Search Quran</h2>
              <button
                type="button"
                className="app-search-modal-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                ✕
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
                placeholder="Search..."
                className="app-header-search-input"
                autoFocus
              />

              <div className="app-header-search-panel app-header-search-panel-inline" role="listbox" aria-label="Search results">
                {isLoading && <p className="app-header-search-status">Searching...</p>}

                {errorMessage ? <p className="app-header-search-error">{errorMessage}</p> : null}

                {!isLoading && !errorMessage && !trimmedQuery ? (
                  <p className="app-header-search-status">Type a keyword to search surahs and ayahs.</p>
                ) : null}

                {!isLoading && !errorMessage && trimmedQuery && surahMatches.length > 0 ? (
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

                {!isLoading && !errorMessage && trimmedQuery && results.length > 0 ? (
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

                {!isLoading && !errorMessage && trimmedQuery && surahMatches.length === 0 && results.length === 0 ? (
                  <p className="app-header-search-status">No matches found.</p>
                ) : null}
              </div>
            </div>
            </div>
          </section>
        </div>
      )}

      {/* Navigation Drawer */}
      <div 
        className={`drawer-backdrop ${isNavDrawerOpen ? "open" : ""}`} 
        onClick={() => setIsNavDrawerOpen(false)} 
      />

      <nav className={`drawer ${isNavDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <Link href="/" className="app-header-brand" onClick={() => setIsNavDrawerOpen(false)}>
            <img src="/green-leaf.svg" alt="Quran Mazid logo" className="app-header-logo" />
            Quran Mazid
          </Link>
          <button
            className="drawer-close-button"
            onClick={() => setIsNavDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>
        <div className="drawer-content">
          <SurahSidebar onItemClick={() => setIsNavDrawerOpen(false)} />
        </div>
      </nav>

      <div
        className={`drawer-backdrop ${isSettingsDrawerOpen ? "open" : ""}`}
        onClick={() => setIsSettingsDrawerOpen(false)}
      />

      <aside className={`settings-drawer ${isSettingsDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="app-header-brand">
            <img src="/green-leaf.svg" alt="Quran Mazid logo" className="app-header-logo" />
            Settings
          </div>
          <button
            className="drawer-close-button"
            onClick={() => setIsSettingsDrawerOpen(false)}
            aria-label="Close settings panel"
          >
            ✕
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
