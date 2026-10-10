# French Aloud

Live demo: https://french-aloud.vercel.app/

French Aloud is a focused experiment in listening to French. Type a word or
sentence, choose a voice, and hear it spoken with ElevenLabs text-to-speech.

## How ElevenLabs Is Used

The app sends text-to-speech requests through its server-side `/api/tts` route
to the ElevenLabs Text to Dialogue WebSocket using `eleven_v4_turbo`.
The server registers one voice, sends the French text and flushes the session.
Audio and errors are forwarded to the browser as NDJSON events. The API key
is managed through environment variables and is never exposed to the browser.

Stability (0.5) and Similarity (0.75) are fixed on the server. There is no
reading-mode control.

Playback speed (0.7× to 1.2×) can be adjusted while audio is playing. The frontend
updates the player's `playbackRate`, so the same audio continues from its current
position at the new speed without restarting. Pitch is preserved. This changes
how the browser plays the audio; it does not change the original audio or ask
ElevenLabs to generate it again. Adjusting speed sends no new `/api/tts` request
and consumes no additional ElevenLabs generation credits. This also works with
cached audio, and the selected speed applies to subsequent playback.

The home page (`/`) is the only reader. It combines the spacious home layout
with named female/male voice dropdowns, colored selection borders and labels.
The previous `/reader` route and legacy two-option reader have been removed.

Browsers supporting MP3
MediaSource playback stream audio; others buffer the complete MP3 before playing.
Stopping, changing text or changing voices cancels the active request.

Completed audio is cached in memory per server instance (100 entries, 20 MiB,
2 MiB per entry). Errors and cancelled streams are not cached. This cache is
best-effort and is not shared between Vercel instances. Playback speed is not
part of the cache key.

Required API-key permissions: **Text to Speech** access and **Voices** read.
**Models** access is only needed for optional model-list diagnostics.
The voice-list API and configured voice IDs are unchanged.

Official references:

- [v4 Turbo realtime guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/websockets/realtime-tdd)
- [v4 settings](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4)
- [List voices API](https://elevenlabs.io/docs/api-reference/voices/search)

## Tech Stack

- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **ElevenLabs Text to Dialogue WebSocket** — v4 Turbo speech generation

## Development

Node.js 22.18 or newer is required for native server-side WebSocket support and
the dependency-free TypeScript test runner. Use Node.js 22 or newer on Vercel.

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Run checks:

```bash
npm test
npm run lint
npm run build
```

The automated tests exercise streamed audio order, short-text flushing, errors,
timeouts and cancellation using a mock WebSocket, without consuming credits.
For a live smoke test, use `/` with a configured voice and verify French
playback, speed changes, Stop/Cancel and replay. Actual model/voice availability
and perceived naturalness must be checked against your ElevenLabs account.

### Copy and recent readings

The Copy button copies only the French text as plain text. Accents, punctuation,
spacing within the text, and line breaks are preserved; leading and trailing
whitespace is trimmed. Copying does not request speech or consume generation credits.

Recent readings opens a dismissible drawer: from the bottom on mobile and the
right on desktop. Text is recorded when audio starts playing, including cached
playback. Failed requests and requests canceled before playback are not recorded.
The list keeps the latest 10 unique texts; reading the same text again moves it to
the top. Click a text card to restore it to the editor without automatically
playing it or changing the selected voice or speed. The drawer stays open and
highlights the card matching the editor text. Each card has an X button to delete
that entry; deleting a reading does not clear the editor. The header X closes the
drawer. Copy remains available beside the main editor.

History stores text and playback timestamps in this browser's localStorage, not
audio. It survives reloads but does not sync across devices or browsers. Clearing
site data removes it. If browser storage is blocked, history works for the current
visit and the drawer explains that it cannot persist.

### Development conventions

Read [docs/development.md](docs/development.md) before implementing or refactoring.
It defines Tailwind token ownership, shared UI components, inline-style restrictions,
verification expectations, and the preferred use of ASCII diagrams in explanations.

### Build consistency

Development and production use webpack explicitly through `npm run dev` and
`npm run build`. On Vercel, use `npm run build` as the Build Command; remove any
`next build` override. When switching from a previous compiler/cache, redeploy
without the existing build cache. Baskervville is downloaded by next/font/google
at build time and served by the application.
