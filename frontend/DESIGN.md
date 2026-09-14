# 🎨 iGOT Karmayogi Bharat — UI/UX Design System Specification (`DESIGN.md`)

> **Source Analysis**: Extracted and standardized from the official **iGOT Karmayogi Portal Home Page** (`first_page.png`), **Authentication / Login Page** (`login.png`), and **Civil Servant Registration Portal** (`signup.png`).
> 
> **Purpose**: Serves as the authoritative single source of truth (SSOT) for all frontend visual styles, typography, spacing tokens, component specifications, color palettes, and responsive layouts across the application.

---

## 🏛️ 1. Brand Philosophy & Visual Language

The iGOT Karmayogi Bharat visual system blends **Government Authority & Institutional Trust** with a **Modern, Dynamic EdTech Digital Experience**.

- **National Identity & Pride**: Saffron/Amber (`#F37023`) and Deep Sovereign Navy Blue (`#0B5C9E` / `#0A387E`) rooted in Indian national symbolism (Lotus, Ashoka chakra blue, Tricolor saffron accents).
- **Accessibility & Compliance**: Strict alignment with **GIGW** (Guidelines for Indian Government Websites) and **WCAG 2.1 AA** contrast ratios.
- **Clarity & Structured Density**: Information-dense governance metrics, step-by-step onboarding radial graphs, clean card surfaces, and unmistakable action triggers.
- **Dual Visual Modes**:
  1. **Official Portal Theme (Light / High Contrast)**: Crisp white canvases, warm peach/sand accent zones, high-legibility navy text, and structured borders.
  2. **Next-Gen AI / Analytics Theme (Dark & Glassmorphic)**: Deep slate/navy canvases (`#020617` / `#0B1E38`) for advanced AI dashboards, radar competency models, and live quiz simulations.

---

## 🎨 2. Master Color Palette & Token System

### 2.1. Primary Brand & Government Accents

| Token Name | Hex Code | HSL / RGB | Usage & Context |
| :--- | :--- | :--- | :--- |
| `--color-brand-orange-500` | `#F37023` | `hsl(22, 90%, 55%)` | Primary Saffron CTA button, brand lotus emblem, active step badge `(1)`, highlighted headings |
| `--color-brand-orange-600` | `#D95B12` | `hsl(22, 85%, 46%)` | Hover & active state for primary saffron buttons, text links |
| `--color-brand-orange-100` | `#FFF3EB` | `hsl(23, 100%, 96%)` | Saffron pill tag background, active course badge fill, highlight tint |
| `--color-brand-gold-500` | `#F59E0B` | `hsl(38, 92%, 50%)` | Secondary yellow/gold accent, "Welcome to iGOT" banner subtext, metric star |
| `--color-brand-gold-100` | `#FEF3C7` | `hsl(48, 96%, 89%)` | Soft gold badge tint, warning callouts |

### 2.2. Sovereign Navy & Deep Blues (Core Authority)

| Token Name | Hex Code | HSL / RGB | Usage & Context |
| :--- | :--- | :--- | :--- |
| `--color-navy-950` | `#071E3D` | `hsl(215, 80%, 13%)` | Deepest auth hero background, dark footer base, rich contrast containers |
| `--color-navy-900` | `#0A387E` | `hsl(216, 85%, 27%)` | Left login & registration hero background, watermark circuit canvas |
| `--color-navy-800` | `#0B5C9E` | `hsl(207, 87%, 33%)` | Metric statistics full-width banner, widget header banners, primary submit buttons |
| `--color-navy-700` | `#0073BC` | `hsl(203, 100%, 37%)` | Secondary CTA buttons, dropdown select backgrounds, interactive links |
| `--color-navy-600` | `#1D70B8` | `hsl(208, 73%, 42%)` | Button hover states, active tab underline, navigation hover highlight |
| `--color-navy-100` | `#EBF5FF` | `hsl(210, 100%, 96%)` | Light blue card backgrounds, step pill backgrounds, table row hover |
| `--color-navy-50` | `#F4F9FD` | `hsl(207, 75%, 98%)` | Subtle blue tint for secondary dashboard cards |

