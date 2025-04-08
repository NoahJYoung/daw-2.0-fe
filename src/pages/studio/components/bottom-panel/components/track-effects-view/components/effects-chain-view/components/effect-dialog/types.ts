import { Effect, Track } from "@/pages/studio/audio-engine/components";

export interface EffectViewProps<T = Effect> {
  effect: T;
  track: Track;
  width: number;
  height: number;
}

export interface EffectViewComponentObject<T = Effect> {
  Upper: ({
    track,
    effect,
    width,
    height,
  }: EffectViewProps<T>) => React.ReactNode;
  Lower: ({
    track,
    effect,
    width,
    height,
  }: EffectViewProps<T>) => React.ReactNode;
}
