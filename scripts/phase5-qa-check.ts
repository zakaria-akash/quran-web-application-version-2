import { readFile } from "node:fs/promises";
import path from "node:path";

interface SurahRecord {
  id: number;
  nameArabic: string;
  nameEnglish: string;
}

interface AyahRecord {
  surahId: number;
  ayahNumber: number;
  arabicText: string;
}

interface TranslationRecord {
  surahId: number;
  ayahNumber: number;
  text: string;
}

// This utility resolves dataset file paths from the project root directory.
const resolvePath = (fileName: string) => path.join(process.cwd(), "public", "quran-json", fileName);

// This helper loads one dataset file and validates that it is a JSON array.
async function loadArrayDataset<T>(fileName: string): Promise<T[]> {
  const filePath = resolvePath(fileName);
  const content = await readFile(filePath, "utf8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error(`${fileName} must contain a top-level JSON array.`);
  }

  return parsed as T[];
}

// This helper validates expected high-level counts for the full Quran dataset.
function validateTopLevelCounts(surahs: SurahRecord[], ayat: AyahRecord[], translations: TranslationRecord[]) {
  if (surahs.length !== 114) {
    throw new Error(`Expected 114 surahs, found ${surahs.length}.`);
  }

  if (ayat.length !== 6236) {
    throw new Error(`Expected 6236 ayat records, found ${ayat.length}.`);
  }

  if (translations.length !== 6236) {
    throw new Error(`Expected 6236 translation records, found ${translations.length}.`);
  }
}

// This helper creates a stable key for ayah joins across datasets.
function ayahKey(surahId: number, ayahNumber: number) {
  return `${surahId}:${ayahNumber}`;
}

// This helper validates ayah/translation one-to-one correspondence and surah references.
function validateCrossDatasetConsistency(surahs: SurahRecord[], ayat: AyahRecord[], translations: TranslationRecord[]) {
  const surahIdSet = new Set(surahs.map((surah) => surah.id));

  // Every ayah must point to a known surah id and have a valid key.
  const ayahKeySet = new Set<string>();
  for (const record of ayat) {
    if (!surahIdSet.has(record.surahId)) {
      throw new Error(`Ayah references unknown surahId=${record.surahId}.`);
    }

    const key = ayahKey(record.surahId, record.ayahNumber);
    ayahKeySet.add(key);
  }

  // Every translation must point to a known surah id and match an existing ayah key.
  for (const record of translations) {
    if (!surahIdSet.has(record.surahId)) {
      throw new Error(`Translation references unknown surahId=${record.surahId}.`);
    }

    const key = ayahKey(record.surahId, record.ayahNumber);
    if (!ayahKeySet.has(key)) {
      throw new Error(`Translation missing ayah counterpart for key=${key}.`);
    }
  }
}

// This main QA check validates dataset health for release confidence.
async function main() {
  const [surahs, ayat, translations] = await Promise.all([
    loadArrayDataset<SurahRecord>("surah.json"),
    loadArrayDataset<AyahRecord>("ayat.json"),
    loadArrayDataset<TranslationRecord>("translation.json"),
  ]);

  validateTopLevelCounts(surahs, ayat, translations);
  validateCrossDatasetConsistency(surahs, ayat, translations);

  // Output summary keeps QA logs readable in CI/local runs.
  console.log("Phase 5 QA dataset checks passed.");
  console.log(`Surahs: ${surahs.length}`);
  console.log(`Ayat: ${ayat.length}`);
  console.log(`Translations: ${translations.length}`);
}

// Non-zero exit codes keep failures visible for release gating.
main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
