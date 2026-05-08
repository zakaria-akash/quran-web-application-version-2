# Responsive Design Specifications

## Desktop View (PC_View.png) - ≥1281px

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: [Logo]  [Search] [Settings Button]                    │
├──────────────┬──────────────────────────┬──────────────────────┤
│              │                          │                      │
│ SIDEBAR      │ MAIN CONTENT             │ SETTINGS PANEL       │
│              │                          │                      │
│ • Surah List │ • Surah Title            │ • Reading Settings   │
│   (280px)    │ • Ayah Reference         │ • Font Settings      │
│              │ • Ayat Display           │ • Translation Font   │
│              │   - Arabic Text          │ • Arabic Font        │
│              │   - Translation          │ • Support Button     │
│              │ • Navigation Buttons     │   (300px)            │
│              │                          │                      │
└──────────────┴──────────────────────────┴──────────────────────┘
```

### Component Sizes
- **Sidebar Width**: 280px
- **Settings Width**: 300px
- **Header Height**: ~60px
- **Content Max Width**: Remaining width

### Colors (Desktop)
- Background: Dark navy gradient (#0d1b2a → #0a0a0a)
- Text: Light gray (#e0e1dd)
- Accent: Blue (#9fb7ff)
- Primary Action: Green (#22c55e)
- Border: Subtle light with 0.12 opacity

### Typography
- Header: 1.1rem - 1.7rem (responsive)
- Body: 0.9rem - 1rem
- Arabic: Dynamic based on settings
- Translation: Dynamic based on settings

---

## Mobile View (Mobile_View.png) - ≤1280px

### Layout Structure
```
┌───────────────────────────────────┐
│ [☰] Quran Mazid [🔍] [⚙️]        │
├───────────────────────────────────┤
│                                   │
│      MAIN CONTENT (Full Width)    │
│                                   │
│      • Surah Title                │
│      • Ayah Reference             │
│      • Ayat Display               │
│        - Arabic Text              │
│        - Translation              │
│      • Navigation Buttons         │
│                                   │
└───────────────────────────────────┘
```

### Header (Mobile)
- **Elements**: Hamburger | Logo | Search | Settings Icon
- **Height**: ~56px
- **Hamburger**: ☰ (left)
- **Logo**: 🌿 Quran Mazid (center)
- **Search**: Compact input (flex-grow)
- **Settings**: ⚙️ icon button (right)

### Navigation Drawer (Mobile_NavBar.png)
```
┌─────────────────────────┐
│ Quran Mazid        [✕]  │
├─────────────────────────┤
│ [Search Bar]            │
├─────────────────────────┤
│ 1 Al Fatihah      الفاتحة │
│ 2 Al Baqarah      البقرة  │
│ 3 Al Imran        آل عمران│
│ ...                     │
│ (Scrollable)            │
└─────────────────────────┘
```

### Drawer Features
- **Width**: 100vw (full viewport width)
- **Animation**: Slide in from left (translateX)
- **Backdrop**: Semi-transparent overlay (rgba(0,0,0,0.5))
- **Header**: 
  - Logo with close button (✕)
  - Sticky on scroll
- **Content**:
  - Search bar at top
  - Full surah list
  - Numbers, English names, Arabic names
  - Active indicator (green border/highlight)
- **Auto-Close**: On item selection or backdrop click

### Settings Modal (Mobile_Settings_Bar.png)
```
┌─────────────────────────────┐
│ Settings                    │
│ Customize text appearance   │
├─────────────────────────────┤
│ [Translation] [Reading]     │
├─────────────────────────────┤
│                             │
│ 📖 Reading Settings         │
│ ├─ Font Settings            │
│ │  ├─ Arabic Font Size: 30  │
│ │  │  [========●======]     │
│ │  ├─ Translation Font: 17  │
│ │  │  [====●=========]      │
│ │  └─ Arabic Font: KFGQ > │
│ └─ Help spread knowledge... │
│    [Support Us Button]      │
│                             │
├─────────────────────────────┤
│ [Close Button]              │
└─────────────────────────────┘
```

### Modal Features
- **Position**: Bottom sheet
- **Width**: 100vw
- **Max Height**: 90vh
- **Border Radius**: 16px 16px 0 0 (top rounded)
- **Animation**: Slide up from bottom
- **Backdrop**: Click to close
- **Scrollable Content**:
  - Tab navigation (Translation/Reading)
  - Collapsible sections
  - Sliders for font sizes
  - Dropdown for font selection
  - Support button with CTA styling

---

## Responsive Breakpoints

### Breakpoint: 1280px
This is the critical breakpoint where the layout switches from desktop 3-column to mobile single-column.

```
Desktop Layout (≥1281px)          Mobile Layout (≤1280px)
├─ Sidebar visible               ├─ Sidebar hidden (drawer)
├─ Settings visible              ├─ Settings modal
├─ Header: grid layout           ├─ Header: flex layout
├─ Search: full width            ├─ Search: compact
└─ Settings button: text         └─ Settings: icon only

