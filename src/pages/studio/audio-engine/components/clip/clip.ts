import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";

@model("AudioEngine/Clip")
export class Clip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  parentTrackId: prop<string>(),
}) {}
