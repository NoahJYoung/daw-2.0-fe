// TODO Replace local storage With presets db logic when building Backend

import { useLocalStorage } from "usehooks-ts";
import { NewPresetData, SynthPreset } from "./types";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { Synthesizer, Track } from "@/pages/studio/audio-engine/components";
import { fromSnapshot } from "mobx-keystone";
import * as Tone from "tone";

export const useSynthPresets = (track: Track) => {
  const [activePreset, setActivePreset] = useState<SynthPreset | null>(null);

  const [presets, setPresets, clearPresets] = useLocalStorage<SynthPreset[]>(
    "SYNTH-PRESETS",
    []
  );

  const savePreset = ({ data, name }: NewPresetData) => {
    const id = uuidv4();
    const newPreset = { data, name, id };
    setPresets((prev) => [...prev, newPreset]);
    setActivePreset(newPreset);
  };

  const menuOptions: { label: string; value: string }[] = presets.map(
    (preset) => ({
      label: preset.name,
      value: preset.id,
    })
  );

  const selectPreset = (id: string) => {
    track.synth.releaseAll(Tone.now());
    const selectedPreset = presets.find((preset) => preset.id === id);
    if (selectedPreset) {
      setActivePreset(selectedPreset);
      const deserialized = fromSnapshot<Synthesizer>(selectedPreset.data);
      track.setSynth(deserialized);
    }
  };

  const deleteSelectedPreset = () => {
    const newPresets = [...presets.filter(({ id }) => id !== activePreset?.id)];
    setActivePreset(null);
    setPresets(newPresets);
  };

  return {
    presets,
    savePreset,
    clearPresets,
    menuOptions,
    selectPreset,
    setActivePreset,
    activePreset,
    deleteSelectedPreset,
  };
};
