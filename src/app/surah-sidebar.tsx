"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Surah } from "@/lib/quran";

interface SurahSidebarProps {
  onItemClick?: () => void;
}

export default function SurahSidebar({ onItemClick }: SurahSidebarProps) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const currentSurahId = pathname.startsWith("/surah/") ? parseInt(pathname.split("/")[2]) : null;

  useEffect(() => {
    async function loadSurahs() {
      try {
        const response = await fetch("/api/quran");
        if (response.ok) {
          const data = await response.json();
          setSurahs(Array.isArray(data?.surahs) ? data.surahs : []);
        }
      } catch (error) {
        console.error("Failed to load surahs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSurahs();
  }, []);

  const filteredSurahs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return surahs;
    return surahs.filter(
      (s) =>
        s.nameEnglish.toLowerCase().includes(query) ||
        s.id.toString() === query ||
        s.nameArabic.includes(query)
    );
  }, [surahs, searchQuery]);

  return (
    <div className="surah-sidebar">
      <div className="surah-sidebar-header">
        <input
          type="text"
          placeholder="Search Surah..."
          className="surah-sidebar-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="surah-sidebar-content">
        {isLoading ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#aab8d4" }}>
            Loading Surahs...
          </div>
        ) : filteredSurahs.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#aab8d4" }}>
            No surahs found
          </div>
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
