// Shared roster of demo mascot bots + the voice catalog used to cast them.

export type Gender = "male" | "female";

export interface BotDef {
  id: string;
  name: string;
  industry: string;
  gender: Gender; // default voice gender
}

// The 20 demo bots we cast voices for.
export const BOTS: BotDef[] = [
  { id: "amp", name: "Mr Amp", industry: "Electrical", gender: "male" },
  { id: "pete", name: "Pipe Pete", industry: "Plumbing", gender: "male" },
  { id: "charlie", name: "Chill Charlie", industry: "HVAC / Heating & Cooling", gender: "male" },
  { id: "bright", name: "Dr. Bright", industry: "Dental", gender: "female" },
  { id: "sue", name: "Sparkle Sue", industry: "Cleaning Services", gender: "female" },
  { id: "rex", name: "Rex Roofer", industry: "Roofing", gender: "male" },
  { id: "paws", name: "Penny Paws", industry: "Veterinary / Pet Care", gender: "female" },
  { id: "max", name: "Coach Max", industry: "Gym / Fitness", gender: "male" },
  { id: "bella", name: "Bella Bloom", industry: "Salon & Spa", gender: "female" },
  { id: "hank", name: "Handy Hank", industry: "Handyman / Remodeling", gender: "male" },
  { id: "grace", name: "Glow Grace", industry: "Med-Spa / Aesthetics", gender: "female" },
  { id: "carl", name: "Counsel Carl", industry: "Law Firm", gender: "male" },
  { id: "larry", name: "Lawn Larry", industry: "Landscaping / Lawn Care", gender: "male" },
  { id: "kate", name: "Key Kate", industry: "Real Estate", gender: "female" },
  { id: "bob", name: "Buster Bob", industry: "Pest Control", gender: "male" },
  { id: "betty", name: "Brew Betty", industry: "Cafe / Restaurant", gender: "female" },
  { id: "will", name: "Wrench Will", industry: "Auto Repair", gender: "male" },
  { id: "amy", name: "Aqua Amy", industry: "Pool Service", gender: "female" },
  { id: "marty", name: "Movin' Marty", industry: "Moving Company", gender: "male" },
  { id: "tina", name: "Tally Tina", industry: "Accounting / Tax", gender: "female" },
];

export interface VoiceDef {
  id: string; // OpenAI voice id
  label: string;
  gender: Gender;
  note: string;
}

// OpenAI TTS voices, grouped by gender.
export const VOICES: VoiceDef[] = [
  { id: "ash", label: "Ash", gender: "male", note: "Energetic, upbeat (great default)" },
  { id: "verse", label: "Verse", gender: "male", note: "Expressive, lively" },
  { id: "ballad", label: "Ballad", gender: "male", note: "Warm, friendly" },
  { id: "echo", label: "Echo", gender: "male", note: "Calm, clear" },
  { id: "onyx", label: "Onyx", gender: "male", note: "Deep, authoritative" },
  { id: "fable", label: "Fable", gender: "male", note: "Animated, British" },
  { id: "nova", label: "Nova", gender: "female", note: "Bright, cheerful (great default)" },
  { id: "coral", label: "Coral", gender: "female", note: "Warm, expressive" },
  { id: "shimmer", label: "Shimmer", gender: "female", note: "Soft, friendly" },
  { id: "sage", label: "Sage", gender: "female", note: "Gentle, calm" },
  { id: "alloy", label: "Alloy", gender: "female", note: "Smooth, neutral" },
];

export function defaultVoiceFor(gender: Gender): string {
  return gender === "female" ? "nova" : "ash";
}
