"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SettingsModal from "./settings/settings-modal";
import { Surah, Translation } from "@/lib/quran";
import SurahSidebar from "./surah-sidebar";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="app-header">
        {/* Brand */}
        <div className="app-header-brand-container" style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <button
            className="app-header-hamburger"
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isNavDrawerOpen}
          >
            ☰
          </button>
          <Link href="/" className="app-header-brand" style={{ marginLeft: "10px" }}>
            <span>🌿</span>
            Quran Mazid
          </Link>
        </div>

        {/* Search & Actions */}
        <div className="app-header-actions-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Search Icon */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className="app-header-settings-icon" 
            aria-label="Search"
          >
            🔍
          </button>

          {/* Theme Toggle Icon (Placeholder) */}
          <button className="app-header-settings-icon" aria-label="Toggle theme">
            🌙
          </button>

          {/* Settings Icon */}
          <button
            type="button"
            className="app-header-settings-icon"
            onClick={() => setIsSettingsModalOpen(true)}
            aria-label="Reader settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="settings-modal-backdrop" onClick={() => setIsSearchOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ padding: "20px" }}>
            <div className="app-header-search-shell" style={{ width: "100%" }}>
              <input
                id="global-header-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Search..."
                className="app-header-search-input"
                style={{ background: "#222" }}
                autoFocus
              />
              {showPanel && (
                <div className="app-header-search-panel" role="listbox" aria-label="Search results" style={{ position: "relative" }}>
                   {isLoading && <p className="app-header-search-status">Searching...</p>}
                   {surahMatches.map((surah) => (
                      <Link key={surah.id} href={`/surah/${surah.id}`} className="app-header-search-result" onClick={handleResultSelection}>
                        {surah.nameEnglish}
                      </Link>
                    ))}
                    {results.map((result) => (
                      <Link key={`${result.surahId}-${result.ayahNumber}`} href={`/surah/${result.surahId}?ayah=${result.ayahNumber}`} className="app-header-search-result" onClick={handleResultSelection}>
                        {result.text}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
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
            <span>🌿</span>
            Quran Mazid
          </Link>
          <button
            className="drawer-close-button"
            onClick={() => setIsNavDrawerOpen(false)}
            aria-label="Close navigation menu"
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
        <div className="drawer-content">
          <SurahSidebar onItemClick={() => setIsNavDrawerOpen(false)} />
        </div>
      </nav>

      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  );
}
