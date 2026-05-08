import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurahContent, getSurahList } from "@/lib/quran";
import AyahList from "./ayah-list";

// This configuration ensures only generated static params are valid route entries.
export const dynamicParams = false;

// This build-time function enables SSG for all known surah ids in the dataset.
export async function generateStaticParams() {
  // The surah list is normalized by the helper, so IDs are safe to stringify.
  const surahList = await getSurahList();

  // Next.js expects params values as strings for dynamic route segments.
  return surahList.map((surah) => ({ id: String(surah.id) }));
}

// This helper parses and validates the route id parameter into a positive integer.
function parseRouteSurahId(rawId: string | undefined): number | null {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

// This helper parses optional ayah query values used for direct navigation from search.
function parseRouteAyahNumber(rawAyah: string | string[] | undefined): number | null {
  const parsed = Number(rawAyah);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

interface SurahDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ayah?: string }>;
}

// This page renders one Surah with Arabic ayat and English translation.
export default async function SurahDetailPage({ params, searchParams }: SurahDetailPageProps) {
  // Params can be async in the App Router, so we await before reading id.
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Invalid ids are treated as unknown routes and sent to not-found UI.
  const surahId = parseRouteSurahId(resolvedParams?.id);
  if (!surahId) {
    notFound();
  }

  // We load surah metadata and joined ayat content in parallel for performance.
  const [surahList, surahContent] = await Promise.all([
    getSurahList(),
    getSurahContent(surahId),
  ]);

  // If no matching surah exists in the dataset, we show not-found state.
  const surahMeta = surahList.find((surah) => surah.id === surahId);
  if (!surahMeta) {
    notFound();
  }

  return (
    <div className="surah-detail-page" style={{ padding: "0 1.5rem" }}>
      {/* Top navigation bar */}
      <div className="surah-detail-topbar" style={{ paddingTop: "1rem" }}>
        <Link href="/" className="back-link">
          ← Back to Surahs
        </Link>
      </div>

      {/* This header identifies the Surah clearly with full metadata. */}
      <header className="surah-detail-header" style={{ textAlign: "center" }}>
        <h1 className="surah-detail-title">{surahMeta.nameEnglish}</h1>
        <p className="surah-detail-arabic-name">{surahMeta.nameArabic}</p>
        <div className="surah-detail-meta" style={{ display: "flex", justifyContent: "center", gap: "12px", color: "#aab8d4", fontSize: "0.9rem" }}>
          <span>Surah {surahMeta.id}</span>
          <span>•</span>
          <span>{surahMeta.totalAyah} Ayahs</span>
          <span>•</span>
          <span>{surahMeta.revelationType}</span>
        </div>
      </header>

      {/* If content is missing, we show an inline safe fallback instead of crashing. */}
      {surahContent.length === 0 ? (
        <section className="surah-empty-state" aria-live="polite">
          <p>No ayat data is currently available for this Surah.</p>
        </section>
      ) : (
        <div style={{ marginTop: "1.5rem" }}>
          {/* All ayahs are loaded and displayed in a continuous list. */}
          <AyahList ayat={surahContent} />
        </div>
      )}
    </div>
  );
}
