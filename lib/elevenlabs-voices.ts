export type VoiceGender = "female" | "male";

export type ConfiguredVoice = {
  id: string;
  gender: VoiceGender;
};

const parseVoiceIds = (value: string | undefined) => [
  ...new Set(
    value
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) ?? [],
  ),
];

export const getConfiguredVoices = (): ConfiguredVoice[] => {
  const femaleIds = parseVoiceIds(process.env.ELEVENLABS_FEMALE_VOICE_IDS);
  const maleIds = parseVoiceIds(process.env.ELEVENLABS_MALE_VOICE_IDS);

  return [
    ...femaleIds.map((id) => ({ id, gender: "female" as const })),
    ...maleIds.map((id) => ({ id, gender: "male" as const })),
  ];
};

export const isAllowedVoiceId = (voiceId: string) =>
  getConfiguredVoices().some(({ id }) => id === voiceId);
