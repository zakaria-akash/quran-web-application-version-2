# Quran Web Application (QWA)

Live application:

- <https://quran-web-application.vercel.app/>

A production-ready Quran reader built on Next.js App Router (JavaScript only), with:

- complete Surah index (114)
- Arabic ayah text + English translation
- global header search (Surah name and translation text) integrated globally across all routes.
- click-through deep-linking to exact ayah panels.
- persistent reader personalization (font family and sizes).
- fully responsive UI (3-column desktop / single-column mobile).
- dark visual system (Black + Navy with Green accents).

This document is the technical handbook for developers, maintainers, and reviewers.

## 1. Product Scope

### In Scope (MVP)

- Surah list page
- Surah detail reading page
- Manual ayah slider with Prev/Next
- Global search in header
 	- Surah name matching (with light fuzzy matching)
 	- Translation text matching
- Reader settings persisted in localStorage
- Minimal backend API routes in the same Next.js app

### Out of Scope

- Audio recitation
- Tafsir
- User auth/accounts
- Database integration
- Multi-translation support

## 2. Technology Stack

- Next.js 16.2.4 (App Router)
- React 19.2.4
- JavaScript (no TypeScript)
- ESLint 9 + eslint-config-next
- Static JSON dataset under public/quran-json

## 3. Architecture at a Glance

### High-Level Flow

1. UI pages and header run in Next.js App Router.
2. Data is stored in local JSON files.
3. Shared data helpers normalize and join datasets.
4. API routes expose normalized responses for search and content retrieval.
5. Reader settings are managed via a client-side provider and persisted in localStorage.

### Runtime Characteristics

- Same-port frontend + backend (single Next.js deployment)
- API routes under src/app/api
- Global header search available on all pages
- Surah detail supports deep-linking by query parameter:
 	- /surah/:id?ayah=:number

## 4. Repository Structure

```text
quran-web-application/
 public/
  quran-json/
   ayat.json
   surah.json
   translation.json
   README.md

 scripts/
  sync-quran-data.mjs
  phase5-qa-check.mjs

 src/
  app/
   api/
    quran/
     route.js
     [id]/
      route.js
    search/
     route.js
   surah/
    [id]/
     page.js
     ayah-slider.js
     not-found.js
   settings/
    page.js
   app-header.js
   globals.css
   layout.js
   page.js
   settings-provider.js
   favicon.ico

  lib/
   quran.js
   settings.js

 QA_SIGNOFF.md
 WorkFlow.md
 QWA_Overview.md
 QWA_FrontendGuide.md
 QWA_BackendGuide.md
 package.json
 README.md
```

## 5. File-by-File Code Flow

This section describes how each major file participates in request flow and UI behavior.

### App Shell

- src/app/layout.js
 	- Defines app metadata.
 	- Wraps the whole app with ReaderSettingsProvider.
 	- Renders global shell layout:
  		- AppHeader (top)
  		- page content
  		- footer

- src/app/globals.css
 	- Defines theme tokens and all route-level/component-level styles.
 	- Controls responsive behavior for:
  		- header/search dropdown
  		- surah list cards
  		- ayah slider and controls
  		- settings form and preview

### Home and Surah Reading

- src/app/page.js
 	- Server component.
 	- Loads normalized Surah list from lib/quran.js.
 	- Renders Surah cards linking to /surah/:id.

- src/app/surah/[id]/page.js
 	- Validates Surah id route parameter.
 	- Reads optional search query parameter ayah.
 	- Loads Surah metadata + joined ayah content.
 	- Renders AyahSlider with initialAyahNumber for deep-link navigation.

- src/app/surah/[id]/ayah-slider.js
 	- Client component.
 	- Manual-only ayah navigation (Prev/Next), no auto sliding.
 	- Initializes and syncs active slide by initialAyahNumber.
 	- Shows one active ayah panel with decorative Arabic frame.

- src/app/surah/[id]/not-found.js
 	- Friendly fallback for invalid or missing Surah id.

### Global Search

- src/app/app-header.js
 	- Client component rendered globally.
 	- Loads Surah list once from GET /api/quran for local name matching.
 	- Performs debounced translation search via POST /api/search.
 	- Supports:
  		- Surah name matching (including light fuzzy transliteration support)
  		- Translation ayah matching
 	- Deep-links ayah results to:
  		- /surah/:id?ayah=:ayahNumber
 	- Clears search state on result click.
 	- Handles outside-click close and Escape-key close for dropdown.

### Settings and Persistence

- src/app/settings/page.js
 	- Client settings UI.
 	- Binds controls to global provider:
  		- Arabic font family
  		- Arabic font size
  		- Translation font size
 	- Includes reset and live preview.

- src/app/settings-provider.js
 	- Client provider using useSyncExternalStore.
 	- Ensures hydration-safe default snapshot behavior.
 	- Hydrates from localStorage once on client.
 	- Applies CSS variables globally.

- src/lib/settings.js
 	- Settings defaults, validation, clamping, merge semantics.
 	- Safe localStorage read/write wrappers.
 	- Exposes settingsConstraints for UI controls.

