import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurahContent, getSurahList } from "@/lib/quran";
import AyahList from "./ayah-list";

export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateStaticParams() {
  const surahList = await getSurahList();
  return surahList.map((surah) => ({ id: String(surah.id) }));
}

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

export default async function SurahDetailPage({ params, searchParams }: SurahDetailPageProps) {
  const resolvedParams = await params;
  await searchParams;

  const surahId = parseRouteSurahId(resolvedParams?.id);
  if (!surahId) {
    notFound();
  }

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
      <div className="surah-detail-topbar">
        <Link href="/" className="back-link">
          Back to Surahs
        </Link>
      </div>

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

      {surahContent.length === 0 ? (
        <section className="surah-empty-state" aria-live="polite">
          <p>No ayat data is currently available for this Surah.</p>
        </section>
      ) : (
          <div className="surah-detail-content">
          <AyahList ayat={surahContent} />
        </div>
      )}
    </div>
  );
}
