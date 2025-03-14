import { Effect } from "../effect/effect";
import { Compressor } from "./compressor";
import { GraphicEQ } from "./graphic-eq";
import { Reverb } from "./reverb";

export type EffectKey = "Graphic EQ" | "Reverb" | "Compressor";

export const effectKeyToClassMap: Record<EffectKey, typeof Effect> = {
  "Graphic EQ": GraphicEQ,
  Reverb: Reverb,
  Compressor: Compressor,
};

export const effectOptions = Object.keys(effectKeyToClassMap).map((key) => ({
  label: key,
  value: key,
})) as { label: EffectKey; value: EffectKey }[];
