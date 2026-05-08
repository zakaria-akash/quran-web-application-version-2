"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SettingsModal from "./settings/settings-modal";
import { Surah, Translation } from "@/lib/quran";

// This debounce value keeps the global search responsive without flooding the API.
const HEADER_SEARCH_DEBOUNCE_MS = 300;

// This helper normalizes unknown payload values into predictable arrays.
function toArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

// This helper strips punctuation and spacing so transliterated names can match more loosely.
function normalizeSearchText(value: string | null | undefined): string {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, "") : "";
}

// This helper computes a small edit distance for short surah-name comparisons.
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

// This helper gives surah-name search a little flexibility for common transliterations.
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

// This global header provides cross-page navigation and search functionality.
export default function AppHeader() {
  // Query state drives live search requests from the shared header input.
  const [query, setQuery] = useState("");

  // Surah list is cached client-side so name searches can work without translation hits.
  const [surahs, setSurahs] = useState<Surah[]>([]);

  // Results state stores matched ayat references returned by /api/search.
  const [results, setResults] = useState<Translation[]>([]);

  // Surah name matches are shown alongside translation matches.
  const [surahMatches, setSurahMatches] = useState<Surah[]>([]);

  // Loading state powers subtle progress feedback while searching.
  const [isLoading, setIsLoading] = useState(false);

  // Error state displays API validation/network issues in a compact way.
  const [errorMessage, setErrorMessage] = useState("");

  // Focus state controls result-panel visibility so it behaves like a simple combobox.
  const [isFocused, setIsFocused] = useState(false);

  // Modal state keeps reader settings in-context instead of routing away.
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // This ref tracks the search shell so outside-click close behavior is reliable.
  const searchShellRef = useRef<HTMLDivElement>(null);

  // Trimmed query avoids unnecessary requests for whitespace-only input.
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  // Load Surah metadata once so name-based search can happen locally.
  useEffect(() => {
    const controller = new AbortController();

    async function loadSurahList() {
      try {
        const response = await fetch("/api/quran", { signal: controller.signal });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        setSurahs(toArray<Surah>(payload?.surahs));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    loadSurahList();

    return () => controller.abort();
  }, []);

  // Close dropdown only when clicking outside, so link clicks inside the panel are not interrupted.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const shell = searchShellRef.current;
      if (!shell) {
        return;
      }

      if (!shell.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    // Empty input clears stale results and exits early without network work.
    if (!trimmedQuery) {
      setResults([]);
      setSurahMatches([]);
      setIsLoading(false);
      setErrorMessage("");
      return undefined;
    }

    // Surah names are matched locally so user typos like Al-Baqara still find the Surah.
    const matchedSurahs = surahs.filter((surah) => matchSurahQuery(trimmedQuery, surah)).slice(0, 8);
    setSurahMatches(matchedSurahs);

    // Abort controller prevents race conditions when query changes quickly.
    const controller = new AbortController();

    // Debounce batches keystrokes into fewer API calls.
    const timerId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        // Global search calls the same route used elsewhere for consistent logic.
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmedQuery }),
          signal: controller.signal,
        });

        // Non-success responses are transformed into concise user-facing errors.
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = typeof payload?.error === "string" ? payload.error : "Search failed.";
          throw new Error(message);
        }

        // Only first results are shown to keep header dropdown compact.
        const payload = await response.json();
        setResults(toArray<Translation>(payload?.results).slice(0, 8));
      } catch (error) {
        // Abort is expected during fast typing and should not show an error message.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setResults([]);
        setErrorMessage(error instanceof Error ? error.message : "Search failed.");
      } finally {
        setIsLoading(false);
      }
    }, HEADER_SEARCH_DEBOUNCE_MS);

    // Cleanup clears timer and in-flight request on effect re-run/unmount.
    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [surahs, trimmedQuery]);

  // Result panel is visible only when input is focused and there is meaningful state to display.
  const showPanel = isFocused && (isLoading || errorMessage || trimmedQuery || results.length > 0 || surahMatches.length > 0);

  // Clicking a result should reset the search box and close the dropdown immediately.
  const handleResultSelection = () => {
    setQuery("");
    setResults([]);
    setSurahMatches([]);
    setErrorMessage("");
    setIsLoading(false);
    setIsFocused(false);
  };

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <header className="app-header">
      {/* Brand link gives users a consistent way back to the home page. */}
      <Link href="/" className="app-header-brand">
        Quran Web Application
      </Link>

      {/* Controls are grouped and right-aligned as one unit on larger screens. */}
      <div className="app-header-controls">
        {/* Search section is global so users can search from any page. */}
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
              if (event.key === "Escape") {
                setIsFocused(false);
              }
            }}
            placeholder="Search translation or Surah..."
            className="app-header-search-input"
          />

          {showPanel ? (
            <div className="app-header-search-panel" role="listbox" aria-label="Header search results">
              {isLoading ? <p className="app-header-search-status">Searching...</p> : null}
              {errorMessage ? <p className="app-header-search-error">{errorMessage}</p> : null}

              {!isLoading && !errorMessage && surahMatches.length > 0 ? (
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
              ) : null}

              {!isLoading && !errorMessage && trimmedQuery && surahMatches.length === 0 && results.length === 0 ? (
                <p className="app-header-search-status">No matches found.</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Settings open in a modal so users keep their current reading context. */}
        <button type="button" className="app-header-settings-button" onClick={openSettingsModal}>
          Reader Settings
        </button>
      </div>

      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
    </header>
  );
}
