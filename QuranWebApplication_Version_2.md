# Quran Web Application 2.0 - Current Version Notes

This document records the current implemented version of the project and supersedes the earlier JavaScript-era planning assumptions.

## Version Identity

- Project name: Quran Web Application 2.0
- Codebase style: TypeScript
- UI direction: responsive dark reader with desktop side panels and mobile drawers

## Current Feature Set

- Direct entry into Al-Fatiha on app load
- Full Surah sidebar navigation
- Continuous Surah reader with Arabic and English text
- Global modal search
- Always-open desktop settings panel
- Mobile navigation drawer
- Mobile settings drawer
- Reader setting persistence
- Internal JSON-backed API routes

## Current Non-Features

- No audio playback
- No tafsir
- No user accounts
- No external database
- No translation switching

## Important UI Decisions

### Desktop

- Left Surah sidebar remains visible
- Reader content fills the center column
- Right settings panel remains visible and no longer collapses

### Mobile

- Drawer-based navigation
- Drawer-based settings access
- Search modal overlay

## Migration Notes

The project previously had documentation written for:

- JavaScript-only implementation
- a Surah-grid homepage
- Tailwind-led styling expectations
- earlier UI planning states

The current implementation differs in several important ways:

- TypeScript is now the actual source language
- `/` redirects to `/surah/1`
- the active reader is a full ayah list, not the old slider flow
- desktop settings are always open
- responsive behavior is implemented with the current CSS system in `src/app/globals.css`

## Current Files That Define the Product

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/app-header.tsx`
- `src/app/surah-sidebar.tsx`
- `src/app/desktop-settings.tsx`
- `src/app/surah/[id]/page.tsx`
- `src/app/surah/[id]/ayah-list.tsx`
- `src/app/settings-provider.tsx`
- `src/lib/quran.ts`
- `src/lib/settings.ts`

## Verification Snapshot

At the time this version note was updated:

- Build passes
- Dataset QA passes
- Lint runs with only image optimization warnings in the header component
