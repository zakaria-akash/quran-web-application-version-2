
import { notFound } from "next/navigation";
import { getSurahContent, getSurahList } from "@/lib/quran";
import AyahList from "./ayah-list";
import Link from "next/link";

// Only known Surah IDs should resolve, so the route opts into static params.
export const dynamicParams = false;
export const dynamic = "force-static";

// Every known Surah route is prebuilt so the core reading experience can load
// from prerendered HTML instead of runtime server work.
export async function generateStaticParams() {
  const surahList = await getSurahList();
  return surahList.map((surah) => ({ id: String(surah.id) }));
}

// Dynamic route validation stays isolated in a helper so the main component can
// focus on orchestration and rendering.
function parseRouteSurahId(rawId: string | undefined): number | null {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

interface SurahDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ayah?: string }>;
}

// This is the main reading route. It resolves the route ID, loads the selected
// Surah content, and renders the continuous list reader.
export default async function SurahDetailPage({ params, searchParams }: SurahDetailPageProps) {
  const resolvedParams = await params;

  // The route still accepts `ayah` query params so search deep links remain
  // valid even though the current reader UI does not auto-scroll yet.
  await searchParams;

  const surahId = parseRouteSurahId(resolvedParams?.id);
  if (!surahId) {
    notFound();
  }

  // Surah metadata and ayah content load together because the page needs both
  // to render the heading and the reading body.
  const [surahList, surahContent] = await Promise.all([
    getSurahList(),
    getSurahContent(surahId),
  ]);

  const surahMeta = surahList.find((surah) => surah.id === surahId);
  if (!surahMeta) {
    notFound();
  }

  return (
    <div className="surah-detail-page">
      {/* Route-local navigation helps readers return to browsing without relying on browser history. */}
      <div className="surah-detail-topbar">
        <Link href="/" className="back-link">
          Back to Surahs
        </Link>
      </div>

      {/* The header gathers all Surah-level context above the ayah content. */}
      <header className="surah-detail-header">
        <h1 className="surah-detail-title">{surahMeta.nameEnglish}</h1>
        <p className="surah-detail-arabic-name">{surahMeta.nameArabic}</p>
        <div className="surah-detail-meta">
          <span>Surah {surahMeta.id}</span>
          <span>•</span>
          <span>{surahMeta.totalAyah} Ayahs</span>
          <span>•</span>
          <span>{surahMeta.revelationType}</span>
        </div>
      </header>

      {/* If the dataset is unexpectedly empty we still render a graceful fallback
          instead of leaving the center column blank. */}
      {surahContent.length === 0 ? (
        <section className="surah-empty-state" aria-live="polite">
          <p>No ayat data is currently available for this Surah.</p>
        </section>
      ) : (
        <div className="surah-detail-content">
          {/* The active reader favors full-Surah continuous reading over slider-style pagination. */}
          <AyahList ayat={surahContent} />
        </div>
      )}
    </div>
  );
}
