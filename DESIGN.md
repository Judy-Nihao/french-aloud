# French Aloud visual specification

## Direction

An uncluttered French reading tool for learners practicing in ordinary indoor
light. Use purple labels, near-black text and fine outlines, yellow selection
badges, green playing feedback and small earth-toned speed badges. Keep large
near-white surfaces and cool-gray surroundings.

Keep system fonts. Do not add decorative animation or downloadable fonts without
an explicit design decision. Preserve the single-column page, native voice
dropdowns, local playback speed and recent-reading drawer.

## Source of truth

```text
app/globals.css
  +-- @theme inline: colors, font, shadows, radii
  +-- document defaults
  +-- Drawer gesture animation
         |
         v
component className: layout, spacing, responsive and interactive states
         |
         +-- components/ui/Button.tsx: repeated button interactions
```

Values below describe the implementation. Update this file when the tokens or
component conventions change. Follow [development conventions](docs/development.md).

## Palette

Tokens in app/globals.css are the source of truth. Neutrals are low-chroma;
purple labels, yellow selection badges, green playing feedback and earth-toned
speed badges provide deliberate accents.

| Token          | Value                    |
| -------------- | ------------------------ |
| canvas         | `oklch(0.946 0.002 270)` |
| surface        | `oklch(0.989 0.002 95)`  |
| ink            | `oklch(0.245 0.003 270)` |
| border         | `oklch(0.62 0.004 270)`  |
| border-control | `oklch(0.49 0.004 270)`  |
| brand          | `oklch(0.71 0.15 295)`   |
| selection      | `oklch(0.84 0.17 85)`    |
| selection-soft | `oklch(0.977 0.025 85)`  |
| success        | `oklch(0.53 0.13 150)`   |
| earth          | `oklch(0.69 0.04 85)`    |

Both voice groups share purple labels and near-black text. Keep explicit
Female/Male names, Selected text and native dropdowns.

## Typography and spacing

- Family: `system-ui, sans-serif`.
- Main title: 30 px, 36 px from the small breakpoint, medium weight and tight
  tracking. Drawer title: 20 px, medium weight.
- French editor: 18 px, 32 px line height. History French: 16 px, 28 px line height.
- Supporting text: 14–16 px. Keep French letter spacing normal.
- Main shell: max width 48 rem; padding 20 px mobile and 40 px from the small
  breakpoint. Header-to-editor section gap: 36 px mobile and 40 px desktop.
- Recent readings stays at the header's right edge; wrapping is allowed at narrow
  widths. Voice groups become two columns at the small breakpoint.
- The editor grows with content using `field-sizing-content`; keep scroll/manual
  resize fallback. Preserve comfortable spacing between editor, voices and play.

## Surfaces and elevation

- Main panel radius: 24 px. Section role: 16 px. Control/history radius: 12 px.
- Main panel and speed region use 1 px solid outlines. Inputs retain stronger
  thin outlines. The form section has no enclosing card.
- Shadows: panel 2 px / 6 px at 2.5%; Drawer 4 px / 16 px at 6%; circular close
  control 1 px / 2 px at 4%.

## Reading flow and guidance

```text
Title + Recent readings
  -> French text label + Copy
  -> Editor with prefilled French
  -> Read aloud
  -> Voice selection
  -> Playback speed
```

Keep the visible `French text` label. The editor retains its prefilled French;
`Type or paste French text…` appears only when empty. Do not add a redundant
full-flow explanation below the title.

## Interaction states

- Play action icons: `Volume2` with `Read aloud`, `X` with `Cancel` while
  generating, and `Square` with `Stop playback` while playing. Place the 20 px
  icon before the text with an 8 px gap. Icons are decorative (`aria-hidden`);
  visible text supplies the accessible button name.
- Primary play button: ink background, surface text, lighter hover. Playing uses
  success green with a darker hover. Disabled
  state uses the control border background and secondary text.
- Shared quiet/icon buttons: hover background and visible keyboard focus.
- Recent readings trigger: full capsule outline and minimum 44 px height.
- History cards: surface background and faint border by default; hover darkens
  background and border; selected uses the active border and selection-soft background.
  Pressed uses soft background. Do not fade the whole card or its French text.
- Drawer close uses the shared `icon-circle` button: a full circular outline,
  surface background and a subtle 1 px / 2 px shadow at 4%. History delete
  buttons remain plain icons, vertically centered in their respective cards.
- Delete controls are separate sibling buttons with 44 px targets. Preserve
  accessible labels and `aria-pressed` on the history selection button.
- Drawer remains right-sided on desktop and bottom-sided on mobile. Keep the
  existing 400 ms transform/opacity gesture animation and reduced-motion override.

## Verification

Check mobile and desktop, long French text, voice selection, loading/error/empty
states, history restoration/deletion, copying and visible keyboard focus. Text
contrast must remain readable; decorative outlines may be subtle. Do not copy
the reference website's very low-contrast navigation text.

Use lint, TypeScript, existing behavior tests and a production build for shared
CSS changes. Browser viewport emulation is not physical iPhone testing.
