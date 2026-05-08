# Quran Web Application 2.0 - Quran JSON Dataset

This folder contains the static Quran dataset used by both the UI and API routes.

## Files

- `surah.json`
  - Surah metadata

- `ayat.json`
  - Arabic ayah records

- `translation.json`
  - English translation records

## Current Dataset Status

- The repository currently contains the full production dataset
- Surah count: 114
- Ayah count: 6236
- Translation count: 6236

## Record Contracts

### Surah record

- `id`
- `nameArabic`
- `nameEnglish`
- `revelationType`
- `totalAyah`

### Ayah record

- `surahId`
- `ayahNumber`
- `arabicText`

### Translation record

- `surahId`
- `ayahNumber`
- `text`

## Join Rule

- Ayah and translation records are matched by `(surahId, ayahNumber)`

## Dataset Maintenance

To refresh the dataset:

```bash
npm run sync:quran
```

To validate the dataset:

```bash
npm run qa:check
```
