// Static public metadata: update this list and redeploy to change voices.
export type VoiceGender = "female" | "male";
export const voices = [
  {
    id: "WeAAwKYcS06VmXw086yZ",
    name: "Victoria - Warm and calm",
    gender: "female",
  },
  {
    id: "ucMmKRQbfDEYyb2IIGax",
    name: "Aurore",
    gender: "female",
  },
  {
    id: "d3AXX0BlgJHYFCuH9X88",
    name: "Emilie - Podcast Host",
    gender: "female",
  },
  {
    id: "jUHQdLfy668sllNiNTSW",
    name: "Clement - Calm and Neutral",
    gender: "male",
  },
  {
    id: "Qrl71rx6Yg8RvyPYRGCQ",
    name: "Guillaume - Narrator",
    gender: "male",
  },
  {
    id: "8qnuneLiGjGrT4A62CCe",
    name: "Jules - conversational",
    gender: "male",
  },
] as const;
export const defaultVoiceId: string = voices[0].id;
