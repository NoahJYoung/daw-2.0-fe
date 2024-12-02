import { ExtendedModel, model, prop } from "mobx-keystone";

import { Effect } from "../../effect/effect";

@model("AudioEngine/Reverb")
export class Reverb extends ExtendedModel(Effect, {
  audioUrl: prop<string>().withSetter(),
}) {
  get name() {
    return "Reverb";
  }

  sync() {
    super.sync();
  }
}
