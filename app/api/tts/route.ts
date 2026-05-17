import { NextRequest, NextResponse } from 'next/server'

const modelId = 'eleven_multilingual_v2'
const voiceSettings = { stability: 0.5, similarity_boost: 0.75 }
const maxCacheEntries = 100
const audioCache = new Map<string, ArrayBuffer>()
const voiceTypes = ['female', 'male'] as const

type VoiceType = (typeof voiceTypes)[number]

const getCacheKey = async (input: unknown) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(input))
  const digest = await crypto.subtle.digest('SHA-256', data)

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const setCachedAudio = (key: string, audioBuffer: ArrayBuffer) => {
  if (audioCache.size >= maxCacheEntries) {
    const oldestKey = audioCache.keys().next().value

    if (oldestKey) {
      audioCache.delete(oldestKey)
    }
  }

  audioCache.set(key, audioBuffer)
}

const createAudioResponse = (audioBuffer: ArrayBuffer, cacheStatus: 'HIT' | 'MISS') => {
  return new NextResponse(audioBuffer.slice(0), {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      'X-TTS-Cache': cacheStatus,
    },
  })
}

const isVoiceType = (value: unknown): value is VoiceType => {
  return voiceTypes.includes(value as VoiceType)
}

const getVoiceId = (voice: VoiceType) => {
  const voiceIdByType: Record<VoiceType, string | undefined> = {
    female: process.env.ELEVENLABS_FEMALE_VOICE_ID ?? process.env.ELEVENLABS_VOICE_ID,
    male: process.env.ELEVENLABS_MALE_VOICE_ID,
  }

  return voiceIdByType[voice]
}

export const POST = async (req: NextRequest) => {
  const { text, voice = 'female' } = await req.json()

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  if (!isVoiceType(voice)) {
    return NextResponse.json({ error: 'voice must be female or male' }, { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = getVoiceId(voice)

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      {
        error:
          'TTS not configured. Set ELEVENLABS_API_KEY, ELEVENLABS_FEMALE_VOICE_ID, and ELEVENLABS_MALE_VOICE_ID.',
      },
      { status: 503 },
    )
  }

  const normalizedText = text.trim()
  const cacheKey = await getCacheKey({
    text: normalizedText,
    voice,
    voiceId,
    modelId,
    voiceSettings,
  })
  const cachedAudio = audioCache.get(cacheKey)

  if (cachedAudio) {
    return createAudioResponse(cachedAudio, 'HIT')
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: normalizedText,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('ElevenLabs error:', err)
    return NextResponse.json({ error: 'TTS request failed' }, { status: res.status })
  }

  const audioBuffer = await res.arrayBuffer()
  setCachedAudio(cacheKey, audioBuffer)

  return createAudioResponse(audioBuffer, 'MISS')
}
