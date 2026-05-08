"use client";

import { SurahContent } from "@/lib/quran";
import { useReaderSettings } from "@/app/settings-provider";

interface AyahListProps {
  ayat: SurahContent[];
}

// This component renders all ayahs in a continuous list as requested.
export default function AyahList({ ayat }: AyahListProps) {
  const { settings } = useReaderSettings();

  if (!ayat || ayat.length === 0) {
    return null;
  }

  return (
    <section className="ayah-list" aria-label="Ayah list">
      <div className="ayah-list-container">
        {ayat.map((ayah) => (
          <article
            key={`${ayah.surahId}-${ayah.ayahNumber}`}
            id={`ayah-${ayah.ayahNumber}`}
            className="ayah-card"
          >
            {/* Ayah number and navigation buttons removed per user request */}
            
            <p 
              className="ayah-arabic-text" 
              style={{ 
                fontFamily: settings.arabicFontFamily, 
                fontSize: `${settings.arabicFontSize}px`
              }}
            >
              {ayah.arabicText}
            </p>

            <p 
              className="ayah-translation-text"
              style={{ 
                fontSize: `${settings.translationFontSize}px`
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
