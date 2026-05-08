import { NextResponse } from "next/server";
import { getSurahContent, getSurahList } from "@/lib/quran";

// This helper validates the dynamic route id before any data work is done.
function parseSurahId(value: any): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

// This route returns all ayat for a specific Surah with joined translation text.
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Params can be async in this Next.js version, so we await them safely.
    const params = await context.params;
    const surahId = parseSurahId(params?.id);

    // Invalid IDs receive a clear client-error response.
    if (!surahId) {
      return NextResponse.json({ error: "Invalid surah id." }, { status: 400 });
    }

    // We load metadata and joined content together for consistent responses.
    const [surahs, ayat] = await Promise.all([
      getSurahList(),
      getSurahContent(surahId),
    ]);

    // Unknown Surah IDs return not found even if ayah data happens to be empty.
    const surah = surahs.find((item) => item.id === surahId);
    if (!surah) {
      return NextResponse.json({ error: "Surah not found." }, { status: 404 });
    }

    // The response includes metadata plus ayat array for client rendering convenience.
    return NextResponse.json({
      surah,
      totalAyat: ayat.length,
      ayat,
    });
  } catch (error) {
    // Catch-all error handling ensures predictable API behavior.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load Surah content." },
      { status: 500 },
    );
  }
}
