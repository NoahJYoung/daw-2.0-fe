import { Compressor } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject } from "../../types";
import { CompressorBottomView, CompressorTopView } from "./components";

export const CompressorView: EffectViewComponentObject<Compressor> = {
  Upper: CompressorTopView,
  Lower: CompressorBottomView,
};
