# Quran Web Application 2.0 - Frontend Guide

This guide documents the current frontend implementation of Quran Web Application 2.0.

## Frontend Stack

- Next.js App Router
- React 19
- TypeScript
- Custom CSS in `src/app/globals.css`
- Client-side persisted settings via `localStorage`
- Client-side persisted theme mode via `localStorage`

## Frontend Structure

```text
src/app/
  api/
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
```

## Main Frontend Flow

### 1. App Shell

- `src/app/layout.tsx`
  - Defines metadata
  - Wraps the tree with `ReaderSettingsProvider`
  - Server-renders `<html>` with dark theme as the default baseline
  - Renders:
    - `AppHeader`
    - desktop `SurahSidebar`
    - route content
    - desktop `DesktopSettings`
    - footer

### 2. Root Route

- `src/app/page.tsx`
  - Redirects to `/surah/1`
  - The app no longer uses a Surah-grid homepage

### 3. Surah Reader

- `src/app/surah/[id]/page.tsx`
  - Validates the route id
  - Loads Surah metadata and content
  - Renders the continuous list reader

- `src/app/surah/[id]/ayah-list.tsx`
  - Current main reader UI
  - Renders all ayahs for the selected Surah
  - Applies Arabic and translation typography settings

- `src/app/surah/[id]/ayah-slider.tsx`
  - Legacy component retained in the repo
  - Not currently mounted by the route

### 4. Header and Search

- `src/app/app-header.tsx`
  - Global header rendered on all routes
  - Handles:
    - desktop search trigger
    - dark/light theme toggle
    - mobile navigation drawer
    - mobile settings drawer
    - modal search UI
  - Uses `/api/quran` to preload Surah data
  - Uses `/api/search` for translation search

Search behavior:

- Surah name matching happens client-side
- Translation matching happens through the API
- Ayah search results navigate to the Surah route and preserve `?ayah=<number>` in the URL

Current limitation:

- The active reader does not yet auto-focus the ayah identified in the query string

### 5. Settings UI

- `src/app/desktop-settings.tsx`
  - Always-open desktop settings panel

- `src/app/settings/settings-content.tsx`
  - Shared controls for font family and size settings
  - Includes reset button and live preview

- `src/app/settings/page.tsx`
  - Standalone settings page

## Styling Model

All active styling is centralized in `src/app/globals.css`.

Key design characteristics:

- Dark-first visual system with a fully designed light mode
- Green accent color for active states
- Semantic theme tokens shared across both modes
- Fixed desktop side columns
- Drawer-driven mobile interactions

Key CSS variables:

```css
:root {
  --color-primary: #22c55e;
  --sidebar-width: 280px;
  --settings-width: 300px;
  --header-height: 64px;
  --qwa-arabic-font-family: "Amiri", serif;
  --qwa-arabic-font-size: 36px;
  --qwa-translation-font-size: 18px;
  --color-bg-start: ...;
  --color-bg-end: ...;
  --color-text: ...;
}
```

## Responsive Behavior

### Desktop

- Breakpoint: `min-width: 1281px`
- Left Surah sidebar visible
- Right settings panel visible
- Center reader column scrolls independently

### Mobile and Tablet

- Breakpoint: `max-width: 1280px`
- Sidebar hidden from layout and opened as a drawer
- Settings opened as a drawer
- Search shown in a modal

## Theme System

- Theme state is owned by `src/app/settings-provider.tsx`
- Supported modes: `dark` and `light`
- The current theme is stored in `localStorage` under a dedicated theme key
- The active theme is applied through `document.documentElement.dataset.theme`
- The server-rendered baseline remains dark to avoid a light flash on hard reload

## Reader Settings Integration

Settings are provided through:

- `src/lib/settings.ts`
- `src/app/settings-provider.tsx`

Frontend components consume settings through `useReaderSettings()` and by CSS variables applied to the provider scope.

## Frontend Quality Notes

- The app builds successfully in production mode
- Current lint output includes `next/image` warnings for logo images in `app-header.tsx`
- The codebase is TypeScript-first, even though some older docs still referenced JavaScript before this documentation update
