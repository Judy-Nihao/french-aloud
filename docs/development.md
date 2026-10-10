# French Aloud development conventions

Read this document before implementing or refactoring the application. Read
[DESIGN.md](../DESIGN.md) for the current visual specification. These are
project rules for coding agents and human contributors. Explicit user instructions
take precedence. Keep this document aligned with the actual code.

## Scope and working approach

French Aloud is a focused French text-to-speech tool. Preserve the existing flow:
choose a configured voice, enter French, play, and adjust local playback speed.
Recent readings and plain-text copying are existing, authorized features. Do not
add translation, authentication, databases, or other product features without a
request. Keep ElevenLabs credentials and provider calls on the server.

Prioritize avoiding rework: inspect existing components and conventions before
adding new abstractions. Separate foundation refactoring from visual redesign.
Keep refactors small and preserve behavior. Add a shared abstraction when there is
real reuse, rather than constructing a speculative design system.

Read the relevant installed Next.js guide in `node_modules/next/dist/docs/`
before editing framework-dependent code. Use the installed version's conventions.

## Styling ownership

Tailwind CSS v4 is the primary styling system. The stylesheet is imported once by
`app/layout.tsx` and processed by `@tailwindcss/postcss`.

```text
app/layout.tsx
  |
  +--> app/globals.css
  |      +-- Tailwind import
  |      +-- @theme: shared colors, font, shadows, radius roles
  |      +-- document defaults: html, body, color scheme
  |      +-- small special CSS: Drawer gesture animation
  |
  +--> app/page.tsx
         +-- page shell: size, padding, responsive layout
         +--> components/FrenchReader.tsx
                +-- editor and voice controls
                +--> CopyTextButton --> ui/Button
                +--> RecentReadings --> ui/Button + Base UI Drawer
                +--> PlayAudioButton --> useSpeechPlayback
                +--> SpeechSpeedControl
```

Keep these responsibilities distinct:

| Location                     | Responsibility                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `app/globals.css` / `@theme` | Reused visual values and semantic design tokens                                                    |
| Global document rules        | Font, page defaults, document sizing, iOS Drawer positioning                                       |
| Small named special CSS      | Gesture variables and state selectors that would be hard to read as utility strings                |
| Component `className`        | Layout, spacing, typography scale, responsive variants, hover, focus, disabled and selected states |
| `components/ui/`             | Repeated interaction primitives and their shared Tailwind styles                                   |
| Feature components           | Product behavior, accessible labels, event handlers and data flow                                  |

Do not move each component's layout into global CSS. Do not replace utility classes
with a large set of `@apply` wrappers. Keep special CSS narrowly scoped and explain
why it is needed. Base UI is an unstyled interaction primitive, not a complete
shadcn theme; our components provide its appearance and motion.

## Shared tokens

Use semantic classes such as `bg-canvas`, `bg-surface`, `text-ink`, `text-secondary`,
`border-border`, `border-border-active`, `ring-focus`, and `shadow-panel`.
Their values live in `app/globals.css`, rather than in each consumer.

```text
@theme token
  --color-surface
       |
       +--> bg-surface in page shell
       +--> bg-surface in editor
       +--> future surface changes happen at the token source
```

Tokens use OKLCH neutrals with purple voice labels, yellow selection cues,
green playing feedback and earth-toned speed badges.
`control-*` roles alias the base palette using `@theme inline`. Change values at
the token source rather than scattering literal colors through JSX.

Token groups:

- Base roles: `canvas`, `surface`, `hover`, `soft`, `ink`, `strong`, `body`,
  `secondary`, `muted`, `placeholder`, borders, focus and primary hover.
- `control-*`: voice controls, speed panel and status feedback. These alias the
  shared cool-neutral base roles.
- `female-*` / `male-*`: category label, selected surface, outline and text. Both groups
  currently share the same brand palette.
  Preserve explicit selected text as well as color cues.
- `font-sans`: `system-ui, sans-serif`. Do not introduce a downloadable font as part
  of an unrelated refactor.
- `shadow-panel` / `shadow-drawer`: shared elevation roles.
- `radius-panel` / `radius-section` / `radius-control`: repeated surface sizes.

Use built-in Tailwind spacing and typography utilities unless a repeated product
rule justifies a token. Do not define tokens for every one-off width or margin.
Opacity suffixes are allowed, for example `bg-soft/60`. Arbitrary values are allowed
for local geometry or platform constraints, such as safe-area insets. Do not use
arbitrary color literals as a substitute for shared color tokens.

Keep complete class names visible to Tailwind's scanner. Choose among complete
strings; do not construct fragments such as `bg-${color}-100`.

## No application inline styles

Do not add JSX `style` props, `element.style` writes, `cssText`, or style attributes
set through DOM APIs. Use Tailwind, CSS sizing, or state/data attributes instead.
ESLint rejects JSX style props and direct `element.style.property` assignments in
application and component TSX files. The written rule also covers other forms
that are not all detected by the lint selectors.

