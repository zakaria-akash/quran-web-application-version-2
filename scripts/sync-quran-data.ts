import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface ApiAyah {
  number: number;
  numberInSurah: number;
  text: string;
}

interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  ayahs: ApiAyah[];
}

interface ApiResponseData {
  surahs: ApiSurah[];
}

interface ApiResponse {
  code: number;
  status: string;
  data: ApiResponseData;
}

// This endpoint provides the complete Quran Arabic text in a structured Surah/Ayah format.
const ARABIC_QURAN_ENDPOINT = "https://api.alquran.cloud/v1/quran/quran-uthmani";

// This endpoint provides a complete English translation in matching Surah/Ayah structure.
const ENGLISH_QURAN_ENDPOINT = "https://api.alquran.cloud/v1/quran/en.asad";

// This output directory matches the existing project data contract used by the app.
const OUTPUT_DIR = path.join(process.cwd(), "public", "quran-json");

// This helper reads JSON from a URL and raises clear errors when the API is unavailable.
async function fetchJson(url: string): Promise<ApiResponseData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}.`);
  }

  const payload = (await response.json()) as ApiResponse;
  if (!payload || payload.code !== 200 || !payload.data) {
    throw new Error(`Unexpected payload shape from ${url}.`);
  }

  return payload.data;
}

// This helper converts edition metadata into the project's revelation-type label style.
function normalizeRevelationType(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "meccan") {
    return "Meccan";
  }
  if (normalized === "medinan") {
    return "Medinan";
  }

  // Unknown values are passed through in title-case-like form for traceability.
  return value.trim();
}

// This helper builds the exact surah.json shape consumed by src/lib/quran.js.
function buildSurahDataset(arabicSurahs: ApiSurah[]) {
  return arabicSurahs.map((surah) => ({
    id: surah.number,
    nameArabic: surah.name,
    nameEnglish: surah.englishName,
    revelationType: normalizeRevelationType(surah.revelationType),
    totalAyah: Array.isArray(surah.ayahs) ? surah.ayahs.length : 0,
  }));
}

// This helper builds the exact ayat.json shape consumed by src/lib/quran.js.
function buildAyatDataset(arabicSurahs: ApiSurah[]) {
  return arabicSurahs.flatMap((surah) =>
    surah.ayahs.map((ayah) => ({
      surahId: surah.number,
      ayahNumber: ayah.numberInSurah,
      arabicText: ayah.text,
    })),
  );
}

// This helper builds translation.json in the exact schema expected by existing helpers.
function buildTranslationDataset(englishSurahs: ApiSurah[]) {
  return englishSurahs.flatMap((surah) =>
    surah.ayahs.map((ayah) => ({
      surahId: surah.number,
      ayahNumber: ayah.numberInSurah,
      text: ayah.text,
    })),
  );
}

// This helper validates that Arabic and translation editions are structurally compatible.
function assertDatasetsAlign(arabicSurahs: ApiSurah[], englishSurahs: ApiSurah[]) {
  if (!Array.isArray(arabicSurahs) || !Array.isArray(englishSurahs)) {
    throw new Error("Surah datasets must be arrays.");
  }

  if (arabicSurahs.length !== 114 || englishSurahs.length !== 114) {
    throw new Error(
      `Expected 114 Surahs in both datasets, got Arabic=${arabicSurahs.length} and English=${englishSurahs.length}.`,
    );
  }

  for (let index = 0; index < arabicSurahs.length; index += 1) {
    const arabicSurah = arabicSurahs[index];
    const englishSurah = englishSurahs[index];

    if (arabicSurah.number !== englishSurah.number) {
      throw new Error(`Surah number mismatch at index ${index}: ${arabicSurah.number} vs ${englishSurah.number}.`);
    }

    const arabicAyahCount = Array.isArray(arabicSurah.ayahs) ? arabicSurah.ayahs.length : 0;
    const englishAyahCount = Array.isArray(englishSurah.ayahs) ? englishSurah.ayahs.length : 0;

    if (arabicAyahCount !== englishAyahCount) {
      throw new Error(
        `Ayah count mismatch for Surah ${arabicSurah.number}: Arabic=${arabicAyahCount}, English=${englishAyahCount}.`,
      );
    }
  }
}

// This function writes one dataset file with stable pretty formatting for easy review.
async function writeDatasetFile(fileName: string, data: any) {
  const absolutePath = path.join(OUTPUT_DIR, fileName);
  const json = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(absolutePath, json, "utf8");
}

// This main workflow fetches data, validates it, transforms it, and writes local datasets.
async function main() {
  // Ensure target directory exists before writing any output files.
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Fetch both editions in parallel to reduce sync runtime.
  const [arabicData, englishData] = await Promise.all([
    fetchJson(ARABIC_QURAN_ENDPOINT),
    fetchJson(ENGLISH_QURAN_ENDPOINT),
  ]);

  // Normalize source arrays from API payloads.
  const arabicSurahs = Array.isArray(arabicData.surahs) ? arabicData.surahs : [];
  const englishSurahs = Array.isArray(englishData.surahs) ? englishData.surahs : [];

  // Guard against partial or incompatible datasets before writing local files.
  assertDatasetsAlign(arabicSurahs, englishSurahs);

  // Build the three local files used across pages and API routes.
  const surahDataset = buildSurahDataset(arabicSurahs);
  const ayatDataset = buildAyatDataset(arabicSurahs);
  const translationDataset = buildTranslationDataset(englishSurahs);

  // Persist all transformed files in parallel for faster completion.
  await Promise.all([
    writeDatasetFile("surah.json", surahDataset),
    writeDatasetFile("ayat.json", ayatDataset),
    writeDatasetFile("translation.json", translationDataset),
  ]);

  // This summary gives quick verification information after the sync run.
  const totalAyat = ayatDataset.length;
  console.log(`Quran dataset synced successfully.`);
  console.log(`Surahs: ${surahDataset.length}`);
  console.log(`Ayat: ${totalAyat}`);
  console.log(`Files written to: ${OUTPUT_DIR}`);
}

// This catch block ensures failures are visible with non-zero exit codes.
main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
