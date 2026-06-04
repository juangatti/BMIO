# Design System: Bar Manager IO (BMIO)

BMIO implements a restrained, dark gastronomy digital atmosphere tailored for high-end bars and restaurants. It focuses on tactile hardware-like UI structures, high-density dashboard layouts, dynamic white-label theme integration, and smooth micro-interactions.

---

## 1. Visual Theme & Atmosphere
*   **Vibe Archetype:** *Ethereal Dark Gastronomy*. The interface utilizes a deep velvet-charcoal background with radial amber-glow backdrops (or tenant dynamic colors) to simulate a dimly lit high-end craft bar.
*   **Density Level:** *Cockpit Dense (8/10)*. Complex data matrices, real-time tap progress volumes, and stock logs are packed efficiently using precise alignments.
*   **Variance & Rhythm:** *Offset Bento Grid (7/10)*. Multi-scale dashboard cards with calculated vertical and horizontal spacing to avoid monotonous symmetric grids.
*   **Motion Intensity:** *Fluid Micro-interactions (6/10)*. States fade and slide using spring-like custom cubic-beziers. 

---

## 2. Color Palette & Dynamic Mapping
*   **Velvet Canvas** (`#09090b` / Zinc 950) — Deep primary background surface.
*   **Obsidian Surface** (`#18181b` / Zinc 900) — Main container, Bento card, and modal fill.
*   **Midnight Border** (`#27272a` / Zinc 800) — Hairline separators, borders, and input boundaries.
*   **High-Contrast Text** (`#f4f4f5` / Zinc 100) — Primary readable copy, numbers, and headers.
*   **Muted Sage Text** (`#a1a1aa` / Zinc 400) — Explanations, metadata, and timestamps.
*   **Restricted Statuses:**
    *   *Success/Active*: Emerald (`#10b981`)
    *   *Warning/Low*: Amber (`#f59e0b`)
    *   *Danger/Alert*: Rose (`#f43f5e`)
*   **Dynamic Brand Color Variable (`--color-primary`)**: Handled via inline CSS mappings. All dynamic badges, focus rings, sliders, and interactive hover outlines map to this variable.

---

## 3. Typographic Architecture
*   **Display & Headlines:** `Plus Jakarta Sans` or custom system sans-serif headers. Track-tight (`tracking-tight` / `-0.02em`), bold (`font-bold`), weight-driven hierarchy.
*   **Body Text:** `Satoshi` or high-legibility Sans-Serif. Maximum 65 characters per line (`max-w-prose`) to avoid horizontal reading fatigue.
*   **Data & Numbers:** `Geist Mono` or `JetBrains Mono`. Essential for tap liters, stock quantities, cashflow metrics, and timestamps to prevent layout shifts.
*   **Banned Fonts:** Inter, Roboto, Arial, Times New Roman.

---

## 4. Component Stylings (Tactile Architecture)

### A. The "Double-Bezel" (Nested Cards)
No container floats flatly. All interactive cards use double enclosures:
*   **Outer Shell:** An outer wrapper with a hairline border (`border border-zinc-800`), padding (`p-1`), and large corner radius (`rounded-2xl`).
*   **Inner Core:** The actual card content container inside the shell. Features a slightly darker background, and a mathematically smaller radius (`rounded-[calc(1rem-0.25rem)]`) for concentric curves.

### B. Tactile Buttons
*   **CTA Buttons:** Semi-pill rounded shapes (`rounded-xl` or `rounded-full`). On click, scale down slightly (`active:scale-[0.98]`) to simulate physical buttons.
*   **Nested Icons:** All trailing icons (like arrows or checkmarks) sit inside their own circular container, flush with the button's right padding.

### C. Skeletal Loaders
No rotating spinner icons. Use custom CSS shimmers (`animate-pulse`) matching the exact shape of the cards being loaded to prevent sudden layout shifts.

---

## 5. Layout & Spacing Principles
*   **Whitespace:** Generous spacing (`py-12` to `py-20`) for section boundaries.
*   **Asymmetric Bento:** Grid layouts use offset sizes (e.g. `col-span-2` next to `col-span-1`) to separate different widgets visually.
*   **Mobile-First Collapse:** All grids collapse to a single-column layout (`grid-cols-1`) with generous touch targets (minimum `44px`) below `768px`.
*   **Safari Layout Guard:** Viewport heights must be defined as `min-h-[100dvh]` to avoid address bar resizing issues.

---

## 6. Motion & Animation Engines
*   **Bezier Physics:** Transition values use:
    ```css
    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
    ```
*   **Transforms-Only Rule:** Never animate properties that trigger browser reflows (`height`, `width`, `top`, `left`). Animate strictly using GPU-accelerated `transform` and `opacity` to maintain 60FPS on mobile.

---

## 7. Explicit Anti-Patterns (Banned)
*   No emojis anywhere in production interfaces.
*   No neon drop shadows or oversaturated outer glows.
*   No standard symmetric 3-column Bootstrap-style card rows.
*   No generic copywriting placeholders (use real bar names and actual item references).
