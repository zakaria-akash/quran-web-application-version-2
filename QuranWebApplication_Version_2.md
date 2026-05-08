# Technical Assessment

## Quran Web Application

## Task

#### You need to clone the UI of this page (https://quranmazid.com/1) and implement the features

#### which are mentioned in detail below. Study the reference site carefully for layout, typography,

#### and interaction patterns before starting.

## Technical Requirements

## Tech Stack

```
Layer Technology
```
**Language** (^) Must use TypeScript
**Backend** (^) Node.js / Hono-Bun
**Frontend** (^) Next.js with Static Site Generation (SSG)
**Styling** (^) Tailwind CSS
**Database** (^) Any Quran JSON/SQLite database sourced from GitHub
**Audio Source** (^) Any free Quran recitation API

## Key UI Elements to Clone

```
Element Description
```
**Assets** (^) Collect All required assets (fonts,img etc) from reff. site
**Icon Sidebar** (^) Left icon-sidebar
**Surah Sidebar** (^) Scrollable list of all 114 surahs with Arabic name, English name,

##### and surah number.

**Ayah Display** (^) Each verse shown with Arabic text (right-aligned) and English

##### translation below. Verse number displayed.

**Audio Playback** (^) Play/pause button per ayah or full surah playback. Use any free

##### Quran audio API.

**Font Settings Panel** (^) Sidebar or modal with: Arabic font selector (min 2 fonts), Arabic

##### font size slider, Translation font size slider.

**Search** (^) Search bar to find ayahs by translation text across all surahs.
**Dark Theme** (^) Dark color scheme matching the reference design.
**Responsive Design** Also Clone the Mobile UI part for above


### Required Features

##### Note: Collect All required assets (fonts,img etc) from reff. site.

##### 1. Left Icon sidebar

- Clone the left icon sidebar

##### 1. Surah sidebar

- Display all 114 surahs with surah number, Arabic name, and English name/translation.
- Clicking a surah navigates to its Ayah page.
- Surah list should be visible as a sidebar on desktop and as a collapsible drawer/menu on mobile.

##### 2. Ayah Page (Surah Reader)

- Show all verses of the selected surah.
- Each ayah displays: verse number, Arabic text (right-aligned, proper Quranic font), and English translation
    (Saheeh International or similar).
- Surah header with surah name, number of ayahs, and revelation place (Makkah/Madinah).

##### 3. Audio Playback

- Play button for each individual ayah to hear its recitation.
- Use any freely available Quran audio API or CDN.

##### 4. Search Functionality

- Allow users to search ayahs by Arabic or English translation text.

##### 5. Font Settings Panel

- Accessible via a settings icon/button in the header or sidebar.
- Arabic Font Selection: minimum 2 Arabic font options (e.g. KFGQ, Amiri, Scheherazade).
- Arabic Font Size: adjustable slider/stepper.
- Translation Font Size: adjustable slider/stepper.
- All settings must persist across sessions using localStorage.

##### 6. UI & Responsiveness

- Dark theme UI matching the QuranMazid reference design.
- Fully responsive: must work well on mobile, tablet, and desktop.
- Clean, professional typography with proper Arabic text rendering.

## Submission Instructions

#### Reply in the same email thread. Do not send a separate email. Submit -

**1.** Public GitHub Repository (Front+Backend) Link (must be public and accessible)
**2.** Live Demo Link deployed on Vercel or Netlify (verify in incognito before submitting)
**3.** Screen Recording showing all features working (maximum 5 minutes)

**4.** (^) Code quality, TypeScript usage, component structure, and commit history will

##### be evaluated.