### 2.3. Surface, Background & Neutral Colors

| Token Name | Hex Code | HSL / RGB | Usage & Context |
| :--- | :--- | :--- | :--- |
| `--color-bg-pure` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Main form cards, course cards, navigation header, content modals |
| `--color-bg-sand` | `#FFF8F1` | `hsl(31, 100%, 97%)` | Hero section warm peach background, carousel container background |
| `--color-bg-pattern` | `#FDF5EC` | `hsl(32, 80%, 96%)` | Showcased courses container with subtle geometric pattern |
| `--color-border-light` | `#E2E8F0` | `hsl(214, 32%, 91%)` | Standard input borders, card borders, horizontal rule dividers |
| `--color-border-medium` | `#CBD5E1` | `hsl(215, 20%, 80%)` | Input hover borders, active card borders, dashed OTP container |
| `--color-border-dark` | `#94A3B8` | `hsl(215, 16%, 65%)` | High contrast input borders, disabled outlines |

### 2.4. Text & Typography Colors

| Token Name | Hex Code | HSL / RGB | Usage & Context |
| :--- | :--- | :--- | :--- |
| `--color-text-primary` | `#0F172A` | `hsl(222, 47%, 11%)` | Primary headings, form labels, card titles, key metric numbers |
| `--color-text-body` | `#334155` | `hsl(215, 25%, 27%)` | Body paragraphs, course descriptions, dropdown items |
| `--color-text-muted` | `#64748B` | `hsl(215, 16%, 47%)` | Subtitles, helper text, author attribution, inactive labels |
| `--color-text-inverted` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Text on navy banners, CTA button text, hero infographic text |
| `--color-text-link` | `#0073BC` | `hsl(203, 100%, 37%)` | "Forgot Password?", "Register here", "Request for help", "Show all >" |

### 2.5. Status, Semantic & National Classification Colors

| Token Name | Hex Code | Usage & Context |
| :--- | :--- | :--- |
| `--color-success-500` | `#10B981` | Green rank spectrum in India Heatmap, basic level badge, quiz correct answer |
| `--color-warning-500` | `#F59E0B` | Intermediate level badge, pending MDO approval, yellow alert callouts |
| `--color-danger-500` | `#EF4444` | Advanced level badge, error alert banners, required field asterisk (`*`) |
| `--color-info-500` | `#0284C7` | Information tooltip `(i)`, government notification pill |
| `--color-social-linkedin`| `#0077B5` | Official LinkedIn social hub card header |
| `--color-social-x` | `#0F1419` | Official X (Twitter) social hub card header |

---

## 🔤 3. Typography Hierarchy & Font System

### 3.1. Font Families

```css
/* Primary Western Sans-Serif (English Content, Numeric Data, Dashboard UI) */
--font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Official Devanagari Script (Hindi Slogans, Ministry Names, National Portal Elements) */
--font-hindi: 'Noto Sans Devanagari', 'Hind', 'Tiro Devanagari Hindi', sans-serif;

/* Tabular & Metric Data (National Statistics, Registration Codes, Percentages) */
--font-mono: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
```

### 3.2. Detailed Type Scale & Style Guide

