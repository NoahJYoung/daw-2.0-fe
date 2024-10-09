import {
  clone,
  ExtendedModel,
  getParent,
  idProp,
  model,
  modelAction,
  prop,
} from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { MidiNote } from "../midi-note";
import { PitchNameTuple } from "../midi-note/types";
import * as Tone from "tone";
import { Track } from "../track";

interface EventParams {
  on: number;
  off: number;
  note: PitchNameTuple;
  velocity?: number;
}

@model("AudioEngine/Mixer/Track/MidiClip")
export class MidiClip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  trackId: prop<string>(),
  type: prop("midi"),
  start: prop<number>(),
  end: prop<number>().withSetter(),
  events: prop<MidiNote[]>(() => []).withSetter(),
  loopSamples: prop<number>(0),
  locked: prop<boolean>(false).withSetter(),
  fadeInSamples: prop<number>(0).withSetter(),
  fadeOutSamples: prop<number>(0).withSetter(),
}) {
  getRefId() {
    return this.id;
  }

  @modelAction
  createEvent(event: EventParams) {
    const newEvent = new MidiNote({ ...event });
    this.setEvents([...this.events, clone(newEvent)]);
  }

  @computed
  get length(): number {
    return this.end - this.start;
  }

  @modelAction
  setStart(newStart: number) {
    const difference = newStart - this.start;
    this.setEnd(this.end + difference);
    this.start = newStart;
  }

  setLoopSamples() {}

  play = () => {};

  stop() {}

  schedule() {
    const parentTrack: Track | undefined = getParent(getParent(this)!);
    if (!parentTrack) {
      throw new Error("No parent track found");
    }
    this.events.forEach((event) => {
      const startTimeInSeconds = Tone.Time(
        event.on + this.start,
        "samples"
      ).toSeconds();

      const endTimeInSeconds = Tone.Time(
        event.off + this.start,
        "samples"
      ).toSeconds();

      const startEventId = Tone.getTransport().scheduleOnce(
        (time) =>
          parentTrack.instrument.triggerAttack(event.note.join(""), time),
        startTimeInSeconds
      );

      const stopEventId = Tone.getTransport().scheduleOnce(
        (time) =>
          parentTrack.instrument.triggerRelease(event.note.join(""), time),
        endTimeInSeconds
      );

      event.startEventId = startEventId;
      event.stopEventId = stopEventId;
    });
  }

  clearEvents = () => {
    const transport = Tone.getTransport();
    this.events.forEach((event) => {
      if (event.startEventId) {
        transport.clear(event.startEventId);
      }

      if (event.stopEventId) {
        transport.clear(event.stopEventId);
      }
    });
  };

  split() {}

  dispose() {
    // TODO:
  }
}
