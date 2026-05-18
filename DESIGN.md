# Design

## Theme

Professional, minimalist interface with expert precision. Supports both light and dark modes with high-contrast, carefully calibrated neutrals and emerald accents.

**Physical context:** Corporate knowledge workers in offices and remote settings, using this tool for critical decisions around leave approvals and project management. Both daytime and late-night work sessions.

Dark mode: Medium gray backgrounds (zinc-900/30), white text, high-chroma emerald accents. Light mode: Clean white backgrounds, dark text, restrained emerald accents.

## Color Palette

All colors derive from CSS custom properties for consistent theming and dark-mode support. Define in `:root` and `.dark` respectively.

### Light Mode

```css
--background: 248 250 252; /* Slate-50 */
--foreground: 9 9 11; /* Zinc-900 */
--primary: 5 150 105; /* Emerald-600 */
--primary-foreground: 255 255 255; /* White */
--secondary: 241 245 249; /* Slate-100 */
--muted: 241 245 249; /* Slate-100 */
--muted-foreground: 100 116 139; /* Slate-500 */
--destructive: 239 68 68; /* Red-500 */
--border: 226 232 240; /* Slate-200 */
```

### Dark Mode

```css
--background: 9 9 11; /* Zinc-900 */
--foreground: 248 250 252; /* Slate-50 */
--primary: 62 207 142; /* Emerald-500 (higher chroma for dark) */
--primary-foreground: 6 32 22; /* Dark emerald for text on primary */
--secondary: 30 41 59; /* Slate-800 */
--muted: 30 41 59; /* Slate-800 */
--muted-foreground: 148 163 184; /* Slate-400 */
--destructive: 127 29 29; /* Red-900 (darkened for dark mode) */
--border: 30 41 59; /* Slate-800 */
```

### Calendar-Specific Variables (Both Modes)

Event states use semantic colors with opacity modulation:

- **Pending**: Amber 500 (`245 158 11`) — awaiting approval, needs attention
- **Approved**: Emerald 500 (`16 185 129`) — confirmed, move forward
- **Rejected**: Rose/Red 500 (`244 63 94`) — declined, user action needed

Dark mode adjusts backgrounds and borders for legibility:

- Pending: `245 158 11 / 0.45` background, `/ 0.8` border
- Approved: `16 185 129 / 0.45` background, `/ 0.8` border
- Rejected: `244 63 94 / 0.45` background, `/ 0.8` border

### Chart Colors (`/config/colors.js`)

Semantic mapping for data visualization:

- **Primary**: `#059669` (Emerald 600, light mode brand)
- **Success**: `#10B981` (Emerald 500, completed items)
- **Warning**: `#F59E0B` (Amber 500, in-progress items)
- **Pending**: `#94A3B8` (Slate 400, awaiting state)
- **Muted**: `#E2E8F0` (Slate 200, no data)
- **Destructive**: `#DC2626` (Red 600, errors)
- **Info**: `#3B82F6` (Blue 500, information)

## Typography

### Typefaces

- **Primary**: Inter (headings, body)
- **Secondary**: Poppins (system fallback in font-family stack)
- **Fallback stack**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif

### Scale & Hierarchy

- **Headings**: Font-weight 800 (black), tight letter-spacing (0.2em uppercase or tighter), scaled by context
- **Body**: 14–16px, font-weight 400, line-height 1.5 (implied by Tailwind defaults)
- **Labels**: 12px, font-weight 600, uppercase, letter-spacing 0.1–0.2em
- **Code/monospace**: System monospace for technical content

Hierarchy established through weight contrast (800 to 400) and size (not always large differences). No flat scales; avoid same font-size used repeatedly.

## Spacing

Tailwind default scale (4px base). Key modular increments:

- `gap-1` to `gap-6`: component spacing
- `p-2` to `p-8`: surface padding
- `mb-4` to `mb-8`: vertical rhythm
- Bottom-of-page footers: `pb-10` to `pb-14` (ensures no text clips at viewport edge on mobile)

Vary padding to avoid monotony—don't apply same padding everywhere.

## Elevation & Depth

### Shadows

- **Shadow-sm**: Subtle depth on interactive elements, cards with gentle hover lift
- **Shadow-lg**: Primary CTAs, emphasis on modal/dialog surfaces
- **Backdrop-blur-2xl**: Glass-effect containers (minimal use; only on modals/panels)
- **Backdrop blur-sm**: Subtle glass-effect on lower layers

### Borders