| Level / Role | Font Size (rem / px) | Line Height | Font Weight | Letter Spacing | Context & Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `2.75rem` (44px) | `1.15` (50px) | `800` (ExtraBold) | `-0.02em` | "Competency-Driven Capacity Building of Officials" |
| **Auth Guide Hero** | `2.25rem` (36px) | `1.2` (44px) | `800` (ExtraBold) | `-0.01em` | "How To Login", "How To Register" |
| **Heading 1 (H1)** | `1.875rem` (30px) | `1.25` (38px) | `700` (Bold) | `-0.01em` | Section Titles: "Showcased Courses", "Amrit Gyaan Kosh" |
| **Heading 2 (H2)** | `1.5rem` (24px) | `1.3` (32px) | `700` (Bold) | `0em` | "Register", "Welcome to iGOT Karmayogi", Hub Titles |
| **Heading 3 (H3)** | `1.25rem` (20px) | `1.35` (28px) | `600` (SemiBold) | `0em` | Widget Titles: "Rule to Role Based Learning", PIB Reports |
| **KPI Metrics** | `1.5rem` (24px) | `1.2` (28px) | `700` (Bold) | `0.02em` | `1,72,63,077` (Total Karmayogis), `6,784` (Total Courses) |
| **Subheading / H4**| `1.125rem` (18px) | `1.4` (26px) | `600` (SemiBold) | `0em` | Form subheadings, Step titles in guides |
| **Body Large** | `1.0rem` (16px) | `1.5` (24px) | `500` (Medium) | `0em` | Primary input text, course titles, main body text |
| **Body Normal** | `0.875rem` (14px) | `1.45` (20px) | `400` / `500` | `0em` | Form labels, navigation links, step descriptions |
| **Caption / Helper**| `0.75rem` (12px) | `1.4` (17px) | `400` (Regular) | `0.01em` | Metric labels, duration pill `⏱️ 20m`, MDO helper notes |
| **Micro Badge** | `0.6875rem` (11px)| `1.2` (14px) | `600` (SemiBold) | `0.04em` | Category badges `[ Course ]`, "or" separator |

---

## 📏 4. Spacing Scale, Grid System & Container Dimensions

### 4.1. 4px / 8px Modular Spacing System

```css
--space-1:  0.25rem; /* 4px   - Micro gaps, pill badge padding-y */
--space-2:  0.5rem;  /* 8px   - Icon margins, compact button padding-y, badge padding-x */
--space-3:  0.75rem; /* 12px  - Input padding-y, card inner grid gaps */
--space-4:  1.0rem;  /* 16px  - Standard card padding, standard gap between inputs */
--space-5:  1.25rem; /* 20px  - Form group spacing, widget header padding */
--space-6:  1.5rem;  /* 24px  - Section internal gutters, button padding-x */
--space-8:  2.0rem;  /* 32px  - Major card padding, grid row gutters */
--space-10: 2.5rem;  /* 40px  - Section top/bottom margins */
--space-12: 3.0rem;  /* 48px  - Section divider gaps */
--space-16: 4.0rem;  /* 64px  - Hero section padding-y */
```

### 4.2. Layout Containers & Max Widths

| Container Class | Max Width | Target Use Case |
| :--- | :--- | :--- |
| `container-sm` | `640px` | Single-card auth modals, verification dialogs |
| `container-md` | `768px` | Reader views, single-column quiz interfaces |
| `container-lg` | `1024px` | Standard sub-pages, video modal containers |
| `container-xl` | `1280px` | Main content container, course carousels |
| `container-2xl`| `1440px` | Full dashboard grid, landing page max-width |
| `container-full`| `100%` | Metric statistics bar, top navigation bar |

### 4.3. Standard Split-Screen Auth Grid

```
┌─────────────────────────────────────────┬─────────────────────────────────────────┐
│              LEFT PANEL                 │               RIGHT PANEL               │
│        (Infographic Guide / Hub)        │         (Interactive Form Card)         │
│                                         │                                         │
│  - Width: 50% Desktop (100% on Mobile)  │  - Width: 50% Desktop (100% on Mobile)  │
│  - Background: Royal Navy (#0A387E)     │  - Background: Pure White (#FFFFFF)     │
│  - Watermark: Hexagon / Circuit Vector  │  - Padding: 48px (32px Tablet/Mobile)   │
│  - Text: White & Saffron Accents        │  - Form Controls, Radio Pills, OTP Box  │
└─────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 🧩 5. Detailed Component Specifications

### 5.1. Top Navigation Bar (Header)

- **Height**: `72px` (Desktop), `64px` (Mobile).
- **Background**: Solid `#FFFFFF` with `border-b border-slate-200` and subtle elevation (`shadow-xs`).
- **Left**: Karmayogi Bharat Official Emblem (Lotus, Saffron/Navy text "कर्मयोगी भारत - लोकहितं मम करणीयम्").
- **Center**: Nav items row with `gap-6` or `gap-8`:
  - Items: `About Us`, `Newsroom`, `Career`, `Tenders`, `Notifications`, `Help Centre`.
  - Style: `text-sm font-medium text-slate-700 hover:text-[#0B5C9E] transition-colors`.
