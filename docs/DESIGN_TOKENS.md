# Design Tokens

These tokens synchronise the application UI with the Syncscript landing page aesthetic.

## Color Palette

| Token | Value | Usage |
| --- | --- | --- |
| `brand.950` | `#070f2e` | App shell background, modal scrims |
| `brand.900` | `#0f255f` | Header gradients, hover states |
| `brand.500` | `#3f67f5` | Primary actions, focus rings |
| `brand.300` | `#99b3ff` | Accent borders, data viz highlights |
| `accent.500` | `#10b981` | Success state, positive metrics |
| `surface.900` | `#1d2133` | Primary surface background |
| `surface.800` | `#343a51` | Elevated cards |
| `neutral.50` | `#f8fafc` | Text on dark surfaces |

Gradients:
- `bg-brand-gradient`: `linear-gradient(135deg, #0f255f 0%, #3f67f5 50%, #10b981 100%)`
- `bg-brand-radial`: `radial-gradient(circle at 20% 20%, rgba(63, 103, 245, 0.45), transparent 55%)`

## Typography

- Display: `Plus Jakarta Sans`
- Body: `Inter`
- Mono: `JetBrains Mono`

Apply display font to headings (`font-display`), while `font-sans` remains the default.

## Elevation & Radius

- `shadow-brand-glow`: layered glow for modals/cards.
- Border radius tokens: `xl` (20px), `2xl` (28px) for large surfaces.

## Container Grid

Containers center by default with responsive padding (`1.5rem` → `4rem`).

Update this document as new tokens/aliases are introduced.
