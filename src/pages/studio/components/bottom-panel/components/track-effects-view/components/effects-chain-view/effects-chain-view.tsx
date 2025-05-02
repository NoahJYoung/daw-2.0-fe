import { Track } from "@/pages/studio/audio-engine/components";
import { EffectsChainListItem } from "./components";
import { observer } from "mobx-react-lite";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { IoAdd } from "react-icons/io5";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { effectOptions } from "@/pages/studio/audio-engine/components/effects";
import { useState } from "react";

const btnClassName = `rounded-xs focus-visible:ring-0 text-2xl relative flex items-center justify-center p-1 w-1/5 h-7 bg-surface-2 text-surface-5 hover:bg-surface-3`;

interface EffectsChainViewProps {
  track: Track;
}

export const EffectsChainView = observer(({ track }: EffectsChainViewProps) => {
  const [selectedEffectKey, setSelectedEffectKey] = useState<string | null>(
    null
  );

  const handleCreate = () => {
    if (selectedEffectKey) {
      track.effectsChain.addNewEffectFromKey(selectedEffectKey);
      setSelectedEffectKey(null);
    }
  };

  const handleChange = (effectKey: string) => setSelectedEffectKey(effectKey);

  const onDelete = (id: string) => track.effectsChain.removeEffect(id);

  const effects = track.effectsChain.effects;

  return (
    <div className="flex flex-col gap-2 w-full h-full max-h-[275px] p-1 border rounded-sm border-surface-2">
      <h5 className="px-1 font-bold text-surface-5">{`${track.name} - Effects Chain`}</h5>
      <span className="px-1 flex w-full items-center gap-2 justify-between">
        <span className="w-4/5">
          <StudioDropdown
            options={effectOptions}
            value={selectedEffectKey}
            colorOffset={0}
            placeholder="Select an effect"
            icon={<MdOutlineSettingsInputComponent />}
            onChange={handleChange}
          />
        </span>
        <StudioButton
          className={btnClassName}
          icon={IoAdd}
          disabled={!selectedEffectKey}
          onClick={handleCreate}
        />
      </span>
      <ul className="w-full flex flex-col p-1 pr-1 gap-1 h-full max-h-[182px] overflow-y-auto styled-scrollbar">
        {effects.map((effect, i) => (
          <EffectsChainListItem
            key={effect.id}
            onDelete={onDelete}
            isLastItem={i === effects.length - 1}
            track={track}
            effect={effect}
          />
        ))}
      </ul>
    </div>
  );
});
