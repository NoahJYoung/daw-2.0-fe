import { Band } from "@/pages/studio/audio-engine/components/effects/graphic-eq/components";
import {
  PeakingFilterIcon,
  HighPassFilterIcon,
  HighShelfFilterIcon,
} from "../components/icons";
import { Track } from "@/pages/studio/audio-engine/components";

export const getBandIcon = (
  band: Band,
  track: Track,
  index: number,
  selectedBandId?: string
) => {
  const selected = band.id === selectedBandId;
  const neutralColor = "#888";
  const [r, g, b] = track.rgb;
  const selectedColor = `rgb(${r}, ${g}, ${b})`;
  const typeToLabelMap: Partial<Record<BiquadFilterType, JSX.Element>> = {
    peaking: (
      <PeakingFilterIcon
        color={selected ? selectedColor : neutralColor}
        number={index}
        size={28}
      />
    ),
    highpass: (
      <HighPassFilterIcon
        color={selected ? selectedColor : neutralColor}
        size={28}
      />
    ),
    highshelf: (
      <HighShelfFilterIcon
        color={selected ? selectedColor : neutralColor}
        size={28}
      />
    ),
  };

  return typeToLabelMap[band.type];
};