- **Right**:
  - **"Log in" Button**: Outline pill button (`border border-[#0B5C9E] text-[#0B5C9E] hover:bg-[#0B5C9E]/5 font-semibold text-sm px-6 py-2 rounded-full`).
  - **"Register" Button**: Solid saffron pill button (`bg-[#F37023] hover:bg-[#D95B12] text-white font-semibold text-sm px-6 py-2 rounded-full shadow-sm`).
  - **Accessibility Icon**: Floating circular dark-blue pill button on far right.

---

### 5.2. Hero Section (Home)

- **Background**: Soft warm gradient `linear-gradient(135deg, #FFF6EE 0%, #FFFFFF 60%, #FFF2E5 100%)`.
- **Left Column**:
  - Overline: `text-sm uppercase tracking-wider font-semibold text-[#B45309]` ("iGOT Karmayogi").
  - Title: `text-4xl sm:text-5xl font-extrabold text-[#F37023] leading-tight` ("Competency-Driven Capacity Building of Officials").
  - Social Links: Row with "Follow Us" label + 5 circular navy icon badges (X, LinkedIn, YouTube, Instagram, Facebook).
- **Right Column**:
  - Hero Highlight Card Banner: 1.7 Crore Users Onboarded banner with 3D graphic elements and pagination dots.

---

### 5.3. Full-Width Metrics & National Statistics Bar

- **Background**: Solid Royal Navy `#0B5C9E` (or gradient `linear-gradient(90deg, #094B83 0%, #0B5C9E 50%, #0D6DBB 100%)`).
- **Layout**: 5 responsive flex/grid columns with subtle vertical border separators (`border-white/15`).
- **Items**:
  1. `👥 1,72,63,077` — Total Karmayogis Onboarded
  2. `📑 6,784` — Total Courses
  3. `✔️ 15,57,65,355` — Total Completions
  4. `👤 20,91,335` — Monthly Active Users
  5. `📜 7,71,427` — Certificates Issued Yesterday
- **Typography**:
  - Numbers: `text-xl sm:text-2xl font-bold text-white tracking-wide font-mono`.
  - Labels: `text-xs text-blue-100 font-normal mt-0.5`.

---

### 5.4. National Governance Insights Grid (2x2 Dashboard)

- **Card Structure**:
  - Border radius: `rounded-2xl` (`16px`).
  - Border: `border border-slate-200`.
  - Background: `#FFFFFF` with `shadow-sm`.
  - **Header Banner**: Solid Royal Blue `#0B5C9E` pill/header with `rounded-t-2xl px-6 py-3 text-white font-bold text-base flex justify-between items-center`.
- **Widgets**:
  1. **Rule to Role Based Learning**:
     - Key 4-stat metrics grid: Union CBPs (`1,434`), Employees with CBPs (`43,45,664`), State CBPs (`2,609`), Role Relevant Completions (`12,374,227`).
     - Donut Chart breakdown for Domain, Functional, Behavioural competencies.
     - Level breakdown for Basic (`3,757`), Intermediate (`1,034`), Advanced (`42`).
  2. **Democratised Learning**:
     - Group A, Group B, Group C/D onboarding and completion bar charts with percentage comparisons.
  3. **iGOT Learning Progress Ranking**:
     - State/UT vs Union Ministries tabs.
     - Heatmap colored interactive SVG India map with gradient rank scale (0 to 62.49 score).
     - Ministry ranking badges (Ministry of Coal, Dept of Food & Public Distribution, Ministry of Mines).
  4. **Shared National Aspirations & eHRMS Integration**:
     - National priority progress bars (AI & Emerging Tech, Citizen Centricity & Jan Bhagidari, Viksit Bharat).
     - eHRMS metrics (Employees with Access, Services Available, Transfers, Pension Claims).

