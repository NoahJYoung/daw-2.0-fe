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
import { EventData } from "../keyboard/types";

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
    this.clearEvents();
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

  split(positionInSamples: number) {
    const adjustedPosition = positionInSamples - this.start;

    const difference = positionInSamples - adjustedPosition;
    const splitEvents = JSON.parse(JSON.stringify([...this.events]))
      .filter(
        (event: { ["$"]: EventData }) =>
          event["$"].on < adjustedPosition && event["$"].off > adjustedPosition
      )
      .map((event: { ["$"]: EventData }) => [
        {
          on: event["$"].on,
          off: adjustedPosition,
          velocity: event["$"].velocity,
          note: [...event["$"].note],
        },

        {
          on: adjustedPosition,
          off: event["$"].off,
          velocity: event["$"].velocity,
          note: [...event["$"].note],
        },
      ]);

    const clipOne = {
      start: this.start,
      end: positionInSamples,
      trackId: this.trackId,
      fadeInSamples: this.fadeInSamples,
      fadeOutSamples: 0,
      events: [
        ...this.events
          .concat(splitEvents.flat())
          .filter(
            (event) =>
              event.on < adjustedPosition && event.off <= adjustedPosition
          )
          .map((event) =>
            clone(
              new MidiNote({
                note: [...event.note],
                velocity: event.velocity,
                on: event.on,
                off: event.off,
              })
            )
          ),
      ],
    };

    const clipTwo = {
      start: positionInSamples,
      end: this.end,
      trackId: this.trackId,
      fadeInSamples: 0,
      fadeOutSamples: this.fadeOutSamples,
      events: [
        ...this.events
          .concat(splitEvents.flat())
          .filter((event) => event.on >= adjustedPosition)
          .map((event) =>
            clone(
              new MidiNote({
                note: [...event.note],
                velocity: event.velocity,
                on: event.on - positionInSamples + difference,
                off: event.off - positionInSamples + difference,
              })
            )
          ),
      ],
    };

    return {
      snapshots: [{ ...clipOne }, { ...clipTwo }],
      clipIdToDelete: this.id,
    };
  }

  dispose() {
    // TODO:
  }
}
