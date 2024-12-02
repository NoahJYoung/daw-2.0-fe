import { Effect } from "../effect/effect";
import { GraphicEQ } from "./graphic-eq";

export type EffectKey = "Graphic EQ";

export const effectKeyToClassMap: Record<EffectKey, typeof Effect> = {
  "Graphic EQ": GraphicEQ,
};

export const effectOptions = Object.keys(effectKeyToClassMap).map((key) => ({
  label: key,
  value: key,
})) as { label: EffectKey; value: EffectKey }[];
