"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SettingsModal from "./settings/settings-modal";
import { Surah, Translation } from "@/lib/quran";

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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  const searchShellRef = useRef<HTMLDivElement>(null);
  const trimmedQuery = useMemo(() => query.trim(), [query]);

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
    setQuery("");
    setResults([]);
    setSurahMatches([]);
    setErrorMessage("");
    setIsLoading(false);
    setIsFocused(false);
  };

  return (
    <>
      <header className="app-header">
        <button
          className="app-header-hamburger"
          onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isNavDrawerOpen}
        >
          ☰
        </button>

        <Link href="/" className="app-header-brand">
          <span>🌿</span>
          Quran Mazid
        </Link>

        <div className="app-header-controls">
          <div className="app-header-search-shell" ref={searchShellRef}>
            <label htmlFor="global-header-search" className="visually-hidden">
              Search translation text or Surah name
            </label>
            <input
              id="global-header-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsFocused(false);
              }}
              placeholder="Search..."
              className="app-header-search-input"
            />

            {showPanel && (
              <div className="app-header-search-panel" role="listbox" aria-label="Header search results">
                {isLoading && <p className="app-header-search-status">Searching...</p>}
                {errorMessage && <p className="app-header-search-error">{errorMessage}</p>}

                {!isLoading && !errorMessage && surahMatches.length > 0 && (
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
                )}

                {!isLoading && !errorMessage && trimmedQuery && results.length > 0 && (
                  <div className="app-header-search-group">
                    <p className="app-header-search-group-title">Ayah Matches</p>
                    {results.map((result) => (
                      <Link
                        key={`${result.surahId}-${result.ayahNumber}-${result.text}`}
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
                )}

                {!isLoading && !errorMessage && trimmedQuery && surahMatches.length === 0 && results.length === 0 && (
                  <p className="app-header-search-status">No matches found.</p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="app-header-settings-icon"
            onClick={() => setIsSettingsModalOpen(true)}
            aria-label="Reader settings"
          >
            ⚙️
          </button>

          <button
            type="button"
            className="app-header-settings-button"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            Settings
          </button>
        </div>
      </header>

      {isNavDrawerOpen && (
        <div className="drawer-backdrop open" onClick={() => setIsNavDrawerOpen(false)} />
      )}

      <nav className={`drawer ${isNavDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2 className="app-header-brand" style={{ fontSize: "1.1rem", margin: 0 }}>
            <span>🌿</span>
            Quran Mazid
          </h2>
          <button
            className="drawer-close-button"
            onClick={() => setIsNavDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>
        <div className="drawer-content">
          <div className="surah-sidebar">
            {surahs.map((surah) => (
              <Link
                key={surah.id}
                href={`/surah/${surah.id}`}
                className="surah-sidebar-item"
                onClick={() => setIsNavDrawerOpen(false)}
              >
                <span className="surah-sidebar-item-number">{surah.id}</span>
                <div className="surah-sidebar-item-names">
                  <span className="surah-sidebar-item-english">{surah.nameEnglish}</span>
                  <span className="surah-sidebar-item-arabic">{surah.nameArabic}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  );
}
