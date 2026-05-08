# Quran Web Application 2.0 - QA Sign-Off

Production URL:

- <https://quran-web-application.vercel.app/>

This checklist reflects the current application behavior after the TypeScript migration and UI redesign.

## Product Scope Verification

- Root route redirects to `/surah/1`
- Surah reader route renders Arabic ayah text and English translation
- Surah sidebar lists all 114 Surahs
- Desktop settings panel remains visible on PC layouts
- Mobile navigation and settings use drawers
- Search supports Surah name and translation text matching
- Reader settings persist in `localStorage`

## Route Checklist

UI routes:

- `/`
- `/surah/[id]`
- `/settings`

API routes:

- `/api/quran`
- `/api/quran/[id]`
- `/api/search`

Validation checks:

- Invalid Surah id returns `400` from `/api/quran/[id]`
- Unknown Surah id returns `404` from `/api/quran/[id]`
- Empty search query returns `400`
- Malformed JSON payload returns `400`

## Dataset Integrity Checklist

- `public/quran-json/surah.json` contains 114 Surahs
- `public/quran-json/ayat.json` contains 6236 ayat records
- `public/quran-json/translation.json` contains 6236 translation records
- Ayat and translations align by `(surahId, ayahNumber)`

## Build and Verification Checklist

- `npm run qa:check` passes
- `npm run build` passes
- `npm run lint` runs successfully
- Static Surah params are generated for the available Surah routes

## Known Current Notes

- `src/app/surah/[id]/ayah-slider.tsx` remains in the repository but is not the active reader component
- Search result ayah links preserve `?ayah=<number>` in the URL, but the current reader does not yet auto-scroll or highlight that ayah
- ESLint currently reports `next/image` warnings for logo usage in `src/app/app-header.tsx`

## Release Recommendation

Quran Web Application 2.0 is release-ready for the current scoped feature set, with the known notes above tracked as polish items rather than blockers.
