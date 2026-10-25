# French Aloud

A simple tool for listening to French with natural-sounding voices, powered by
ElevenLabs. Type or paste French text, choose a voice, and listen.

[Try the live demo](https://french-aloud.vercel.app/)

## Features

- **French text-to-speech** with six male and female voice options.
- **Adjustable playback speed** from 0.7× to 1.2×, with pitch preserved.
- **Playback controls** to stop audio or cancel generation.
- **Recent readings** saved in your browser for quickly revisiting texts.
- **One-click copying** of your French text.
- **Responsive layout** for mobile and desktop.

## Built with

Next.js, React, TypeScript, Tailwind CSS, and ElevenLabs.

## Local development

```sh
nvm install
nvm use
npm ci
npm run dev
```

## ElevenLabs API

French Aloud uses the ElevenLabs **Text to Speech** API to turn French text into
natural-sounding audio with a choice of six voices.
