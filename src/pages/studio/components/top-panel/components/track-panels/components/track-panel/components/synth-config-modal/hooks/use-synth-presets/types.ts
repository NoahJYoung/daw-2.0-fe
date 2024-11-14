import { Synthesizer } from "@/pages/studio/audio-engine/components";
import { SnapshotOutOf } from "mobx-keystone";

export interface SynthPreset {
  id: string;
  name: string;
  data: SnapshotOutOf<Synthesizer>;
}

export type NewPresetData = Omit<SynthPreset, "id">;
