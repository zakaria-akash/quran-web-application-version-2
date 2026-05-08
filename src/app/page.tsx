import Link from "next/link";
import { getSurahList } from "@/lib/quran";

// This page is a Server Component that fetches Surah metadata at build/request time.
export default async function Home() {
  // The data helper normalizes and sorts surah records for predictable rendering.
  const surahList = await getSurahList();

  return (
    <div className="surah-list-page">
      {/* This heading establishes the page purpose for users and accessibility tools. */}
      <h1 className="surah-list-title">The Holy Quran</h1>

      {/* This supporting text clarifies what content is shown in the list below. */}
      <p className="surah-list-subtitle">Select a Surah to begin reading and studying the Quran with translations.</p>

      {/* This grid renders one card per surah and links to the dynamic surah route. */}
      <div className="surah-grid" aria-label="Surah list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", padding: "8px" }}>
        {surahList.map((surah) => (
          <Link key={surah.id} href={`/surah/${surah.id}`} className="surah-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", textDecoration: "none", color: "inherit", transition: "all 0.2s" }}>
            {/* The number gives quick positional context for each surah. */}
            <span className="surah-sidebar-item-number" style={{ width: "40px", height: "40px", flexShrink: 0 }}>{surah.id}</span>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: "1rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{surah.nameEnglish}</span>
              <span style={{ fontSize: "0.8rem", color: "#aab8d4" }}>{surah.revelationType} • {surah.totalAyah} Ayahs</span>
            </div>

            {/* Arabic and English names are both shown to match the project requirements. */}
            <span className="surah-sidebar-item-arabic" style={{ fontSize: "1.2rem", margin: 0 }}>{surah.nameArabic}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
