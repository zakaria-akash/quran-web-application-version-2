# Quran Web Application 2.0 - Responsive Design Specification

This document describes the current responsive behavior implemented in the app.

## Breakpoints

- Desktop: `min-width: 1281px`
- Mobile and tablet: `max-width: 1280px`
- Small-screen tuning: `max-width: 768px`

## Desktop Layout

Desktop uses a 3-column reading shell.

### Structure

- Header at the top
- Left sidebar for Surah navigation
- Center reader content
- Right settings panel

### Desktop Column Sizes

- Left sidebar: `280px`
- Right settings panel: `300px`
- Center area: remaining width

### Desktop Behaviors

- Surah sidebar is always visible
- Settings panel is always visible
- Main reader column scrolls independently
- Surah list inside the sidebar scrolls within the sidebar
- Sidebar content stretches to the full width of the desktop sidebar

## Mobile and Tablet Layout

Mobile and tablet use a single-column layout.

### Structure

- Sticky header
- Full-width reader content
- Navigation hidden until opened from the hamburger menu
- Settings hidden until opened from the settings button

### Mobile Behaviors

- Navigation opens as a left drawer
- Settings open as a right drawer
- Search opens as a modal overlay
- Main content uses the full layout width

## Header Behavior

### Desktop Header

- Brand on the left
- Search trigger on the right with other action buttons
- No hamburger menu

### Mobile Header

- Hamburger button visible
- Brand remains visible
- Search and settings action buttons remain accessible

## Search UI

- Search is presented as a modal overlay
- Search supports:
  - Surah name results
  - Translation text results
- Search results are scrollable inside the modal

## Settings UI

### Desktop

- Settings are permanently visible in the right column
- No collapse toggle is shown

### Mobile

- Settings open inside a right-side drawer

## Reader Typography

Typography is controlled by CSS variables exposed through the settings provider:

- `--qwa-arabic-font-family`
- `--qwa-arabic-font-size`
- `--qwa-translation-font-size`

## Core Visual Tokens

```css
:root {
  --color-black: #0a0a0a;
  --color-navy: #0d1b2a;
  --color-text-light: #e0e1dd;
  --color-primary: #22c55e;
  --color-primary-hover: #16a34a;
  --color-accent-blue: #9fb7ff;
  --sidebar-width: 280px;
  --settings-width: 300px;
  --header-height: 64px;
}
```

## Accessibility Expectations

- Semantic landmarks such as `header`, `main`, `nav`, and `section`
- Button labels for icon-only controls
- Keyboard support for modal and drawer dismissal with `Escape`
- Focus-visible support through browser/native and component styling

## Known Responsive Notes

- The desktop reader currently uses the continuous `AyahList` view rather than the old slider interaction
- Search ayah links preserve the ayah number in the URL, but the reader does not yet auto-jump to that ayah
