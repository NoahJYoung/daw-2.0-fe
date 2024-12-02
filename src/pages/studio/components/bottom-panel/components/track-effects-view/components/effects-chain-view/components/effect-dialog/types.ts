import { Effect, Track } from "@/pages/studio/audio-engine/components";

export interface EffectViewProps<T = Effect> {
  effect: T;
  track: Track;
}

export interface EffectViewComponentObject<T = Effect> {
  Upper: () => React.ReactNode;
  Lower: ({ track, effect }: EffectViewProps<T>) => React.ReactNode;
}
