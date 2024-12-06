import { Effect } from "../effect/effect";
import { GraphicEQ } from "./graphic-eq";
import { Reverb } from "./reverb";

export type EffectKey = "Graphic EQ" | "Reverb";

export const effectKeyToClassMap: Record<EffectKey, typeof Effect> = {
  "Graphic EQ": GraphicEQ,
  Reverb: Reverb,
};

export const effectOptions = Object.keys(effectKeyToClassMap).map((key) => ({
  label: key,
  value: key,
})) as { label: EffectKey; value: EffectKey }[];
