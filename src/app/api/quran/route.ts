import { NextResponse } from "next/server";
import { getSurahList } from "@/lib/quran";

// This route serves the normalized Surah list for UI pages and external consumers.
export async function GET() {
  try {
    // Data loading is cached in the helper to avoid repeated file parsing.
    const surahs = await getSurahList();

    // A stable response shape keeps client usage straightforward and predictable.
    return NextResponse.json({
      total: surahs.length,
      surahs,
    });
  } catch (error) {
    // The message is sanitized to avoid exposing internal stack details.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load Surah list." },
      { status: 500 },
    );
  }
}
