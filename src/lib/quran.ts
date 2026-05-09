import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Represents the basic Surah metadata.
 */
export interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  revelationType: string;
  totalAyah: number | null;
}

/**
 * Represents an individual Ayah (verse) text in Arabic.
 */
export interface Ayah {
  surahId: number;
  ayahNumber: number;
  arabicText: string;
}

/**
 * Represents the translation of a specific Ayah.
 */
export interface Translation {
  surahId: number;
  ayahNumber: number;
  text: string;
}

/**
 * A joined record of both Arabic text and English translation for a single Ayah.
 */
export interface SurahContent {
  surahId: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
}

/**
 * In-memory cache for loaded and parsed Quran datasets to improve performance.
 */
interface QuranDataCache {
  surahs: Surah[] | null;
  ayat: Ayah[] | null;
  translations: Translation[] | null;
}

// Global cache to persist across server requests.
const quranDataCache: QuranDataCache = {
  surahs: null,
  ayat: null,
  translations: null,
};

// Base path to the dataset directory inside the public folder.
const QURAN_DATA_DIR = path.join(process.cwd(), "public", "quran-json");

// Filename constants for dataset files.
const DATA_FILES = {
  surahs: "surah.json",
  ayat: "ayat.json",
  translations: "translation.json",
};

// Toggle for production caching.
const SHOULD_USE_DATA_CACHE = true;

/**
 * Sanitizes input to ensure it's a valid positive integer (used for IDs/Indices).
 */
function toPositiveInteger(value: string | number | null | undefined): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

/**
 * Returns the absolute path for a dataset file.
 */
function getDataFilePath(fileName: string): string {
  return path.join(QURAN_DATA_DIR, fileName);
}

/**
 * Reads a JSON file from disk and parses it into a native JavaScript array.
 * Throws an error if the content is not a valid JSON array.
 */
async function readJsonArray(fileName: string): Promise<any[]> {
  const absolutePath = getDataFilePath(fileName);
  const rawFileContent = await readFile(absolutePath, "utf8");
  const parsedValue = JSON.parse(rawFileContent);

  if (!Array.isArray(parsedValue)) {
    throw new Error(`${fileName} must contain a top-level array.`);
  }

  return parsedValue;
}

/**
 * Normalizes a raw object from the Surah JSON into a structured Surah object,
 * ensuring all required fields are present and correctly typed.
 */
function normalizeSurahRecord(inputRecord: any): Surah | null {
  const id = toPositiveInteger(inputRecord?.id);
  const nameArabic = typeof inputRecord?.nameArabic === "string" ? inputRecord.nameArabic.trim() : "";
  const nameEnglish = typeof inputRecord?.nameEnglish === "string" ? inputRecord.nameEnglish.trim() : "";

  if (!id || !nameArabic || !nameEnglish) {
    return null;
  }

  return {
    id,
    nameArabic,
    nameEnglish,
    revelationType:
      typeof inputRecord?.revelationType === "string" ? inputRecord.revelationType.trim() : "",
    totalAyah: toPositiveInteger(inputRecord?.totalAyah),
  };
}

/**
 * Normalizes raw ayah records into a consistent structure.
 */
function normalizeAyahRecord(inputRecord: any): Ayah | null {
  const surahId = toPositiveInteger(inputRecord?.surahId);
  const ayahNumber = toPositiveInteger(inputRecord?.ayahNumber);
  const arabicText = typeof inputRecord?.arabicText === "string" ? inputRecord.arabicText.trim() : "";

  if (!surahId || !ayahNumber || !arabicText) {
    return null;
  }

  return {
    surahId,
    ayahNumber,
    arabicText,
  };
}

/**
 * Normalizes raw translation records into a consistent structure.
 */
function normalizeTranslationRecord(inputRecord: any): Translation | null {
  const surahId = toPositiveInteger(inputRecord?.surahId);
  const ayahNumber = toPositiveInteger(inputRecord?.ayahNumber);
  const text = typeof inputRecord?.text === "string" ? inputRecord.text.trim() : "";

  if (!surahId || !ayahNumber || !text) {
    return null;
  }

  return {
    surahId,
    ayahNumber,
    text,
  };
}

/**
 * Utility to map over a raw dataset array, applying a normalization function,
 * and filtering out any records that failed validation.
 */
function normalizeArrayRecords<T, R>(inputArray: T[], normalizer: (item: T) => R | null): R[] {
  return inputArray.map(normalizer).filter((item): item is R => item !== null);
}

/**
 * Fetches and returns the full list of Surahs. Uses cache if available.
 */
