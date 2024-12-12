import { Reverb } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewComponentObject, EffectViewProps } from "../../types";
import { observer } from "mobx-react-lite";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { reverbSelectItems } from "@/pages/studio/audio-engine/components/effects/reverb/types";

const ReverbTopView = () => <div>Reverb Top View</div>;

const ReverbBottomView = observer(
  ({ effect: reverb }: EffectViewProps<Reverb>) => {
    const handleChange = (value: string) => {
      reverb.setSelectedReverb(value);
    };

    return (
      <StudioDropdown
        options={reverbSelectItems}
        value={reverb.selectedReverb}
        placeholder="Select a reverb type"
        // icon={<FaGuitar />}
        onChange={handleChange}
      />
    );
  }
);

export const ReverbView: EffectViewComponentObject<Reverb> = {
  Upper: ReverbTopView,
  Lower: ReverbBottomView,
};
