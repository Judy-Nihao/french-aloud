# French Aloud visual specification

## Direction

An uncluttered French reading tool for learners practicing in ordinary indoor
light. Use warm matte neutrals, readable text, generous spacing and subtle panel
elevation. The interface serves the reading task. Rose and sky identify voice
groups in small labels and selected states.

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

## Neutral palette

All base neutrals use OKLCH hue 75 with low chroma. Values are declared in
`app/globals.css`; do not duplicate literal colors in components.

| Role                | OKLCH            | Purpose                                     |
| ------------------- | ---------------- | ------------------------------------------- |
| canvas              | `0.931 0.006 75` | Page background                             |
| surface             | `0.991 0.002 75` | Main panel, editor, Drawer                  |
| hover               | `0.965 0.004 75` | Quiet hover and selected history background |
| soft                | `0.915 0.008 75` | Small badges and pressed feedback           |
| border              | `0.88 0.009 75`  | Light surface outlines                      |
| border-control      | `0.80 0.012 75`  | Form control outlines                       |
| border-active       | `0.60 0.015 75`  | Selected history outline                    |
| focus / secondary   | `0.48 0.012 75`  | Keyboard focus and secondary actions        |
| muted / placeholder | `0.50 0.012 75`  | Supporting text                             |
| body                | `0.43 0.012 75`  | Description text                            |
| strong              | `0.25 0.006 75`  | Labels and strong text                      |
| ink                 | `0.20 0.006 75`  | French text, title, primary button          |
| primary-hover       | `0.30 0.008 75`  | Primary button hover                        |

`control-*` tokens alias these roles. Do not reintroduce a separate stone or slate
palette for speed controls or voice dropdowns.

## Voice category cues

Female roles use hue 15; male roles use hue 235. Label lightness is 0.94 with
chroma 0.025. Selected surfaces use lightness 0.98 and chroma 0.008.
Female text uses `0.38 0.10 15`, male text `0.38 0.075 235`.
Selected borders use lightness 0.72, with respective chroma 0.09 and 0.075.

Keep the selected border, lightly tinted background and explicit `Selected` text.
Do not use gender symbols. Preserve native dropdowns and readable option names.

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
- Main panel has no additional border utility: its shadow includes a 0.5 px
  outline at 12% opacity, a 2 px / 4 px shadow at 4%, and a 6 px / 16 px shadow
  at 4%. All use the warm strong neutral.
- Drawer uses the same thin shadow outline plus an 8 px / 32 px shadow at 8%.
- The form section has no enclosing card. Speed controls use a subtle background
  without a separate border. Individual inputs retain usable outlines.

## Interaction states

- Primary play button: ink background, surface text, lighter hover. Disabled
  state uses the control border background and secondary text.
- Shared quiet/icon buttons: hover background and visible keyboard focus.
- Recent readings trigger: full capsule outline and minimum 44 px height.
- History cards: surface background and faint border by default; hover darkens
  background and border; selected uses the active border and hover background.
  Pressed uses soft background. Do not fade the whole card or its French text.
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
