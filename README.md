# French Aloud

Live demo: https://french-aloud.vercel.app/

French Aloud is a focused experiment in listening to French. Type a word or
sentence, choose a voice, and hear it spoken with ElevenLabs text-to-speech.

## How ElevenLabs Is Used

The app sends text-to-speech requests through its server-side `/api/tts` route
to the ElevenLabs REST API. The API key is managed through Vercel environment
variables and is never exposed to the browser.

Official references:

- [Text-to-Speech API](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/text-to-speech#using-the-text-to-speech-api)
- [List voices API](https://elevenlabs.io/docs/api-reference/voices/search)

## Tech Stack

- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **ElevenLabs REST API** — text-to-speech

## Development

Node.js 22 is recommended. Next.js requires Node.js 20.9 or newer.

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
npm run lint
npm run build
```
