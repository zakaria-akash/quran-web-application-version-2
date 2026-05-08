# Quran Web Application 2.0 - Backend Guide

Quran Web Application 2.0 uses a lightweight internal backend built with Next.js route handlers. There is no separate server, database, or external persistence layer in the current implementation.

## Backend Stack

- Next.js App Router route handlers
- TypeScript
- Local JSON dataset under `public/quran-json`
- Node.js runtime features for file access

## Backend Structure

```text
src/app/api/
  quran/
    [id]/
      route.ts
    route.ts
  search/
    route.ts

src/lib/
  quran.ts
```

## Data Source

All backend routes read from:

- `public/quran-json/surah.json`
- `public/quran-json/ayat.json`
- `public/quran-json/translation.json`

These files are normalized and accessed through `src/lib/quran.ts`.

## Shared Data Layer

`src/lib/quran.ts` provides:

- Surah record normalization
- Ayah record normalization
- Translation record normalization
- In-memory dataset caching
- Joined Surah content generation
- Translation text search

Caching model:

- Parsed datasets are cached in memory for the process lifetime
- This avoids repeated file parsing during route execution

## API Routes

### `GET /api/quran`

Purpose:

- Return the normalized Surah list

Success shape:

```json
{
  "total": 114,
  "surahs": [
    {
      "id": 1,
      "nameArabic": "الفاتحة",
      "nameEnglish": "Al-Faatiha",
      "revelationType": "Meccan",
      "totalAyah": 7
    }
  ]
}
```

### `GET /api/quran/[id]`

Purpose:

- Return one Surah plus all joined ayah content

Success shape:

```json
{
  "surah": {
    "id": 1,
    "nameArabic": "الفاتحة",
    "nameEnglish": "Al-Faatiha",
    "revelationType": "Meccan",
    "totalAyah": 7
  },
  "totalAyat": 7,
  "ayat": [
    {
      "surahId": 1,
      "ayahNumber": 1,
      "arabicText": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "translationText": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    }
  ]
}
```

Validation behavior:

- Invalid id returns `400`
- Unknown Surah returns `404`

### `POST /api/search`

Purpose:

- Search translation text and enrich each result with Surah metadata

Request:

```json
{ "query": "mercy" }
```

Success shape:

```json
{
  "query": "mercy",
  "total": 1,
  "results": [
    {
      "surahId": 1,
      "ayahNumber": 3,
      "text": "The Entirely Merciful, the Especially Merciful.",
      "surahNameEnglish": "Al-Faatiha",
      "surahNameArabic": "الفاتحة"
    }
  ]
}
```

Validation behavior:

- Invalid JSON returns `400`
- Empty query returns `400`

## Supporting Scripts

### `scripts/sync-quran-data.ts`

- Fetches Arabic Quran text from AlQuran Cloud
- Fetches English translation from AlQuran Cloud
- Validates structural compatibility
- Rewrites local dataset files

### `scripts/phase5-qa-check.ts`

- Validates dataset counts
- Confirms ayah and translation alignment
- Provides a repeatable QA check before release

## Current Backend Constraints

- No database
- No user-specific saved server state
- No audio endpoints
- No rate limiting layer
- No authentication

## Operational Notes

- Frontend and backend ship from the same Next.js deployment
- All API responses are shaped for direct frontend use
- The backend is intentionally small and deterministic to keep maintenance simple
