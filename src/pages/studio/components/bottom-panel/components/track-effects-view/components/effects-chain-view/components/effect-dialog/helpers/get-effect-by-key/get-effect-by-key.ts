import { GraphicEQView, ReverbView } from "../../components";
import { EffectViewComponentObject } from "../../types";

// TODO: Figure out this type relationship without using any here

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const effectComponentMap: Record<string, EffectViewComponentObject<any>> = {
  ["Graphic EQ"]: GraphicEQView,
  Reverb: ReverbView,
};

export const getEffectByKey = (key: string) =>
  effectComponentMap[key] ?? { Upper: null, Lower: null };