The editor uses `field-sizing-content` with a minimum height and full width.
Supporting browsers grow and shrink it to fit content. It uses `rows={4}`,
`overflow-y-auto` and `resize-y` as the fallback: older browsers keep a usable
scrollable, manually resizable editor. Do not restore JavaScript height writes.
Check long text and restored history text when changing editor layout.

Base UI may generate inline gesture variables and positioning styles internally.
Those library-managed values are not application inline styling. Keep consuming
its CSS variables rather than rewriting the library's positioning system.

## Shared UI components

`components/ui/Button.tsx` owns repeated button interactions:

- `quiet`: text actions such as Copy.
- `icon`: per-reading delete, with a consistent 44 px target.
- `icon-circle`: Drawer close, with a circular outline and subtle shared shadow.
- `pill`: Recent readings, with its visible capsule outline.

Use these variants through the shared Button. Feature components still own their
labels and behavior. Use Base UI's `render` composition for Drawer triggers and
close buttons so semantics, refs and keyboard behavior are retained. Button
forwards standard button props, including React 19's ref prop; it defaults to
`type="button"` to avoid accidental form submission.

Keep context-specific geometry at the call site, for example an absolute position
for a delete button. Do not override the shared variant's colors by appending
conflicting utility classes. Add a justified variant when behavior is genuinely
shared; do not create a variant for every feature.

The primary speech button remains a feature component because it owns loading,
playback and cancellation state. It still uses shared color and elevation tokens.

## Accessibility and motion

Provide accessible labels for icon-only controls, use actual buttons, keep visible
keyboard focus, and preserve disabled and selected state semantics. Avoid nesting
a delete button inside the selectable history button. Use text and semantic state
in addition to category color.

Drawer layout stays in `className`. Its `reading-drawer-*` CSS handles
`data-starting-style`, `data-ending-style`, `data-swiping` and Base UI gesture
variables. Animate transform and opacity, not layout properties. Respect
`prefers-reduced-motion`. Preserve both bottom mobile and right-side desktop
behavior. Do not add artificial waits to produce a sense of motion.

## Functional relationships to preserve

```text
French input + chosen voice
       |
       +--> PlayAudioButton --> useSpeechPlayback --> /api/tts
       |                             |                   |
       |                             |                   +--> cache / ElevenLabs
       |                             +--> audio playback starts
       |                                      +--> latest 10 unique texts
       |
       +--> CopyTextButton --> clipboard: French plain text only
       |
       +--> SpeechSpeedControl --> same player's playbackRate
                                  (no new generation request)

Recent readings card
       +--> click: restore input + highlight selected card
       +--> X: remove that single stored entry
       +--> no automatic speech generation
```

Do not send playback speed to ElevenLabs. Do not include speed in the audio cache
key. Preserve cached playback history, deduplication and single-entry deletion.
Keep history local to this browser; it is not an audio archive or cloud sync.

## Verification

Use `npm run lint`, `npx tsc --noEmit`, and tests relevant to changed behavior.
For changes that affect the production CSS or component integration, run a
production build. `npx next build --webpack` is the verified build fallback when
Turbopack cannot operate in the local sandbox.

Prettier uses `prettier-plugin-tailwindcss` with `app/globals.css` as its stylesheet.
Format only edited files rather than changing unrelated files.

For shared styling changes, inspect mobile and desktop: default, hover, focus,
selected and disabled states as relevant. Verify Drawer open/close, history
selection/deletion and copying. When touching playback, verify initial speed,
in-play speed changes and cancellation. When touching textarea sizing, verify
short and long text and restoring history; distinguish real device testing from
viewport emulation. Do not add tests that merely duplicate CSS declarations.

## Agent communication

Reply in Traditional Chinese with Taiwan-style full-width punctuation. Technical
code, paths, commands and ASCII diagrams retain their standard ASCII syntax.

The user prefers ASCII diagrams when explaining flows, component composition,
file relationships and architectural choices. Give a short direct explanation,
then a small diagram where it improves understanding. Mark proposed structure
as proposed and actual structure as actual. For simple edits, do not force a
large diagram or repeat information already established.

Examples:

```text
shared token --> Tailwind utility --> UI component --> feature screen
```

State what changed, why, how it was checked and any material limitations. Avoid
unnecessary approval pauses for work already authorized. Commit or publish only
within the user's requested scope; do not treat a request for explanation as a
request to redesign the app.

## Documentation boundaries

This file is maintained project guidance and belongs in Git. Keep a link in
README and a local AGENTS.md entry so future contributors and agents find it.
AGENTS.md is currently ignored by this repository; its local pointer does not
ship to a fresh clone. The README link is therefore the committed entry point.

`docs/design/` is ignored and contains personal reference reports. Do not rely on
those private reports as the only source for required development rules. Do not
commit personal design references or browser artifacts.
