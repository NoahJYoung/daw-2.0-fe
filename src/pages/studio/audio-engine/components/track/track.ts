import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { Clip } from "../clip";

@model("AudioEngine/Track")
export class Track extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  name: prop<string>("New Track").withSetter(),
  clips: prop<Clip[]>(() => []),
  rgbColor: prop<string>("rgb(120, 120, 120)").withSetter(),
  active: prop(false).withSetter(),
  muted: prop(false).withSetter(),
  soloed: prop(false).withSetter(),
}) {
  createClip() {
    const track = new Clip({ parentTrackId: this.id });
    this.clips.push(track);
  }
}
