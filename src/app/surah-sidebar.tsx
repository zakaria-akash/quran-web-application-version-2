"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Surah } from "@/lib/quran";

export default function SurahSidebar() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Extract current surah ID from pathname
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

  return (
    <div className="surah-sidebar">
      <div className="surah-sidebar-header">
        <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Surahs</h2>
      </div>
      <div className="surah-sidebar-content">
        {isLoading ? (
          <div style={{ padding: "16px", textAlign: "center", color: "#aab8d4" }}>
            Loading...
          </div>
        ) : surahs.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center", color: "#aab8d4" }}>
            No surahs available
          </div>
        ) : (
          surahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className={`surah-sidebar-item ${currentSurahId === surah.id ? "active" : ""}`}
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