---

### 5.5. Showcased Courses & Amrit Gyaan Kosh Carousels

- **Container**: `bg-[#FDF5EC]` with decorative subtle motif and `py-12 px-6 rounded-3xl`.
- **Header**: Centered `text-2xl font-bold text-slate-900` with "Show all >" right-aligned link (`text-[#0B5C9E] font-semibold text-sm`).
- **Navigation Controls**: Left & right floating black circular buttons (`w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black`).
- **Course Card Specs**:
  - Background: `#FFFFFF`, `rounded-xl`, `border border-slate-200`, `shadow-sm hover:shadow-md transition-shadow`.
  - Thumbnail: Aspect ratio `16:9` with duration pill badge in top/bottom corner (`bg-black/80 text-white text-xs px-2.5 py-1 rounded-full font-medium`).
  - Category Badge: `border border-[#F37023] text-[#F37023] bg-[#FFF3EB] text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block mt-3`.
  - Title: `text-sm sm:text-base font-bold text-slate-900 line-clamp-2 mt-2 leading-snug`.
  - Attribution: Small author avatar + `text-xs text-slate-500 mt-3 flex items-center gap-1.5`.

---

### 5.6. Karmayogi Hubs & Radial Diagrams

- **Interactive Hub Layout**:
  - Center Node: Glowing circular Karmayogi emblem.
  - Orbiting Nodes: Competencies, Hubs, Discussions, Events, Certificates with thin connecting radial lines.
  - Active Details Card: "Network Hub - Connect and collaborate with peers across Ministries, Departments, Organisations" with pagination dots.
- **Action Walkthrough Cards**:
  - Split cards with thumbnail preview + bottom royal blue action strip with play icon (`How to Login and Register ? ▶` / `iGOT Walkthrough ▶`).

---

### 5.7. Authentication & Registration Pages (`login.png` & `signup.png`)

#### A. Left Guide Panel (Infographic):
- **Background**: Deep Royal Navy `#0A387E` with subtle geometric network/circuit watermark background.
- **Top Badge**: Gold/Yellow `Welcome to iGOT Karmayogi` + Large White Bold `How To Login 🖱️` or `How To Register`.
- **Step Badges**:
  - Number badge: `w-8 h-8 rounded-full bg-[#F37023] text-white font-bold text-sm flex items-center justify-center`.
  - Section Header: `text-sm sm:text-base font-bold text-[#F59E0B]`.
  - Timeline Steps: White italicized or clean text with vertical connecting timeline line and bullet nodes.
- **Radial Node Network (Signup)**:
  - 4 interconnected circular icons (1: Gov Email, 2: MDO Admin, 3: Find MDO Details, 4: Connect within Org) radiating from central glowing white hub.

#### B. Right Form Card:
- **Header**:
  - Back Arrow `←` with `text-xl text-slate-700 hover:text-slate-900`.
  - Title: `text-2xl font-bold text-slate-900` ("Register" / "Login").
  - Step Progress Bar:
    - Step 1: Active circle `w-8 h-8 rounded-full bg-[#F37023] text-white font-bold flex items-center justify-center`.
    - Progress Line: `h-1 flex-1 bg-[#0B5C9E] mx-3 rounded`.
    - Step 2: Inactive circle `w-8 h-8 rounded-full bg-slate-300 text-slate-600 font-bold flex items-center justify-center`.
