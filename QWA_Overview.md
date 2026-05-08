# Quran Web Application 2.0 - Overview

Quran Web Application 2.0 is a responsive Quran reader built with Next.js App Router and TypeScript. It uses a local Quran JSON dataset, an internal API layer, and a desktop-first reading layout that keeps navigation and reader settings visible on large screens.

## Product Goals

- Provide a clean and stable Quran reading experience
- Open directly into reading mode instead of a marketing-style landing page
- Keep the data layer simple by using local JSON files
- Persist reader preferences in the browser
- Support both desktop and mobile reading with route-consistent navigation

## What the App Currently Does

- Redirects `/` to `/surah/1` so Al-Fatiha is the first view
- Displays all 114 Surahs in a searchable sidebar
- Renders each Surah as a continuous list of Arabic ayah text and English translation
- Supports global search by Surah name and translation text
- Provides an always-open desktop settings panel
- Provides mobile navigation and settings drawers
- Saves reader typography preferences to `localStorage`
- Supports a persisted dark/light theme toggle
- Uses dark mode as the default first-render theme on server load and hard reload

## Current UX Model

### Desktop

- Left sidebar: searchable Surah list
- Center column: active Surah reader
- Right sidebar: always-open settings panel
- Theme toggle available in the global header

### Mobile and Tablet

- Single-column reader
- Navigation opens from a left drawer
- Settings open from a right drawer
- Search opens in a modal
- Theme toggle remains available in the header

## Core Routes

- `/`
  - Redirects to `/surah/1`

- `/surah/[id]`
  - Main reader route

- `/settings`
  - Dedicated settings page

- `/api/quran`
- `/api/quran/[id]`
- `/api/search`

## Current Tech Stack

- Next.js 16.2.4
- React 19.2.4
- TypeScript
- ESLint 9
- Custom CSS
- Local JSON data under `public/quran-json`

## Architecture Summary

- `src/lib/quran.ts` loads and normalizes dataset files
- `src/lib/settings.ts` manages validation and persistence for reader settings
- `src/app/settings-provider.tsx` provides app-wide settings state
- `src/app/settings-provider.tsx` also persists and applies the active theme mode
- `src/app/api/*` exposes normalized data and search routes
- `src/app/globals.css` contains the active visual system and responsive behavior

## Important Current Notes

- The active reader component is `src/app/surah/[id]/ayah-list.tsx`
- `src/app/surah/[id]/ayah-slider.tsx` remains in the repo but is not the current main reading experience
- Search ayah results include an `ayah` query parameter, but the active full-list reader does not yet auto-scroll to that ayah

## Non-Goals

- Audio recitation
- Tafsir
- Authentication
- Database integration
- Multi-translation switching

## Intended Audience for This Repo

- Developers extending the reader
- Maintainers updating Quran data
- Reviewers validating UI, route, and data behavior
