import { model, prop, ExtendedModel, modelAction } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "./base-audio-node-wrapper";
import { Track, Transport } from "./components";

@model("AudioEngine")
export class AudioEngine extends ExtendedModel(BaseAudioNodeWrapper, {
  transport: prop<Transport>(() => new Transport({})),
  tracks: prop<Track[]>(() => []),
}) {
  @modelAction
  createTrack = () => {
    const track = new Track({});
    this.tracks.push(track);
  };
}