export async function getSurahList(): Promise<Surah[]> {
  if (SHOULD_USE_DATA_CACHE && quranDataCache.surahs) {
    return quranDataCache.surahs;
  }

  const rawSurahArray = await readJsonArray(DATA_FILES.surahs);
  const normalizedSurahs = normalizeArrayRecords(rawSurahArray, normalizeSurahRecord);

  // Sorting by ID guarantees stable output order for the UI.
  normalizedSurahs.sort((a, b) => a.id - b.id);
  if (SHOULD_USE_DATA_CACHE) {
    quranDataCache.surahs = normalizedSurahs;
  }
  return normalizedSurahs;
}

/**
 * Fetches and returns the full list of all Ayahs in the Quran.
 */
export async function getAyatList(): Promise<Ayah[]> {
  if (SHOULD_USE_DATA_CACHE && quranDataCache.ayat) {
    return quranDataCache.ayat;
  }

  const rawAyatArray = await readJsonArray(DATA_FILES.ayat);
  const normalizedAyat = normalizeArrayRecords(rawAyatArray, normalizeAyahRecord);

  // Sort ensures Ayahs are processed in a predictable order.
  normalizedAyat.sort((a, b) => a.surahId - b.surahId || a.ayahNumber - b.ayahNumber);
  if (SHOULD_USE_DATA_CACHE) {
    quranDataCache.ayat = normalizedAyat;
  }
  return normalizedAyat;
}

/**
 * Fetches and returns the full list of all translations in the Quran.
 */
export async function getTranslationList(): Promise<Translation[]> {
  if (SHOULD_USE_DATA_CACHE && quranDataCache.translations) {
    return quranDataCache.translations;
  }

  const rawTranslationArray = await readJsonArray(DATA_FILES.translations);
  const normalizedTranslations = normalizeArrayRecords(
    rawTranslationArray,
    normalizeTranslationRecord,
  );

  // Sort keeps translation data aligned with the Ayah list order.
  normalizedTranslations.sort((a, b) => a.surahId - b.surahId || a.ayahNumber - b.ayahNumber);
  if (SHOULD_USE_DATA_CACHE) {
    quranDataCache.translations = normalizedTranslations;
  }
  return normalizedTranslations;
}

/**
 * Filters and returns all Ayahs belonging to a specific Surah ID.
 */
export async function getAyatBySurahId(surahIdInput: string | number): Promise<Ayah[]> {
  const surahId = toPositiveInteger(surahIdInput);
  if (!surahId) {
    return [];
  }

  const ayatList = await getAyatList();
  return ayatList.filter((ayah) => ayah.surahId === surahId);
}

/**
 * Filters and returns all translation lines belonging to a specific Surah ID.
 */
export async function getTranslationsBySurahId(surahIdInput: string | number): Promise<Translation[]> {
  const surahId = toPositiveInteger(surahIdInput);
  if (!surahId) {
    return [];
  }

  const translationList = await getTranslationList();
  return translationList.filter((translation) => translation.surahId === surahId);
}

/**
 * Combines Arabic Ayah text and its corresponding translation into a unified
 * content record for a specific Surah ID, used for the Surah reader page.
 */
export async function getSurahContent(surahIdInput: string | number): Promise<SurahContent[]> {
  const surahId = toPositiveInteger(surahIdInput);
  if (!surahId) {
    return [];
  }

  const [ayat, translations] = await Promise.all([
    getAyatBySurahId(surahId),
    getTranslationsBySurahId(surahId),
  ]);

  // Use a map to build the join efficiently in O(N).
  const translationByAyahNumber = new Map<number, string>(
    translations.map((translation) => [translation.ayahNumber, translation.text]),
  );

  // Join the records by matching verse numbers.
  return ayat.map((ayah) => ({
    surahId: ayah.surahId,
    ayahNumber: ayah.ayahNumber,
    arabicText: ayah.arabicText,
    translationText: translationByAyahNumber.get(ayah.ayahNumber) || "",
  }));
}

/**
 * Searches across all translation data for a keyword or phrase,
 * returns matches across any Surah.
 */
export async function searchTranslationText(queryInput: string): Promise<Translation[]> {
  const query = typeof queryInput === "string" ? queryInput.trim().toLowerCase() : "";

  if (!query) {
    return [];
  }

  const translationList = await getTranslationList();
  return translationList.filter((entry) => entry.text.toLowerCase().includes(query));
}

/**
 * Clears the in-memory dataset cache. Useful for testing or hot-reloading scenarios.
 */
export function clearQuranCache(): void {
  quranDataCache.surahs = null;
  quranDataCache.ayat = null;
  quranDataCache.translations = null;
}
