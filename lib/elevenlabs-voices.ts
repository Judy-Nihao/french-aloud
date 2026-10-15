import { voices } from "./voices";

export const isAllowedVoiceId = (voiceId: string) =>
  voices.some(({ id }) => id === voiceId);
