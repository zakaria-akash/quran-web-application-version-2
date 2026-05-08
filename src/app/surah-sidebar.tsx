"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Surah } from "@/lib/quran";

interface SurahSidebarProps {
  surahs: Surah[];
  onItemClick?: () => void;
}

export default function SurahSidebar({ surahs, onItemClick }: SurahSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const pathname = usePathname();

  const currentSurahId = pathname.startsWith("/surah/") ? parseInt(pathname.split("/")[2], 10) : null;

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
      <div className="surah-sidebar-header">
        <input
          type="text"
          placeholder="Search Surah..."
          className="surah-sidebar-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="surah-sidebar-content">
        {filteredSurahs.length === 0 ? (
          <div className="sidebar-status">No Surahs found.</div>
        ) : (
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
