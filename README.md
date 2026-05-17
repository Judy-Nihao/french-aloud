# French Aloud

French Aloud is a small web app for collecting French words and sentences with images, then listening to them through realistic text-to-speech audio.

The project explores a simple full-stack flow: users can create a phrase card, optionally attach an image, save the card to Supabase, and play the French text aloud through a server-side TTS API route.

## Tech Stack

- **Next.js App Router**: frontend UI and server route handlers
- **TypeScript**: typed application code
- **Tailwind CSS**: styling and responsive layout
- **Supabase Database**: stores phrase card records
- **Supabase Storage**: stores uploaded card images
- **ElevenLabs Text to Speech API**: generates natural-sounding spoken French audio

## Core Integration

Each phrase card is split across Supabase Database and Supabase Storage:

```txt
Supabase Database
cards.content    French word or sentence
cards.image_url  Public URL for the uploaded image
cards.created_at Creation timestamp

Supabase Storage
card-images      Uploaded image files
```

Text-to-speech is handled through a Next.js API route:

```txt
Browser
→ POST /api/tts
→ Next.js server reads ELEVENLABS_API_KEY
→ ElevenLabs generates audio
→ Browser receives and plays audio/mpeg
```

The ElevenLabs API key stays server-side and is never exposed to the browser.

## Voice Card Test Flow

The current app includes a small integration panel that can:

- test pronunciation through `/api/tts`
- test Supabase read access
- upload an image to Supabase Storage
- insert a phrase card into the Supabase `cards` table
- play the generated French audio
- switch between female and male French voice options

TTS responses are cached in server memory for repeated playback of the same text, voice, model, and voice settings. On the first request for a specific text and voice, the app calls the TTS API and caches the audio. On the next identical request, the app reuses the cached audio instead of calling the TTS API again.

## Environment Variables

Create a local `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_FEMALE_VOICE_ID=
ELEVENLABS_MALE_VOICE_ID=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is used by the browser-side Supabase client. The ElevenLabs key and voice IDs are read only by the server route.

## Development

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
