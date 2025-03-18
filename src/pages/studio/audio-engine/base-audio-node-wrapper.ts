/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Model, onPatches, getSnapshot, getRoot } from "mobx-keystone";
import { AudioEngine } from "./audio-engine";

@model("AudioEngine/BaseAudioNodeWrapper")
export class BaseAudioNodeWrapper extends Model({}) {
  protected onInit(): void {
    onPatches(this, (patches) => {
      // TODO: FIx undo bug when deleting all tracks
      this.sync();
      if (patches[0]) {
        if (patches[0].path.includes("selectedRefs")) {
          const { mixer } = getRoot<AudioEngine>(this);
          const valueId = (patches[0] as any).value?.id;

          if (valueId) {
            if (!mixer.tracks.find((track) => track.id === valueId)) {
              mixer.unselectAllTracks();
            }
          }
        }
      }
    });
    this.init();
  }

  protected sync(): void {}

  protected init(): void {
    this.sync();
  }

  public serialize() {
    return getSnapshot(this);
  }
}
