"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SurahContent } from "@/lib/quran";
import { useReaderSettings } from "@/app/settings-provider";

interface AyahSliderProps {
  ayat: SurahContent[];
  initialAyahNumber?: number | null;
}

// This component provides manual-only slide navigation for Surah ayat.
export default function AyahSlider({ ayat, initialAyahNumber = null }: AyahSliderProps) {
  const { settings } = useReaderSettings();
  
  // Current slide index tracks the visible ayah panel.
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!Array.isArray(ayat) || ayat.length === 0 || !initialAyahNumber) {
      return 0;
    }

    const matchedIndex = ayat.findIndex((ayah) => ayah.ayahNumber === initialAyahNumber);
    return matchedIndex >= 0 ? matchedIndex : 0;
  });

  // Total count is memoized for minor render efficiency and readability.
  const totalAyat = useMemo(() => ayat.length, [ayat.length]);

  // Jump menu state controls the custom dropdown used for reliable cross-device width.
  const [isJumpMenuOpen, setIsJumpMenuOpen] = useState(false);
  const [jumpQuery, setJumpQuery] = useState("");
  const jumpMenuRef = useRef<HTMLDivElement>(null);

  // Fast lookup allows direct jumping to any ayah number from a compact control.
  const ayahIndexByNumber = useMemo(
    () => new Map(ayat.map((ayah, index) => [ayah.ayahNumber, index])),
    [ayat]
  );

  const activeAyahNumber = ayat[activeIndex]?.ayahNumber ?? ayat[0]?.ayahNumber ?? 1;

  const normalizedJumpQuery = useMemo(
    () => jumpQuery.trim().replace(/^ayah\s*/i, "").replace(/[^0-9]/g, ""),
    [jumpQuery]
  );

  const filteredAyat = useMemo(() => {
    if (!normalizedJumpQuery) {
      return ayat;
    }

    return ayat.filter((ayah) => String(ayah.ayahNumber).includes(normalizedJumpQuery));
  }, [ayat, normalizedJumpQuery]);

  // When query params change on the same route, sync to the requested ayah.
  useEffect(() => {
    if (!initialAyahNumber || totalAyat === 0) {
      return;
    }

    const matchedIndex = ayat.findIndex((ayah) => ayah.ayahNumber === initialAyahNumber);
    if (matchedIndex >= 0) {
      setActiveIndex(matchedIndex);
    }
  }, [ayat, initialAyahNumber, totalAyat]);

  // Keep input text aligned with currently visible ayah when selection changes.
  useEffect(() => {
    setJumpQuery(`Ayah ${activeAyahNumber}`);
  }, [activeAyahNumber]);

  // Prev/next are explicit user-driven actions with no auto-sliding behavior.
  const goToPrev = () => {
    setActiveIndex((current) => (current === 0 ? 0 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === totalAyat - 1 ? totalAyat - 1 : current + 1));
  };

  const jumpToAyahNumber = (requestedAyahNumber: number) => {
    const nextIndex = ayahIndexByNumber.get(requestedAyahNumber);

    if (typeof nextIndex === "number") {
      setActiveIndex(nextIndex);
      setJumpQuery(`Ayah ${requestedAyahNumber}`);
      setIsJumpMenuOpen(false);
    }
  };

  const handleJumpInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJumpQuery(event.target.value);
    setIsJumpMenuOpen(true);
  };

  const handleJumpInputFocus = () => {
    setIsJumpMenuOpen(true);
  };

  const handleJumpInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (normalizedJumpQuery) {
        const exactAyahNumber = Number(normalizedJumpQuery);
        if (ayahIndexByNumber.has(exactAyahNumber)) {
          jumpToAyahNumber(exactAyahNumber);
          return;
        }
      }

      if (filteredAyat.length > 0) {
        jumpToAyahNumber(filteredAyat[0].ayahNumber);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsJumpMenuOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsJumpMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!isJumpMenuOpen) {
      return undefined;
    }

    const onPointerDown = (event: PointerEvent) => {
      const wrapper = jumpMenuRef.current;
      if (!wrapper) {
        return;
      }

      if (!wrapper.contains(event.target as Node)) {
        setIsJumpMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsJumpMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isJumpMenuOpen]);

  // Guard handles unexpected empty input without rendering slider controls.
  if (totalAyat === 0) {
    return null;
  }

  return (
    <section className="ayah-slider" aria-label="Ayah slider">
      <div className="ayah-slider-jump" ref={jumpMenuRef} style={{ marginBottom: "20px" }}>
        <label htmlFor="ayah-jump-input" className="ayah-slider-jump-label" style={{ fontWeight: 600, color: "#fff" }}>
          Jump To Ayah
        </label>
        <div className="ayah-slider-jump-field">
          <input
            id="ayah-jump-input"
            type="text"
            className="ayah-slider-jump-input"
            style={{ 
              width: "100%", 
              height: "40px", 
              background: "rgba(255,255,255,0.08)", 
              border: "1px solid rgba(255,255,255,0.15)", 
              borderRadius: "20px",
              padding: "0 16px",
              color: "#fff"
            }}
            value={jumpQuery}
            onChange={handleJumpInputChange}
            onFocus={handleJumpInputFocus}
            onKeyDown={handleJumpInputKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-controls="ayah-jump-menu"
            aria-expanded={isJumpMenuOpen}
            aria-label="Jump to ayah number"
            placeholder="Type ayah number..."
          />

          {isJumpMenuOpen ? (
            <ul id="ayah-jump-menu" className="ayah-slider-jump-menu" role="listbox" aria-label="Ayah numbers">
              {filteredAyat.length > 0 ? (
                filteredAyat.map((ayah) => {
                  const isSelected = ayah.ayahNumber === activeAyahNumber;

                  return (
                    <li key={`jump-${ayah.surahId}-${ayah.ayahNumber}`}>
                      <button
                        type="button"
                        className={`ayah-slider-jump-option ${isSelected ? "is-selected" : ""}`}
                        onClick={() => jumpToAyahNumber(ayah.ayahNumber)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        Ayah {ayah.ayahNumber}
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="ayah-slider-jump-empty">No matching ayah found.</li>
              )}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Pagination controls stay on their own row below Jump To Ayah. */}
      <div className="ayah-slider-controls" style={{ marginBottom: "24px" }}>
        <button
          type="button"
          onClick={goToPrev}
          disabled={activeIndex === 0}
          className="ayah-slider-button"
          style={{ background: activeIndex === 0 ? "rgba(255,255,255,0.05)" : "var(--color-primary)", color: activeIndex === 0 ? "#666" : "#000", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: "600" }}
          aria-label="Go to previous ayah"
        >
          Prev
        </button>

        <p className="ayah-slider-counter" aria-live="polite" style={{ fontWeight: "700", color: "#fff" }}>
          {activeIndex + 1} / {totalAyat}
        </p>

        <button
          type="button"
          onClick={goToNext}
          disabled={activeIndex === totalAyat - 1}
          className="ayah-slider-button"
          style={{ background: activeIndex === totalAyat - 1 ? "rgba(255,255,255,0.05)" : "var(--color-primary)", color: activeIndex === totalAyat - 1 ? "#666" : "#000", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: "600" }}
          aria-label="Go to next ayah"
        >
          Next
        </button>
      </div>

      {/* Slider viewport masks off-screen slides while preserving smooth transitions. */}
      <div className="ayah-slider-viewport">
        <div
          className="ayah-slider-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          aria-live="polite"
        >
          {ayat.map((ayah, index) => (
            <article
              key={`${ayah.surahId}-${ayah.ayahNumber}`}
              className="ayah-slide"
              style={{ flex: "0 0 100%", padding: "0 10px" }}
              aria-hidden={index !== activeIndex}
            >
              <div className="ayah-card">
                <div className="ayah-header">
                  <span className="ayah-number-badge">{ayah.ayahNumber}</span>
                </div>
                
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
