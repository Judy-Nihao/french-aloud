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
reading-mode control. Playback speed (0.7× to 1.2×) changes locally, preserves
pitch and does not generate another request or consume additional credits.
Both readers share the same playback implementation. Browsers supporting MP3
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
For a live smoke test, use `/reader` with a configured voice and verify French
playback, speed changes, Stop/Cancel and replay. Actual model/voice availability
and perceived naturalness must be checked against your ElevenLabs account.
