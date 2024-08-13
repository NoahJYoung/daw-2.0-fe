import { model, Model, prop, modelAction } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNode } from "./types";

@model("AudioEngine")
export class AudioEngine
  extends Model({
    text: prop<string>(),
    done: prop(false),
  })
  implements BaseAudioNode
{
  @modelAction
  setDone(done: boolean) {
    this.done = done;
  }

  @modelAction
  setText(text: string) {
    this.text = text;
  }

  @computed
  get asString() {
    return `${!this.done ? "TODO" : "DONE"} ${this.text}`;
  }

  // TODO: implement serialize function
  serialize() {
    return "";
  }
}
