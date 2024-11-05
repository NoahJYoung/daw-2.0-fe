import {
  clone,
  ExtendedModel,
  getParent,
  idProp,
  model,
  modelAction,
  prop,
  Ref,
} from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { MidiNote } from "../midi-note";
import { PitchNameTuple } from "../midi-note/types";
import * as Tone from "tone";
import { Track } from "../track";
import { EventData } from "../keyboard/types";
import { MAX_SAMPLES_PER_PIXEL, MIN_SAMPLES_PER_PIXEL } from "../../constants";
import { noteRef } from "../refs";

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
  samplesPerPixel: prop<number>(256).withSetter(),
  subdivision: prop("8n").withSetter(),
  snapToGrid: prop(false).withSetter(),
  selectedNoteRefs: prop<Ref<MidiNote>[]>(() => []),
  quantizePercentage: prop<number>(100),
}) {
  getRefId() {
    return this.id;
  }

  @modelAction
  createEvent(event: EventParams) {
    const newEvent = new MidiNote({ ...event });
    this.setEvents([...this.events, clone(newEvent)]);
  }

  samplesToPixels(samples: number) {
    return samples / this.samplesPerPixel;
  }

  pixelsToSamples(pixels: number) {
    return pixels * this.samplesPerPixel;
  }

  @computed
  get length(): number {
    return this.end - this.start;
  }

  @computed
  get startMeasure(): number {
    return parseInt(
      Tone.Time(this.start, "samples").toBarsBeatsSixteenths().split(":")[0]
    );
  }

  @computed
  get endMeasure(): number {
    return parseInt(
      Tone.Time(this.end, "samples").toBarsBeatsSixteenths().split(":")[0]
    );
  }

  @computed
  get measures() {
    return this.endMeasure - this.startMeasure + 1;
  }

  @computed
  get zoomWidth() {
    return this.samplesToPixels(Tone.Time(this.measures, "m").toSamples());
  }

  @computed
  get selectedNotes() {
    return this.selectedNoteRefs.map((r) => r.current);
  }

  @computed
  get canZoomIn(): boolean {
    return this.samplesPerPixel > MIN_SAMPLES_PER_PIXEL;
  }

  @computed
  get canZoomOut(): boolean {
    return this.samplesPerPixel < MAX_SAMPLES_PER_PIXEL / 2;
  }

  zoomIn() {
    const newSPP = this.samplesPerPixel / 2;
    if (this.canZoomIn) {
      this.setSamplesPerPixel(newSPP);
    }
  }

  zoomOut() {
    const newSPP = this.samplesPerPixel * 2;
    if (this.canZoomOut) {
      this.setSamplesPerPixel(newSPP);
    }
  }

  @modelAction
  selectNote(note: MidiNote) {
    if (!this.events.includes(note)) throw new Error("unknown midi note");

    if (!this.selectedNotes.includes(note)) {
      this.selectedNoteRefs.push(noteRef(note));
    }
  }

  @modelAction
  unselectNote(note: MidiNote) {
    if (!this.events.includes(note)) throw new Error("unknown midi note");

    const trackRefIndex = this.selectedNoteRefs.findIndex(
      (noteRef) => noteRef.maybeCurrent === note
    );

    if (trackRefIndex >= 0) {
      this.selectedNoteRefs.splice(trackRefIndex, 1);
    }
  }

  selectAllNotes() {
    this.events.forEach((note) => this.selectNote(note));
  }

  unselectAllNotes() {
    this.events.forEach((note) => this.unselectNote(note));
  }

  @modelAction
  setQuantizePercentage(percentage: number) {
    if (percentage >= 0 && percentage <= 100) {
      this.quantizePercentage = percentage;
    }
  }

  quantize() {
    this.selectedNotes.forEach((note) => {
      const globalPosition = this.start + note.on;
      const quantizedGlobalPosition = Tone.Time(
        globalPosition,
        "samples"
      ).quantize(this.subdivision, this.quantizePercentage);
      const newOn = quantizedGlobalPosition - this.start;
      note.setOn(newOn);
    });
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
