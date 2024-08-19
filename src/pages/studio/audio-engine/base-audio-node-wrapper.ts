import { model, Model, onPatches, getSnapshot } from "mobx-keystone";

@model("AudioEngine/BaseAudioNodeWrapper")
export class BaseAudioNodeWrapper extends Model({}) {
  protected onInit(): void {
    onPatches(this, () => {
      this.sync();
    });
  }

  protected sync(): void {}

  public serialize() {
    return getSnapshot(this);
  }
}
