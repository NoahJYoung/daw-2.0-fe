import { Reverb } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject, EffectViewProps } from "../../types";
import { observer } from "mobx-react-lite";

const ReverbTopView = () => <div>Reverb Top View</div>;

const ReverbBottomView = observer(
  ({ effect: reverb }: EffectViewProps<Reverb>) => {
    return <div>REVERB BOTTOM VIEW</div>;
  }
);

export const ReverbView: EffectViewComponentObject<Reverb> = {
  Upper: ReverbTopView,
  Lower: ReverbBottomView,
};
