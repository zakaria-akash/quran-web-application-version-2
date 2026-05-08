import { NextResponse } from "next/server";
import { getSurahList, searchTranslationText } from "@/lib/quran";

// This helper converts incoming query values into a normalized search string.
function normalizeQuery(value: any): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

// This route searches translation text and returns ayah matches with Surah context.
export async function POST(request: Request) {
  // This variable stores parsed request body so invalid JSON can be handled separately.
  let body: any;

  try {
    // Malformed JSON should be treated as a client-side bad request.
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
  // Parsed body is now validated for query-specific rules.
    const query = normalizeQuery(body?.query);

    // Empty queries are rejected to prevent unnecessary full-list scans.
    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    // Translation search is case-insensitive in the shared quran helper.
    const matchedTranslations = await searchTranslationText(query);

    // We enrich each match with Surah names to make UI rendering simpler.
    const surahList = await getSurahList();
    const surahById = new Map(surahList.map((surah) => [surah.id, surah]));

    const results = matchedTranslations.map((match) => {
      const surah = surahById.get(match.surahId);
      return {
        surahId: match.surahId,
        ayahNumber: match.ayahNumber,
        text: match.text,
        surahNameEnglish: surah?.nameEnglish || "",
        surahNameArabic: surah?.nameArabic || "",
      };
    });

    // Stable response fields simplify pagination or analytics extensions later.
    return NextResponse.json({
      query,
      total: results.length,
      results,
    });
  } catch (error) {
    // Any parse or runtime errors produce a standard internal-error response.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search request failed." },
      { status: 500 },
    );
  }
}
