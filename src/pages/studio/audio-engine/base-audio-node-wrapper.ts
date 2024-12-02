import { model, Model, onPatches, getSnapshot } from "mobx-keystone";

@model("AudioEngine/BaseAudioNodeWrapper")
export class BaseAudioNodeWrapper extends Model({}) {
  protected onInit(): void {
    onPatches(this, () => {
      this.sync();
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