### Data Layer

- src/lib/quran.js
 	- Reads JSON datasets from public/quran-json.
 	- Normalizes Surah, ayah, translation records.
 	- Provides joined Surah content for reader pages.
 	- Provides translation text search helper.
 	- Uses in-memory cache in production; bypasses cache in development.

### API Layer

- src/app/api/quran/route.js
 	- GET surah list with stable payload:
  		- { total, surahs }

- src/app/api/quran/[id]/route.js
 	- GET one Surah content payload:
  		- validates id
  		- returns 400 for invalid id
  		- returns 404 for unknown id
  		- returns Surah metadata + joined ayat

- src/app/api/search/route.js
 	- POST translation search payload:
  		- request: { query }
  		- returns 400 for invalid JSON or empty query
  		- returns matched ayah entries enriched with Surah names

### Data Operations and QA Scripts

- scripts/sync-quran-data.mjs
 	- Pulls full Arabic and English datasets from AlQuran Cloud.
 	- Validates structural alignment.
 	- Writes normalized files:
  		- surah.json
  		- ayat.json
  		- translation.json

- scripts/phase5-qa-check.mjs
 	- Dataset integrity checker.
 	- Confirms counts and cross-file consistency.

## 6. End-to-End Request Flows

### A. Open Home Page

1. GET / renders src/app/page.js.
2. page.js calls getSurahList().
3. quran.js loads/normalizes surah.json.
4. UI renders card grid with links to /surah/:id.

### B. Open Surah Page

1. GET /surah/:id enters src/app/surah/[id]/page.js.
2. Route id is validated.
3. getSurahContent(id) joins ayah + translation.
4. AyahSlider renders and allows manual panel navigation.

### C. Search and Open Exact Ayah

1. User types in global header input.
2. Header computes local Surah-name matches.
3. Header also calls POST /api/search for translation text matches.
4. User clicks ayah result link:
  - /surah/:id?ayah=:ayahNumber
5. Surah page passes initialAyahNumber to AyahSlider.
6. Slider opens directly on the target ayah panel.

## 7. API Contracts

### GET /api/quran

Success 200

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

Error 500

```json
{ "error": "Failed to load Surah list." }
```

### GET /api/quran/:id

Success 200

```json
{
 "surah": {
  "id": 2,
  "nameArabic": "البقرة",
  "nameEnglish": "Al-Baqarah"
 },
 "totalAyat": 286,
 "ayat": [
  {
   "surahId": 2,
   "ayahNumber": 1,
   "arabicText": "الم",
   "translationText": "Alif, Lam, Meem."
  }
 ]
}
```

Invalid id 400

```json
{ "error": "Invalid surah id." }
```

Unknown id 404

```json
{ "error": "Surah not found." }
```

### POST /api/search

Request

```json
{ "query": "mercy" }
```

Success 200

```json
{
 "query": "mercy",
 "total": 12,
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

Invalid JSON 400

```json
{ "error": "Invalid JSON payload." }
```

Empty query 400

```json
{ "error": "Query is required." }
```

## 8. Dataset Contract

Files:

- public/quran-json/surah.json
- public/quran-json/ayat.json
- public/quran-json/translation.json

Expected counts:

- Surahs: 114
- Ayat: 6236
- Translations: 6236

Join key:

- (surahId, ayahNumber)

## 9. Setup and Local Development

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start Production Mode

```bash
npm run start
```

## 10. NPM Scripts

- npm run dev
 	- start development server
- npm run build
 	- create production build
- npm run start
 	- run production server
- npm run lint
 	- lint all source files
- npm run sync:quran
 	- sync and normalize latest dataset from API source
- npm run qa:check
 	- run dataset integrity validations

## 11. Quality Gates and Release Checklist

Minimum release gate:

```bash
npm run lint
npm run qa:check
npm run build
```

Additional checklist:

- verify header search returns Surah and ayah matches
- verify ayah deep-linking opens the requested ayah panel
- verify settings persist after full refresh
- verify API 400/404/500 behavior remains stable

Reference:

- QA_SIGNOFF.md

## 12. Troubleshooting

### npm run dev exits with port conflict

If a previous Next.js process is still running, free the port and retry.

### Search result click does not navigate

Expected behavior:

- Surah result opens /surah/:id
- Ayah result opens /surah/:id?ayah=:ayahNumber

If navigation is not visible, confirm the URL updates. On same-route ayah jumps, UI may update without a large page transition.

### Dataset mismatch errors

Run:

```bash
npm run sync:quran
npm run qa:check
```

## 13. Security and Privacy Notes

- No user account data stored.
- Reader settings are stored locally in browser localStorage only.
- No database configured.

## 14. Roadmap Candidates (Post-MVP)

- Keyboard navigation for ayah slider
- Highlighted ayah focus indicator on deep-link open
- Optional translation pack strategy
- Offline-friendly caching strategy

## 15. License and Credits

Data source used by sync script:

- AlQuran Cloud API

Project and implementation workflow references:

- QWA_Overview.md
- QWA_FrontendGuide.md
- QWA_BackendGuide.md
- WorkFlow.md
