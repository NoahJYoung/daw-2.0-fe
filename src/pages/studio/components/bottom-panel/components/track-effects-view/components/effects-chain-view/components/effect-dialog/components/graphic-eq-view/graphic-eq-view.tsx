import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject } from "../../types";
import { GraphicEQTopView, GraphicEQBottomView } from "./components";

export const GraphicEQView: EffectViewComponentObject<GraphicEQ> = {
  Upper: GraphicEQTopView,
  Lower: GraphicEQBottomView,
};
