import { model, Model, prop, modelAction } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNode } from "./types";

@model("Track")
export class Clip
  extends Model({ text: prop<string>() })
  implements BaseAudioNode
{
  @modelAction
  setText(text: string) {
    this.text = text;
  }

  serialize() {
    return "";
  }
}

// const clip = new Clip({ text: "Initial Text" });

@model("Track")
export class Track
  extends Model({ clips: prop<Clip[]>() })
  implements BaseAudioNode
{
  serialize() {
    return "";
  }
}

// export const exampleTrack = new Track({ clips: [clip] });

@model("AudioEngine")
export class AudioEngine
  extends Model({
    text: prop<string>(),
    done: prop(false),
    tracks: prop<Track[]>(),
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