Transition: Smooth (no jank)
```

### Secondary Breakpoint: 768px
Fine-tuning for smaller phones:
- Reduce padding/margins
- Smaller font sizes
- Compact button sizes (still ≥44px touch target)

---

## Key Features by Device

### Desktop
✅ Sidebar always visible
✅ Settings panel always visible
✅ Search dropdown below input
✅ No hamburger menu
✅ Full typography sizes

### Mobile
✅ Hamburger menu for navigation
✅ Settings as bottom sheet modal
✅ Full-width content
✅ Compact header
✅ Touch-friendly UI (≥44px targets)
✅ Gesture support (swipe to close drawer)

### Both
✅ Responsive search functionality
✅ Global header on all pages
✅ Footer always visible
✅ Ayah slider controls
✅ Previous/Next navigation
✅ Dark theme with green accents

---

## CSS Custom Properties (Variables)

```css
:root {
  /* Colors */
  --color-black: #0a0a0a;
  --color-navy: #0d1b2a;
  --color-text-light: #e0e1dd;
  --color-primary: #22c55e;
  --color-primary-hover: #16a34a;
  
  /* Layout */
  --sidebar-width: 280px;
  --settings-width: 300px;
  
  /* Typography */
  --font-ui: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  --qwa-arabic-font-family: "Amiri", serif;
  --qwa-arabic-font-size: 36px;
  --qwa-translation-font-size: 18px;
  --header-control-radius: 10px;
}
```

---

## Animation Details

### Drawer
- **Trigger**: Hamburger click
- **Animation**: `transform: translateX(-100%)` → `translateX(0)`
- **Duration**: 0.3s ease
- **Backdrop**: Fade in simultaneously

### Settings Modal
- **Trigger**: Settings icon/button click
- **Animation**: Slide up from bottom
- **Duration**: 0.3s ease
- **Backdrop**: Semi-transparent overlay

### Search Dropdown
- **Trigger**: Focus on input
- **Animation**: Fade in
- **Position**: Below input
- **Max Height**: 320px (scrollable)

---

## Accessibility Features

✅ Semantic HTML (header, nav, main, section)
✅ ARIA labels for icons and buttons
✅ Keyboard navigation support
✅ Focus indicators (outline: 2px solid)
✅ High contrast ratios (WCAG AA)
✅ Touch targets ≥44px × 44px
✅ Screen reader support
✅ Escape key closes modals/drawers

---

## Performance Considerations

- CSS variables enable instant theme changes
- Transform-based animations (GPU accelerated)
- Mobile-first CSS reduces bundle size
- Responsive images with srcset (future enhancement)
- Lazy loading for long lists (future enhancement)
- Minimal layout shifts (CLS optimized)

---

## Testing Checklist

### Desktop
- [ ] All 3 columns visible and aligned
- [ ] Sidebar surah list shows active indicator
- [ ] Settings panel shows all controls
- [ ] Search works and displays results
- [ ] No horizontal scroll on 1920px screen
- [ ] Responsive at 1281px exactly

### Mobile Portrait (375px)
- [ ] Header fits without overflow
- [ ] Hamburger menu opens drawer
- [ ] Drawer slides in smoothly
- [ ] Content takes full width
- [ ] Settings modal appears as bottom sheet
- [ ] All buttons are touchable (≥44px)

### Mobile Landscape (812px width)
- [ ] Layout adapts properly
- [ ] No content cutoff
- [ ] Drawer still functional
- [ ] Readable text without zoom

### Tablet (768px - 1024px)
- [ ] Single column layout
- [ ] Touch-friendly spacing
- [ ] Settings modal responsive
- [ ] Header doesn't overlap content

### Edge Cases
- [ ] Exactly at 1280px breakpoint
- [ ] Very long surah names
- [ ] Very long ayah text (RTL)
- [ ] Translation with special characters
- [ ] Dark mode (browser preference)
