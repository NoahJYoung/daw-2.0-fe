import { Reverb } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject } from "../../types";
import { ReverbBottomView, ReverbTopView } from "./components";

export const ReverbView: EffectViewComponentObject<Reverb> = {
  Upper: ReverbTopView,
  Lower: ReverbBottomView,
};