- **Form Controls**:
  - **Center / State Toggle**:
    - Two side-by-side bordered pill buttons (`border border-slate-300 rounded-lg p-3 flex items-center gap-3 cursor-pointer`).
    - Radio indicator: Blue checked `(●)` vs unchecked `(○)`.
  - **Dropdown Selects (Ministry / Organisation / Designation)**:
    - Style: `w-full h-11 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#0B5C9E] focus:border-transparent outline-none`.
    - Custom Chevron: Down arrow icon right-aligned.
  - **Gov Email & OTP Verification Card**:
    - Style: `border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 mt-4`.
    - Input: `Enter your government email address`.
    - Action: `Send OTP` button (`bg-[#0B5C9E] hover:bg-[#094B83] text-white text-sm font-semibold px-5 py-2 rounded-lg ml-auto block`).
    - Helper Link: "Not able to proceed? Get registered through your MDO. **Click here** to view Nodal Officers."
  - **Buttons**:
    - Primary Form CTA: `bg-[#0B5C9E] hover:bg-[#094B83] text-white font-semibold text-base py-3 px-8 rounded-lg shadow-sm w-full sm:w-auto`.
    - Provider Selector: `bg-[#0073BC] hover:bg-[#005B94] text-white font-medium px-4 py-2.5 rounded-lg flex items-center justify-between w-full`.
  - **Footer Auth Switch**:
    - "Don't have an account yet? **Register here**" / "Already have an account? **Sign in here**" (`text-sm text-slate-600` with `text-[#0073BC] font-semibold hover:underline`).

---

## 📐 6. Border Radii, Elevation & Shadows

### 6.1. Border Radii Scale

```css
--radius-xs:   0.25rem; /* 4px   - Small badges, checkbox corners */
--radius-sm:   0.375rem;/* 6px   - Form inputs, standard buttons */
--radius-md:   0.5rem;  /* 8px   - Dropdown menus, provider selectors, action buttons */
--radius-lg:   0.75rem; /* 12px  - Course cards, case study cards, modal windows */
--radius-xl:   1.0rem;  /* 16px  - Governance widget cards, container modules */
--radius-2xl:  1.5rem;  /* 24px  - Showcase carousel wrappers, large panels */
--radius-full: 9999px;  /* Pill buttons ("Register", "Log in", category badges) */
```

### 6.2. Elevation & Shadow Tokens

```css
--shadow-xs: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08);
--shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.09), 0 2px 4px -2px rgba(15, 23, 42, 0.07);
--shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.08);
--shadow-xl: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08);

/* Colored Glows for Active Accents */
--shadow-glow-orange: 0 4px 14px 0 rgba(243, 112, 35, 0.35);
--shadow-glow-blue:   0 4px 14px 0 rgba(11, 92, 158, 0.35);
```

---

## ⚡ 7. Transitions, Micro-Interactions & States

| Element | Interaction State | CSS Transform / Transition |
| :--- | :--- | :--- |
| **Pill Buttons** | Hover | `transform: translateY(-1px); filter: brightness(1.05); box-shadow: var(--shadow-glow-orange);` |
| **Course Cards** | Hover | `transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: #CBD5E1;` |
| **Form Inputs** | Focus | `outline: none; border-color: #0B5C9E; box-shadow: 0 0 0 3px rgba(11, 92, 158, 0.15);` |
| **Dropdowns** | Active / Open | `border-color: #0B5C9E; ring: 2px ring-blue-500/20;` |
| **Carousel Arrows**| Hover | `transform: scale(1.08); background-color: #0B5C9E; transition: all 150ms ease;` |
| **Tab Items** | Active | `border-bottom: 2px solid #0B5C9E; font-weight: 700; color: #0B5C9E;` |

---

## 💻 8. Ready-to-Use CSS Tokens & Tailwind v4 Theme Configuration

### 8.1. Native CSS Custom Properties (`index.css`)

