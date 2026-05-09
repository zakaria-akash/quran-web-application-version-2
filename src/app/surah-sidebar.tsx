"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Surah } from "@/lib/quran";

interface SurahSidebarProps {
  surahs: Surah[];
  onItemClick?: () => void;
}

// This sidebar is client-rendered only for local interactivity. The actual
// Surah data arrives from the server so the list is visible on first paint.
export default function SurahSidebar({ surahs, onItemClick }: SurahSidebarProps) {
  // Local state tracks the user's raw search text in the sidebar input.
  const [searchQuery, setSearchQuery] = useState("");

  // Deferring the query keeps typing smooth by letting React postpone the
  // filtering work when the user is entering text quickly.
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const pathname = usePathname();

  // The current URL decides which Surah should receive the active visual state.
  const currentSurahId = pathname.startsWith("/surah/") ? parseInt(pathname.split("/")[2], 10) : null;

  // Filtering is memoized so unrelated rerenders do not repeatedly scan the
  // full 114-Surah dataset.
  const filteredSurahs = useMemo(() => {
    const query = deferredSearchQuery.toLowerCase().trim();
    if (!query) {
      return surahs;
    }

    return surahs.filter(
      (surah) =>
        surah.nameEnglish.toLowerCase().includes(query) ||
        surah.id.toString() === query ||
        surah.nameArabic.includes(query),
    );
  }, [deferredSearchQuery, surahs]);

  return (
    <div className="surah-sidebar">
      {/* Sidebar search is fully local and never needs to hit the network. */}
      <div className="surah-sidebar-header">
        <input
          type="text"
          placeholder="Search Surah..."
          className="surah-sidebar-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {/* The scrollable content area renders either an empty state or the filtered list. */}
      <div className="surah-sidebar-content">
        {filteredSurahs.length === 0 ? (
          <div className="sidebar-status" style={{ padding: "16px" }}>No Surahs found.</div>
        ) : (
          // Each item links directly to its Surah route and can optionally close
          // the mobile drawer when selected.
          filteredSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className={`surah-sidebar-item ${currentSurahId === surah.id ? "active" : ""}`}
              onClick={onItemClick}
            >
              <span className="surah-sidebar-item-number">{surah.id}</span>
              <div className="surah-sidebar-item-names">
                <span className="surah-sidebar-item-english">{surah.nameEnglish}</span>
                <span className="surah-sidebar-item-arabic">{surah.nameArabic}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