- **1px solid** `border-border` (CSS variable): Default card and section dividers
- **No thick accent borders** (>1px side-stripe): Use full borders, background tints, or leading icons instead
- **Rounded corners**: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-[2.5rem]` (40px for large containers)

## Components

### Cards

- **Structure**: 1px border in `border-border` color, subtle background tint (`bg-background/95`), soft shadow
- **Hover**: Slight shadow increase, border may brighten slightly
- **State**: No nested cards. Use spacing and typography hierarchy instead.

### Buttons

- **Primary**: Solid emerald background (`bg-primary`), white text (light mode) or dark foreground (dark mode), sharp corners (4–8px radius)
- **Secondary**: Subtle background (`bg-black/5` light, `bg-white/5` dark), text color in muted-foreground, hover lifts to `bg-black/10` or `bg-white/10`
- **Active/Selected**: Scale effect (`active:scale-95`), visual feedback without animation lag
- **Focus state**: Ring offset and ring color from `--ring` variable (emerald in both modes for accessibility)

### Navigation

- **Toolbar/Top bar**: Flexbox row, left-aligned title + navigation buttons, right-aligned view switchers
- **Sidebar**: Vertical list of routes, current route highlighted with emerald accent background, smooth color transitions
- **Mobile**: Hamburger → overlay drawer, full-screen navigation (not slide-out)

### Modals & Dialogs

- **Overlay**: Semi-transparent dark overlay with `backdrop-blur`
- **Content**: Rounded container (12–16px), padded (24–32px), centered on screen
- **Close button**: Icon-only in top-right, with aria-label for accessibility
- **Actions**: Primary action on right, secondary on left; consistent button styling

### Forms

- **Inputs**: 1px border `border-input`, rounded 6–8px, full-width in columns, focus ring from `--ring`
- **Labels**: Bold, tight letter-spacing, placed above field
- **Error state**: Destructive color (`--destructive`) for text, error border color
- **Success state**: Emerald (`--primary`) for checkmark or confirmation text

### Calendar (react-big-calendar)

- **Month view**: Full-width, 7-day grid with header row
- **Events**: Small badges with user initials and status indicator (colored background)
- **Today**: Highlighted with `--calendar-bg-today` background
- **Off-range dates**: Muted with `--calendar-off-range` background
- **"Show more" link**: Styled as small pill button with border and rounded corners, hover darkens background
- **Navigation**: Left/right chevrons, "Today" button in a pill-shaped container group

### Datepicker (react-datepicker)

- **Header**: Solid emerald background (`--primary`), white text
- **Selected day**: Circular button with emerald background, white text, hover state slightly darkened
- **In-range days**: Light emerald tint (`--primary / 0.1` to `/ 0.2`)
- **Today badge**: Bold with emerald border and circular shape
- **Navigation arrows**: Emerald color, hover slightly desaturated
- **Time picker**: Same emerald theming, selected item highlighted

## Responsive Design

Mobile-first Tailwind approach:

- **Mobile (default)**: Single column, full width, stacked navigation, larger touch targets (44px+)
- **Tablet (`sm:` 640px+)**: Two columns, sidebar begins pinning
- **Desktop (`md:` 768px+)**: Full layout, sidebar visible, multi-column grids
- **Large (`lg:` 1024px+)**: Extended content areas, three-column grids for data

Key breakpoint patterns:

- Padding: `p-4 md:p-6 lg:p-8`
- Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Font sizes: `text-sm md:text-base lg:text-lg`

## Motion & Transitions

- **Transitions**: `transition-all duration-300` for color/opacity changes, `transition-colors duration-300` for color-only
- **No layout animations**: Position and size changes use instant snapping (no animated transitions)
- **Ease curves**: Exponential ease-out (equivalent to `ease-out-quart`/`ease-out-quint`), no bounce or elastic
- **Reduced motion**: Respect `prefers-reduced-motion` media query; disable transitions for these users

## Dark Mode Specifics

Tailwind's dark mode is class-based (`.dark` on `<html>`). All component styles must account for:

- Text colors: `text-foreground` (white), `text-muted-foreground` (gray)
- Backgrounds: `bg-background` (zinc-900/30 with transparency), `bg-card` (zinc-900)
- Borders: `border-border` (slate-800 in dark)
- Hover states: `dark:hover:bg-white/10` (not always matching light `bg-black/10`)

**Elevation in dark mode**: Layering is critical. Use rgba with alpha to create depth:

- Surface 0: `bg-background` (zinc-900 at 30% opacity)
- Surface 1: `bg-zinc-900/50` (slightly darker)
- Surface 2: `bg-zinc-800` (darker still)

## Accessibility

- **Color contrast**: All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- **Focus states**: Visible ring around all interactive elements, using `--ring` color
- **Semantic HTML**: `<button>` for buttons, `<a>` for links, `<form>` for forms, proper heading hierarchy
- **ARIA labels**: Icon-only buttons must have `aria-label`, decorative icons must have `aria-hidden="true"`
- **Reduced motion**: Respect system preference; disabling transitions is acceptable
- **Touch targets**: Minimum 44×44px on mobile, proper spacing around clickable elements

## Constraints & Absolute Bans

**Side-stripe borders** (>1px colored left/right border): Use full borders, tints, or icons instead  
**Gradient text** (`background-clip: text`): Use solid colors, emphasize via weight/size  
**Glassmorphism by default**: Rare and purposeful, not decorative  
**Identical card grids**: Vary card sizes, content hierarchy, or spacing  
**Nested cards**: Use spacing and visual hierarchy instead  
**Hero-metric template**: Avoid the "big number + small label + stats + gradient" SaaS cliché  
**Modal as first thought**: Prefer inline or progressive alternatives

## Quality Standards

- **Precision**: Every pixel counted. Spacing and alignment must be exact to convey expert trust.
- **Clarity**: Information hierarchy is not optional. Titles, subtitles, body text, hints—each layer earns its weight and size.
- **Restraint**: One accent color (emerald), tinted neutrals, no unnecessary decorations.
- **Performance**: Smooth transitions and hover states, no layout shifts, responsive to touch without lag.
