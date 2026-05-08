# Quran Web Application 2.0

Live application:

- <https://quran-web-application.vercel.app/>

Quran Web Application 2.0 is a production-ready Quran reader built with Next.js App Router and TypeScript. It uses a local Quran JSON dataset, server-side API routes, and a responsive reading layout with a permanent desktop sidebar and desktop settings panel.

## Current Product Summary

- Root route redirects directly to Al-Fatiha at `/surah/1`
- Complete Surah index of all 114 Surahs
- Surah reader page with full Arabic ayah text and English translation
- Global header search for Surah names and translation text
- Desktop 3-column layout: Surah sidebar, reader content, settings panel
- Mobile drawer navigation and mobile settings drawer
- Reader typography settings persisted in `localStorage`
- TypeScript codebase across app, API, scripts, and utilities

## Scope

### In Scope

- Responsive Surah reader
- Search by Surah name and translation text
- Reader settings:
  - Arabic font family
  - Arabic font size
  - Translation font size
- Static JSON dataset management
- Internal API routes for Surah list, Surah content, and search

### Out of Scope

- Audio recitation
- Tafsir
- User accounts
- Database integration
- Multiple translation packs

## Technology Stack

- Next.js 16.2.4
- React 19.2.4
- TypeScript
- ESLint 9
- Custom CSS in `src/app/globals.css`
- Local JSON dataset under `public/quran-json`
- Utility scripts executed with `tsx`

Note:

- `tailwindcss` is installed in the project, but the current UI is primarily implemented with custom global CSS rather than an active Tailwind utility workflow.

## Current Architecture

### App Shell

- `src/app/layout.tsx`
  - Global metadata
  - Wraps app with `ReaderSettingsProvider`
  - Renders header, desktop left sidebar, center reader area, desktop settings panel, and footer

- `src/app/app-header.tsx`
  - Global header
  - Desktop search trigger and mobile action buttons
  - Mobile navigation drawer
  - Mobile settings drawer
  - Search modal with Surah and ayah result groups

- `src/app/globals.css`
  - Theme tokens
  - Desktop and mobile layout rules
  - Drawer/modal styling
  - Reader and settings styling

### Routing

- `/`
  - Redirects to `/surah/1`

- `/surah/[id]`
  - Main reading route
  - Pre-generates valid Surah routes using `generateStaticParams`

- `/settings`
  - Dedicated settings page
  - Secondary route; desktop users typically use the always-open settings panel

### Data and State

- `src/lib/quran.ts`
  - Reads `surah.json`, `ayat.json`, and `translation.json`
  - Normalizes records
  - Caches parsed arrays in memory
  - Joins Arabic ayah text with translation text

- `src/lib/settings.ts`
  - Defines settings defaults and bounds
  - Validates and sanitizes saved values
  - Reads/writes `localStorage`

- `src/app/settings-provider.tsx`
  - App-wide reader settings store
  - Uses `useSyncExternalStore`
  - Applies typography settings through CSS variables

### API Routes

- `GET /api/quran`
  - Returns normalized Surah list

- `GET /api/quran/[id]`
  - Returns Surah metadata plus joined ayah content

- `POST /api/search`
  - Searches translation text and enriches results with Surah names

## Repository Structure

```text
quran-web-application/
  public/
    quran-json/
      ayat.json
      surah.json
      translation.json
      README.md

  scripts/
    phase5-qa-check.ts
    sync-quran-data.ts

  src/
    app/
      api/
        quran/
          [id]/
            route.ts
          route.ts
        search/
          route.ts
      settings/
        page.tsx
        settings-content.tsx
        settings-modal.tsx
      surah/
        [id]/
          ayah-list.tsx
          ayah-slider.tsx
          not-found.tsx
          page.tsx
      app-header.tsx
      desktop-settings.tsx
      globals.css
      layout.tsx
      page.tsx
      settings-provider.tsx
      surah-sidebar.tsx

    lib/
      quran.ts
      settings.ts

  QA_SIGNOFF.md
  QWA_BackendGuide.md
  QWA_FrontendGuide.md
  QWA_Overview.md
  QuranWebApplication_Version_2.md
  RESPONSIVE_DESIGN_SPEC.md
  RESPONSIVE_UI_CHANGES.md
  WorkFlow.md
```

## Runtime Behavior

### Launch Flow

1. User opens `/`
2. App redirects to `/surah/1`
3. Al-Fatiha loads as the default reader view
4. Desktop users see:
   - Surah sidebar on the left
   - Reader content in the center
   - Settings panel on the right
5. Mobile users use drawers for navigation and settings

### Reader Flow

1. User selects a Surah from sidebar or search
2. `src/app/surah/[id]/page.tsx` validates the route id
3. Surah metadata and joined ayah content load through `src/lib/quran.ts`
4. `AyahList` renders the full Surah in a continuous reading view

### Search Flow

1. Header opens the search modal
2. Surah matches are computed client-side from `/api/quran`
3. Translation matches come from `POST /api/search`
4. Clicking a result navigates to the Surah route

Important current behavior:

- Search ayah links still include `?ayah=<number>` in the URL.
- The current reader UI renders the full Surah list view and does not yet auto-scroll or highlight the target ayah.

## Main UI Components

- `src/app/surah-sidebar.tsx`
  - Searchable Surah list
  - Active Surah indicator
  - Used in both desktop sidebar and mobile drawer

- `src/app/desktop-settings.tsx`
  - Always-open desktop settings panel

- `src/app/settings/settings-content.tsx`
  - Settings controls and live preview

- `src/app/surah/[id]/ayah-list.tsx`
  - Primary active reading component
  - Renders all ayahs continuously

- `src/app/surah/[id]/ayah-slider.tsx`
  - Legacy reader component retained in codebase
  - Not currently used by the main Surah route

## Scripts

- `npm run dev`
  - Start development server

- `npm run dev:safe`
  - Start development server with Turbopack disabled and increased memory

- `npm run build`
  - Create production build

- `npm run start`
  - Start production server

- `npm run lint`
  - Run ESLint

- `npm run sync:quran`
  - Pull fresh Quran dataset from AlQuran Cloud and rewrite local JSON files

- `npm run qa:check`
  - Validate dataset counts and cross-file alignment

## Dataset Contract

Files:

- `public/quran-json/surah.json`
- `public/quran-json/ayat.json`
- `public/quran-json/translation.json`

Expected counts:

- Surahs: 114
- Ayat: 6236
- Translations: 6236

Join key:

- `(surahId, ayahNumber)`

## Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start Production

```bash
npm run start
```

## Quality Gate

Recommended release checks:

```bash
npm run lint
npm run qa:check
npm run build
```

Current status at the time of this documentation update:

- `npm run qa:check` passes
- `npm run build` passes
- `npm run lint` passes with `next/image` warnings in `src/app/app-header.tsx`

## Related Documents

- `QWA_Overview.md`
- `QWA_FrontendGuide.md`
- `QWA_BackendGuide.md`
- `RESPONSIVE_DESIGN_SPEC.md`
- `RESPONSIVE_UI_CHANGES.md`
- `QA_SIGNOFF.md`
- `WorkFlow.md`
