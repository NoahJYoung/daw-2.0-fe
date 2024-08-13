import { model, Model } from "mobx-keystone";
import { BaseAudioNode } from "./types";

@model("AudioEngine")
export class AudioEngine extends Model({}) implements BaseAudioNode {
  // TODO: implement serialize function
  serialize() {
    return "";
  }
}
