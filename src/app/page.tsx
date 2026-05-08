import Link from "next/link";
import { getSurahList } from "@/lib/quran";

// This page is a Server Component that fetches Surah metadata at build/request time.
export default async function Home() {
  // The data helper normalizes and sorts surah records for predictable rendering.
  const surahList = await getSurahList();

  return (
    <main className="surah-list-page">
      {/* This heading establishes the page purpose for users and accessibility tools. */}
      <h1 className="surah-list-title">Quran Web Application</h1>

      {/* This supporting text clarifies what content is shown in the list below. */}
      <p className="surah-list-subtitle">Browse Surahs and open any Surah to read its Ayat and translation.</p>

      {/* This grid renders one card per surah and links to the dynamic surah route. */}
      <section className="surah-grid" aria-label="Surah list">
        {surahList.map((surah) => (
          <Link key={surah.id} href={`/surah/${surah.id}`} className="surah-card">
            {/* The number gives quick positional context for each surah. */}
            <span className="surah-number">{surah.id}</span>

            {/* Arabic and English names are both shown to match the project requirements. */}
            <span className="surah-name-arabic">{surah.nameArabic}</span>
            <span className="surah-name-english">{surah.nameEnglish}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
