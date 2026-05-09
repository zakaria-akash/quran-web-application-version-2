"use client";

import { SurahContent } from "@/lib/quran";
import { useReaderSettings } from "@/app/settings-provider";

interface AyahListProps {
  ayat: SurahContent[];
}

// This component renders the full Surah in a continuous reading flow instead
// of paginating ayahs one at a time.
export default function AyahList({ ayat }: AyahListProps) {
  // Reader settings provide the live typography values applied to every ayah row.
  const { settings } = useReaderSettings();

  if (!ayat || ayat.length === 0) {
    return null;
  }

  return (
    <section className="ayah-list" aria-label="Ayah list">
      <div className="ayah-list-container">
        {/* Every ayah is its own article so anchors, future highlighting, and
            any eventual bookmarking features have stable DOM targets. */}
        {ayat.map((ayah) => (
          <article
            key={`${ayah.surahId}-${ayah.ayahNumber}`}
            id={`ayah-${ayah.ayahNumber}`}
            className="ayah-card"
          >
            {/* Arabic text keeps its own font family and size controls because
                Quranic script readability has different needs from translation text. */}
            <p
              className="ayah-arabic-text"
              style={{
                fontFamily: settings.arabicFontFamily,
                fontSize: `${settings.arabicFontSize}px`,
              }}
            >
              {ayah.arabicText}
            </p>

            {/* Translation sizing is controlled separately so readers can tune
                bilingual readability without affecting the Arabic script. */}
            <p
              className="ayah-translation-text"
              style={{
                fontSize: `${settings.translationFontSize}px`,
              }}
            >
              {ayah.translationText || "Translation unavailable."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