```css
:root {
  /* Brand Primary Saffron & Ambers */
  --brand-orange-500: #F37023;
  --brand-orange-600: #D95B12;
  --brand-orange-100: #FFF3EB;
  --brand-gold-500:   #F59E0B;
  --brand-gold-100:   #FEF3C7;

  /* Sovereign Navy & Blues */
  --navy-950: #071E3D;
  --navy-900: #0A387E;
  --navy-800: #0B5C9E;
  --navy-700: #0073BC;
  --navy-600: #1D70B8;
  --navy-100: #EBF5FF;
  --navy-50:  #F4F9FD;

  /* Neutrals & Surfaces */
  --bg-pure:     #FFFFFF;
  --bg-sand:     #FFF8F1;
  --bg-pattern:  #FDF5EC;
  --text-main:   #0F172A;
  --text-body:   #334155;
  --text-muted:  #64748B;
  --border-subtle: #E2E8F0;
  --border-strong: #CBD5E1;

  /* Typography */
  --font-family-sans: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  --font-family-hindi: 'Noto Sans Devanagari', 'Hind', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Roboto Mono', monospace;
}
```

### 8.2. Tailwind CSS v4 Theme Mapping (`@theme` Directive)

```css
@import "tailwindcss";

@theme {
  --color-karmayogi-orange: #F37023;
  --color-karmayogi-orange-hover: #D95B12;
  --color-karmayogi-orange-light: #FFF3EB;
  --color-karmayogi-gold: #F59E0B;
  
  --color-karmayogi-navy-dark: #0A387E;
  --color-karmayogi-navy: #0B5C9E;
  --color-karmayogi-navy-light: #0073BC;
  --color-karmayogi-navy-tint: #EBF5FF;

  --color-karmayogi-sand: #FFF8F1;
  --color-karmayogi-sand-dark: #FDF5EC;

  --font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  --font-hindi: 'Noto Sans Devanagari', 'Hind', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 📱 9. Responsive Breakpoint Standards

| Breakpoint Key | Screen Width | Adjustments & Guidelines |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | `0px - 639px` | Stack split auth into single column (form first or guide collapsed), hamburger nav, 1 course card visible per carousel slide. |
| **Tablet (`640px - 1023px`)** | `640px - 1023px` | 2-column metrics bar, 2 course cards per carousel view, compact left guide illustration. |
| **Desktop (`1024px - 1439px`)** | `1024px - 1439px` | Full 50/50 split auth layout, 4 course cards per carousel view, 2x2 governance widget grid. |
| **Ultra-Wide (`>= 1440px`)** | `1440px+` | Content centered in `max-w-7xl` / `max-w-[1440px]`, full decorative backgrounds bleed to screen edge. |

---

## 🎯 10. Implementation Action Plan for Frontend Components

1. **Tokens Setup (`frontend/src/index.css`)**: Apply `@theme` variables and Google Fonts (`Plus Jakarta Sans` & `Noto Sans Devanagari`).
2. **Top Navigation (`Navbar.jsx`)**: Refactor to official Karmayogi Bharat layout (emblem, Hindi slogan, pill buttons for Login/Register, nav links).
3. **Hero & Statistics Bar (`HeroSection.jsx` & `MetricStatsBar.jsx`)**: Build the 5-stat authoritative banner and warm hero banner.
4. **Governance Analytics Dashboard (`NationalGovernanceGrid.jsx`)**: Implement Rule to Role, Heatmap Ranking, and eHRMS widgets.
5. **Authentic Course & Case Study Carousels (`ShowcasedCourses.jsx`)**: Style cards with exact badges, duration pills, and navigation chevrons.
6. **Unified Dual Auth Portal (`LoginView.jsx` & `RegisterView.jsx`)**:
   - Implement the 50/50 split layout.
   - Left infographic with step badges, timeline nodes, and Parichay guide.
   - Right form with Center/State pill selector, dropdowns, dashed OTP verification box, and provider selector.
