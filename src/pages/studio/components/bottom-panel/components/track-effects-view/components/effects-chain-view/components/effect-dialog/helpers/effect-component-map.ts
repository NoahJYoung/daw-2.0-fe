/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphicEQView } from "../components";
import { EffectViewComponentObject } from "../types";

export const effectComponentMap: Record<
  string,
  EffectViewComponentObject<any>
> = {
  ["Graphic EQ"]: GraphicEQView,
};
